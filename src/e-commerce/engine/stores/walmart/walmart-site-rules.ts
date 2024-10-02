import { WalmartSoldShipRuleWholesaleGallery } from "./rules/walmart-sold-ship/wholesale-gallery/walmart-sold-ship-rule-wholesale-gallery"
import { WalmartSoldShipRuleItem } from "./rules/walmart-sold-ship/item-details/walmart-sold-ship-rule-item"
import { WalmartRuleWholesaleGalleryProductFeedback } from "./rules/walmart-product-feedback/wholesale-gallery/walmart-rule-wholesale-gallery-product-feedback"
import { WalmartRuleItemProductFeedbackRule } from "./rules/walmart-product-feedback/item-details/walmart-rule-item-product-feedback"
import { ProSellerRuleWholesaleGallery } from "./rules/wallmart-pro-seller/wholesale-gallery/pro-seller-rule-wholesale-gallery"
import { ProSellerRuleItem } from "./rules/wallmart-pro-seller/item-details/pro-seller-rule-item"
import { ProSellerRuleWholesaleList } from "./rules/wallmart-pro-seller/wholesale-list/pro-seller-rule-wholesale-list"
import { WalmartRuleWholesaleListProductFeedback } from "./rules/walmart-product-feedback/wholesale-list/walmart-rule-wholesale-list-product-feedback"
import { WalmartSoldShipRuleWholesaleList } from "./rules/walmart-sold-ship/wholesale-list/walmart-sold-ship-rule-wholesale-list"

export enum WalmartRulesEnum {
  WHOLESALE_LIST,
  WHOLESALE_GALLERY,
  ITEM
}

export const RULES_PER_PAGE = Object.freeze({
	[WalmartRulesEnum.WHOLESALE_LIST]: [
		new WalmartSoldShipRuleWholesaleList(),
		new WalmartRuleWholesaleListProductFeedback(),
		new ProSellerRuleWholesaleList()
	],
	[WalmartRulesEnum.WHOLESALE_GALLERY]: [
		new WalmartSoldShipRuleWholesaleGallery(),
		new WalmartRuleWholesaleGalleryProductFeedback(),
		new ProSellerRuleWholesaleGallery()
	],
	[WalmartRulesEnum.ITEM]: [
		new WalmartSoldShipRuleItem(),
		new WalmartRuleItemProductFeedbackRule(),
		new ProSellerRuleItem()
	]
})
