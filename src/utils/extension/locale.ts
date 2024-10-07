import { IS_NODE, NODE_LOCALE } from "../analytics/logger";
import { browserWindow } from "../dom/html";
import { ext } from "./ext";

export const i18n = ext.i18n.getMessage;

export const LOCALE = IS_NODE ? NODE_LOCALE : i18n("@@ui_locale");
export const LOCALE_DIRECTION = IS_NODE ? "" : i18n("@@bidi_dir");
export const LOCALE_DIRECTION_OPPOSITE = LOCALE_DIRECTION === "rtl" ? "ltr" : "rtl";
export const LOCALE_DIRECTION_OPPOSITE__FLOAT = LOCALE_DIRECTION === "rtl" ? "left" : "right";

export const detectingLanguage = async (text: string = null) => {
  if (text) {
    return ext.i18n.detectLanguage(text);
  }

  if (browserWindow().document) {
    const lang = await ext.i18n.detectLanguage(browserWindow().document?.body?.innerText);
    if (lang?.languages?.length > 0) {
      const bestGuess = lang.languages.sort((a, b) => b.percentage - a.percentage)[0];
      if (lang.isReliable) {
        return bestGuess.language;
      }
      return LOCALE;
    }
    return LOCALE;
  }
  return LOCALE;
};
