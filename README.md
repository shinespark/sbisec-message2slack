# SBI Securities Messages Scraping Tool

A tool that automatically logs into SBI Securities and scrapes important notifications.

## Features

- Automatic login to SBI Securities
- Automatic scraping of notification pages
- Automatic detection of important notifications
- Console output of results
- Slack notification of important notifications

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Environment Variables

Set the following environment variables:

```bash
# SBI Securities login credentials
export USER_ID="your_user_id_here"
export USER_PASSWORD="your_password_here"
export SLACK_WEBHOOK_URL="your_slack_webhook_url_here"
```

Alternatively, you can create a `.env` file to configure them:

```bash
# .env file
USER_ID=your_user_id_here
USER_PASSWORD=your_password_here
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
```

### 3. Build TypeScript

```bash
yarn build
```

## Usage

### Run in Development Mode

```bash
yarn dev
```

### Run After Building

```bash
yarn start
```
