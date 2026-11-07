export interface IProduct {
  id: string;
  domain: string;
  url: string;
  repaint?: boolean;
  document?: string;
  itemPageDocument?: string;
  regenerate?: boolean;
  locale?: string;
}
