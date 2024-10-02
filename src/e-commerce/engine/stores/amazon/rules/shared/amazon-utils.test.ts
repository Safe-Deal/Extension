import { amazon_products } from "../../../../logic/utils/__tests__/urls.mock";
import { getAsinFromUrl } from "./amazon-utils";

describe("Amazon - Utils Tests", () => {
  for (const product of amazon_products) {
    it(`Extract Asin from URL - ${product}`, () => {
      const url = getAsinFromUrl(product);
      expect(url).not.toBeNull();
      expect(url).toHaveLength(10);
    });
  }
});
