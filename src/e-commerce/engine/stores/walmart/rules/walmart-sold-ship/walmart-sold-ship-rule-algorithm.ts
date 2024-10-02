import { isExist } from "../../../../../../utils/general/general"

const WALMART_VALUE_TEXT = "walmart"
const isWalmart = (el: Element) => el?.textContent?.toLowerCase()?.includes(WALMART_VALUE_TEXT)

const isSoldAndShipByWalmart = (soldAndShipEl: Element): boolean => {
	if (!isExist(soldAndShipEl)) {
		return false
	}
	return isWalmart(soldAndShipEl)
}

export { isSoldAndShipByWalmart }
