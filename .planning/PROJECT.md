# Safe Deal Extension

## What This Is

Safe Deal is an existing browser extension for e-commerce guidance, anti-scam checks, affiliate flows, supplier tooling, and auth/premium experiences across Chrome and Firefox. This workstream adds a new anti-scam capability: users can hover outbound links on supported pages, trigger a manual Safe Deal scan, and see that exact link colored with a short explanation before deciding whether to click.

## Core Value

Help users make safer browsing decisions at click-time without slowing normal browsing or breaking the existing Safe Deal extension flows.

## Requirements

### Validated

- ✓ Popup/auth/subscription flows already exist in the extension — existing
- ✓ Page/domain anti-scam analysis already exists via content script → Pegasus → worker flow — existing
- ✓ E-commerce analysis and injected UI already exist on supported commerce sites — existing
- ✓ Supplier tooling for Alibaba already exists — existing
- ✓ Affiliate/link-related content-script behavior already exists via Shutaf — existing

### Active

- [ ] User can hover an outbound `http/https` link on supported pages and see a Safe Deal CTA after `500ms`
- [ ] User can click the CTA and manually scan the target hostname using the current anti-scam worker flow
- [ ] User can see the exact scanned link background colored `green`, `orange`, `red`, or `gray` with a short generic explanation

### Out of Scope

- Auto-scan every page link — excluded to keep v1 low-noise and low-cost
- Full path-level or redirect-chain reputation — excluded because current anti-scam engines are domain-based
- Blocking navigation by default — excluded because v1 is advisory, not enforcement
- Persisting scanned-link state across sessions — excluded to keep v1 simple and reversible
- Exposing engine-by-engine explanations — excluded to keep copy generic in v1

## Context

This is a brownfield extension codebase with existing multi-context architecture: service worker/background logic, multiple content scripts, popup UI, and Pegasus messaging backed by Zustand stores. Anti-scam already analyzes the current page domain through `src/anti-scam/content-script-anti-scam.ts`, `src/anti-scam/anti-scam-worker.ts`, and `src/anti-scam/logic/anti-scam-logic.ts`. The new feature should reuse that architecture rather than invent a parallel system. The feature scope is extension-only v1 for all users on pages where the anti-scam content script already runs. Success means users can manually scan outbound links and consistently receive a color result plus short explanation.

## Constraints

- **Architecture**: Must follow existing content script → Pegasus → worker pattern — keeps behavior aligned with current extension design
- **Compatibility**: Must preserve Chrome MV3 and Firefox MV2 support — current extension ships both
- **Detection model**: V1 uses current domain reputation engines only — current anti-scam system is domain-based, not full URL/path based
- **UX scope**: Hover CTA appears after `500ms`, scanning stays manual — avoids noisy auto-scanning
- **State persistence**: Link scan state stays in-memory for current page/tab lifecycle only — simpler v1, less risk
- **Whitelist behavior**: Existing whitelist semantics force green in v1 — aligns with current anti-scam trust model

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Manual hover-to-scan instead of auto-scan | Lower noise, lower cost, easier to fit current architecture | — Pending |
| CTA appears after `500ms` hover delay | Reduce spammy popovers on link-dense pages | — Pending |
| V1 color model is `green` / `orange` / `red` / `gray` | Matches existing Safe Deal-style result language better than current 3-state anti-scam enum | — Pending |
| V1 scans hostnames with current anti-scam engines | Reuses existing worker/raters and keeps implementation realistic | — Pending |
| Existing whitelist forces green | Matches current trust semantics and minimizes surprise in v1 | — Pending |
| Original link remains clickable before scan | Keep feature advisory, not blocking | — Pending |
| Explanation copy stays generic | Avoids exposing engine internals in v1 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-02 after initialization*
