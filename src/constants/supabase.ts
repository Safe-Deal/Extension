import { API_URL, EXTENSION_AUTH_PATH, LISTS_URL } from "./api-params";

export const SUPABASE = Object.freeze({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  EXTENSION_AUTH_PATH,
  EXTENSION_API_PATH: API_URL,
  LISTS_PAGE_PATH: LISTS_URL
});

export enum SupabaseAuthEvents {
  INITIAL_SESSION = "INITIAL_SESSION",
  SIGNED_IN = "SIGNED_IN",
  SIGNED_OUT = "SIGNED_OUT",
  PASSWORD_RECOVERY = "PASSWORD_RECOVERY",
  TOKEN_REFRESHED = "TOKEN_REFRESHED",
  USER_UPDATED = "USER_UPDATED"
}

export enum AuthMessagesEvents {
  AUTH_SESSION = "AUTH_SESSION",
  LOGIN_WINDOW = "LOGIN_WINDOW",
  LOGOUT = "LOGOUT",
  GET_SESSION = "GET_SESSION",
  SESSION_CHANGED = "SESSION_CHANGED"
}

export enum SubscriptionStatus {
  Active = "active",
  PastDue = "past_due",
  Canceled = "canceled",
  Canceling = "canceling",
  Paused = "paused",
  Trialing = "trialing",
  Deleted = "deleted",
  Unknown = "unknown"
}
