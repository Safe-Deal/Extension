export const DOMAIN_LANG_MAPPING = {
  aliexpress: {
    en: "www.aliexpress.com",
    en_us: "www.aliexpress.us",
    es: "es.aliexpress.com",
    fr: "fr.aliexpress.com",
    de: "de.aliexpress.com",
    ru: "aliexpress.ru",
    pt: "pt.aliexpress.com",
    it: "it.aliexpress.com",
    nl: "nl.aliexpress.com",
    tr: "tr.aliexpress.com",
    ja: "ja.aliexpress.com",
    ko: "ko.aliexpress.com",
    ar: "ar.aliexpress.com",
    th: "th.aliexpress.com",
    vi: "vi.aliexpress.com",
    id: "id.aliexpress.com",
    he: "he.aliexpress.com",
    pl: "pl.aliexpress.com",
    ro: "ro.aliexpress.com",
    cs: "cs.aliexpress.com",
    sv: "sv.aliexpress.com",
    da: "da.aliexpress.com",
    fi: "fi.aliexpress.com",
    hu: "hu.aliexpress.com",
    bg: "bg.aliexpress.com",
    sk: "sk.aliexpress.com",
    lt: "lt.aliexpress.com",
    lv: "lv.aliexpress.com",
    sl: "sl.aliexpress.com"
  },
  amazon: {
    en: "www.amazon.com",
    es: "www.amazon.es",
    fr: "www.amazon.fr",
    de: "www.amazon.de",
    jp: "www.amazon.co.jp",
    it: "www.amazon.it",
    ca: "www.amazon.ca",
    cn: "www.amazon.cn",
    in: "www.amazon.in",
    mx: "www.amazon.com.mx",
    au: "www.amazon.com.au",
    br: "www.amazon.com.br",
    nl: "www.amazon.nl",
    ae: "www.amazon.ae",
    sg: "www.amazon.sg",
    tr: "www.amazon.com.tr",
    sa: "www.amazon.sa",
    se: "www.amazon.se",
    pl: "www.amazon.pl",
    za: "www.amazon.co.za"
  },
  ebay: {
    en: "www.ebay.com",
    es: "www.ebay.es",
    fr: "www.ebay.fr",
    de: "www.ebay.de",
    it: "www.ebay.it",
    ca: "www.ebay.ca",
    au: "www.ebay.com.au",
    at: "www.ebay.at",
    be_fr: "www.befr.ebay.be",
    be_nl: "www.benl.ebay.be",
    ch: "www.ebay.ch",
    cn: "www.ebay.cn",
    hk: "www.ebay.com.hk",
    ie: "www.ebay.ie",
    in: "www.ebay.in",
    my: "www.ebay.com.my",
    nl: "www.ebay.nl",
    ph: "www.ebay.ph",
    pl: "www.ebay.pl",
    sg: "www.ebay.com.sg",
    za: "www.ebay.co.za"
  }
};

export const DOMAIN_CURRENCY_MAPPING = {
  aliexpress: {
    en: { symbol: "$", name: "USD" },
    en_us: { symbol: "$", name: "USD" },
    es: { symbol: "€", name: "EUR" },
    fr: { symbol: "€", name: "EUR" },
    de: { symbol: "€", name: "EUR" },
    ru: { symbol: "₽", name: "RUB" },
    pt: { symbol: "€", name: "EUR" },
    it: { symbol: "€", name: "EUR" },
    nl: { symbol: "€", name: "EUR" },
    tr: { symbol: "₺", name: "TRY" },
    ja: { symbol: "¥", name: "JPY" },
    ko: { symbol: "₩", name: "KRW" },
    ar: { symbol: "د.إ", name: "AED" },
    th: { symbol: "฿", name: "THB" },
    vi: { symbol: "₫", name: "VND" },
    id: { symbol: "Rp", name: "IDR" },
    he: { symbol: "₪", name: "ILS" },
    pl: { symbol: "zł", name: "PLN" },
    ro: { symbol: "lei", name: "RON" },
    cs: { symbol: "Kč", name: "CZK" },
    sv: { symbol: "kr", name: "SEK" },
    da: { symbol: "kr", name: "DKK" },
    fi: { symbol: "€", name: "EUR" },
    hu: { symbol: "Ft", name: "HUF" },
    bg: { symbol: "лв", name: "BGN" },
    sk: { symbol: "€", name: "EUR" },
    lt: { symbol: "€", name: "EUR" },
    lv: { symbol: "€", name: "EUR" },
    sl: { symbol: "€", name: "EUR" }
  },
  amazon: {
    en: { symbol: "$", name: "USD" },
    es: { symbol: "€", name: "EUR" },
    fr: { symbol: "€", name: "EUR" },
    de: { symbol: "€", name: "EUR" },
    jp: { symbol: "¥", name: "JPY" },
    it: { symbol: "€", name: "EUR" },
    ca: { symbol: "$", name: "CAD" },
    cn: { symbol: "¥", name: "CNY" },
    in: { symbol: "₹", name: "INR" },
    mx: { symbol: "$", name: "MXN" },
    au: { symbol: "$", name: "AUD" },
    br: { symbol: "R$", name: "BRL" },
    nl: { symbol: "€", name: "EUR" },
    ae: { symbol: "د.إ", name: "AED" },
    sg: { symbol: "$", name: "SGD" },
    tr: { symbol: "₺", name: "TRY" },
    sa: { symbol: "ر.س", name: "SAR" },
    se: { symbol: "kr", name: "SEK" },
    pl: { symbol: "zł", name: "PLN" },
    za: { symbol: "R", name: "ZAR" }
  },
  ebay: {
    en: { symbol: "$", name: "USD" },
    es: { symbol: "€", name: "EUR" },
    fr: { symbol: "€", name: "EUR" },
    de: { symbol: "€", name: "EUR" },
    it: { symbol: "€", name: "EUR" },
    ca: { symbol: "$", name: "CAD" },
    au: { symbol: "$", name: "AUD" },
    at: { symbol: "€", name: "EUR" },
    be_fr: { symbol: "€", name: "EUR" },
    be_nl: { symbol: "€", name: "EUR" },
    ch: { symbol: "CHF", name: "CHF" },
    cn: { symbol: "¥", name: "CNY" },
    hk: { symbol: "$", name: "HKD" },
    ie: { symbol: "€", name: "EUR" },
    in: { symbol: "₹", name: "INR" },
    my: { symbol: "RM", name: "MYR" },
    nl: { symbol: "€", name: "EUR" },
    ph: { symbol: "₱", name: "PHP" },
    pl: { symbol: "zł", name: "PLN" },
    sg: { symbol: "$", name: "SGD" },
    za: { symbol: "R", name: "ZAR" }
  }
};

export const SMALL_LANGUAGES = [
  "am",
  "bg",
  "ca",
  "cs",
  "da",
  "el",
  "et",
  "fi",
  "fil",
  "gu",
  "he",
  "hr",
  "hu",
  "kn",
  "lt",
  "lv",
  "ml",
  "mr",
  "ms",
  "no",
  "ro",
  "sk",
  "sl",
  "sr",
  "sw",
  "ta",
  "te",
  "uk",
  "vi"
];

type DomainToLangMapping = { [key: string]: string };
export const DOMAIN_LTD_TO_LANG_MAP: DomainToLangMapping = {
  com: "en_US", // General global domain
  us: "en_US", // United States
  ru: "ru_RU", // Russia
  es: "es_ES", // Spain
  fr: "fr_FR", // France
  de: "de_DE", // Germany
  it: "it_IT", // Italy
  nl: "nl_NL", // Netherlands
  pl: "pl_PL", // Poland
  tr: "tr_TR", // Turkey
  pt: "pt_PT", // Portugal
  cz: "cs_CZ", // Czech Republic
  hu: "hu_HU", // Hungary
  fi: "fi_FI", // Finland
  no: "nb_NO", // Norway
  se: "sv_SE", // Sweden
  dk: "da_DK", // Denmark
  jp: "ja_JP", // Japan
  in: "hi_IN", // India
  ca: "en_CA", // Canada
  vn: "vi_VN", // Vietnam
  ae: "ar_AE", // United Arab Emirates
  "com.br": "pt_BR", // Brazil
  "com.tr": "tr_TR", // Turkey
  "com.mx": "es_MX", // Mexico
  "com.au": "en_AU", // Australia
  "co.kr": "ko_KR", // South Korea
  "co.id": "id_ID", // Indonesia
  "co.th": "th_TH", // Thailand
  "co.za": "en_ZA", // South Africa
  "co.il": "he_IL", // Israel
  sg: "en_SG", // Singapore
  my: "ms_MY", // Malaysia
  gr: "el_GR", // Greece
  cl: "es_CL", // Chile
  co: "es_CO", // Colombia
  za: "en_ZA", // South Africa
  ua: "uk_UA", // Ukraine
  at: "de_AT", // Austria
  ch: "de_CH", // Switzerland
  be: "nl_BE" // Belgium
};
