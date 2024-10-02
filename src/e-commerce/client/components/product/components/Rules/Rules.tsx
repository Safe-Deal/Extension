import React from "react"
import { getSymbolClassByText } from "../../../../../../constants/icons"
import { PRICING_ITEM_DETAILS } from "../../../../../engine/logic/utils/const"
import { Explanation } from "../../../shared/Explanation"
import { PriceChart } from "../PriceHistory/PriceChart"
import { getReliabilityProductsSummaryTooltip } from "../../../../../../constants/rule-reliability-messages"

interface IRulesProps {
  rules: any;
  bg: string;
}

export function Rules({ rules, bg }: IRulesProps) {
	const reasons = rules?.filter((r) => r && r.name !== PRICING_ITEM_DETAILS)
	const listItems = []
	const pricing = rules?.find((r) => r.name === PRICING_ITEM_DETAILS)
	const explanationEntities = getReliabilityProductsSummaryTooltip(reasons)
	explanationEntities.map((explanation) => {
		const { ruleExplanation, reliabilityMessage } = explanation
		const reliabilityClass = getSymbolClassByText(reliabilityMessage)
		listItems.push({
			title: reliabilityMessage,
			explanation: ruleExplanation,
			className: reliabilityClass
		})
	})

	if (pricing && pricing.isValidRule) {
		const explanationPricing = getReliabilityProductsSummaryTooltip([pricing])[0]
		const { ruleExplanation, reliabilityMessage } = explanationPricing
		const reliabilityClass = getSymbolClassByText(reliabilityMessage)
		listItems.push({
			title: reliabilityMessage,
			explanation: ruleExplanation,
			className: reliabilityClass
		})
	}

	return (
		<div className="sd-rules">
			<ul className="sd-rules__explanation">
				{listItems.map((item) => {
					const spaceIndex = item.title.indexOf(" ")
					const itemText = item.title.substring(spaceIndex + 1)
					return (
						<li key={item.title} className="sd-rules__explanation__reason" title={item.title}>
							<div className={`sd-reason ${item.className}`}>
								<span className={`${item.className}-bullet sd-rules__explanation__reason__bullet`} />
								<span className={`${item.className}-title sd-rules__explanation__reason__title`}>{itemText}</span>
								<Explanation text={item.explanation} />
							</div>
						</li>
					)
				})}
			</ul>
			<PriceChart bg={bg} prices={pricing?.dataset?.price} currency={pricing?.dataset?.currency} />
		</div>
	)
}
