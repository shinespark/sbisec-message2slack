import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";

const LOGIN_URL = "https://www.sbisec.co.jp/ETGate";
const HOME_URL = "https://site1.sbisec.co.jp/ETGate/";
const UNCONFIRMED_IMPORTANT_MESSAGES_URL =
  "https://site1.sbisec.co.jp/ETGate/?_ControlID=WPLETmbR001Control&_PageID=WPLETmbR001Rsub15&_DataStoreID=DSWPLETmbR001Control&_ActionID=DefaultAID&category_id=03&max_cnt_mb=200&message_filter_value=2";

const COOKIES_FILE = "tmp/cookies.json";
const DOM_CONTENT_LOADED = "domcontentloaded";
const TIMEOUT = 10000;
const DEVICE_AUTH_TIMEOUT = 60000;
const DEVICE_AUTH_CHECK_INTERVAL = 5000;

interface ImportantMessageLink {
  title: string;
  url: string;
}

export interface ImportantMessage {
  // NOTE: tableレイアウトのため、スクレイピングが面倒なので一旦コメントアウト
  // isDeletable: boolean;
  // receivedDate: string;
  // dueDate: string;
  title: string;
  url: string;
  // isConfirmed: boolean;
  body: string;
}

export class SbiSecBrowser {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: false, // デバッグ用にブラウザを表示
      args: ["--window-size=1280,800"],
      defaultViewport: { width: 1280, height: 720 },
    });
    if (fs.existsSync(COOKIES_FILE)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, "utf8"));
      await this.browser.setCookie(...cookies);
    }

    this.page = await this.browser.newPage();
  }

  async login(userId: string, password: string): Promise<boolean> {
    if (!this.page) throw new Error("ページが初期化されていません");

    try {
      console.log("SBI証券のログインページにアクセス中...");

      await this.page.goto(LOGIN_URL, {
        waitUntil: DOM_CONTENT_LOADED,
      });

      await this.page.waitForSelector("input[name='user_id']");

      console.log("ログインフォームに入力中...");

      // ユーザーIDとパスワードを入力
      await this.page.type("input[name='user_id']", userId);
      await this.page.type("input[name='user_password']", password);
      await this.page.click("input[name='ACT_login']");

      // ログイン後のページ読み込みを待機
      await this.page.waitForNavigation({
        waitUntil: DOM_CONTENT_LOADED,
      });

      // デバイス認証の完了まで待機
      const deviceAuthSuccess = await this.waitForDeviceAuth();
      if (!deviceAuthSuccess) {
        console.log("デバイス認証に失敗しました");
        return false;
      }

      console.log("ログイン完了");
      await this.updateCookies();
      return true;
    } catch (error) {
      console.error("ログインに失敗しました:", error);
      return false;
    }
  }

  async waitForDeviceAuth(): Promise<boolean> {
    if (!this.page) throw new Error("ページが初期化されていません");
    console.log("デバイス認証を待機中...");

    const startTime = Date.now();
    while (DEVICE_AUTH_TIMEOUT > Date.now() - startTime) {
      const currentUrl = this.page.url();
      if (currentUrl === HOME_URL) {
        return true;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, DEVICE_AUTH_CHECK_INTERVAL)
      );
    }

    console.log("デバイス認証が完了しませんでした");
    return false;
  }

  async updateCookies(): Promise<void> {
    const cookies = await this.browser?.cookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies));
  }

  async scrapeImportantMessageLinks(): Promise<ImportantMessageLink[]> {
    if (!this.page) throw new Error("ページが初期化されていません");

    try {
      console.log("重要なお知らせ一覧にアクセス中...");

      await this.page.goto(UNCONFIRMED_IMPORTANT_MESSAGES_URL, {
        waitUntil: DOM_CONTENT_LOADED,
      });

      await this.page.waitForSelector("form > table:nth-of-type(2) a", {
        timeout: TIMEOUT,
      });

      console.log("重要なお知らせ一覧をスクレイピング中...");

      const messageLinks = await this.page.$$eval(
        "form > table:nth-of-type(2) a",
        (elements) => {
          return elements.map((element) => {
            return {
              title: element.textContent,
              url: element.href,
            };
          });
        }
      );
      console.log(`${messageLinks.length}件の重要なお知らせを取得しました`);
      return messageLinks;
    } catch (error) {
      console.error("重要なお知らせ一覧のスクレイピングに失敗しました:", error);
      return [];
    }
  }

  async scrapeImportantMessages(
    messageLinks: ImportantMessageLink[]
  ): Promise<ImportantMessage[]> {
    try {
      const messages: ImportantMessage[] = [];
      for (const messageLink of messageLinks) {
        const message = await this.scrapeImportantMessage(messageLink);
        if (message) {
          messages.push(message);
        }
        // TODO: 開発中は1件でリターン
        return messages;
      }
      return messages;
    } catch (error) {
      return [];
    }
  }

  async scrapeImportantMessage(
    messageLink: ImportantMessageLink
  ): Promise<ImportantMessage | null> {
    if (!this.page) throw new Error("ページが初期化されていません");

    try {
      await this.page.goto(messageLink.url, {
        waitUntil: DOM_CONTENT_LOADED,
      });

      await this.page.waitForSelector("form > table:nth-of-type(3)", {
        timeout: TIMEOUT,
      });

      const body = await this.page.$eval(
        "form > table:nth-of-type(3)",
        (element) => element.textContent
      );
      const message: ImportantMessage = {
        title: messageLink.title,
        url: messageLink.url,
        body: this.normalizeText(body),
      };

      // "電子交付に同意し、書面内容を理解しました"
      await this.page.click("input[name='ACT_estimate']");

      return message;
    } catch (error) {
      console.error("重要なお知らせのスクレイピングに失敗しました:", error);
      return null;
    }
  }

  private normalizeText(text: string | null): string {
    if (!text) return "";

    return text
      .trim() // 行頭・行末の空白・改行を削除
      .replace(/\n\s*\n/g, "\n") // 複数回連続の改行を単一の改行に
      .replace(/\n\s+/g, "\n") // 改行後の行頭空白を削除
      .replace(/\s+\n/g, "\n"); // 改行前の行末空白を削除
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
