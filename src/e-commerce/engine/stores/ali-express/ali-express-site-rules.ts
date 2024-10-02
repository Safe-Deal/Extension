import { AliExpressRuleItemPricingRule } from "./rules/pricing/item-details/ali-express-rule-item-pricing";
import { AliExpressRuleItemProductFeedbackRule } from "./rules/product-feedback/item-details/ali-express-rule-item-product-feedback";
import { AliExpressRuleWholesaleGalleryProductFeedback } from "./rules/product-feedback/wholesale-gallery/ali-express-rule-wholesale-gallery-product-feedback";
import { AliExpressRuleWholesaleListProductFeedback } from "./rules/product-feedback/wholesale-list/ali-express-rule-wholesale-list-product-feedback";
import { AliExpressRuleItemShopOpenYear } from "./rules/shop-open-year/item-details/ali-express-rule-item-shop-open-year";
import { AliExpressRuleGalleryShopOpenYear } from "./rules/shop-open-year/wholesale-gallery/ali-express-rule-gallery-shop-open-year";
import { AliExpressRuleListShopOpenYear } from "./rules/shop-open-year/wholesale-list/ali-express-rule-list-shop-open-year";
import { AliExpressRuleItemStorePositiveFeedbackRule } from "./rules/store-positive-feedback/item-details/ali-express-rule-item-store-positive-feedback";
import { AliExpressRuleWholesaleGalleryStorePositiveFeedback } from "./rules/store-positive-feedback/wholesale-gallery/ali-express-rule-wholesale-gallery-store-positive-feedback";
import { AliExpressRuleWholesaleListStorePositiveFeedback } from "./rules/store-positive-feedback/wholesale-list/ali-express-rule-wholesale-list-store-poitive-feedback";
import { AliExpressRuleItemTopSeller } from "./rules/top-seller/item-details/ali-express-rule-item-top-seller";
import { AliExpressRuleGalleryTopSeller } from "./rules/top-seller/wholesale-gallery/ali-express-rule-gallery-top-seller";
import { AliExpressRuleListTopSeller } from "./rules/top-seller/wholesale-list/ali-express-rule-list-top-seller";

export enum AliExpressRulesEnum {
  WHOLESALE_LIST,
  WHOLESALE_GALLERY,
  ITEM
}

export const RULES_PER_PAGE = Object.freeze({
  [AliExpressRulesEnum.WHOLESALE_LIST]: [
    new AliExpressRuleWholesaleListProductFeedback(),
    new AliExpressRuleListTopSeller(),
    new AliExpressRuleListShopOpenYear(),
    new AliExpressRuleWholesaleListStorePositiveFeedback()
  ],
  [AliExpressRulesEnum.WHOLESALE_GALLERY]: [
    new AliExpressRuleWholesaleGalleryProductFeedback(),
    new AliExpressRuleGalleryTopSeller(),
    new AliExpressRuleGalleryShopOpenYear(),
    new AliExpressRuleWholesaleGalleryStorePositiveFeedback()
  ],
  [AliExpressRulesEnum.ITEM]: [
    new AliExpressRuleItemProductFeedbackRule(),
    new AliExpressRuleItemTopSeller(),
    new AliExpressRuleItemShopOpenYear(),
    new AliExpressRuleItemPricingRule(),
    new AliExpressRuleItemStorePositiveFeedbackRule()
  ]
});
