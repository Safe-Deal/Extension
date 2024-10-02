import { AmazonRuleWholesaleGalleryProductFeedback } from "./rules/product-feedback/wholesale-gallery/amazon-rule-wholesale-gallery-product-feedback";
import { AmazonRuleItemProductFeedbackRule } from "./rules/product-feedback/item-details/amazon-rule-item-product-feedback";
import { AmazonChoiceRuleWholesaleGallery } from "./rules/amazon-choice/wholesale-gallery/amazon-choice-rule-wholesale-gallery";
import { AmazonChoiceRuleItem } from "./rules/amazon-choice/item-details/amazon-choice-rule-item";
import { BsrRuleItem } from "./rules/bsr/item-details/bsr-rule-item";
import { BsrWholesaleGallery } from "./rules/bsr/wholesale-gallery/bsr-wholesale-gallery";
import { AmazonRuleItemPricingRule } from "./rules/pricing/item-details/amazon-rule-item-pricing";
import { AmazonSoldShipRuleItem } from "./rules/amazon-sold-ship/item-details/amazon-sold-ship-rule-item";
import { AmazonSoldShipRuleWholesaleGallery } from "./rules/amazon-sold-ship/wholesale-gallery/amazon-sold-ship-rule-wholesale-gallery";
import { AmazonRuleItemStorePositiveFeedbackRule } from "./rules/store-positive-feedback/item-details/amazon-rule-item-store-positive-feedback";
import { AmazonRuleWholesaleGalleryStorePositiveFeedback } from "./rules/store-positive-feedback/wholesale-gallery/amazon-rule-wholesale-gallery-store-positive-feedback";

export enum AmazonRulesEnum {
  WHOLESALE_LIST,
  WHOLESALE_GALLERY,
  ITEM
}

export const RULES_PER_PAGE = Object.freeze({
  [AmazonRulesEnum.WHOLESALE_LIST]: [],
  [AmazonRulesEnum.WHOLESALE_GALLERY]: [
    new AmazonChoiceRuleWholesaleGallery(),
    new BsrWholesaleGallery(),
    new AmazonRuleWholesaleGalleryProductFeedback(),
    new AmazonSoldShipRuleWholesaleGallery(),
    new AmazonRuleWholesaleGalleryStorePositiveFeedback()
  ],
  [AmazonRulesEnum.ITEM]: [
    new AmazonChoiceRuleItem(),
    new BsrRuleItem(),
    new AmazonRuleItemProductFeedbackRule(),
    new AmazonRuleItemPricingRule(),
    new AmazonSoldShipRuleItem(),
    new AmazonRuleItemStorePositiveFeedbackRule()
  ]
});
