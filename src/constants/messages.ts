import { i18n } from "../utils/extension/locale";
import { FAILED_SYMBOL, PASSED_SYMBOL } from "./icons";

export const isMac = () => typeof navigator !== "undefined" && /Mac/i.test(navigator.userAgent);

export const t = (key: string, data?: object) => {
  const text = i18n(key);

  if (data) {
    return formatString(text, data);
  }
  return text;
};

const formatString = (srt: string, data: object): string => {
  const stringWithPlaceholders = String(srt);
  const replacements = { ...data };
  Object.keys(replacements).forEach((key) => {
    if (replacements[key]?.i18n && typeof replacements[key].i18n === "string") {
      replacements[key] = t(replacements[key].i18n);
    }

    if (
      replacements[key] == null ||
      replacements[key] === undefined ||
      replacements[key] === "null" ||
      replacements[key] === "undefined"
    ) {
      replacements[key] = "";
    }

    if (typeof replacements[key] === "number") {
      replacements[key] = replacements[key].toString().includes(".") ? replacements[key].toFixed(2) : replacements[key];
    }

    if (Number.isNaN(replacements[key]) || replacements[key] == "NaN") {
      replacements[key] = 0;
    }
  });

  const result = stringWithPlaceholders.replace(
    /{(\w+)}/g,
    (placeholderWithDelimiters, placeholderWithoutDelimiters) =>
      replacements.hasOwnProperty(placeholderWithoutDelimiters)
        ? replacements[placeholderWithoutDelimiters]
        : placeholderWithDelimiters
  );
  return result;
};

export const isRtl = () => t("@@bidi_dir") === "rtl";

export const isDocRTL = (): boolean => {
  const lang = document.querySelector("html").getAttribute("lang");
  return document.body.getAttribute("dir") === "rtl" || lang === "he" || lang === "he-il";
};

const getDayTime = (word) => {
  if (t("hi") !== "Hi") {
    return t("hi");
  }

  const hours = new Date().getHours();
  const isMorning = hours > 6 && hours < 12;
  if (isMorning) {
    return `${word} ${t("morning")}`;
  }
  const isDay = hours >= 10 && hours < 20;
  if (isDay) {
    return `${word} ${t("day")}`;
  }
  const isNight = hours >= 20 || hours < 6;
  if (isNight) {
    return `${word} ${t("night")}`;
  }
};

export const messages = {
  // General
  good_deal_signal: `${PASSED_SYMBOL} - ${t("signal_of_a_good_deal")}`,
  bad_deal_signal: `${FAILED_SYMBOL} - ${t("signal_of_a_bad_deal")}`,
  getCurrentYear: () => {
    const year = new Date().getFullYear();
    return `@${year}`;
  },

  // Tour
  tour_step1_title: t("tour_step1_title"),
  tour_step1_text: `${getDayTime(t("good"))}${t("tour_step1_text_0")} \n ${t("tour_step1_text_3")}\n\n ${t(
    "tour_step1_text_1"
  )}  \n\n${t("tour_step1_text_2")}`,
  tour_step1_lets_start: t("tour_step1_lets_start"),

  tour_step2_title: t("tour_step2_title"),
  tour_step2_text: `${t("tour_step2_text_0")}<br><br>${t("tour_step2_text_3")}`,

  tour_step3_title: t("tour_step3_title"),
  tour_step3_text: `${t("tour_step3_text_0")} \n\n<div class='green'> ${t("tour_step3_text_1")}</div> \n
         <div class='red'> ${t("tour_step3_text_2")}</div>\n
         <div class='yellow'> ${t("tour_step3_text_3")}</div>`,

  tour_step4_title: t("tour_step4_title"),
  tour_step4_text: `${t("tour_step4_text_0")} \n\n ${t("tour_step4_text_1")}`,

  tour_step5_title: t("tour_step5_title"),
  tour_step5_text: `${t("tour_step5_text_0")} \n\n ${t("tour_step5_text_1")}`,

  tour_feedback_title: t("tour_feedback_title"),
  tour_feedback_text: `${t("tour_feedback_text")} <a target="_blank" href="https://www.joinsafedeal.com/feedback"> ${t(
    "contact_form"
  )}</a> ${t("or")} <a target='_blank' href='mailto:hi@joinsafedeal.com'> ${t("by_email")} </a> ${t(
    "or"
  )} <a target='_blank' href='tel:+16506463794'> ${t("call_as_at")} </a> 
	 &nbsp;&nbsp;|&nbsp;&nbsp;  	 
 	 <a href="https://www.joinsafedeal.com/mobile" target="_blank" rel="noreferrer noopener">
	 	<img width="20" src="data:image/png;base64,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">
	 	${t("mobile_app")}
	 </a> 
  `,
  open_client: t("click_to_reveal", { systemShortcut: isMac() ? "Option (⌥) + D" : "Alt + D" })
};
