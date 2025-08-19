import { SbiSecBrowser } from "./lib/services/browser";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const scraper = new SbiSecBrowser();

  try {
    const userId = process.env.USER_ID;
    const userPassword = process.env.USER_PASSWORD;

    if (!userId || !userPassword) {
      console.error("環境変数 USER_ID と USER_PASSWORD を設定してください");
      process.exit(1);
    }

    console.log("SBI証券スクレイピングを開始します...");

    // 初期化
    await scraper.initialize();

    // ログイン
    const loginSuccess = await scraper.login(userId, userPassword);
    if (!loginSuccess) {
      console.error("ログインに失敗しました");
      return;
    }

    // 重要なお知らせをスクレイピング
    const messageLinks = await scraper.scrapeImportantMessageLinks();
    if (messageLinks.length === 0) {
      console.log("未確認の重要なお知らせはありません");
      return;
    }

    const messages = await scraper.scrapeImportantMessages(messageLinks);
    console.log(messages);
  } catch (error) {
    console.error("エラーが発生しました:", error);
  } finally {
    // ブラウザを閉じる
    // await scraper.close();
  }
})();
