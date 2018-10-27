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
const onPost = async (filename, slackUrl, slackToken, slackChannel, comment) => {
    if (!filename) {
        console.warn("no image filename");
        return false;
    }
    const filepath = path.resolve(__dirname, filename);
    // SlackにPOST
    if (!slackUrl || !slackToken) {
        console.warn('slackUrl or slackToken is empty');
    } else {
        const web = new WebClient(slackToken);
        const result =
            await web.files.upload({
                filename: filename,
                file: fs.createReadStream(filepath),
                title: filename,
                channels: slackChannel,
                initial_comment: comment
            });
        if (result.ok) {
            console.log(`slack post! ${result.file.permalink}`);
        } else {
            console.error('slack post error', result.error);
        }
    }
};

// 撮影設定
const cameraOption = config.cameraOption;
// 定期実行設定
const cronTime = process.env.CRON_TIME || config.cronTime; // 指定されなかった場合ワンショット実行する
// Slackでfile.upload APIを使用するための情報。また投稿設定
const slackWebhookUrl = (process.env.SLACK_WEBHOOK_URL || config.slackWebhookUrl || "https://slack.com/api/files.upload");
const slackToken = (process.env.SLACK_TOKEN || config.slackToken || "");
const slackChannel = (process.env.SLACK_CHANNEL || config.slackChannel || "");
const slackComment = (process.env.SLACK_COMMENT || config.slackComment || "");

if (cronTime) {
    // 定期実行
    console.log(`CronJob scheduled! ${cronTime}`);
    
    let count = 0;
    new CronJob(cronTime, async () => {
        console.log(`Job Start #${count++}`)
        const filename = await onCapture(cameraOption);
        const result = await onPost(filename, slackWebhookUrl, slackToken, slackChannel, slackComment);
        console.log('Done');
    }, null, true);
} else {
    (async () => {
        console.log('Onshot run');
        const filename = await onCapture(cameraOption);
        const result = await onPost(filename, slackWebhookUrl, slackToken, slackChannel, slackComment);
        console.log('Done');
    })();
}