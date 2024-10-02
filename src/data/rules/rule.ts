import { WEIGHT } from "../../constants/weight"
import { IProduct } from "../entities/product.interface"
import { IRuleResult } from "../entities/rule-result.interface"
import { SiteDomSelector } from "../sites/site-dom-selector"

export abstract class Rule {
	protected name: string

	protected value: object

	protected weight = WEIGHT.ONE

	constructor(name = "", weight: any) {
		this.name = name
		this.value = null
		this.weight = weight
	}

	public getName(): string {
		return this.name
	}

  public abstract evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult>;
}
