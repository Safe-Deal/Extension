// get super deals from page
const getSuperDealsPerPageInWholesale = (dom: Document): HTMLElement[] => {
  const allSuperDealsInPageNodeList: NodeListOf<Element> = dom.querySelectorAll(
    '[class^="manhattan--pricePointLineOne"]'
  );
  return Array.from(allSuperDealsInPageNodeList) as HTMLElement[];
};

// get partial super deals from page
const getPartialSuperDeals = (dom: Document): HTMLElement[] => {
  const partialSuperDealNodeList: NodeListOf<Element> = dom.querySelectorAll(
    ":not(.productSliderItem) > .productContainer"
  );
  return Array.from(partialSuperDealNodeList) as HTMLElement[];
};

export { getSuperDealsPerPageInWholesale, getPartialSuperDeals };
