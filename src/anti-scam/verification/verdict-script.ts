import { ScamConclusion, ScamSiteType } from "../types/anti-scam";

export type TabScript = "absent" | "SAFE" | "DANGEROUS" | "NO_DATA" | "throw";
export type EngineScript = "SAFE" | "DANGEROUS" | "NO_DATA" | "reject";

export type VerdictScript = {
  tab: TabScript;
  wot: EngineScript;
  norton: EngineScript;
  voidUrl: EngineScript;
};

export const verdictScript: VerdictScript = {
  tab: "absent",
  wot: "NO_DATA",
  norton: "NO_DATA",
  voidUrl: "NO_DATA"
};

const conclusion = (type: Exclude<EngineScript, "reject">, tabId: number): ScamConclusion => ({
  type: ScamSiteType[type],
  tabId
});

export const readEngine = (which: "wot" | "norton" | "voidUrl", tabId: number): Promise<ScamConclusion> => {
  const action = verdictScript[which];
  if (action === "reject") {
    return Promise.reject(new Error(`${which} rejected`));
  }
  return Promise.resolve(conclusion(action, tabId));
};

export const readTab = (tabId: number): Promise<ScamConclusion> => {
  if (verdictScript.tab === "throw") {
    return Promise.reject(new Error("examineTab failed"));
  }
  if (verdictScript.tab === "absent") {
    return Promise.reject(new Error("examineTab called for an absent tab"));
  }
  return Promise.resolve(conclusion(verdictScript.tab, tabId));
};
