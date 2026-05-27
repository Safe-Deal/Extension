export enum ShutafMessageType {
  PING = "ping",
  GENERATE_AFFILIATE_LINK = "generateAffiliateLink"
}

export interface IShutafMessageBus {
  [ShutafMessageType.PING]: () => Promise<void>;
  [ShutafMessageType.GENERATE_AFFILIATE_LINK]: (url: string) => Promise<void>;
}
