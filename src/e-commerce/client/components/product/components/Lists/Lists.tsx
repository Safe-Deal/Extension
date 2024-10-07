import React, { useMemo } from "react";
import { ResponsiveIframe } from "../../../shared/ResponsiveIframe";
import "./Lists.scss";
import { SUPABASE } from "@constants/supabase";
import { useAuthStore } from "@store/AuthState";

export interface Product {
  product_id: string;
  product_name: string;
  product_url: string;
}

interface IListProps {
  action: string | null;
  product: any | null;
}

export const Lists = ({ action, product }: IListProps) => {
  const { session, loading } = useAuthStore((state) => ({ session: state.session, loading: state.loading }));
  const { id: product_id, url: product_url, domain: product_name } = product?.product;
  const productData: Product = {
    product_id,
    product_name,
    product_url
  };
  const url = useMemo(() => {
    if (!session || loading) return;
    const baseUrl = new URL(SUPABASE.LISTS_PAGE_PATH);
    baseUrl.searchParams.set("mode", "ext");
    baseUrl.searchParams.set("product", JSON.stringify(productData));
    baseUrl.searchParams.set("action", action);
    baseUrl.searchParams.set("session", JSON.stringify(session));

    return baseUrl;
  }, [session, loading]);

  return (
    <div className="sd-product-lists">
      <ResponsiveIframe src={url} onLoad={() => {}} />
    </div>
  );
};
