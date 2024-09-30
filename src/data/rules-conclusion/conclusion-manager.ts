import { ConclusionProduct } from "../../e-commerce/engine/logic/conclusion/conclusion-product";
import { IConclusionProductEntity } from "../../e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import { logError } from "../../utils/analytics/logger";
import { RuleManager } from "../rules/rule-manager";
import { infuseProduct } from "./conclusion-reporter";

export class ConclusionManager {
  constructor(private rulesManger: RuleManager) {
    this.rulesManger = rulesManger;
  }

  public async conclusion(): Promise<IConclusionProductEntity[]> {
    const rulesMangerResult: [] = await this.rulesManger.execute();
    const products = this.rulesManger.getProducts();
    if (rulesMangerResult.length === 0) {
      logError(new Error(`0 Rules Executed inside RuleManager!!! : Products ${JSON.stringify(products)}`));
    }
    const conclusions = this.getConclusionProducts(rulesMangerResult);
    for (const conclusion of conclusions) {
      infuseProduct(conclusion, products[0]);
    }
    return conclusions;
  }

  public async conclusionForBrain() {
    const rulesMangerResult = await this.rulesManger.execute();
    const products = this.rulesManger.getProducts();
    if (rulesMangerResult.length === 0) {
      logError(new Error(`0 Rules Executed inside RuleManager!!! : Products ${JSON.stringify(products)}`));
      return [];
    }
    const conclusions = this.getConclusionProducts(rulesMangerResult);
    const result = [];
    for (const conclusion of conclusions) {
      const prod = await infuseProduct(conclusion, products[0]);
      if (prod) {
        result.push(prod);
      }
    }
    if (result.length === 0) {
      const product = products[0];
      const conclusionProd = conclusions[0];
      const conclusion = conclusionProd.productConclusion;
      conclusionProd.productConclusion = undefined;
      result.push({
        ...product,
        ...conclusionProd,
        conclusion
      });
    }
    return result;
  }

  private getConclusionProducts(rulesMangerResult: any[]) {
    return rulesMangerResult.map((ruleManagerResult: any) => {
      const conclusionProduct = new ConclusionProduct(ruleManagerResult);
      return conclusionProduct.conclusion();
    });
  }
}
