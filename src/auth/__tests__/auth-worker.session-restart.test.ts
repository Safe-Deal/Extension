/**
 * Reproduces "signed-in users get asked to sign in again".
 *
 * The MV3 service worker is killed after ~30s idle and restarted on the next event.
 * Each restart re-runs initAuthWorker() with a fresh in-memory Supabase client, seeded
 * from the persisted auth store (IndexedDB in production, `mockDisk` here).
 *
 * A fake Supabase Auth server implements refresh-token rotation the way Supabase documents it:
 *  - refreshing the active token issues a new one (rotation)
 *  - reusing the parent of the active token is tolerated (returns the active token)
 *  - reusing anything older revokes the whole session ("Invalid Refresh Token: Already Used")
 */

const mockDisk: { state: any } = { state: undefined };

jest.mock("@utils/analytics/logger", () => ({ debug: jest.fn(), logError: jest.fn(), initLog: jest.fn() }));
jest.mock("@utils/extension/ext", () => ({ ext: { windows: { create: jest.fn(), remove: jest.fn() } } }));
jest.mock("@store/AuthState", () => {
  const actual = jest.requireActual("@store/AuthState");
  return {
    ...actual,
    // Stand-in for the Pegasus IndexedDB-backed store: hydrate from "disk", write every change back.
    initAuthStoreBackend: async () => {
      if (mockDisk.state) actual.useAuthStore.setState(mockDisk.state);
      actual.useAuthStore.subscribe((s: any) => {
        mockDisk.state = JSON.parse(JSON.stringify(s));
      });
      return actual.useAuthStore;
    }
  };
});

process.env.SUPABASE_URL = "https://fake-project.supabase.co";
process.env.SUPABASE_ANON_KEY = "anon-key";

const HOUR_MS = 60 * 60 * 1000;
const realNow = Date.now.bind(Date);
let clockOffset = 0;
const nowSec = () => Math.floor(Date.now() / 1000);

const USER = { id: "user-1", aud: "authenticated", email: "free@user.test", user_metadata: {}, app_metadata: {} };

const b64url = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const makeJwt = (family: number) =>
  `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ sub: USER.id, exp: nowSec() + 3600, fam: family, n: Math.random() })}.sig`;

type Family = { chain: string[]; revoked: boolean; access: Set<string> };
let families: Family[] = [];
let tokenSeq = 0;

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const issue = (famId: number, refresh: string) => {
  const access_token = makeJwt(famId);
  families[famId].access.add(access_token);
  return {
    access_token,
    refresh_token: refresh,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: nowSec() + 3600,
    user: USER
  };
};

/** Fake Supabase Auth server: rotation + parent tolerance + reuse detection. */
const serverRefresh = (rt: string): { status: number; body: any } => {
  const famId = families.findIndex((f) => f.chain.includes(rt));
  if (famId < 0)
    return {
      status: 400,
      body: { error_code: "refresh_token_not_found", msg: "Invalid Refresh Token: Refresh Token Not Found" }
    };
  const fam = families[famId];
  if (fam.revoked) return { status: 400, body: { error_code: "session_not_found", msg: "Session not found" } };
  const idx = fam.chain.indexOf(rt);
  const last = fam.chain.length - 1;
  if (idx === last) {
    const next = `R${++tokenSeq}`;
    fam.chain.push(next);
    return { status: 200, body: issue(famId, next) };
  }
  if (idx === last - 1) return { status: 200, body: issue(famId, fam.chain[last]) };
  fam.revoked = true; // reuse outside the tolerated window: whole session revoked
  return {
    status: 400,
    body: { error_code: "refresh_token_already_used", msg: "Invalid Refresh Token: Already Used" }
  };
};

const serverUser = (bearer: string) => {
  const fam = families.find((f) => f.access.has(bearer));
  let exp = 0;
  try {
    exp = JSON.parse(Buffer.from(bearer.split(".")[1], "base64url").toString()).exp;
  } catch {
    /* not a jwt */
  }
  return fam && !fam.revoked && exp > nowSec()
    ? json(200, USER)
    : json(401, { error_code: "bad_jwt", msg: "invalid JWT" });
};

const fakeFetch = async (input: any, init: any = {}) => {
  const url = String(typeof input === "string" ? input : input.url);
  const headers = new Headers(init.headers);
  if (url.includes("/auth/v1/token") && url.includes("grant_type=refresh_token")) {
    const { status, body } = serverRefresh(JSON.parse(init.body).refresh_token);
    return json(status, body);
  }
  if (url.includes("/auth/v1/user")) return serverUser((headers.get("Authorization") || "").replace("Bearer ", ""));
  if (url.includes("/auth/v1/logout")) return new Response(null, { status: 204 });
  throw new Error(`unexpected fetch ${url}`);
};

/** User logs in on joinsafedeal.com; the site hands the SAME session to the extension (AUTH_SESSION). */
const login = () => {
  families.push({ chain: ["R0"], revoked: false, access: new Set() });
  const session = issue(families.length - 1, "R0");
  mockDisk.state = { session, user: USER, isPremium: false };
  return session;
};

/** Simulates a service-worker cold start running the real initAuthWorker(). */
const restartServiceWorker = async () => {
  window.localStorage.clear(); // a service worker has no localStorage: Supabase keeps its session in memory only
  let init: () => Promise<void>;
  let client: any;
  jest.isolateModules(() => {
    /* eslint-disable global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
    init = require("../auth-worker").initAuthWorker;
    client = require("../../utils/supabase").default;
    /* eslint-enable global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  });
  await init!();
  await new Promise((r) => setTimeout(r, 0));
  await client.auth.stopAutoRefresh();
};

/** Another client holding a copy of the same session (e.g. the website) refreshes it. */
const otherClientRefresh = (rt: string) => serverRefresh(rt).body.refresh_token as string;

const storedSession = () => mockDisk.state?.session;
const activeRefreshToken = () => families[0].chain[families[0].chain.length - 1];

describe("auth worker across service-worker restarts", () => {
  let originalFetch: any;
  beforeEach(() => {
    families = [];
    tokenSeq = 0;
    clockOffset = 0;
    mockDisk.state = undefined;
    jest.spyOn(Date, "now").mockImplementation(() => realNow() + clockOffset);
    originalFetch = global.fetch;
    (global as any).fetch = fakeFetch;
  });
  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("persists the rotated refresh token when a restart refreshes an expired session", async () => {
    login();
    clockOffset += 2 * HOUR_MS; // access token (1h TTL) has expired
    await restartServiceWorker(); // refresh R0 -> R1 happens inside initSupabaseSession()

    expect(activeRefreshToken()).toBe("R1");
    expect(storedSession().refresh_token).toBe("R1");
  });

  it("stays signed in when the website also refreshes its copy of the session once", async () => {
    login();
    clockOffset += 2 * HOUR_MS;
    await restartServiceWorker(); // extension: R0 -> R1

    otherClientRefresh("R0"); // website still holds R0 (parent of R1): tolerated, gets R1
    clockOffset += 2 * HOUR_MS;
    otherClientRefresh("R1"); // website rotates R1 -> R2

    await restartServiceWorker(); // extension refreshes with whatever it persisted

    expect(families[0].revoked).toBe(false);
    const res = await fakeFetch("https://fake-project.supabase.co/auth/v1/user", {
      headers: { Authorization: `Bearer ${storedSession().access_token}` }
    });
    expect(res.status).toBe(200);
  });

  it("known limit (not fixable in the extension alone): two rotations elsewhere while the extension is idle still revoke the shared session", async () => {
    login();
    clockOffset += 2 * HOUR_MS;
    await restartServiceWorker(); // extension: R0 -> R1, persisted (with fix)

    otherClientRefresh("R1"); // website: R1 -> R2
    clockOffset += 2 * HOUR_MS;
    otherClientRefresh("R2"); // website: R2 -> R3

    await restartServiceWorker(); // extension presents R1 (grandparent of R3) -> reuse detected

    expect(families[0].revoked).toBe(true);
  });
});
