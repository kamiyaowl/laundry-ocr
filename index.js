const config = require("config");
const cron = require('cron').CronJob;
const NodeWebcam = require( "node-webcam" );

// 写真撮影して保存する
const onCapture = async (opts) => {
    try {
        const result = await NodeWebcam.capture( "capture", opts);
        return "capture.jpg"; // TODO:もっとやる気が必要
    } catch(e) {
        console.error(e);
        return false;
    }
};
// Webhook先に通知できるように叩く
const onPost = async (imagepath, urls) => {
    if(!imagepath) {
        console.error("no imagepath");
        return false;
    }
    if(!urls || !urls.length) {
        console.warn('urls are empty');
        return false;
    }
};

// load config and envs
const caperaOption = config.cameraOption;
const webhookUrls = // スペース区切りでURL複数指定可能
    (process.env.WEBHOOK_URLS || config.webhookUrls || "")
        .split(" ")
        .filter(x => x); 
const cronTime = process.env.CRON_TIME || config.cronTime; // 指定されなかった場合ワンショット実行する

if (cronTime) {
    // 定期実行
} else {
    (async () => {
        console.log('onshot run');
        const filename = await onCapture(caperaOption);
        const result = await onPost(filename, webhookUrls);
        console.log('done');
    })();
}