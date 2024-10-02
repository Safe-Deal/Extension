import tippy, { animateFill, followCursor } from "tippy.js"
import { LOCALE_DIRECTION } from "../extension/locale"
import { HELP_ICON_18 } from "../../constants/visual"
import { DONE_PRODUCT_CSS_CLASS } from "../../constants/display"
import {
	IConclusionProductEntity,
	ProductConclusionEnum
} from "../../e-commerce/engine/logic/conclusion/conclusion-product-entity.interface"
import { debug } from "../analytics/logger"
import { browserWindow } from "../dom/html"

import "tippy.js/dist/tippy.css"
import "tippy.js/themes/light-border.css"
import { getReliabilityProductsSummaryTooltipMessage } from "../../constants/rule-reliability-messages"
import { ProductPaint } from "../../e-commerce/engine/logic/site/paint/product-paint"
import { isDocRTL } from "../../constants/messages"

interface IExplanationRule {
  explanation: string;
  explanationUrl?: string;
  size?: number;
}
const TOOLTIP_DISPLAY_DELAY_MS: number = 930
export const getDirection = () => {
	const { document } = browserWindow()
	return document?.dir ?? LOCALE_DIRECTION
}

export const isElementRtl = (el: Element): boolean => {
	const direction = getComputedStyle(el)?.direction
	return direction === "rtl"
}

const getProps = (explanation, props = {}): any => ({
	zIndex: 99999,
	theme: "light-border",
	content: `<div class="sd-rule-explanation__help_text" style="direction:${getDirection()}">
                ${explanation}
              </div>`,
	allowHTML: true,
	duration: [50, 50],
	placement: "auto",
	animateFill: true,
	trigger: "mouseenter focus",
	maxWidth: 800,
	followCursor: "initial",
	plugins: [animateFill, followCursor],
	...props
})

export const mountTippy = (el, explanation, settings = undefined, ignoreLineBreaks = false) => {
	const html = ignoreLineBreaks ? explanation : explanation.replace(/\n/g, "<br/>")
	const props = getProps(html, settings)
	tippy(el, props)
}

export const createRuleExplanation = ({ explanation }: IExplanationRule) => {
	const questionMarkEl = document.createElement("span")
	questionMarkEl.innerHTML = `<div class="sd-rule-explanation__help-icon">${HELP_ICON_18}</div>`
	mountTippy(questionMarkEl, explanation, {
		maxWidth: 440
	})
	return questionMarkEl
}

const appendProductReliabilityPopover = ({ targetEl, explanation }) => {
	mountTippy(targetEl, explanation, {
		delay: [TOOLTIP_DISPLAY_DELAY_MS, 0]
	})
}

export const addProperDirection = (el: HTMLElement) => {
	if (el?.style) {
		el.style.direction = getDirection()
	}
}

const addProcessingDoneClasses = (el: Element, conclusionProduct: IConclusionProductEntity, classNames = undefined) => {
	if (el && el.classList) {
		const isHebrew = isElementRtl(el)
		const directionClass = isHebrew ? "items-list__item--rtl" : "items-list__item--ltr"
		const className = classNames ? `${classNames}` : "sd-no-additional-class"
		el.classList?.add("items-list__item", DONE_PRODUCT_CSS_CLASS, directionClass, className)

		switch (conclusionProduct.productConclusion) {
		case ProductConclusionEnum.RECOMMENDED:
			el.classList?.add("items-list__item--green")
			break
		case ProductConclusionEnum.DOUBTFUL:
			el.classList?.add("items-list__item--yellow")
			break
		case ProductConclusionEnum.NOT_RECOMMENDED:
			el.classList?.add("items-list__item--red")
			break
		case ProductConclusionEnum.INSUFFICIENT_DATA:
			el.classList?.add("items-list__item--gray")
			break
		default:
			debug(`Unknown conclusion product${conclusionProduct.productConclusion}`)
			break
		}
	} else {
		debug("PaintUtils.addProcessingDoneClasses: el is not a valid element")
	}
}

const createIconImage = (conclusionProduct, rules): HTMLElement => {
	const NODE_NAME = "SafeDeal"
	const iconImageSpan = document.createElement("div")
	const iconImage = document.createElement("img")
	iconImageSpan.className = "safe-deal-image-wholesale-product-container"

	const reason: Text = document.createTextNode(NODE_NAME)
	iconImage.appendChild(reason)

	const isRtlLang = isDocRTL()
	iconImage.className = `safe-deal-image-wholesale-product ${isRtlLang ? "safe-deal-image-wholesale-product-rtl" : ""}`

	iconImage.src = ProductPaint.getProductIconImageOLD(conclusionProduct)
	appendProductReliabilityPopover({
		targetEl: iconImageSpan,
		explanation: getReliabilityProductsSummaryTooltipMessage(rules)
	})
	iconImageSpan.appendChild(iconImage)

	return iconImageSpan
}

export const PaintUtils = {
	createRuleExplanation,
	appendProductReliabilityPopover,
	addProcessingDoneClasses,
	createIconImage
}

export default PaintUtils
