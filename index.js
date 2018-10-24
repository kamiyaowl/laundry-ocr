const fs = require("fs");
const config = require("config");
const { CronJob } = require("cron");
const NodeWebcam = require("node-webcam");
const { WebClient } = require("@slack/client");

// 写真撮影して保存する
const onCapture = async (opts) => {
    try {
        const result = await NodeWebcam.capture("capture", opts);
        return "capture.jpg"; // TODO:もっとやる気が必要
    } catch (e) {
        console.error(e);
        return false;
    }
};
// Webhook先に通知できるように叩く
const onPost = async (imagepath, slackUrl, urls) => {
    if (!imagepath) {
        console.error("no imagepath");
        return false;
    }
    // SlackにPOST
    if (!slackUrl) {
        console.warn('slackUrl is empty');
    } else {

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
const postTitle = (process.env.POST_TITLE || config.postTitle || "");
const postComment = (process.env.POST_COMMENT || config.postComment || "");
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
            .then(filename => onPost(filename, slackWebhookUrl, webhookUrls))
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
        const result = await onPost(filename, slackWebhookUrl, webhookUrls);
        console.log('Done');
    })();
}