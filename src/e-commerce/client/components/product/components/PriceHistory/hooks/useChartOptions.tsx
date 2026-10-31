import { useMemo } from "react";
import { getChartOptions } from "../data/PriceChartOptions";

export const useChartOptions = (chartData, bg, currency, displayedCurrency, theme: "light" | "dark") =>
  useMemo(
    () => getChartOptions({ hasData: chartData.hasData, data: chartData.data, bg, currency, displayedCurrency, theme }),
    [chartData, bg, currency, displayedCurrency, theme]
  );
