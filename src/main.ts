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
    const messageLinks = await scraper.scrapeMessageLinks();

    console.log(messageLinks);

    // // 結果を表示
    // console.log("\n=== 重要なお知らせ ===");
    // const importantNotices = notices.filter((notice) => notice.isImportant);

    // if (importantNotices.length === 0) {
    //   console.log("重要なお知らせはありません");
    // } else {
    //   importantNotices.forEach((notice, index) => {
    //     console.log(`\n${index + 1}. ${notice.date}`);
    //     console.log(`   タイトル: ${notice.title}`);
    //     if (notice.content) {
    //       console.log(`   内容: ${notice.content}`);
    //     }
    //     console.log("   ---");
    //   });
    // }

    // // すべてのお知らせも表示
    // console.log("\n=== すべてのお知らせ ===");
    // notices.forEach((notice, index) => {
    //   console.log(
    //     `${index + 1}. [${notice.isImportant ? "重要" : "通常"}] ${
    //       notice.date
    //     } - ${notice.title}`
    //   );
    // });
  } catch (error) {
    console.error("エラーが発生しました:", error);
  } finally {
    // ブラウザを閉じる
    // await scraper.close();
  }
})();
