import { EbayRuleItemDeliveryRule } from "./rules/delivery/item-details/ebay-rule-item-delivery";
import { EbayRuleWholesaleGalleryDelivery } from "./rules/delivery/wholesale-gallery/ebay-rule-wholesale-gallery-delivery";
import { EbayRuleWholesaleListDelivery } from "./rules/delivery/wholesale-list/ebay-rule-wholesale-list-delivery";
import { EbayRuleItemFreeShipping } from "./rules/free-shipping/item-details/ebay-rule-item-free-shipping";
import { EbayRuleGalleryFreeShipping } from "./rules/free-shipping/wholesale-gallery/ebay-rule-gallery-free-shipping";
import { EbayRuleListFreeShipping } from "./rules/free-shipping/wholesale-list/ebay-rule-list-free-shipping";
import { EbayRuleItemProductFeedbackRule } from "./rules/product-feedback/item-details/ebay-rule-item-product-feedback";
import { EbayRuleWholesaleGalleryProductFeedback } from "./rules/product-feedback/wholesale-gallery/ebay-rule-wholesale-gallery-product-feedback";
import { EbayRuleWholesaleListProductFeedback } from "./rules/product-feedback/wholesale-list/ebay-rule-wholesale-list-product-feedback";
import { EbayRuleItemReturnPolicy } from "./rules/return-policy/item-details/ebay-rule-item-return-policy";
import { EbayRuleGalleryReturnPolicy } from "./rules/return-policy/wholesale-gallery/ebay-rule-gallery-return-policy";
import { EbayRuleListReturnPolicy } from "./rules/return-policy/wholesale-list/ebay-rule-list-return-policy";
import { EbayRuleItemShopOpenYear } from "./rules/shop-open-year/item-details/ebay-rule-item-shop-open-year";
import { EbayRuleItemTopSeller } from "./rules/top-seller/item-details/ebay-rule-item-top-seller";
import { EbayRuleGalleryTopSeller } from "./rules/top-seller/wholesale-gallery/ebay-rule-gallery-top-seller";
import { EbayRuleListTopSeller } from "./rules/top-seller/wholesale-list/ebay-rule-list-top-seller";
import { EbayRuleGalleryShopOpenYear } from "./rules/shop-open-year/wholesale-gallery/ebay-rule-gallery-shop-open-year";
import { EbayRuleListShopOpenYear } from "./rules/shop-open-year/wholesale-list/ebay-rule-list-shop-open-year";
import { EbayRuleListSoldByBrand } from "./rules/sold-by-brand/wholesale-list/ebay-rule-list-sold-by-brand";
import { EbayRuleGallerySoldByBrand } from "./rules/sold-by-brand/wholesale-gallery/ebay-rule-gallery-sold-by-brand";
import { EbayRuleItemSoldByBrand } from "./rules/sold-by-brand/item-details/ebay-rule-item-sold-by-brand";

export enum EbayRulesEnum {
  WHOLESALE_LIST,
  WHOLESALE_GALLERY,
  ITEM
}

export const RULES_PER_PAGE = Object.freeze({
  [EbayRulesEnum.WHOLESALE_LIST]: [
    new EbayRuleWholesaleListProductFeedback(),
    new EbayRuleListTopSeller(),
    new EbayRuleListReturnPolicy(),
    new EbayRuleWholesaleListDelivery(),
    new EbayRuleListFreeShipping(),
    new EbayRuleListShopOpenYear(),
    new EbayRuleListSoldByBrand()
  ],
  [EbayRulesEnum.WHOLESALE_GALLERY]: [
    new EbayRuleWholesaleGalleryProductFeedback(),
    new EbayRuleGalleryTopSeller(),
    new EbayRuleGalleryReturnPolicy(),
    new EbayRuleWholesaleGalleryDelivery(),
    new EbayRuleGalleryFreeShipping(),
    new EbayRuleGalleryShopOpenYear(),
    new EbayRuleGallerySoldByBrand()
  ],
  [EbayRulesEnum.ITEM]: [
    new EbayRuleItemProductFeedbackRule(),
    new EbayRuleItemTopSeller(),
    new EbayRuleItemReturnPolicy(),
    new EbayRuleItemDeliveryRule(),
    new EbayRuleItemFreeShipping(),
    new EbayRuleItemShopOpenYear(),
    new EbayRuleItemSoldByBrand()
  ]
});
