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
  const labelColor = isDark ? "#e5e7eb" : "#475467";
  const yLabelColor = isDark ? "#f1f5f9" : "#344054";
  const gridColor = isDark ? "#3b4252" : "#e5e7eb";
  const chartOptions: ApexOptions = {
    noData: {
      text: t("no_data"),
      align: "center",
      verticalAlign: "middle",
      style: {
        color: isDark ? "#e5e7eb" : "#495057",
        fontSize: "15px",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }
    },
    theme: {
      mode: isDark ? "dark" : "light"
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
      background: "transparent",
      animations: { enabled: false },
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
      style: {
        fontSize: "12px",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      },
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
        shadeIntensity: 0.9,
        opacityFrom: isDark ? 0.35 : 0.45,
        opacityTo: isDark ? 0.05 : 0.25,
        stops: [0, 60, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 2.5
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
      max: Math.max(...data[1]) + 2,
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
