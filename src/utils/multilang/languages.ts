import { parse } from "tldjs"
import {
	DOMAIN_CURRENCY_MAPPING,
	DOMAIN_LANG_MAPPING,
	DOMAIN_LTD_TO_LANG_MAP,
	SMALL_LANGUAGES
} from "./domainLanguages"

export const FREE_SHIPPING_TEXT = [
	"free",
	"مجانا",
	"免费",
	"免費",
	"gratuitement",
	"umsonst",
	"חינם",
	"de graça",
	"бесплат",
	"gratuitamente"
]

export const MONTH_MULTI_TEXT = {
	january: ["янв", "يناير", "يناير", "janvier", "januar", "ינואר", "janeiro", "январь", "enero"],
	february: ["фев", "فبراير", "فبراير", "février", "februar", "פברואר", "fevereiro", "февраль", "febrero"],
	march: ["мар", "مارس", "مارس", "mars", "marzo", "מרץ", "março", "март", "marzo"],
	april: ["апр", "апрель", "апрель", "avril", "abril", "אפריל", "abril", "апрель", "abril"],
	may: ["май", "май", "май", "mai", "mayo", "מאי", "maio", "май", "mayo"],
	june: ["июн", "июнь", "июнь", "juin", "junio", "יוני", "junho", "июнь", "junio"],
	july: ["июл", "июль", "июль", "juillet", "julio", "יולי", "julho", "июль", "julio"],
	august: ["авг", "август", "август", "août", "agosto", "אוגוסט", "agosto", "август", "agosto"],
	september: ["сен", "сентябрь", "сентябрь", "septembre", "setembro", "ספטמבר", "setembro", "сентябрь", "septiembre"],
	october: ["окт", "октябрь", "октябрь", "octobre", "outubro", "אוקטובר", "outubro", "октябрь", "octubre"],
	november: ["ноя", "ноябрь", "ноябрь", "novembre", "novembro", "נובמבר", "novembro", "ноябрь", "noviembre"],
	december: ["дек", "декабрь", "декабрь", "décembre", "dezembro", "דצמבר", "dezembro", "декабрь", "diciembre"]
}

export const AND_MULTILINGUAL = ["and", "و", "和", "和", "et", "und", "ו", "और", "e", "и"]
export const stripAllNotEnglish = (input: string) => input.replace(/[^a-zA-Z0-9 ]/g, "")

export const NO = ["not", "لا", "不", "non", "nicht", "לא", "नहीं", "non", "não", "не"]
export const BUYER = [
	"buyer",
	"مشتر",
	"买方",
	"acheteur",
	"Käufer",
	"הקונה",
	"क्रेता",
	"compratore",
	"comprador",
	"покупатель"
]

export const DAY = ["day", "يوم", "日", "jour", "día", "יום", "dia", "день", "día", "день"]

export const isContainedIn = (text: string, multi: string[] = []): boolean => {
	if (!text) return false

	return multi.some((x: string) => text?.toLowerCase().includes(x?.toLowerCase()))
}

export const getAliExpressLangByDomainLtd = (domainExtension: string): string =>
	DOMAIN_LTD_TO_LANG_MAP[domainExtension] || "en_US"

export const isSmallLanguage = (localeCode) => SMALL_LANGUAGES.includes(localeCode)

export const isDomainSmallLanguage = (domain) => {
	for (const platform in DOMAIN_LANG_MAPPING) {
		if (Object.prototype.hasOwnProperty.call(DOMAIN_LANG_MAPPING, platform)) {
			for (const localeCode in DOMAIN_LANG_MAPPING[platform]) {
				if (Object.prototype.hasOwnProperty.call(DOMAIN_LANG_MAPPING[platform], localeCode)) {
					if (DOMAIN_LANG_MAPPING[platform][localeCode] === domain) {
						return isSmallLanguage(localeCode)
					}
				}
			}
		}
	}
	return false
}

type DomainCurrency = {
  symbol: string;
  name: string;
};

export const getDomainCurrency = (url: string): DomainCurrency => {
	const parsedUrl = parse(url)
	const { hostname } = parsedUrl

	if (hostname) {
		const domainKey = Object.keys(DOMAIN_LANG_MAPPING).find((key) =>
			Object.values(DOMAIN_LANG_MAPPING[key])?.some((value: string) => value.includes(hostname))
		)

		if (domainKey) {
			const subdomainKey = Object.keys(DOMAIN_LANG_MAPPING[domainKey]).find((sub) =>
				DOMAIN_LANG_MAPPING[domainKey][sub]?.includes(hostname)
			)
			const currency = DOMAIN_CURRENCY_MAPPING[domainKey][subdomainKey] || DOMAIN_CURRENCY_MAPPING[domainKey]?.en
			return currency
		}
	}
	return null
}
