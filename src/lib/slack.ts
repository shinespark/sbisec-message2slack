import { IncomingWebhook } from "@slack/webhook";
import { ImportantMessage } from "./browser";

const SLACK_WEBHOOK_LIMIT = 10;

export async function sendSlackNotification(
  importantMessages: ImportantMessage[],
  slackWebhookUrl: string
) {
  const webhook = new IncomingWebhook(slackWebhookUrl);

  for (const importantMessage of importantMessages.slice(
    0,
    SLACK_WEBHOOK_LIMIT
  )) {
    const slackMessage = buildSlackMessage(importantMessage);
    await webhook.send(slackMessage);
  }
}

function buildSlackMessage(message: ImportantMessage) {
  return {
    attachments: [
      {
        color: "good",
        title: message.title,
        title_link: message.url,
        fields: [
          {
            title: "本文",
            value: message.body,
          },
        ],
      },
    ],
  };
}
