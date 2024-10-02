import React from "react"
import LinearProgress from "@mui/material/LinearProgress"
import { IMAGE_SAFE_DEAL } from "../../../../constants/visual"

type InitialLoaderProps = {
  coupons: boolean;
  isMinimal: boolean;
};

export function InitialLoader({ coupons, isMinimal }: InitialLoaderProps) {
	return (
		<div
			data-testid="initial-loader"
			className={`sd-initial-loader sd-initial-loader--${coupons || isMinimal ? "group" : "solo"}`}
		>
			<div className="sd-initial-loader__content">
				<img className="sd-initial-loader__image" src={IMAGE_SAFE_DEAL} alt="Safe Deal Logo" />
				<LinearProgress className="sd-initial-loader__progress" />
			</div>
		</div>
	)
}
