import { RULE_VALUE } from "../../../../../../constants/rule-value"

export const calculateAmazonChoiceValueAlgorithm = (amazonChoiceEl: any): number =>
	amazonChoiceEl ? RULE_VALUE.RULE_VAL_10 : RULE_VALUE.RULE_VAL_5
