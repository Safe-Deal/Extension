import React from "react"
import "react-circular-progressbar/dist/styles.css"
import AnalysisProgressBars from "./AnalysisProgressBars"

export function ProductEvaluation({ product }: { product: any }) {
	return <AnalysisProgressBars product={product.product} />
}
