export enum ScamSiteType {
  SAFE = "SAFE",
  DANGEROUS = "DANGEROUS",
  NO_DATA = "NO_DATA"
}

export interface ScamConclusion {
  type: ScamSiteType;
  trustworthiness?: number;
  childSafety?: number;
  tabId: number;
}

export type ScamRequest = {
  domain: string;
  tabId: number;
};

export interface ScamRater {
  name: string;
  get(domain: string, tabId: number): Promise<ScamConclusion>;
}
