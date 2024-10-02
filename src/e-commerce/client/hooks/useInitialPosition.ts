import { useState, useEffect } from "react"

const PADDING = {
	y: 10
}

const minSizes = {
	height: 60
}

const calcPosition = (height) => ({
	y: window.innerHeight - height - PADDING.y
})

export const useInitialPosition = (elementRef) => {
	const [initialPosition, setInitialPosition] = useState(calcPosition(minSizes.height))

	useEffect(() => {
		if (elementRef.current) {
			const elementHeight = elementRef.current.offsetHeight
			setInitialPosition(calcPosition(elementHeight))
		}
	}, [elementRef])

	return initialPosition
}
