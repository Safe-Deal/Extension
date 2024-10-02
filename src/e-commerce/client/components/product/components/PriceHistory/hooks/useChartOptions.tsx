import { useMemo } from "react"
import { getChartOptions } from "../data/PriceChartOptions"

export const useChartOptions = (chartData, bg, currency, displayedCurrency) =>
	useMemo(
		() =>
			getChartOptions({
				hasData: chartData.hasData,
				data: chartData.data,
				bg,
				currency,
				displayedCurrency
			}),
		[chartData, bg, currency, displayedCurrency]
	)
