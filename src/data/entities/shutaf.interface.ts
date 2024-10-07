export enum ShutafType {
  API = "[API]",
  JSON = "[DIRECT_FROM_JSON]"
}

export interface IShutaf {
  name: string;
  domain: string;
  target: string;
  targetParam?: string;
  targetParamName?: string;
  shutaf: string;
}

export interface IShutafUrl {
  product: string;
  shutaff: string;
  provider: IShutaf;
}
