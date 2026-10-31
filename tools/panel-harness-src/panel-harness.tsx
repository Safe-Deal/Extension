import React from "react";
import { createRoot } from "react-dom/client";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { getSafeDealTheme } from "../../src/utils/react/theme";
import { ProductFull } from "../../src/e-commerce/client/components/product/ProductFull";
import { ProductConclusionEnum, IConclusionProductEntity } from "../../src/e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import { PRICING_ITEM_DETAILS } from "../../src/e-commerce/engine/logic/utils/const";

// Styles: tokens + panel styles
import "../../src/e-commerce/client/assets/_theme.scss";
import "../../src/e-commerce/client/assets/_product-full.scss";
import "../../src/e-commerce/client/assets/_rules.scss";
import "../../src/e-commerce/client/components/product/components/PriceHistory/PriceChart.scss";

function makeMockProduct(): IConclusionProductEntity {
  const url = "https://www.aliexpress.com/item/3256803371913623.html";
  return {
    productConclusion: ProductConclusionEnum.RECOMMENDED,
    product: { id: "3256803371913623", domain: "www.aliexpress.com", url } as any,
    rules: [
      {
        name: PRICING_ITEM_DETAILS,
        isValidRule: true,
        weight: 1,
        value: 1,
        tooltipSummary: {
          type: "SAFE" as any,
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
          type: "SAFE" as any,
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
  const mock = makeMockProduct();
  return (
    <ThemeProvider theme={getSafeDealTheme(theme)}>
      <div id="safe-deal-react-toolbar" className="safe-deal-page-container" data-theme={theme}>
        <ProductFull product={mock as any} />
      </div>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("panel-root") as HTMLElement).render(<App />);

