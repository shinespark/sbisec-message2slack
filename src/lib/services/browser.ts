import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";

const SBI_SEC_LOGIN_URL = "https://www.sbisec.co.jp/ETGate";
const SBI_SEC_IMPORTANT_MESSAGE_URL =
  "https://site1.sbisec.co.jp/ETGate/?_ControlID=WPLETmbR001Control&_PageID=WPLETmbR001Rsub15&_DataStoreID=DSWPLETmbR001Control&_ActionID=DefaultAID&message_filter_value=2&category_id=03&max_cnt_mb=200";
const COOKIES_FILE = "cookies.json";

const DOM_CONTENT_LOADED = "domcontentloaded";
const TIMEOUT = 10000;

interface SbiSecMessageLink {
  title: string;
  url: string;
}

export interface SbiSecMessage {
  isDeletable: boolean;
  receivedDate: string;
  dueDate: string;
  title: string;
  url: string;
  isConfirmed: boolean;
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

      // SBI証券のログインページにアクセス
      await this.page.goto(SBI_SEC_LOGIN_URL, {
        waitUntil: DOM_CONTENT_LOADED,
      });

      // ログインフォームが表示されるまで待機
      await this.page.waitForSelector("input[name='user_id']");

      console.log("ログインフォームに入力中...");

      // ユーザーIDとパスワードを入力
      await this.page.type("input[name='user_id']", userId);
      await this.page.type("input[name='user_password']", password);

      // ログインボタンをクリック
      await this.page.click("input[name='ACT_login']");

      // ログイン後のページ読み込みを待機
      await this.page.waitForNavigation({
        waitUntil: DOM_CONTENT_LOADED,
      });

      // 実際にはここでデバイス認証待ちがある
      console.log("デバイス認証待ち中...");
      // TODO: ホームに遷移できていたらskipするようにしてもいいかも
      await new Promise((resolve) => setTimeout(resolve, 60000));

      console.log("ログイン完了");
      await this.updateCookies();
      return true;
    } catch (error) {
      console.error("ログインに失敗しました:", error);
      return false;
    }
  }

  async updateCookies(): Promise<void> {
    const cookies = await this.browser?.cookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies));
  }

  async scrapeMessageLinks(): Promise<SbiSecMessageLink[]> {
    if (!this.page) throw new Error("ページが初期化されていません");

    try {
      console.log("重要なお知らせページにアクセス中...");

      // お知らせページにアクセス
      await this.page.goto(SBI_SEC_IMPORTANT_MESSAGE_URL, {
        waitUntil: DOM_CONTENT_LOADED,
      });

      // お知らせ一覧が表示されるまで待機
      await this.page.waitForSelector("form > table:nth-of-type(2) a", {
        timeout: TIMEOUT,
      });

      console.log("お知らせをスクレイピング中...");

      // お知らせの情報を抽出
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
      console.log(`${messageLinks.length}件のお知らせを取得しました`);
      return messageLinks;
    } catch (error) {
      console.error("お知らせのスクレイピングに失敗しました:", error);
      return [];
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
