import { isExist } from "../../../../../../utils/general/general";

const AMAZON_VALUE_TEXT = "amazon";
const isAmazon = (el: Element) => el?.textContent?.toLowerCase()?.includes(AMAZON_VALUE_TEXT);
const isShipByAmazon = (shipEl: Element) => isAmazon(shipEl);
const isSoldByAmazon = (soldEl: Element) => isAmazon(soldEl);

const isSoldShipByAmazon = (shipEl: Element, soldEl: Element): boolean => {
  if (!isExist(shipEl) || !isExist(soldEl)) {
    return false;
  }
  return isShipByAmazon(shipEl) && isSoldByAmazon(soldEl);
};

const isSoldOrShipByAmazon = (shipEl: Element, soldEl: Element): boolean => {
  if (!isExist(shipEl) || !isExist(soldEl)) {
    return false;
  }
  return isShipByAmazon(shipEl) || isSoldByAmazon(soldEl);
};

export { isSoldOrShipByAmazon, isSoldShipByAmazon };
