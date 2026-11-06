import { AuthMessagesEvents } from "@constants/supabase";
import { isTrustedAuthMessage } from "../auth-message";

const TRUSTED_ORIGIN = "https://www.joinsafedeal.com";

const sessionMessage = {
  type: AuthMessagesEvents.AUTH_SESSION,
  payload: { session: { access_token: "ACCESS", user: { user_metadata: { subscription_status: "active" } } } }
};

const messageEvent = ({
  data = sessionMessage as unknown,
  origin = TRUSTED_ORIGIN,
  source = window as MessageEventSource | null
} = {}) => new MessageEvent("message", { data, origin, source });

describe("isTrustedAuthMessage", () => {
  it("accepts the session posted by the joinsafedeal page itself", () => {
    expect(isTrustedAuthMessage(messageEvent(), TRUSTED_ORIGIN)).toBe(true);
  });

  it("rejects a session posted from a localhost page", () => {
    expect(isTrustedAuthMessage(messageEvent({ origin: "http://localhost:3000" }), TRUSTED_ORIGIN)).toBe(false);
  });

  it("rejects a session posted from another origin", () => {
    expect(isTrustedAuthMessage(messageEvent({ origin: "https://attacker.test" }), TRUSTED_ORIGIN)).toBe(false);
  });

  it("rejects a session whose source is not the page window", () => {
    const frame = document.createElement("iframe");
    document.body.appendChild(frame);
    expect(isTrustedAuthMessage(messageEvent({ source: frame.contentWindow }), TRUSTED_ORIGIN)).toBe(false);
    expect(isTrustedAuthMessage(messageEvent({ source: null }), TRUSTED_ORIGIN)).toBe(false);
    frame.remove();
  });

  it("rejects a message of another type", () => {
    const data = { ...sessionMessage, type: AuthMessagesEvents.LOGOUT };
    expect(isTrustedAuthMessage(messageEvent({ data }), TRUSTED_ORIGIN)).toBe(false);
  });

  it("rejects an AUTH_SESSION message without a session", () => {
    expect(
      isTrustedAuthMessage(
        messageEvent({ data: { type: AuthMessagesEvents.AUTH_SESSION, payload: {} } }),
        TRUSTED_ORIGIN
      )
    ).toBe(false);
    expect(
      isTrustedAuthMessage(messageEvent({ data: { type: AuthMessagesEvents.AUTH_SESSION } }), TRUSTED_ORIGIN)
    ).toBe(false);
    expect(isTrustedAuthMessage(messageEvent({ data: null }), TRUSTED_ORIGIN)).toBe(false);
  });
});
