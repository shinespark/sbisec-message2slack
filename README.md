# SBI Securities Messages Scraping Tool

A tool that automatically logs into SBI Securities and scrapes important messages.

<img width="525" alt="slack" src="https://github.com/user-attachments/assets/a1d568f7-feb2-4f84-9e39-978b6fd4885d" />

<img width="600" alt="no_unconfirmed_important_messages!" src="https://github.com/user-attachments/assets/130f2f95-19c0-4cc0-9ada-2906c0e18b71" />


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
