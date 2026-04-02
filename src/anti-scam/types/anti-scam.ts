export enum ScamSiteType {
  SAFE = "SAFE",
  SUSPICIOUS = "SUSPICIOUS",
  DANGEROUS = "DANGEROUS",
  NO_DATA = "NO_DATA"
}

export interface ScamConclusion {
  type: ScamSiteType;
  trustworthiness?: number;
  childSafety?: number;
  tabId: number;
  explanation?: string;
  engineBreakdown?: { name: string; result: ScamSiteType }[];
}

export type ScamRequest = {
  domain: string;
  tabId: number;
};

export interface ScamRater {
  name: string;
  get(domain: string, tabId: number): Promise<ScamConclusion>;
}
