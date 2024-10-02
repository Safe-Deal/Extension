import { ApexOptions } from "apexcharts"
import { t } from "../../../../../../../constants/messages"

export const getChartOptions = ({ hasData, data, bg, currency, displayedCurrency }) => {
	const chartOptions: ApexOptions = {
		noData: {
			text: t("no_data"),
			align: "center",
			verticalAlign: "middle",
			style: {
				color: "#495057",
				fontSize: "15px",
				fontFamily: "'Plus Jakarta Sans', sans-serif"
			}
		},
		grid: {
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
					colors: "#475467",
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
					colors: "#344054",
					fontSize: "12px",
					fontFamily: "'Plus Jakarta Sans', sans-serif",
					fontWeight: 400
				}
			},
			decimalsInFloat: 0,
			forceNiceScale: false,
			min: () => 0
		},
		tooltip: {
			enabled: hasData,
			inverseOrder: true,
			x: {
				show: false
			},
			y: {
				formatter(val) {
					return val ? `${val}` : ""
				}
			}
		}
	}
	return chartOptions
}
