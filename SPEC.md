# Performance Optimization Spec

## Objective

Reduce perceived page lag and memory consumption caused by the extension running on every page the user visits. Focus is entirely on **runtime performance** — no build-time changes. Target symptoms: pages feel slow/laggy when the extension is active; browser memory usage is too high.

## Root-Cause Analysis

Five issues were identified by reading the source. Listed by severity.

---

### P0-A — Memory leak: `onDocumentInactivity` creates unbounded MutationObservers

**File:** `src/utils/browser/browser.ts:51-66`  
**Called from:** `src/e-commerce/client/processing/queHandler.ts:32`  
**Called by:** `startProcessingInterval` → every 200 ms

`onDocumentInactivity` is designed as a one-shot debounce gate, but it creates a brand-new `MutationObserver` on `document` with `childList + subtree + characterData` every time it is called and **never disconnects it**. Because it is called inside a 200 ms `setInterval`, observers accumulate indefinitely for the lifetime of the content script. Each observer fires on every DOM mutation (which is constant on SPA pages like Amazon). The callbacks pile up faster than they can be GC'd.

**Fix:** Refactor `onDocumentInactivity` to create the observer once and reuse it, or replace it with a module-level `setTimeout`/`clearTimeout` debounce (no observer needed for inactivity detection — just reset a timer on each incoming call).

---

### P0-B — DOM serialization round-trip on every product

**Files:**  
- `src/e-commerce/client/processing/queHandler.ts:37`  
- `src/e-commerce/apps/deals-amazon/ui/DealsCouponsApp.tsx:20`  
- `src/supplier/client/SupplierClient.tsx:21`  
- `src/e-commerce/client/components/product/components/Reviews/Reviews.tsx:36`  
- `src/e-commerce/apps/deals-ali-express/ui/components/analyzer/analyzer.tsx:55`

`SiteMetadata.getDomOuterHTML(document)` calls `new XMLSerializer().serializeToString(doc)` — serializing the entire live page DOM (typically 300 KB–5 MB on Amazon/eBay listing pages) into a string. This string is:
1. Allocated in the content script heap
2. Copied into a Pegasus IPC message
3. Received by the background service worker
4. Re-parsed by `node-html-parser` back into a DOM

This round-trip happens **once per product request** (i.e., multiple times per page load on listing pages), and the serialized string is never needed in full — the background only queries it with CSS selectors to extract product fields that are already visible in the live DOM.

**Fix:** Move the CSS-selector extraction step to the content script side (where the live DOM is available). Pass a plain structured object to the background worker instead of the raw HTML string. The background's `SiteMetadata.getDom(data)` call and `node-html-parser` import can then be removed from the worker path.

---

### P0-C — `setInterval` at 200 ms runs forever, driving P0-A

**File:** `src/e-commerce/client/events/eventRegistration.ts:18-24`

`startProcessingInterval` sets a 200 ms interval that calls `sendNextRequest()` on every tick, regardless of whether the queue has work. `sendNextRequest` always calls `onDocumentInactivity` (see P0-A), so even after the queue is drained the interval keeps creating MutationObservers. The interval is stopped only on `beforeunload`, which never fires on MV3 service-worker-managed tab navigations.

Additionally, `ClientQue.isAllDone()` (called on every tick) spreads the entire `inProgressing` LRU cache into an array on each check: `[...this.inProgressing.keys()].length` — wasteful when the queue is empty.

**Fix:** 
1. Stop the interval as soon as `isAllDone()` returns true; restart it from `addProductToQue`.
2. Replace the `[...keys()].length` spread with an integer counter maintained in `ClientProcessingQue`.

---

### P1-A — `onHrefChange` attaches a click listener to every page

**File:** `src/utils/dom/location.ts:35-38`

`onHrefChange` attaches event listeners for `["hashchange", "popstate", "beforeunload", "click"]` globally. The `click` listener fires `isUrlChanged(document.location.href, callback)` on **every single click** across all HTTP/S pages (since shutaf and anti-scam run on `http://*/*`). The URL comparison itself is cheap, but on interactive pages (e.g., Amazon search) with rapid clicks this adds up — and the broad `MutationObserver` on `document.body` with `subtree: true` duplicates the work.

**Fix:** Remove `click` from `EFFECTED_EVENTS`. SPA navigations are captured by `hashchange` and `popstate`; hard navigations fire `beforeunload` + page reload. The `click` listener is redundant.

---

### P1-B — `useContentModifiedObserver` observes the entire DOM with `attributes: true`

**File:** `src/e-commerce/client/hooks/useContentModifiedObserver.ts:6-10`

The default config includes `attributes: true` in addition to `childList + subtree`. Attribute mutations are extremely frequent on modern e-commerce pages (hover states, lazy-load attribute changes, ad rotations). While the callback is throttled at 4 s, the observer callback itself still fires on every single attribute change across the entire document body, allocating `MutationRecord` objects per mutation before the throttle discards them.

**Fix:** Remove `attributes: true` from the default observer options. Content modifications relevant to product detection are structural (new list items added to the DOM), not attribute-level.

---

## Implementation Tasks (in order)

### Task 1 — Fix `onDocumentInactivity` memory leak (P0-A)

**File:** `src/utils/browser/browser.ts`

Replace the observer-per-call pattern with a simple debounce using `setTimeout`/`clearTimeout`. No MutationObserver is needed for inactivity detection — the caller already decides when to invoke it.

```ts
// Before: creates a new MutationObserver on every call
export const onDocumentInactivity = (callback, inactivityTimeMs = 500) => {
  if (inactivityTimeMs === 0) { callback(); return; }
  let timeout;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, inactivityTimeMs);
  });
  observer.observe(document, { childList: true, subtree: true, characterData: true });
};

// After: single debounce, no observer
let _inactivityTimeout: ReturnType<typeof setTimeout> | null = null;

export const onDocumentInactivity = (callback: () => void, inactivityTimeMs = 500) => {
  if (inactivityTimeMs === 0) { callback(); return; }
  if (_inactivityTimeout) clearTimeout(_inactivityTimeout);
  _inactivityTimeout = setTimeout(() => {
    _inactivityTimeout = null;
    callback();
  }, inactivityTimeMs);
};
```

---

### Task 2 — Replace DOM serialization with structured extraction (P0-B)

**Primary focus:** `src/e-commerce/client/processing/queHandler.ts`

The background worker uses the serialized DOM to call `SiteMetadata.getDom(data)` which returns a `ParsedHtml` object queried via CSS selectors inside `RuleManager`. Extract those selectors **in the content script** using the live DOM (no serialization needed), and pass the resulting data structure instead.

Steps:
1. Audit which CSS selectors and DOM queries are executed by `RuleManager` / `SiteFactory` on the background side.
2. Create a `extractProductFields(product: IProduct, site: Site): Record<string, string>` function that runs those queries against the live `document` in the content script.
3. Change `IBackgroundListenerMessage.document` from `string` (full HTML) to the extracted fields object.
4. Update `processProduct` in `src/e-commerce/worker/worker.ts` to consume the pre-extracted fields instead of calling `SiteMetadata.getDom`.
5. Repeat for the secondary call sites (Reviews, DealsCoupons, Supplier, AliExpress analyzer) — each passes `getDomOuterHTML` for different extraction purposes; evaluate whether the same pattern applies or whether those can extract inline.

---

### Task 3 — Make the processing interval event-driven (P0-C)

**Files:** `src/e-commerce/client/events/eventRegistration.ts`, `src/e-commerce/client/processing/que.ts`

1. Export a `notifyQueueUpdated()` callback hook from `ClientProcessingQue` (or use an event emitter pattern).
2. Call `startProcessingInterval()` from `addProductToQue` when the queue transitions from empty → non-empty.
3. Call `stopProcessingInterval()` from `progressingDone` when `isAllDone()` becomes true.
4. In `ClientProcessingQue`, replace `[...this.inProgressing.keys()].length` with a private `_inProgressCount: number` counter incremented/decremented in `getNextProductFromQue` / `progressingDone`.

---

### Task 4 — Remove `click` from `onHrefChange` listeners (P1-A)

**File:** `src/utils/dom/location.ts:35`

```ts
// Before
const EFFECTED_EVENTS = ["hashchange", "popstate", "beforeunload", "click"];

// After
const EFFECTED_EVENTS = ["hashchange", "popstate", "beforeunload"];
```

Verify that SPA navigation on Amazon, eBay, and AliExpress is still detected after this change (these sites use `history.pushState` which fires `popstate`).

---

### Task 5 — Remove `attributes: true` from default MutationObserver config (P1-B)

**File:** `src/e-commerce/client/hooks/useContentModifiedObserver.ts:6-10`

```ts
// Before
options = { childList: true, subtree: true, attributes: true }

// After
options = { childList: true, subtree: true }
```

Verify no call site relies on attribute observation for product detection.

---

## Code Style

- TypeScript strict mode; no `any` in changed code paths.
- Do not add comments unless the logic is non-obvious.
- Do not add error handling for paths that cannot fail.
- No new dependencies.
- Keep changes minimal and scoped to the described files — do not refactor surrounding code.

## Testing Strategy

- After Task 1: Load an Amazon search page, wait 60 seconds, open DevTools → Memory → take a heap snapshot. The number of `MutationObserver` instances should be 0 (garbage collected) or 1 (the single shared content-modified observer), not growing with time.
- After Task 2: Load an Amazon product page and verify the deal widget appears with correct data. Check the Pegasus message payload in the service worker network tab — it should not contain an `document` HTML string.
- After Task 3: Load an Amazon search page, let all products process, then verify the interval is not firing (no 200 ms wakeups visible in the Performance profiler timeline).
- After Task 4: Navigate within Amazon search (click a product, press Back) and verify the URL-change handler fires correctly.
- After Task 5: Load an Amazon product listing page and verify the deal widget appears after DOM changes (lazy-loaded products).

## Boundaries

- **Never touch:** Human-delay jitter in `BaseProductDownloader` — it exists to avoid bot detection.
- **Never touch:** `ConcurrencyManager` per-domain limits — they exist to avoid rate limiting.
- **Never touch:** Auth flow, Supabase session handling.
- **Never touch:** Webpack / build config (out of scope per user).
- **Ask first before touching:** Pegasus message bus structure — changes affect all contexts simultaneously.
- **Ask first before touching:** Zustand store sync protocol — `__ZUSTAND_SYNC__` mechanism is shared infrastructure.
