import { debug } from "../../../utils/analytics/logger";
import { IProduct } from "../../../data/entities/product.interface";
import { MemoryCache } from "../../../utils/cashing/memoryCache";

const EXPIRATION_MINUTES = 15;

class ClientProcessingQue {
  private readonly productsQue: IProduct[] = [];

  private readonly alreadyProcessed = new MemoryCache(EXPIRATION_MINUTES);

  private inProgressing = new MemoryCache(EXPIRATION_MINUTES);

  getStats() {
    return {
      alreadyProcessedLength: [...this.alreadyProcessed.keys()].length,
      productsQueLength: this.productsQue.length,
      inProgressing: [...this.inProgressing.keys()]
    };
  }

  getProcessingAmount = () => [...this.inProgressing.keys()].length;

  isAllDone: () => boolean = () => {
    const amount = [...this.inProgressing.keys()];
    const result = this.productsQue.length === 0 && amount.length === 0;
    return result;
  };

  isProcessed: (product: IProduct) => boolean = (product: IProduct) =>
    this.alreadyProcessed.get(product.id) != null || this.inProgressing.get(product.id) != null;

  isProductProcessed: (product: IProduct) => boolean = (product: IProduct) =>
    this.alreadyProcessed.get(product.id) != null;

  progressingDone: (productId: string) => void = (productId: string) => {
    this.inProgressing.delete(productId);
  };

  getNextProductFromQue: () => IProduct = () => {
    const product: IProduct = this.productsQue.pop();
    if (product?.id) {
      debug(`=> Pop out from Client productQue: ${product.id}`);
      this.inProgressing.set(product.id, product);
      return product;
    }
    return null;
  };

  addProductToQue = (product: IProduct) => {
    const isExistedInThePast: boolean = this.isProcessed(product);
    const isExisted: boolean = this.productsQue.some((pr: IProduct) => pr.id === product.id);

    if (!isExisted && !isExistedInThePast) {
      this.alreadyProcessed.set(product.id, true);
      this.productsQue.push(product);
      debug(`<= Product added to Client productQue: ${product.id}`);
    } else {
      debug(`<= Product already in Client productQue: ${product.id}`);
    }
  };
}

export const ClientQue = new ClientProcessingQue();
