import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { LOCALE_DIRECTION } from "../../../../../../utils/extension/locale";
import { currencySign } from "../../../../../../utils/general/general";
import { t } from "../../../../../../constants/messages";
import { LoaderSpinner } from "../../../shared/Loader";
import { useChartOptions } from "./hooks/useChartOptions";
import { useProcessedData } from "./hooks/useProcessedData";
import "./PriceChart.scss";

interface IPriceChartArguments {
  prices: unknown[];
  currency: string;
  bg: string;
}

export const PriceChart = ({ prices, currency, bg }: IPriceChartArguments) => {
  const displayedCurrency = useMemo(() => currencySign(currency) || "USD", [currency]);
  const { chartData, isLoaded } = useProcessedData(prices);
  const chartOptions = useChartOptions(chartData, bg, currency, displayedCurrency);

  return (
    <div className="sd-price_chart">
      {chartData.hasData && (
        <h3 className="sd-price_chart__title">
          {t("chart_title")} ({displayedCurrency})
        </h3>
      )}
      {!isLoaded ? (
        <div>
          <LoaderSpinner />
        </div>
      ) : (
        <ReactApexChart
          className="sd-price_chart__apexchart"
          style={{ direction: LOCALE_DIRECTION }}
          options={chartOptions}
          series={chartOptions.series}
          type="area"
          width="670"
          height="241"
        />
      )}
    </div>
  );
};
