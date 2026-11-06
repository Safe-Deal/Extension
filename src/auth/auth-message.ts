import { Session } from "@supabase/supabase-js";
import { AuthMessagesEvents } from "@constants/supabase";

export interface AuthSessionMessage {
  type: AuthMessagesEvents.AUTH_SESSION;
  payload: { session: Session };
}

const isAuthSessionMessage = (data: unknown): data is AuthSessionMessage =>
  typeof data === "object" &&
  data !== null &&
  (data as { type?: unknown }).type === AuthMessagesEvents.AUTH_SESSION &&
  Boolean((data as { payload?: { session?: unknown } }).payload?.session);

export const isTrustedAuthMessage = (
  event: MessageEvent<unknown>,
  trustedOrigin: string
): event is MessageEvent<AuthSessionMessage> =>
  event.source === window && event.origin === trustedOrigin && isAuthSessionMessage(event.data);
