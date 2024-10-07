import { ProductStore } from "../logic/conclusion/conclusion-product-entity.interface";

export interface IMetaData {
  id: string;
  category: string;
  source: ProductStore;
  domain: string;
  title: string;
  description: string;
  images: string[];
  related?: any;
  price?: any;
  details?: unknown;
}

type PriceHistory = {
  date: string;
  price: number;
  minPrice: number;
  maxPrice: number;
};

type Price = {
  currency: string;
  maxPrice: number;
  minPrice: number;
  price: PriceHistory[];
};

type ProductDetails = {
  category: string;
  related: null;
  price: Price;
  details: Record<string, unknown>;
};

type Bonus = {
  isBonusRule: boolean;
  value: number;
};

type Rule = {
  type: string;
  name: string;
  i18n: string;
  i18nData?: object;
  i18nExplanation: string;
  value: number;
  weight: number;
  bonus?: Bonus;
};

export type IProductReported = {
  id: string;
  category: string;
  source: string;
  domain: string;
  title: string;
  conclusion: string;
  images: string[];
  locale: string;
  product: ProductDetails;
  description: string;
  rules: Rule[];
  ver: string;
};
