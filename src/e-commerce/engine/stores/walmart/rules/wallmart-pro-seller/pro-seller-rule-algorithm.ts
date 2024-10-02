import { RULE_VALUE } from "../../../../../../constants/rule-value"

export const calculateProSellerValueAlgorithm = (proSellerEl: any): number =>
	proSellerEl ? RULE_VALUE.RULE_VAL_10 : RULE_VALUE.RULE_VAL_5
