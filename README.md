# Laundry-ocr

node.jsで作成された定点カメラアプリケーションです。

*OCRと名前がついていますが、写真を取るだけで需要を満たせるためただの定点カメラです。*

一定時間ごとにビデオデバイスから画像を取得し、Slack等にアップロードすることができます

# Dependency

* node.js v8 ~
* fswebcam

# Usage

以下の項目を設定します。設定方法には環境変数を指定するか、`config/`にjson設定ファイルを配置する方法があります。
両方が指定された場合、環境変数の値が優先されます。(Docker実行のため)

| 環境変数 | config | 設定値内容 | 設定例
|---|---|---|--|
|CRON_TIME|cronTime |定期実行する感覚を設定します。未指定の場合は１回だけ即座に実行されます | `"*/1 * * * *"` 
|SLACK_WEBHOOK_URL|slackWebhookUrl|slackのPOST先です。正確にはfile upload apiを使うので設定の必要はありません。 | `""`
|SLACK_TOKEN | slackToken | slackに画像を投稿するために使用するトークンです | -
|SLACK_CHANNEL | slackChannel | Slackの投稿先チャンネルIDです | -
|SLACK_CCOMMENT | slackComment | Slack投稿時のコメント | "Hello"

実行時は以下のいくつかの手法が推奨されます。

## 直接実行

```
$ node index.js
```

## pm2使用

```
npm install -g pm2
pm2 start index.js
```

## Docker

```
docker-compose up
```

## Docker(ビルド済みイメージ)

[DockerHub](https://hub.docker.com/r/kamiyaowl/laundry-ocr/)
```
docker pull kamiyaowl/laundry-ocr
```

# License

MIT


