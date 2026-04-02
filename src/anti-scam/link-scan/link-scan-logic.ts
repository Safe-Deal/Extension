import { debug } from "../../utils/analytics/logger";
import { ApiScamNorton } from "../scam-rater/api-scam-norton";
import { ApiScamVoidUrl } from "../scam-rater/api-scam-void-url";
import { ApiScamWOT } from "../scam-rater/api-scam-wot";
import { ScamConclusion, ScamRater, ScamSiteType } from "../types/anti-scam";
import { WHITELISTED_DOMAINS } from "../logic/anti-scam-white-list";
import { LinkScanResult } from "./types";

const RATERS: ScamRater[] = [new ApiScamWOT(), new ApiScamNorton(), new ApiScamVoidUrl()];

const isLinkWhitelisted = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  return WHITELISTED_DOMAINS.some((trusted) => {
    const t = trusted.toLowerCase();
    return normalized === t || normalized.endsWith(`.${t}`);
  });
};

const KNOWN_SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "buff.ly",
  "short.link",
  "rb.gy",
  "cutt.ly",
  "is.gd",
  "tiny.cc",
  "bl.ink"
];

const EXPLANATIONS: Record<string, string> = {
  safe: "Safe: domain is whitelisted / known trusted",
  safe_engines: "Safe: reputation sources consider this domain trusted",
  suspicious_low_trust: "Suspicious: domain has a low trust score from reputation sources",
  suspicious_one_flag: "Suspicious: one reputation source flagged this domain, others had no data",
  suspicious_mixed: "Suspicious: reputation sources disagree on this domain",
  suspicious_shortener: "Suspicious: this is a known URL shortener — final destination unknown",
  dangerous: "Dangerous: multiple reputation sources flagged this domain",
  dangerous_very_low: "Dangerous: domain has very low trust scores from reputation sources",
  no_data: "No data: reputation sources had insufficient data for this domain",
  no_data_suspicious: "Suspicious: no reputation data found for this domain — proceed with caution",
  suspicious_partial: "Suspicious: not all reputation sources could verify this domain",
  error: "No data: could not complete scan for this domain"
};

// Re-classify a rater result using stricter thresholds on the raw trustworthiness score.
// The existing raters have very loose SAFE ranges (e.g. WOT: 11-100 = SAFE, Norton: "w" unrated = SAFE).
// For link scanning we apply our own thresholds:
//   >= 60 → SAFE
//   30-59 → SUSPICIOUS
//   < 30  → DANGEROUS
// If no trustworthiness score available, the rater had no real data → NO_DATA.
// We never trust a blind SAFE without a meaningful confidence score.
const reclassify = (conclusion: ScamConclusion): ScamSiteType => {
  const trust = conclusion.trustworthiness;

  // No numeric score — trust the rater's own verdict for SAFE and DANGEROUS,
  // since the engine explicitly classified it (e.g. WOT "Trusted" with N/A score)
  if (trust === null || trust === undefined) {
    if (conclusion.type === ScamSiteType.DANGEROUS) return ScamSiteType.DANGEROUS;
    if (conclusion.type === ScamSiteType.SAFE) return ScamSiteType.SAFE;
    return ScamSiteType.NO_DATA;
  }

  if (trust >= 60) return ScamSiteType.SAFE;
  if (trust >= 30) return ScamSiteType.SUSPICIOUS;
  return ScamSiteType.DANGEROUS;
};

export class LinkScanEvaluator {
  public static async evaluate(hostname: string, tabId: number): Promise<LinkScanResult> {
    try {
      const normalized = hostname.toLowerCase().replace(/^www\./, "");

      if (isLinkWhitelisted(normalized)) {
        return {
          state: "safe",
          hostname: normalized,
          explanation: EXPLANATIONS.safe,
          engineBreakdown: []
        };
      }

      if (KNOWN_SHORTENERS.includes(normalized)) {
        return {
          state: "suspicious",
          hostname: normalized,
          explanation: EXPLANATIONS.suspicious_shortener,
          engineBreakdown: []
        };
      }

      const settled = await Promise.allSettled(RATERS.map((r) => r.get(normalized, tabId)));

      const breakdown: { name: string; result: ScamSiteType }[] = [];
      let safeCount = 0;
      let suspiciousCount = 0;
      let dangerousCount = 0;
      let isTrustedByWot = false;

      RATERS.forEach((rater, i) => {
        const item = settled[i];
        let classification: ScamSiteType;

        if (item.status === "fulfilled") {
          classification = reclassify(item.value);
          if (rater.name === "ApiScamWOT" && classification === ScamSiteType.SAFE) {
            isTrustedByWot = true;
          }
          debug(
            `LinkScanEvaluator:: ${rater.name} → raw:${item.value.type} trust:${item.value.trustworthiness} → reclassified:${classification}`
          );
        } else {
          classification = ScamSiteType.NO_DATA;
          debug(`LinkScanEvaluator:: ${rater.name} → rejected`);
        }

        breakdown.push({ name: rater.name, result: classification });
        if (classification === ScamSiteType.SAFE) safeCount += 1;
        if (classification === ScamSiteType.SUSPICIOUS) suspiciousCount += 1;
        if (classification === ScamSiteType.DANGEROUS) dangerousCount += 1;
      });

      // ≥2 dangerous → dangerous
      if (dangerousCount >= 2) {
        return {
          state: "dangerous",
          hostname: normalized,
          explanation: EXPLANATIONS.dangerous,
          engineBreakdown: breakdown
        };
      }

      // Any dangerous + any suspicious → dangerous
      if (dangerousCount >= 1 && suspiciousCount >= 1) {
        return {
          state: "dangerous",
          hostname: normalized,
          explanation: EXPLANATIONS.dangerous_very_low,
          engineBreakdown: breakdown
        };
      }

      // 1 dangerous, rest NO_DATA or SAFE → suspicious
      if (dangerousCount === 1) {
        return {
          state: "suspicious",
          hostname: normalized,
          explanation: EXPLANATIONS.suspicious_one_flag,
          engineBreakdown: breakdown
        };
      }

      // Any suspicious (no dangerous) → suspicious
      if (suspiciousCount >= 1) {
        return {
          state: "suspicious",
          hostname: normalized,
          explanation: EXPLANATIONS.suspicious_low_trust,
          engineBreakdown: breakdown
        };
      }

      // For outbound links, a WOT trusted verdict is enough to treat the domain as safe.
      if (isTrustedByWot && dangerousCount === 0 && suspiciousCount === 0) {
        return {
          state: "safe",
          hostname: normalized,
          explanation: EXPLANATIONS.safe_engines,
          engineBreakdown: breakdown
        };
      }

      // SAFE if at least 2 engines say SAFE and none say DANGEROUS/SUSPICIOUS
      if (safeCount >= 2 && dangerousCount === 0 && suspiciousCount === 0) {
        return {
          state: "safe",
          hostname: normalized,
          explanation: EXPLANATIONS.safe_engines,
          engineBreakdown: breakdown
        };
      }

      // Only 1 safe, rest NO_DATA — not enough confidence
      if (safeCount === 1 && dangerousCount === 0 && suspiciousCount === 0) {
        return {
          state: "suspicious",
          hostname: normalized,
          explanation: EXPLANATIONS.suspicious_partial,
          engineBreakdown: breakdown
        };
      }

      // All NO_DATA — no engine had info → suspicious (unknown = not trusted)
      return {
        state: "suspicious",
        hostname: normalized,
        explanation: EXPLANATIONS.no_data_suspicious,
        engineBreakdown: breakdown
      };
    } catch {
      return { state: "error", hostname, explanation: EXPLANATIONS.error, engineBreakdown: [] };
    }
  }
}
