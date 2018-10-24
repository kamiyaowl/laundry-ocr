const fs = require("fs");
const path = require("path");
const config = require("config");
const { CronJob } = require("cron");
const NodeWebcam = require("node-webcam");
const { WebClient } = require("@slack/client");

// 写真撮影して保存する
const onCapture = (opts) => {
    return new Promise((resolve, reject) => {
        const identify = "capture"
        const filename = `${identify}.jpg`;
        const filepath = path.resolve(__dirname, filename);

        try {
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
            NodeWebcam.capture(identify, opts, (err, result) => {
                // ファイル存在確認
                if (!fs.existsSync(filepath)) {
                    reject("capture failure");
                    return;
                }
                console.log('captured!')
                resolve(filename);
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};
// Webhook先に通知できるように叩く
const onPost = async (filename, slackUrl, slackToken, slackChannel, urls) => {
    if (!filename) {
        console.warn("no image filename");
        return false;
    }
    const filepath = path.resolve(__dirname, filename);
    // SlackにPOST
    if (!slackUrl) {
        console.warn('slackUrl is empty');
    } else {
        const web = new WebClient(slackToken);
        const result =
            await web.files.upload({
                filename: filename,
                file: fs.createReadStream(filepath),
                title: filename,
                channels: slackChannel,
            });
        if (result.ok) {
            console.log('slack post');
        } else {
            console.error('slack post error', result.error);
        }
    }
    // Slack以外にPOST
    if (!urls || !urls.length) {
        console.warn('urls are empty');
    } else {

    }
    return true;
};

// 撮影設定
const caperaOption = config.cameraOption;
// 定期実行設定
const cronTime = process.env.CRON_TIME || config.cronTime; // 指定されなかった場合ワンショット実行する
// Slackでfile.upload APIを使用するための情報。また投稿設定
const slackWebhookUrl = (process.env.SLACK_WEBHOOK_URL || config.slackWebhookUrl || "https://slack.com/api/files.upload");
const slackToken = (process.env.SLACK_TOKEN || config.slackToken || "");
const slackChannel = (process.env.SLACK_CHANNEL || config.slackChannel || "");
// Slack以外にpostする場合
const webhookUrls = // スペース区切りでURL複数指定可能
    (process.env.WEBHOOK_URLS || config.webhookUrls || "")
        .split(" ").filter(x => x);

if (cronTime) {
    // 定期実行
    new CronJob(cronTime, () => {
        console.log('Job Start')
        Promise.resolve()
            .then(() => onCapture(cameraOption))
            .then(filepath => onPost(filepath, slackWebhookUrl, webhookUrls))
            .then(x => {
                if (x) {
                    console.log('Job Done')
                }
            })
            .catch(err => {
                console.error(err);
            });
    }, null, true);
} else {
    (async () => {
        console.log('Onshot run');
        const filename = await onCapture(caperaOption);
        const result = await onPost(filename, slackWebhookUrl, slackToken, slackChannel, webhookUrls);
        console.log('Done');
    })();
}