import { ApexOptions } from "apexcharts";
import { t } from "../../../../../../../constants/messages";

type GetOptionsArgs = {
  hasData: boolean;
  data: any[];
  bg: string;
  currency: string;
  displayedCurrency: string;
  theme: "light" | "dark";
};

export const getChartOptions = ({ hasData, data, bg, currency, displayedCurrency, theme }: GetOptionsArgs) => {
  const isDark = theme === "dark";
  const labelColor = isDark ? "#cbd5e1" : "#475467";
  const yLabelColor = isDark ? "#cbd5e1" : "#344054";
  const gridColor = isDark ? "#334155" : "#e5e7eb";
  const chartOptions: ApexOptions = {
    noData: {
      text: t("no_data"),
      align: "center",
      verticalAlign: "middle",
      style: {
        color: isDark ? "#cbd5e1" : "#495057",
        fontSize: "15px",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }
    },
    grid: {
      borderColor: gridColor,
      yaxis: {
        lines: {
          show: hasData
        }
      }
    },
    colors: [bg],
    series: [
      {
        name: `${currency} (${displayedCurrency}) `,
        data: hasData ? data[1] : []
      }
    ],
    chart: {
      type: "area",
      zoom: {
        enabled: false
      },
      toolbar: {
        show: false
      },
      foreColor: labelColor
    },
    tooltip: {
      enabled: hasData,
      inverseOrder: true,
      theme: isDark ? "dark" : "light",
      x: {
        show: false
      },
      y: {
        formatter(val) {
          return val ? `${val}` : "";
        }
      }
    },
    markers: {
      colors: ["gray"]
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.7,
        stops: [0, 70, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    xaxis: hasData && {
      type: "datetime",
      categories: data[0],
      labels: {
        style: {
          colors: labelColor,
          fontSize: "12px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 400
        }
      }
    },
    yaxis: {
      max: Math.max(...data[1]) + 1,
      labels: {
        show: true,
        align: "center",
        style: {
          colors: yLabelColor,
          fontSize: "12px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 400
        }
      },
      decimalsInFloat: 0,
      forceNiceScale: false,
      min: () => 0
    }
  };
  return chartOptions;
};
