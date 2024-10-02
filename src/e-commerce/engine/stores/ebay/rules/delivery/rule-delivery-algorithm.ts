import { differenceInDays, format, isAfter, parse } from "date-fns";
import { RULE_VALUE } from "../../../../../../constants/rule-value";
import { selectFromRange } from "../../../../../../utils/general/general";
import { MONTH_MULTI_TEXT } from "../../../../../../utils/multilang/languages";

const LOCAL_DELIVERY_BRACKETS = [
  { start: 0, end: 3, value: RULE_VALUE.RULE_VAL_10 },
  { start: 4, end: 7, value: RULE_VALUE.RULE_VAL_9 },
  { start: 8, end: 13, value: RULE_VALUE.RULE_VAL_8 },
  { start: 13, end: 15, value: RULE_VALUE.RULE_VAL_5 },
  { start: 16, end: 22, value: RULE_VALUE.RULE_VAL_4 },
  { start: 23, end: 40, value: RULE_VALUE.RULE_VAL_3 },
  { start: 41, end: 100, value: RULE_VALUE.RULE_VAL_1 }
];

const INTERNATIONAL_DELIVERY_BRACKETS = [
  { start: 0, end: 14, value: RULE_VALUE.RULE_VAL_10 },
  { start: 15, end: 22, value: RULE_VALUE.RULE_VAL_9 },
  { start: 23, end: 30, value: RULE_VALUE.RULE_VAL_8 },
  { start: 31, end: 45, value: RULE_VALUE.RULE_VAL_5 },
  { start: 46, end: 50, value: RULE_VALUE.RULE_VAL_2 },
  { start: 51, end: 100, value: RULE_VALUE.RULE_VAL_1 }
];

const findEnglishMonth = (monthText: string): string => {
  for (const [englishMonth, translations] of Object.entries(MONTH_MULTI_TEXT)) {
    if (translations.some((translation) => monthText.includes(translation))) {
      return englishMonth;
    }
  }
  return monthText;
};

export const ebayDeliveryTextToDate = (input: string): Date => {
  const regex = /(\bMon|Tue|Wed|Thu|Fri|Sat|Sun),\s(Feb|Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{1,2})/g;
  let latestDate: Date | null = null;
  let match = regex.exec(input);

  while (match) {
    const [, , month, day] = match;
    const year = new Date().getFullYear(); // Assuming current year for simplicity
    const englishMonth = findEnglishMonth(month); // Convert month to English if needed
    const dateStr = `${englishMonth} ${day}, ${year}`;
    const date = parse(dateStr, "MMM d, yyyy", new Date());

    if (!latestDate || isAfter(date, latestDate)) {
      latestDate = date;
    }

    match = regex.exec(input);
  }

  return latestDate;
};

const deliveryTimeInDays = (deliveryDate) => {
  const today = new Date();
  const deliveryDays = differenceInDays(deliveryDate, today);
  return deliveryDays;
};

export const calculateDeliveryValueAlgorithm = (deliveryInfoTxt: string, internationalDelivery: boolean): any => {
  const deliveryDate: Date = ebayDeliveryTextToDate(deliveryInfoTxt);
  const days = deliveryTimeInDays(deliveryDate);
  let score = selectFromRange(LOCAL_DELIVERY_BRACKETS, days);
  if (internationalDelivery) {
    score = selectFromRange(INTERNATIONAL_DELIVERY_BRACKETS, days);
  }
  return { score, days };
};
