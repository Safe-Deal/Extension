import { IProduct } from "../../../../data/entities/product.interface";
import { getDomain } from "../../../../utils/dom/html";
import { ProductStore } from "../../logic/conclusion/conclusion-product-entity.interface";
import { AliExpressProductDownloader } from "../../stores/ali-express/product/ali-express-product-downloader";
import { IMetaData } from "../meta-data.interface";

export default async function extractAliExpressMeta(
  downloader: AliExpressProductDownloader,
  product: IProduct,
  pricing: any
): Promise<IMetaData> {
  const productData = await downloader.download();
  if (!productData) {
    return null;
  }

  const domain = getDomain(product.url);
  const { maxPrice = 0, minPrice = 0, price = 0 } = pricing || {};
  const priseTable = price;

  return {
    domain,
    source: ProductStore.ALI_EXPRESS,
    id: product.id,
    title: productData.title,
    description: productData.description,
    category: productData.category,
    images: productData.images,
    details: {
      store: {
        following: productData.storeFollowing,
        positiveRate: productData.storePositiveRate,
        topRatedSeller: productData.storeIsTopRated
      }
    },
    price: {
      maxPrice,
      minPrice,
      price: priseTable
    }
  };
}
