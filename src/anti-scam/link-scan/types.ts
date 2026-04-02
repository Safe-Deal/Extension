import { ScamSiteType } from "../types/anti-scam";

export type LinkScanState = "idle" | "hover-eligible" | "loading" | "safe" | "suspicious" | "dangerous" | "no_data" | "error";

export interface LinkScanResult {
  state: Exclude<LinkScanState, "idle" | "hover-eligible" | "loading">;
  hostname: string;
  explanation: string;
  engineBreakdown: { name: string; result: ScamSiteType }[];
}

export enum LinkScanMessageTypes {
  SCAN_LINK = "scanLink"
}

export interface ILinkScanMessageBus {
  [LinkScanMessageTypes.SCAN_LINK]: (hostname: string) => Promise<LinkScanResult>;
}
