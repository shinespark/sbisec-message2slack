# SBI 証券 重要なお知らせ 確認 & Slack 転送スクリプト

SBI 証券でホーム画面に毎回表示されてしまう、未確認の重要なお知らせをすべて自動で確認済みにし、Slack に転送するスクリプト。

<img width="525" alt="slack" src="https://github.com/user-attachments/assets/a1d568f7-feb2-4f84-9e39-978b6fd4885d" />

<img width="600" alt="no_unconfirmed_important_messages!" src="https://github.com/user-attachments/assets/130f2f95-19c0-4cc0-9ada-2906c0e18b71" />

## 機能

- Puppteer を利用した SBI 証券へのログイン
- 未確認の重要なお知らせをすべて自動で確認済みにし、Slack へ転送

- SBI 証券はデバイス認証を行っているため、初回ログイン時には、手動でのデバイス認証が必要です。所定の手順に従って、デバイス認証を行ってください。
  - 次回以降は、cookie.json を利用してログインするため、手動でのデバイス認証は不要です。
- Slack への転送は、Webhook URL を利用して行います。事前に Slack の Incoming Webhook を設定してください。

## セットアップ

### 1. インストール

```bash
yarn install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを開いて、以下の環境変数を設定します。

```bash
USER_ID=your_user_id_here
USER_PASSWORD=your_password_here
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
```

### 3. ビルド

```bash
yarn build
```

### 4. 実行

```bash
yarn start
```

## 開発

### Run in Development Mode

```bash
yarn dev
```
