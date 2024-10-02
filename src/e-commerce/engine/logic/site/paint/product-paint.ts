import { isRtl, t } from "../../../../../constants/messages";
import {
  IMAGE_BAD,
  IMAGE_BAD_OLD,
  IMAGE_GOOD,
  IMAGE_GOOD_OLD,
  IMAGE_MEDIUM,
  IMAGE_MEDIUM_OLD,
  IMAGE_SAFE_DEAL_GRAY,
  IMAGE_SAFE_DEAL_GRAY_OLD
} from "../../../../../constants/visual";
import {
  BAD_BG,
  BAD_BORDER,
  BAD_CHART_BG,
  DOUBTFUL_BG,
  DOUBTFUL_BORDER,
  DOUBTFUL_CHART_BG,
  GOOD_BG,
  GOOD_BORDER,
  GOOD_CHART_BG,
  INSUFFICIENT_DATA_BG,
  INSUFFICIENT_DATA_BORDER,
  INSUFFICIENT_DATA_CHART_BG
} from "../../../stores/ali-express/display/visual";
import { IConclusionProductEntity, ProductConclusionEnum } from "../../conclusion/conclusion-product-entity.interface";

export const getProductClass = (conclusionProduct: IConclusionProductEntity): string => {
  if (conclusionProduct.productConclusion === ProductConclusionEnum.RECOMMENDED) {
    return "sd-product-full__header--recommended";
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.DOUBTFUL) {
    return "sd-product-full__header--doubtful";
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.INSUFFICIENT_DATA) {
    return "sd-product-full__header--insufficient";
  }
  return "sd-product-full__header--bad";
};

export const getProductBg = (conclusionProduct: IConclusionProductEntity): any => {
  if (conclusionProduct.productConclusion === ProductConclusionEnum.RECOMMENDED) {
    return GOOD_BG;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.DOUBTFUL) {
    return DOUBTFUL_BG;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.INSUFFICIENT_DATA) {
    return INSUFFICIENT_DATA_BG;
  }
  return BAD_BG;
};

export const getProductChartBg = (conclusionProduct: IConclusionProductEntity): any => {
  if (conclusionProduct.productConclusion === ProductConclusionEnum.RECOMMENDED) {
    return GOOD_CHART_BG;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.DOUBTFUL) {
    return DOUBTFUL_CHART_BG;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.INSUFFICIENT_DATA) {
    return INSUFFICIENT_DATA_CHART_BG;
  }
  return BAD_CHART_BG;
};

export const getProductIconImage = (conclusionProduct: IConclusionProductEntity): string => {
  if (conclusionProduct.productConclusion === ProductConclusionEnum.RECOMMENDED) {
    return IMAGE_GOOD;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.DOUBTFUL) {
    return IMAGE_MEDIUM;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.INSUFFICIENT_DATA) {
    return IMAGE_SAFE_DEAL_GRAY;
  }
  return IMAGE_BAD;
};

export const getProductIconImageOLD = (conclusionProduct: IConclusionProductEntity): string => {
  if (conclusionProduct.productConclusion === ProductConclusionEnum.RECOMMENDED) {
    return IMAGE_GOOD_OLD;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.DOUBTFUL) {
    return IMAGE_MEDIUM_OLD;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.INSUFFICIENT_DATA) {
    return IMAGE_SAFE_DEAL_GRAY_OLD;
  }
  return IMAGE_BAD_OLD;
};

export const getProductConclusionText = (product: IConclusionProductEntity): string => {
  if (product.productConclusion === ProductConclusionEnum.RECOMMENDED) {
    return t("recommended_product");
  }
  if (product.productConclusion === ProductConclusionEnum.DOUBTFUL) {
    return t("doubtful_product");
  }
  if (product.productConclusion === ProductConclusionEnum.INSUFFICIENT_DATA) {
    return t("insufficient_data");
  }
  return t("unrecommended_product");
};

export const getProductBoxShadow = (conclusionProduct: IConclusionProductEntity, boxShadowType = ""): any => {
  if (conclusionProduct.productConclusion === ProductConclusionEnum.RECOMMENDED) {
    return `0px 0px 0px 3.5px ${boxShadowType} ${GOOD_BORDER}`;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.DOUBTFUL) {
    return `0px 0px 0px 3.5px ${boxShadowType} ${DOUBTFUL_BORDER}`;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.INSUFFICIENT_DATA) {
    return `0px 0px 0px 3.5px ${boxShadowType} ${INSUFFICIENT_DATA_BORDER}`;
  }
  return `0px 0px 0px 3.5px ${boxShadowType} ${BAD_BORDER}`;
};

export const getProductOutline = (conclusionProduct: IConclusionProductEntity): any => {
  if (conclusionProduct.productConclusion === ProductConclusionEnum.RECOMMENDED) {
    return `1px solid ${GOOD_BORDER}`;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.DOUBTFUL) {
    return `1px solid ${DOUBTFUL_BORDER}`;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.INSUFFICIENT_DATA) {
    return `1px solid ${INSUFFICIENT_DATA_BORDER}`;
  }
  return `1px solid ${BAD_BORDER}`;
};

export const getBorderColor = (conclusionProduct: IConclusionProductEntity): any => {
  if (conclusionProduct.productConclusion === ProductConclusionEnum.RECOMMENDED) {
    return GOOD_BORDER;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.DOUBTFUL) {
    return DOUBTFUL_BORDER;
  }
  if (conclusionProduct.productConclusion === ProductConclusionEnum.INSUFFICIENT_DATA) {
    return INSUFFICIENT_DATA_BORDER;
  }
  return BAD_BORDER;
};

export const isRtlDir = isRtl();

export const ProductPaint = {
  getProductBg,
  getProductChartBg,
  getProductIconImage,
  getProductIconImageOLD,
  getProductConclusionText,
  getProductBoxShadow,
  getProductOutline
};
