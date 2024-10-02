import { SAFE_DEAL_OFF } from "../../constants/sites";
import { debug } from "../../utils/analytics/logger";
import { ext } from "../../utils/extension/ext";

const MIN_DELAY_MINUTES = 0.8;
const MAX_DELAY_MINUTES = 1.8;

const MIN_INTERVAL_IN_MS = MIN_DELAY_MINUTES * 60 * 1000;
const MAX_INTERVAL_IN_MS = MAX_DELAY_MINUTES * 60 * 1000;
const MAX_LINKS_OPENED_IN_TAB = 50;

const MAX_LINK_OPENING_IN_SEC = 10;
const IS_PINNED_TAB = true;

const REFERRER = "https://const.joinsafedeal.com/ads/?url=";

export class ShutafTabManger {
  static shutaffTabId: number | string | null = null;

  static requests: string[] = [];

  static currentLinkOpeningTime: Date | null = null;

  static interval: number | null = null;

  public static initialize() {
    const scheduleNextOpenTab = () => {
      const openTabsWrapper = async () => {
        await this.openTabLogic();
        scheduleNextOpenTab();
      };

      this.interval = MIN_INTERVAL_IN_MS + Math.random() * (MAX_INTERVAL_IN_MS - MIN_INTERVAL_IN_MS);
      debug(`Shutaff:: openTabsWrapper interval in minutes: ${this.interval / 1000 / 60}`);

      setTimeout(openTabsWrapper, this.interval);
    };

    scheduleNextOpenTab();
  }

  public static scheduleShutafLink(url: string) {
    if (url.includes(SAFE_DEAL_OFF) || this.currentLinkOpeningTime) {
      debug(`Shutaff:: scheduleShutafLink url: ${url} won't be added.`);
      return;
    }

    debug(`Shutaff:: scheduleShutafLink added to open: ${url}`);
    this.requests.push(url);
    debug(`Shutaff:: scheduleShutafLink Requests: ${this.requests.length}`);
  }

  private static async openNewTab(): Promise<void> {
    return new Promise((resolve) => {
      ext.tabs.create(
        {
          active: false,
          pinned: IS_PINNED_TAB
        },
        (tab) => {
          if (tab.id !== undefined) {
            this.shutaffTabId = tab.id;
          }
          this.currentLinkOpeningTime = null;
          resolve();
        }
      );
    });
  }

  private static async isTabExist(): Promise<boolean> {
    if (typeof this.shutaffTabId !== "number") {
      return false;
    }

    try {
      const tab = await ext.tabs.get(this.shutaffTabId);
      const isExist = tab?.id > 0;
      return isExist;
    } catch (error) {
      debug(error);
      return false;
    }
  }

  private static async closeTab(): Promise<void> {
    debug(`Shutaff:: closing tab: ${this.shutaffTabId} `);
    return new Promise((resolve) => {
      if (this.shutaffTabId) {
        ext.tabs.remove(this.shutaffTabId, () => {
          this.shutaffTabId = null;
          debug(`Shutaff:: closing tab: ${this.shutaffTabId}  tab closed.`);
          resolve();
        });
      } else {
        debug(`Shutaff:: closing tab: ${this.shutaffTabId}  tab not existed.`);
        resolve();
      }
    });
  }

  private static isThereWorkLeft(): boolean {
    return this.requests.length > 0;
  }

  private static async openTabLogic() {
    if (!this.isThereWorkLeft()) {
      return;
    }

    if (this.currentLinkOpeningTime) {
      debug(`Shutaff:: currentLinkOpeningTime: ${this.currentLinkOpeningTime} `);
      return;
    }

    let isTabExist = await this.isTabExist();
    if (!isTabExist) {
      await this.openNewTab();
    }

    debug(`Shutaff:: openTabLogic tab: ${this.shutaffTabId} `);
    this.currentLinkOpeningTime = new Date();

    debug(`Shutaff:: requests: ${JSON.stringify(this.requests, null, 2)} `);
    isTabExist = await this.isTabExist();
    let maxTabsAmount = MAX_LINKS_OPENED_IN_TAB;
    while (isTabExist && this.isThereWorkLeft() && maxTabsAmount > 0) {
      const targetUrl = this.requests.pop();
      if (targetUrl) {
        const link = `${targetUrl}#${SAFE_DEAL_OFF}`;
        await this.updateTabWithLink(link);
        debug(`Shutaff:: Link: ${link} done, requests left: ${JSON.stringify(this.requests, null, 2)} `);
        maxTabsAmount -= 1;
      }
    }
    this.currentLinkOpeningTime = null;
    this.closeTab();
  }

  public static async updateTabWithLink(link: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const referrerLink = `${REFERRER}${encodeURIComponent(link)}`;
      debug(`Shutaf:: updateTabWithLink link: ${link} referrerLink: ${referrerLink}`);

      this.currentLinkOpeningTime = new Date();
      let timeoutId;
      const listener = (tabId: number, changeInfo: any) => {
        if (tabId === this.shutaffTabId && changeInfo.status === "complete") {
          debug(`Shutaf:: updateTabWithLink closing is ready: ${link}`);
          ext.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeoutId);
          resolve();
        }
      };

      timeoutId = setTimeout(() => {
        ext.tabs.onUpdated.removeListener(listener);
        debug(`Shutaf:: updateTabWithLink closing is timeout: ${link}`);
        resolve();
      }, MAX_LINK_OPENING_IN_SEC * 1000);

      ext.tabs.onUpdated.addListener(listener);
      ext.tabs.update(this.shutaffTabId, { url: referrerLink }, () => {
        debug(`Shutaf:: Tab updated with link: ${referrerLink}`);
      });
    });
  }
}
