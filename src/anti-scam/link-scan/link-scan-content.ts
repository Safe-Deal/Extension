import { getDomain } from "@utils/dom/html";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { initPegasusTransport } from "@utils/pegasus/transport/content-script";
import React from "react";
import ReactDOM from "react-dom/client";
import { debug, logError } from "../../utils/analytics/logger";
import { LinkScanPopover } from "./LinkScanPopover";
import { ILinkScanMessageBus, LinkScanMessageTypes, LinkScanResult, LinkScanState } from "./types";

initPegasusTransport({ allowWindowMessagingForNamespace: "CONTENT_SCRIPT_LINK_SCAN" });

const HOVER_DELAY_MS = 500;
const DISMISS_DELAY_MS = 200;
const RESULT_AUTO_DISMISS_MS = 5000;

const cache = new Map<string, LinkScanResult>();

let hoverTimer: ReturnType<typeof setTimeout> | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
let resultDismissTimer: ReturnType<typeof setTimeout> | null = null;
let activeAnchor: HTMLAnchorElement | null = null;
let activeHostname: string | null = null;
let floatingContainer: HTMLDivElement | null = null;
let floatingRoot: ReturnType<typeof ReactDOM.createRoot> | null = null;
let scanInProgress = false;

const { sendMessage } = definePegasusMessageBus<ILinkScanMessageBus>();

// ── Styles ──────────────────────────────────────

const injectStyles = () => {
  if (document.getElementById("sd-link-scan-styles")) return;
  const style = document.createElement("style");
  style.id = "sd-link-scan-styles";
  style.textContent = `
    @keyframes sd-spin { to { transform: rotate(360deg); } }
    #sd-link-scan-float { pointer-events: auto; }
    #sd-link-scan-float * { pointer-events: auto; }
  `;
  document.head.appendChild(style);
};

// ── Helpers ─────────────────────────────────────

const getOutboundHostname = (anchor: HTMLAnchorElement): string | null => {
  try {
    const href = anchor.href;
    if (!href || !/^https?:\/\//i.test(href)) return null;
    const url = new URL(href);
    const targetHost = url.hostname.toLowerCase().replace(/^www\./, "");
    const currentHost = getDomain()
      .toLowerCase()
      .replace(/^www\./, "");
    if (targetHost === currentHost) return null;
    return targetHost;
  } catch {
    return null;
  }
};

// ── Floating popover lifecycle ──────────────────

const positionFloat = () => {
  if (!floatingContainer || !activeAnchor) return;
  const rect = activeAnchor.getBoundingClientRect();
  floatingContainer.style.top = `${window.scrollY + rect.bottom + 4}px`;
  floatingContainer.style.left = `${window.scrollX + rect.left}px`;
};

const removePopover = () => {
  if (resultDismissTimer) {
    clearTimeout(resultDismissTimer);
    resultDismissTimer = null;
  }
  if (floatingRoot) {
    floatingRoot.unmount();
    floatingRoot = null;
  }
  if (floatingContainer?.parentNode) {
    floatingContainer.parentNode.removeChild(floatingContainer);
  }
  floatingContainer = null;
  activeAnchor = null;
  activeHostname = null;
  scanInProgress = false;
};

const render = (state: LinkScanState, result?: LinkScanResult, onScan?: () => void) => {
  if (!floatingRoot) return;
  floatingRoot.render(React.createElement(LinkScanPopover, { state, result, onScan: onScan ?? (() => {}) }));

  if (resultDismissTimer) {
    clearTimeout(resultDismissTimer);
    resultDismissTimer = null;
  }

  if (["safe", "suspicious", "dangerous", "no_data", "error"].includes(state)) {
    resultDismissTimer = setTimeout(() => {
      removePopover();
    }, RESULT_AUTO_DISMISS_MS);
  }
};

const mountPopover = (anchor: HTMLAnchorElement, hostname: string) => {
  removePopover();
  activeAnchor = anchor;
  activeHostname = hostname;

  const container = document.createElement("div");
  container.id = "sd-link-scan-float";
  container.style.cssText = "position:absolute;z-index:2147483645;";
  document.body.appendChild(container);
  floatingContainer = container;
  floatingRoot = ReactDOM.createRoot(container);
  positionFloat();

  // Hovering over the popover cancels dismiss
  container.addEventListener("mouseenter", () => cancelDismiss());
  container.addEventListener("mouseleave", () => scheduleDismiss());

  const cached = cache.get(hostname);
  if (cached) {
    render(cached.state, cached);
    return;
  }

  const handleScan = async () => {
    scanInProgress = true;
    render("loading");

    try {
      const result = await sendMessage(LinkScanMessageTypes.SCAN_LINK, hostname);
      cache.set(hostname, result);

      const bgMap: Record<string, string> = {
        safe: "rgba(34,197,94,0.15)",
        suspicious: "rgba(249,115,22,0.15)",
        dangerous: "rgba(239,68,68,0.15)",
        no_data: "rgba(148,163,184,0.15)",
        error: "rgba(148,163,184,0.15)"
      };
      if (anchor.isConnected) {
        anchor.style.backgroundColor = bgMap[result.state] ?? "";
      }

      scanInProgress = false;
      render(result.state, result);
    } catch (error) {
      logError(error, "LinkScan:: Error:");
      scanInProgress = false;
      render("error");
    }
  };

  render("hover-eligible", undefined, handleScan);
};

// ── Dismiss with grace period ───────────────────

const cancelDismiss = () => {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
};

const scheduleDismiss = () => {
  cancelDismiss();
  dismissTimer = setTimeout(() => {
    // Don't dismiss while scan is running or result is cached
    if (scanInProgress) return;
    if (activeHostname && cache.has(activeHostname)) return;
    removePopover();
  }, DISMISS_DELAY_MS);
};

// ── Mouse handlers ──────────────────────────────

const handleMouseOver = (e: MouseEvent) => {
  const target = (e.target as Element)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!target) return;

  if (target === activeAnchor) {
    cancelDismiss();
    return;
  }

  const hostname = getOutboundHostname(target);
  if (!hostname) return;

  if (hoverTimer) clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    mountPopover(target, hostname);
  }, HOVER_DELAY_MS);
};

const handleMouseOut = (e: MouseEvent) => {
  const target = (e.target as Element)?.closest?.("a[href]") as HTMLAnchorElement | null;

  // If leaving an anchor we haven't mounted yet, just cancel the timer
  if (target && target !== activeAnchor) {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    return;
  }

  if (target !== activeAnchor) return;

  // Moving into the floating popover? relatedTarget will be inside it
  const related = e.relatedTarget as Node | null;
  if (related && floatingContainer?.contains(related)) {
    cancelDismiss();
    return;
  }

  scheduleDismiss();
};

// ── Init ────────────────────────────────────────

injectStyles();
document.addEventListener("mouseover", handleMouseOver, true);
document.addEventListener("mouseout", handleMouseOut, true);

// Reposition on scroll
window.addEventListener("scroll", positionFloat, { passive: true });

window.addEventListener("beforeunload", () => {
  removePopover();
  document.removeEventListener("mouseover", handleMouseOver, true);
  document.removeEventListener("mouseout", handleMouseOut, true);
});

debug("LinkScan :: Content script initialized");
