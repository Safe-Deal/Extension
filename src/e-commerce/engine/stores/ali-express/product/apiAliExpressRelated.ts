import { debug } from "../../../../../utils/analytics/logger";
import { Remote } from "../../../../../utils/downloaders/remote/remoteFetcher";

export class ApiAliExpressRelated {
  protected remote: Remote;

  public async call(productID): Promise<any> {
    if (!productID) {
      return Promise.resolve(null);
    }
    const url = `https://aliexpress.ru/aer-api/v1/product/detail/special_for_you?product_id=${productID}`;
    try {
      const result = [];
      const response = await Remote.postJson(url, { lang: "en", pageSize: 49 });
      const { products } = response.response;
      if (products && products.length) {
        for (const product of products) {
          const item = {
            id: product.id,
            img: product.imgUrl,
            orders: product.orders,
            ratings: product.rating,
            price: product.price,
            title: product.title,
            url: product.url
          };
          result.push(item);
        }
        return result;
      }
      return null;
    } catch (error) {
      debug(new Error(`ApiAliExpressRelated Api Call Failed ${url} -> ${JSON.stringify(error)}`));
      return null;
    }
  }
}
