import { useState, useEffect } from "react"
import { processChartData } from "../data/PriceChartData"

export const useProcessedData = (prices) => {
	const [chartData, setChartData] = useState({
		hasData: false,
		data: [[], []]
	})
	const [isLoaded, setIsLoaded] = useState(false)

	useEffect(() => {
		let animationFrameId

		const handleDataProcessing = () => {
			const processedData = processChartData(prices)
			setChartData(processedData)
			setIsLoaded(true)
		}

		const requestFrame = () => {
			animationFrameId = requestAnimationFrame(() => {
				handleDataProcessing()
			})
		}

		setTimeout(() => {
			requestFrame()
		}, 50)

		return () => cancelAnimationFrame(animationFrameId)
	}, [prices])

	return { chartData, isLoaded }
}
