import React from "react";
import { createRoot } from "react-dom/client";
import ThemeProvider from "@mui/material/styles/ThemeProvider";

// Defer loading extension modules until i18n is stubbed

function makeMockProduct(): any {
  const url = "https://www.aliexpress.com/item/3256803371913623.html";
  return {
    productConclusion: "RECOMMENDED",
    product: { id: "3256803371913623", domain: "www.aliexpress.com", url } as any,
    rules: [
      {
        name: "Pricing Item Details",
        isValidRule: true,
        weight: 1,
        value: 1,
        tooltipSummary: {
          type: "SAFE",
          description: "Price trend looks stable",
          i18n: "price_trend_stable",
          ruleExplanation: "Recent prices are consistent",
          i18nExplanation: "price_trend_stable_expl"
        },
        dataset: {
          currency: "USD",
          price: [
            { date: "2024-06-01T00:00:00.000Z", price: 12.5 },
            { date: "2024-07-01T00:00:00.000Z", price: 13.0 },
            { date: "2024-08-01T00:00:00.000Z", price: 14.2 },
            { date: "2024-09-01T00:00:00.000Z", price: 15.0 },
            { date: "2024-10-01T00:00:00.000Z", price: 15.6 }
          ]
        }
      } as any,
      {
        name: "Store positive feedback",
        isValidRule: true,
        weight: 1,
        value: 1,
        tooltipSummary: {
          type: "SAFE",
          description: "Store has high positive feedback",
          i18n: "store_positive",
          ruleExplanation: "Positive rate above threshold",
          i18nExplanation: "store_positive_expl"
        }
      } as any
    ]
  };
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const theme = (params.get("theme") as "light" | "dark") || "light";
  const verdict = params.get("verdict") || "good";
  const mock = makeMockProduct();
  if (verdict === "bad") {
    mock.productConclusion = "NOT_RECOMMENDED";
    // add a red rule text
    mock.rules.push({
      name: "Low rating",
      isValidRule: true,
      weight: 1,
      value: 1,
      tooltipSummary: {
        type: "UNSAFE",
        description: "Store has low positive feedback",
        i18n: "store_negative",
        ruleExplanation: "Positive rate below threshold",
        i18nExplanation: "store_negative_expl"
      }
    } as any);
  }
  // Stub chrome.i18n BEFORE loading any extension modules
  const messages = require("../../src/browser-extension/public/_locales/en/messages.json");
  (window as any).chrome = (window as any).chrome || {};
  (window as any).chrome.i18n = {
    getMessage: (key: string) => {
      if (key === "@@bidi_dir") return "ltr";
      if (key === "@@ui_locale") return "en";
      return (messages as any)[key]?.message || key;
    }
  };
  (window as any).browser = (window as any).browser || {};
  (window as any).browser.i18n = (window as any).chrome.i18n;

  // Now require real modules (after stubbing i18n)
  const { getSafeDealTheme } = require("../../src/utils/react/theme");
  const { ProductFull } = require("../../src/e-commerce/client/components/product/ProductFull");
  // Styles: tokens + panel styles
  require("../../src/e-commerce/client/assets/_theme.scss");
  require("../../src/e-commerce/client/assets/_product-full.scss");
  require("../../src/e-commerce/client/assets/_rules.scss");
  require("../../src/e-commerce/client/components/product/components/PriceHistory/PriceChart.scss");
  // Align chart theme store with requested theme
  try {
    const { useThemeStore } = require("../../src/store/ThemeState");
    useThemeStore.getState().setEffective(theme);
  } catch {}
  return (
    <ThemeProvider theme={getSafeDealTheme(theme)}>
      <div id="safe-deal-react-toolbar" className="safe-deal-page-container" data-theme={theme}>
        <ProductFull product={mock as any} />
      </div>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("panel-root") as HTMLElement).render(<App />);

