import { ProductStore } from "@e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import { handleError } from "@utils/analytics/logger";
import { querySelector } from "@utils/dom/html";
import { countWords, removeNonEnglishChars } from "@utils/text/strings";
import { useEffect, useState } from "react";

const MAX_PRODUCT_NAME_WORD_COUNT = 7;
const MIN_PRODUCT_NAME_WORD_COUNT = 2;

const trimProductName = (name) => {
  const separators = /[ ,.-]/;
  const words = name.split(separators);
  if (words.length <= MAX_PRODUCT_NAME_WORD_COUNT) {
    return name;
  }

  return words.slice(0, MAX_PRODUCT_NAME_WORD_COUNT).join(" ").trim();
};

const STORES_HANDLERS = {
  [ProductStore.AMAZON]: () => {
    const productNameElement = querySelector(
      ["#productTitle", "#title", "#productTitle h1", "#productTitle span"],
      document
    );
    if (productNameElement) {
      const name = productNameElement.textContent.trim();
      const onlyName = name.split(" - ")[0];
      const final = trimProductName(onlyName);
      return `${final}`;
    }
    handleError(new Error("Product name not found on Amazon page"), "Research:: useProductName:: getProductName");
    return "";
  },
  [ProductStore.ALI_EXPRESS]: () => {
    const tag = querySelector(['[data-pl="product-title"]', 'meta[property="og:title"]'], document);
    if (tag) {
      const content = tag.getAttribute("content")?.trim() || tag.textContent;
      if (content) {
        const name = content.split(" - ")[0];
        return trimProductName(name);
      }
    }
    handleError(new Error("Product name not found on AliExpress page"), "Research:: useProductName:: getProductName");
    return "";
  },
  [ProductStore.ALI_EXPRESS_RUSSIA]: () => {
    const { title = "" } = document;
    const name = title.split(" | ")[0];
    return trimProductName(name);
  },
  [ProductStore.EBAY]: () => {
    const tag = querySelector(['meta[name="twitter:title"]', ".x-item-title", ".x-item-title__mainTitle"], document);
    if (tag) {
      const content = tag.getAttribute("content") || tag.textContent;
      if (content) {
        const name = content.split(" - ")[0];
        return trimProductName(name);
      }
    }
    handleError(new Error("Product name not found on eBay page"), "Research:: useProductName:: getProductName");
    return "";
  }
};

const getProductName = ({ productId, store, isSmall }) => {
  const handler = STORES_HANDLERS[store];
  const name = handler ? handler(productId) : "";
  if (isSmall) {
    const onlyEnglish = removeNonEnglishChars(name);
    const words = countWords(onlyEnglish);
    if (words > MIN_PRODUCT_NAME_WORD_COUNT) {
      return onlyEnglish;
    }
  }

  return name;
};

interface IProductNameProps {
  productId: string;
  store: ProductStore;
  isSmall: boolean;
}

type UseProductName = [string, (productName: string) => void];

export const useProductName = ({ productId, store, isSmall }: IProductNameProps): UseProductName => {
  const [productName, setProductName] = useState<string>("");

  useEffect(() => {
    const productName = getProductName({ productId, store, isSmall });
    setProductName(productName);
  }, [productId, store]);

  return [productName, setProductName];
};
