# PRD: Hover-to-Scan Outbound Links

## Problem

Safe Deal currently evaluates the page/domain the user is on, but not the outbound links the user is about to click. Users can still leave a trusted page through a risky link with no inline warning at click-time.

## Goal

Add a lightweight, manual link-scan UX in the extension:

- On hover of an outbound link, show a small Safe Deal popover near the link with icon + `Scan me`.
- On click, show loading in the popover.
- Scan the target link in v1 using current anti-scam domain reputation engines.
- Color the exact hovered link background by result.
- Show a short reason in the result popover.

## Non-goals

- Auto-scan every link on page load
- Full URL/path reputation in v1
- Redirect-chain resolution in v1
- Blocking navigation by default
- Replacing current page/domain anti-scam flow
- Perfect detection of short-lived/path-specific scams

## User story

As a user browsing any page, when I see a link I may click, I want a quick manual Safe Deal scan before leaving the page, so I can judge if the target looks safe, suspicious, dangerous, or unknown.

## UX flow

1. User hovers an outbound `http/https` link.
2. After `500ms` hover delay, small anchored popover appears near link: Safe Deal icon + `Scan me`.
3. User clicks the popover.
4. Popover switches to spinner/loading state.
5. Extension extracts the target hostname and sends scan request to background via Pegasus.
6. Worker runs current anti-scam domain engines against that hostname.
7. Popover updates with:
   - state color
   - short label
   - 1-2 line explanation
8. Exact link background is colored:
   - green = safe
   - orange = suspicious/doubtful
   - red = dangerous
   - gray = insufficient/no data
9. If user re-hovers same link during the current page lifecycle, in-memory cached result may show fast.

## State model

### Link scan states

- `idle`: no hover, no popover
- `hover-eligible`: outbound link hovered, CTA visible
- `loading`: scan requested, spinner shown
- `safe`: green background + positive explanation
- `suspicious`: orange background + caution explanation
- `dangerous`: red background + warning explanation
- `no_data`: gray background + limited-confidence explanation
- `error`: treat as gray UX copy, no crash

### V1 classification rule

Use current anti-scam domain engines as primary input: `WOT`, `Norton Safe Web`, `URLVoid`, plus existing whitelist behavior.

Recommended v1 rule:

- `green`
  - domain is on existing Safe Deal whitelist, or
  - at least 1 engine says safe and 0 say dangerous
- `orange`
  - exactly 1 engine says dangerous and the rest are `no data`, or
  - engines disagree (`safe` and `dangerous` both present)
- `red`
  - 2 or more engines say dangerous
- `gray`
  - all engines return `no data`, hostname cannot be parsed, or link is unsupported

This gives a practical orange state without pretending path-level certainty.

## Functional requirements

1. Detect hover only on outbound `a[href]` links with `http/https`.
2. Ignore internal anchors, `javascript:`, `mailto:`, `tel:`, empty links, and extension UI links.
3. Show a compact popover near the exact hovered link after `500ms` of continuous hover.
4. Popover CTA text in v1: `Scan me`.
5. On click, do not auto-navigate before scan result is shown if user clicked the Safe Deal CTA itself.
6. Clicking the original link remains allowed even if the user has not scanned it yet.
7. Show Safe Deal loading spinner while awaiting result.
8. Scan only the target domain/hostname in v1, not full path.
9. Known shorteners should default to `orange` in v1 unless later expanded/resolved.
10. Apply background color to the exact scanned link element.
11. Show short generic explanation text in result popover.
12. Explanation must mention why in domain terms, eg:
    - `Safe: domain is whitelisted / known trusted`
    - `Suspicious: one reputation source flagged this domain, others had no data`
    - `Dangerous: multiple reputation sources flagged this domain`
    - `No data: reputation sources had insufficient data for this domain`
13. Preserve result while link remains in view/hover context.
14. Cache results by normalized hostname in memory only for the current page/tab lifecycle; do not persist link state across reloads, tabs, or sessions.
15. Reuse existing whitelist semantics where practical:
    - built-in trusted-domain whitelist
    - user/safe-deal remembered safe behavior
16. Existing whitelist should force `green` for outbound-link scans in v1.
17. Do not break current anti-scam page-level behavior.

## Technical approach

### Architecture

Keep current repo pattern:

- content script owns DOM hover detection, popover UI, link highlighting
- Pegasus transports message from content script to background worker
- anti-scam worker performs scan
- worker/store returns normalized result object to content script

### Repo-aligned implementation

- Extend `src/anti-scam/content-script-anti-scam.ts` or add focused link-scan content module under `src/anti-scam/`
- Add new Pegasus message for target-link scan, separate from current page-domain scan
- Reuse `src/anti-scam/anti-scam-worker.ts` as execution point
- Reuse current raters in `src/anti-scam/scam-rater/`
- Extend anti-scam result typing in `src/anti-scam/types/anti-scam.ts` to support:
  - `SAFE | SUSPICIOUS | DANGEROUS | NO_DATA`
  - explanation text
  - optional engine breakdown
  - normalized hostname
- Use content-script-local UI for popover instead of full-page modal
- Use existing Zustand/Pegasus store only if needed for shared state; for v1, ephemeral per-tab content-script state is likely enough, with in-memory cache only

### Data flow

1. Hovered link href parsed in content script.
2. Normalize hostname.
3. Check whitelist / cache first.
4. Send Pegasus message to anti-scam worker with hostname.
5. Worker runs current domain raters.
6. Worker returns aggregated classification + explanation.
7. Content script paints link background + updates popover.

### Why this fits repo now

- matches existing content script -> Pegasus -> worker pattern
- reuses current anti-scam engines
- avoids large new backend/system work
- keeps scope manual and bounded

## Risks / open issues

- Redirect links: v1 likely scans the visible href hostname, not final destination. Shorteners and tracking links may look safer or less safe than final target.
- Path-level malicious pages: current engines are domain-based, so `example.com/bad-page` may still return green/gray if root domain looks okay.
- False positives: one engine may flag a legitimate domain, producing orange/red.
- False negatives: engines may miss new scam domains or compromised paths.
- Whitelisting behavior: current whitelist is broad and includes remembered-safe behavior; that may force green even when a specific outbound path is risky.
- DOM complexity: dynamic sites may re-render links, so highlight/popover lifecycle must be resilient.
- UX noise: frequent hover affordance may feel spammy on link-dense pages.
- Accessibility: hover-only UX needs fallback for keyboard focus.
- Hover timing: `500ms` delay should reduce noise, but still needs validation on dense-link pages.

## Success metrics

- CTA shown on eligible outbound-link hover with low visual noise
- Scan result returned fast enough to feel interactive
  - target: p95 under 1.5s from CTA click to visible result
- High result coverage on scanned links
  - target: green/orange/red/gray result on >95% of scan attempts
- Low error/crash rate in content script
- Meaningful usage
  - CTR from hover CTA to scan
  - repeat scans per user/session
- Outcome quality
  - track result distribution by state
  - track dismiss/ignore after orange/red

## Phased rollout suggestion

### Phase 1: Internal/dev

- Manual hover CTA on eligible links
- Domain-only scan
- Background color + explanation popover
- Session cache only
- Basic telemetry/logging

### Phase 2: Limited release

- Tune hover timing and placement
- Add keyboard-focus trigger
- Add hostname normalization improvements
- Refine orange/red thresholds from real data

### Phase 3: Smarter link intelligence

- Common redirect/shortener expansion where safe and cheap
- Better explanation strings per engine mix
- Optional persisted cache
- Stronger site-specific handling for large platforms

## Locked decisions

- CTA appears after `500ms` hover delay.
- Link state is not persisted beyond the current page/tab lifecycle.
- Explanation copy stays generic; do not expose engine names in v1.
- Clicking the original link before scan remains allowed.
- Known shorteners default to `orange` unless expanded/resolved.
- Existing whitelist forces `green` for outbound-link scans in v1.

## Unresolved questions

- None for current v1 scope.
