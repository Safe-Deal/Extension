import { logError } from "../../utils/analytics/logger";
import { IProduct } from "../entities/product.interface";
import { IRuleResult } from "../entities/rule-result.interface";
import { SiteDomSelector } from "../sites/site-dom-selector";
import { Rule } from "./rule";

export class RuleManager {
  constructor(
    private products: IProduct[],
    private rules: Rule[] = [],
    private siteDomSelector: SiteDomSelector
  ) {}

  public getProducts(): IProduct[] {
    return this.products;
  }

  public async execute(): Promise<any> {
    const rulesManagerPromiseResult: Array<Promise<any>> = this.products.map(async (product: IProduct) => {
      const rulesPromiseResult: Array<Promise<IRuleResult>> = this.rules.map(async (rule: Rule) => {
        try {
          const result = await rule.evaluate(product, this.siteDomSelector);
          const resultValidated = this.validateResult(result, rule);
          return resultValidated;
        } catch (error) {
          logError(error, `${rule.getName()} => ${product.url}`);
        }
        return null;
      });
      const rulesResult = await Promise.all(rulesPromiseResult);
      return {
        product,
        rules: rulesResult
      };
    });
    return Promise.all(rulesManagerPromiseResult);
  }

  private validateResult(res: IRuleResult, rule: Rule): IRuleResult {
    if (res == null || res === undefined) {
      throw new Error(`${rule.getName()} :: Rule are not allowed be return null or undefined`);
    }
    if (res.value == null || res.value === undefined) {
      throw new Error(
        `${rule.getName()}  :: result.value are not allowed to return null or undefined, return an number 0 if you want to ignore this rule`
      );
    }
    if (res.weight == null || res.weight === undefined) {
      throw new Error(
        `${rule.getName()}  :: result.weight are not allowed to return null or undefined, return an number 0 if you want to ignore this rule`
      );
    }

    return res;
  }
}
