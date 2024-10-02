import { debug } from "../../utils/analytics/logger";
import { ext } from "../../utils/extension/ext";
import { ScamConclusion, ScamSiteType } from "../types/anti-scam";

const getCurrentTabProperties = async (tabId): Promise<any> => {
  const fetcher = new Promise((resolve, reject) => {
    try {
      if (typeof tabId !== "number") {
        reject(new Error(`Tab ID is not a number:${tabId}`));
        return;
      }
      ext.tabs.get(tabId, async (tab) => {
        resolve(tab);
      });
    } catch (error) {
      debug(error, "AntiScam :: getCurrentTabProperties");
    }
  });
  const tab = await fetcher;
  return tab;
};

const validateTab = (tab, tabId): Promise<ScamConclusion> =>
  new Promise((resolve) => {
    const { title, url, favIconUrl } = tab;
    let score = 0;
    let type = ScamSiteType.NO_DATA;

    if (title && url) {
      score += 20;
      if (url.startsWith("https://")) {
        score += 30;
      }
      if (favIconUrl) {
        score += 20;
      }
      if (title.length > 10) {
        score += 30;
      }
    }

    if (score > 0) {
      type = score >= 80 ? ScamSiteType.SAFE : ScamSiteType.DANGEROUS;
    }

    resolve({
      type,
      trustworthiness: score,
      tabId
    });
  });

export const examineTab = async (tabId) => {
  if (tabId) {
    try {
      const tab = await getCurrentTabProperties(tabId);
      const { title, url, pendingUrl, favIconUrl } = tab;
      debug(
        `Evaluating Tab ID: ${tab} - url: ${url} - pendingUrl: ${pendingUrl} - title: ${title} - favIconUrl: ${favIconUrl}`,
        "AntiScam ::"
      );
      const tabRate = await validateTab(tab, tabId);
      return tabRate;
    } catch (error) {
      debug(`Error evaluating tab: ${tabId}`, "AntiScam ::");
      return {
        type: ScamSiteType.NO_DATA,
        trustworthiness: null,
        tabId
      };
    }
  }
};
