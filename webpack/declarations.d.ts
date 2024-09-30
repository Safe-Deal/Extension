declare module "*.svg" {
  const content: any;
  export default content;
}

declare const IS_DEBUGGER_ON: boolean;

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}
