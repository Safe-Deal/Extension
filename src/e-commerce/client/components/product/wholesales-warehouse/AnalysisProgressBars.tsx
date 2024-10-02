import React from "react"
import ProgressBar from "./ProgressBar"
import "./analysis-progress-bars.scss"

type Product = {
  analysis: Record<string, { title: string; value: number; reason?: string }>;
  summary: {
    value: number;
    title: string;
    reason?: string;
  };
};

const AnalysisProgressBars = ({ product }: { product: Product }) => (
	<section className="analysis__progress-bars">
		<div className="progress-bar__container">
			<ProgressBar title={product.summary?.title} value={product.summary?.value} reason={product.summary?.reason} />
		</div>
		<div className="progress-bar__container">
			{Object.entries(product.analysis).map(([key, value]) => (
				<ProgressBar key={key} title={value.title} value={value.value} reason={value.reason} />
			))}
		</div>
	</section>
)

export default AnalysisProgressBars
