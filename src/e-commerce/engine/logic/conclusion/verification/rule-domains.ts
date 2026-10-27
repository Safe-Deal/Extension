import BONUS_POINTS from "../../../../../constants/rule-bonus-value";
import { RULE_VALUE } from "../../../../../constants/rule-value";
import { IRule } from "../../../../../data/entities/rule.interface";
import { Rule } from "../../../../../data/rules/rule";
import {
  AliExpressRulesEnum,
  RULES_PER_PAGE as ALI_RULES_PER_PAGE
} from "../../../stores/ali-express/ali-express-site-rules";
import { AliExpressRuleItemPricingRule } from "../../../stores/ali-express/rules/pricing/item-details/ali-express-rule-item-pricing";
import { AliExpressRuleItemProductFeedbackRule } from "../../../stores/ali-express/rules/product-feedback/item-details/ali-express-rule-item-product-feedback";
import { AliExpressRuleItemShopOpenYear } from "../../../stores/ali-express/rules/shop-open-year/item-details/ali-express-rule-item-shop-open-year";
import { AliExpressRuleItemStorePositiveFeedbackRule } from "../../../stores/ali-express/rules/store-positive-feedback/item-details/ali-express-rule-item-store-positive-feedback";
import { AliExpressRuleItemTopSeller } from "../../../stores/ali-express/rules/top-seller/item-details/ali-express-rule-item-top-seller";
import { AmazonRulesEnum, RULES_PER_PAGE as AMAZON_RULES_PER_PAGE } from "../../../stores/amazon/amazon-site-rules";
import { AmazonChoiceRuleItem } from "../../../stores/amazon/rules/amazon-choice/item-details/amazon-choice-rule-item";
import { AmazonSoldShipRuleItem } from "../../../stores/amazon/rules/amazon-sold-ship/item-details/amazon-sold-ship-rule-item";
import { BsrRuleItem } from "../../../stores/amazon/rules/bsr/item-details/bsr-rule-item";
import { AmazonRuleItemPricingRule } from "../../../stores/amazon/rules/pricing/item-details/amazon-rule-item-pricing";
import { AmazonRuleItemProductFeedbackRule } from "../../../stores/amazon/rules/product-feedback/item-details/amazon-rule-item-product-feedback";
import { AmazonRuleItemStorePositiveFeedbackRule } from "../../../stores/amazon/rules/store-positive-feedback/item-details/amazon-rule-item-store-positive-feedback";

export type RuleState = {
  label: string;
  rank: number;
  rule: IRule;
};

export type RuleDomain = {
  label: string;
  isRegular: boolean;
  invalid: RuleState;
  valid: RuleState[];
};

export type StoreDomain = {
  store: string;
  rules: RuleDomain[];
};

const weightOf = (rule: Rule): number => {
  const weight = Reflect.get(rule, "weight");
  if (typeof weight !== "number") {
    throw new Error(`Rule ${rule.getName()} has no numeric weight`);
  }
  return weight;
};

const ruleOf = <T extends Rule>(rules: readonly Rule[], ruleClass: new () => T): T => {
  const found = rules.find((rule): rule is T => rule instanceof ruleClass);
  if (!found) {
    throw new Error(`${ruleClass.name} is not in the real site rule list`);
  }
  return found;
};

const regularDomain = (rule: Rule, label: string, values: number[]): RuleDomain => {
  const weight = weightOf(rule);
  const name = rule.getName();
  return {
    label,
    isRegular: true,
    invalid: {
      label: `${label}: invalid`,
      rank: -1,
      rule: { name, value: 0, weight, isValidRule: false }
    },
    valid: values.map((value) => ({
      label: `${label}: value ${value}`,
      rank: value,
      rule: { name, value, weight, isValidRule: true }
    }))
  };
};

const bonusDomain = (rule: Rule, label: string, bonuses: number[]): RuleDomain => {
  const weight = weightOf(rule);
  const name = rule.getName();
  return {
    label,
    isRegular: false,
    invalid: {
      label: `${label}: invalid`,
      rank: -1,
      rule: { name, value: 0, weight, bonus: { isBonusRule: true, value: BONUS_POINTS.NONE }, isValidRule: false }
    },
    valid: bonuses.map((bonus) => ({
      label: `${label}: bonus ${bonus}`,
      rank: bonus,
      rule: { name, value: 0, weight, bonus: { isBonusRule: true, value: bonus }, isValidRule: true }
    }))
  };
};

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_unused, index) => from + index);

const AMAZON_FEEDBACK_VALUES = range(RULE_VALUE.RULE_VAL_1, RULE_VALUE.RULE_VAL_10);
const STORE_FEEDBACK_VALUES = [
  RULE_VALUE.RULE_VAL_NEGATIVE_CRITICAL,
  RULE_VALUE.RULE_VAL_2,
  RULE_VALUE.RULE_VAL_6,
  RULE_VALUE.RULE_VAL_8,
  RULE_VALUE.RULE_VAL_9,
  RULE_VALUE.RULE_VAL_10
];
const ALI_FEEDBACK_VALUES = [
  RULE_VALUE.RULE_VAL_1,
  RULE_VALUE.RULE_VAL_4,
  RULE_VALUE.RULE_VAL_7,
  RULE_VALUE.RULE_VAL_8,
  RULE_VALUE.RULE_VAL_9,
  RULE_VALUE.RULE_VAL_10
];
const AMAZON_BSR_BONUSES = [
  RULE_VALUE.RULE_VAL_1,
  RULE_VALUE.RULE_VAL_2,
  RULE_VALUE.RULE_VAL_3,
  RULE_VALUE.RULE_VAL_4,
  RULE_VALUE.RULE_VAL_5,
  RULE_VALUE.RULE_VAL_6,
  RULE_VALUE.RULE_VAL_10
];
const AMAZON_SOLD_SHIP_BONUSES = [BONUS_POINTS.SEVEN, BONUS_POINTS.TEN];
const AMAZON_CHOICE_BONUSES = [BONUS_POINTS.HUGE_BONUS];
const ALI_TOP_SELLER_BONUSES = [BONUS_POINTS.NONE, BONUS_POINTS.TEN];
const ALI_SHOP_OPEN_YEAR_BONUSES = [
  BONUS_POINTS.NEGATIVE_MEDIUM,
  BONUS_POINTS.NONE,
  BONUS_POINTS.THREE,
  BONUS_POINTS.SEVEN,
  BONUS_POINTS.TWELVE,
  BONUS_POINTS.FIFTEEN
];
const PRICING_BONUSES = [BONUS_POINTS.NONE];

export const amazonItemDomain = (): StoreDomain => {
  const rules = AMAZON_RULES_PER_PAGE[AmazonRulesEnum.ITEM];
  return {
    store: "Amazon item page",
    rules: [
      regularDomain(ruleOf(rules, AmazonRuleItemProductFeedbackRule), "Product reviews", AMAZON_FEEDBACK_VALUES),
      regularDomain(ruleOf(rules, AmazonRuleItemStorePositiveFeedbackRule), "Seller feedback", STORE_FEEDBACK_VALUES),
      bonusDomain(ruleOf(rules, AmazonChoiceRuleItem), "Amazon's Choice", AMAZON_CHOICE_BONUSES),
      bonusDomain(ruleOf(rules, BsrRuleItem), "Best seller rank", AMAZON_BSR_BONUSES),
      bonusDomain(ruleOf(rules, AmazonSoldShipRuleItem), "Sold or shipped by Amazon", AMAZON_SOLD_SHIP_BONUSES),
      bonusDomain(ruleOf(rules, AmazonRuleItemPricingRule), "Pricing", PRICING_BONUSES)
    ]
  };
};

export const aliExpressItemDomain = (): StoreDomain => {
  const rules = ALI_RULES_PER_PAGE[AliExpressRulesEnum.ITEM];
  return {
    store: "AliExpress item page",
    rules: [
      regularDomain(ruleOf(rules, AliExpressRuleItemProductFeedbackRule), "Product reviews", ALI_FEEDBACK_VALUES),
      regularDomain(
        ruleOf(rules, AliExpressRuleItemStorePositiveFeedbackRule),
        "Seller feedback",
        STORE_FEEDBACK_VALUES
      ),
      bonusDomain(ruleOf(rules, AliExpressRuleItemTopSeller), "Top seller", ALI_TOP_SELLER_BONUSES),
      bonusDomain(ruleOf(rules, AliExpressRuleItemShopOpenYear), "Shop open years", ALI_SHOP_OPEN_YEAR_BONUSES),
      bonusDomain(ruleOf(rules, AliExpressRuleItemPricingRule), "Pricing", PRICING_BONUSES)
    ]
  };
};
