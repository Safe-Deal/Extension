import * as React from "react"
import { t } from "../../../../constants/messages"

export default function PremiumTerms({ toggle }: { toggle: () => void }) {
	return (
		<div className="mdl-card__supporting-text" style={{ marginBottom: "0", paddingBottom: "0" }}>
			<h4
				style={{
					paddingTop: "0",
					marginTop: "0",
					marginBottom: "3px",
					paddingBottom: "3px"
				}}
			>
				{t("premium_features")}
			</h4>
			<ul style={{ paddingTop: "0", marginTop: "0" }}>
				<li>{t("premium_features_no_affiliation")}</li>
				<li>{t("premium_features_enhanced_support")}</li>
				<li>{t("premium_features_cost")}</li>
			</ul>
			<div className="mdl-card__actions" style={{ paddingTop: "0", marginTop: "0" }}>
				<a href="#" className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent  mdl-js-ripple-effect">
					{t("buy_premium")}
				</a>
        &nbsp;&nbsp;&nbsp;
				<a href="#" onClick={toggle} className="mdl-button  mdl-js-ripple-effect">
					{t("affiliated_websites")}
				</a>
			</div>
		</div>
	)
}
