import { RULE_VALUE } from "../../../../constants/rule-value"
import { WEIGHT } from "../../../../constants/weight"
import { IRuleManagerResult } from "../../../../data/entities/rule-manager-result.interface"
import { IRule } from "../../../../data/entities/rule.interface"
import { debug, IS_DEBUG } from "../../../../utils/analytics/logger"
import { IConclusionProductEntity, ProductConclusionEnum } from "./conclusion-product-entity.interface"

const GREEN_SAFE_LIMIT = 0.455
const DOUBTFUL_MIN_LIMIT = 0.276 // 60% of bad deals are medium risk
const MIN_LIMIT_FOR_CONCLUSION = 1

export class ConclusionProduct {
	constructor(public ruleManagerResult: IRuleManagerResult) {}

	// algorithm
	//   RV1 = weight * value
	//   RV2 = weight * value
	//   max = (max weight * max value) * num of Rv's
	//   RV1 + RV2 / max(RV1 + RV2)
	public conclusion(): IConclusionProductEntity {
		const numOfValidRules = this.getNumOfValidRulesWithoutPricingAndBonusAmount()
		debug(`numOfValidRules: ${numOfValidRules}`)
		if (numOfValidRules <= MIN_LIMIT_FOR_CONCLUSION) {
			const noData = this.getInsufficientDataResponse()
			return noData
		}

		const numOfRegularRules: number = this.getNumOfValidAndRegularRulesAmount()
		const maxValuePerRule: number = WEIGHT.TEN * RULE_VALUE.RULE_VAL_10
		const normalizationDividerValue: number = numOfRegularRules * maxValuePerRule
		const bonuses: number = this.accumulateRulesBonus(this.ruleManagerResult)

		const accumulateRulesValue: number = this.accumulateRulesValue(this.ruleManagerResult, numOfRegularRules) + bonuses
		const productConclusion = this.calculateProductConclusionRules(accumulateRulesValue, normalizationDividerValue)

		if (IS_DEBUG) {
			const rulesText = []
			for (const rule of this.ruleManagerResult.rules) {
				const displayRule = { ...rule }
				if (displayRule.dataset) {
					displayRule.dataset = `Dataset ${displayRule?.dataset?.price?.length} items | item 0 -> ${JSON.stringify(displayRule?.dataset?.price[0])}`
				}
				rulesText.push(displayRule)
			}
			const id = this?.ruleManagerResult?.product?.id || this?.ruleManagerResult?.product?.url
			debug(
				`Product:${id} | Conclusion: ${productConclusion} | # rules:${numOfRegularRules} | Sum:${accumulateRulesValue} | Bonuses:${bonuses} | divider:${normalizationDividerValue} | maxValue:${maxValuePerRule} | avr: ${
					accumulateRulesValue / normalizationDividerValue
				} | pass>:${GREEN_SAFE_LIMIT}\n${JSON.stringify(rulesText, null, 2)}`
			)
		}

		return {
			...this.ruleManagerResult,
			...{
				productConclusion
			}
		}
	}

	getNumOfValidRulesWithoutPricingAndBonusAmount(): number {
		const validRulesAmount: IRule[] = this.ruleManagerResult.rules.filter(
			(rule: IRule) => rule?.weight > WEIGHT.NONE && rule?.isValidRule
		)
		return validRulesAmount.length
	}

	private calculateProductConclusionRules(
		accumulateRulesValue: number,
		normalizationDividerValue: number
	): ProductConclusionEnum {
		const productConclusionValue = accumulateRulesValue / normalizationDividerValue
		if (productConclusionValue >= GREEN_SAFE_LIMIT) {
			return ProductConclusionEnum.RECOMMENDED
		}
		if (productConclusionValue >= DOUBTFUL_MIN_LIMIT && productConclusionValue < GREEN_SAFE_LIMIT) {
			return ProductConclusionEnum.DOUBTFUL
		}
		return ProductConclusionEnum.NOT_RECOMMENDED
	}

	private getNumOfValidAndRegularRulesAmount(): number {
		const regularRulesAmount: IRule[] = this.ruleManagerResult.rules
			.filter((rule: IRule) => rule && rule.isValidRule)
			.filter((rule: IRule) => rule && (!rule.bonus || rule.bonus.isBonusRule === false))
		return regularRulesAmount.length
	}

	private accumulateRulesBonus(ruleManagerResult: IRuleManagerResult) {
		return ruleManagerResult.rules.reduce((accumulator, currentValue) => {
			let res = 0
			if (!currentValue) {
				return accumulator
			}

			if (currentValue.bonus && currentValue.bonus.isBonusRule) {
				res = currentValue.bonus.value
			}

			return accumulator + res
		}, 0)
	}

	private accumulateRulesValue(ruleManagerResult: IRuleManagerResult, numOfRegularRules: number): number {
		if (numOfRegularRules > 1) {
			return ruleManagerResult.rules.reduce(
				(accumulator, currentValue) =>
					accumulator +
          (currentValue && !Number.isNaN(currentValue.value) ? currentValue.value * currentValue.weight : 0),
				0
			)
		}
		return ruleManagerResult.rules.reduce(
			(accumulator, currentValue) =>
				accumulator + (currentValue && !Number.isNaN(currentValue.value) ? currentValue.value * WEIGHT.TEN : 0),
			0
		)
	}

	private getInsufficientDataResponse(): IConclusionProductEntity {
		return {
			...this.ruleManagerResult,
			...{
				productConclusion: ProductConclusionEnum.INSUFFICIENT_DATA
			}
		}
	}
}
