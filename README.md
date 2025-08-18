# SBI Securities Notification Scraping Tool

A tool that automatically logs into SBI Securities and scrapes important notifications.

## Features

- Automatic login to SBI Securities
- Automatic scraping of notification pages
- Automatic detection of important notifications
- Console output of results

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
export PASSWORD="your_password_here"
```

Alternatively, you can create a `.env` file to configure them:

```bash
# .env file
USER_ID=your_user_id_here
PASSWORD=your_password_here
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
