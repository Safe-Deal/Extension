import React from "react";
import { LinkScanResult, LinkScanState } from "./types";

const SAFE_DEAL_ICON = chrome.runtime.getURL("assets/icons/icon48.png");

const STATE_COLORS: Record<string, string> = {
  safe: "#22c55e",
  suspicious: "#f97316",
  dangerous: "#ef4444",
  no_data: "#94a3b8",
  error: "#94a3b8",
};

const STATE_LABELS: Record<string, string> = {
  safe: "Safe",
  suspicious: "Suspicious",
  dangerous: "Dangerous",
  no_data: "No data",
  error: "No data",
};

interface Props {
  state: LinkScanState;
  result?: LinkScanResult;
  onScan: () => void;
}

export const LinkScanPopover: React.FC<Props> = ({ state, result, onScan }) => {
  const isResult = result && !["idle", "hover-eligible", "loading"].includes(state);
  const color = isResult ? STATE_COLORS[state] : "#3b82f6";

  return (
    <div
      className="sd-link-scan-popover"
      style={{
        background: "#fff",
        border: `2px solid ${color}`,
        borderRadius: "8px",
        padding: "6px 10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        fontFamily: "system-ui, sans-serif",
        whiteSpace: "nowrap",
        minWidth: "120px",
        maxWidth: "280px",
        lineHeight: "1.4",
        cursor: "default",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={SAFE_DEAL_ICON}
        alt="Safe Deal"
        style={{ width: "16px", height: "16px", flexShrink: 0 }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />

      {state === "hover-eligible" && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onScan(); }}
          style={{
            background: "none",
            border: "none",
            color: "#3b82f6",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            padding: 0,
          }}
        >
          Scan me
        </button>
      )}

      {state === "loading" && (
        <span style={{ color: "#64748b" }}>
          <span className="sd-link-scan-spinner" style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            border: "2px solid #cbd5e1",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "sd-spin 0.6s linear infinite",
            marginRight: "4px",
            verticalAlign: "middle",
          }} />
          Scanning…
        </span>
      )}

      {isResult && (
        <span style={{ color: "#1e293b", whiteSpace: "normal", wordBreak: "break-word" }}>
          <strong style={{ color }}>{STATE_LABELS[state]}</strong>
          {" — "}
          {result.explanation.replace(/^[^:]+:\s*/, "")}
        </span>
      )}
    </div>
  );
};
