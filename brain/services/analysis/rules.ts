import { ConclusionManager } from "../../../src/data/rules-conclusion/conclusion-manager";
import { RuleManager } from "../../../src/data/rules/rule-manager";
import { Site } from "../../../src/data/sites/site";
import { SiteFactory } from "../../../src/data/sites/site-factory";
import { ServerLogger } from "../../utils/logging";

interface IProcessArgs {
  url: string;
  data: any;
  productId: string;
}

export const processRules = async ({ url, data, productId }: IProcessArgs) => {
  const site: Site = new SiteFactory().create({
    url,
    pathName: data?.url?.pathName,
    dom: null
  });

  const { rules } = site;
  const { siteDomSelector } = site || {};

  const { product } = data;
  ServerLogger.log(`Product: ${productId || data?.url?.pathName} `);

  if (!rules) {
    ServerLogger.error(`Rules Not Found !!! on: ${site.url} - ${site.pathName} - ${productId}`);
  } else {
    ServerLogger.log(`Found: ${data?.url?.domain} with ${site?.rules?.length} rules for: ${site?.pathName}`);
  }
  ServerLogger.log(`Running Rules: ${productId} ....`);
  product.domain = data.url.domain;
  const ruleManager = new RuleManager([product], rules, siteDomSelector);
  const conclusionManager = new ConclusionManager(ruleManager);
  const result = await conclusionManager.conclusionForBrain();
  return result;
};
