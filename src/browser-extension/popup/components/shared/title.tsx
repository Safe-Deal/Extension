import * as React from "react"
import { IMAGE_SAFE_DEAL_POPUP } from "../../../../constants/visual"

export default function Title() {
	return (
		<div className="safe-deal-popup__header__container">
			<img className="safe-deal-popup__header__logo" src={IMAGE_SAFE_DEAL_POPUP} alt="Safe Deal Logo" />
			<span className="safe-deal-popup__header__brand">Safe Deal</span>
		</div>
	)
}
