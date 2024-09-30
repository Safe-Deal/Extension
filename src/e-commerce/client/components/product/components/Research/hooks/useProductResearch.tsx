import React from "react";
import RedditIcon from "@mui/icons-material/Reddit";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WebIcon from "@mui/icons-material/Web";
import ShoppingIcon from "@mui/icons-material/ShoppingCart";
import ImageIcon from "@mui/icons-material/Image";
import { EmbeddedComponent } from "@e-commerce/client/components/shared/EmbeddedComponent";
import { ProductStore } from "@e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import { t } from "@constants/messages";
import { Reviews } from "../../Reviews/Reviews";

interface IResearchComponents {
  Label: string;
  Link: string;
  Icon: JSX.Element;
  Component: JSX.Element;
}

const Content = ({ productId, searchQuery, store, isSmall }): IResearchComponents[] => [
  {
    Label: t("video_reviews"),
    Link: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${searchQuery} ${isSmall ? "" : t("reviews")}`)}`,
    Icon: <YouTubeIcon sx={{ color: "#FF0000", paddingTop: "2px" }} />,
    Component: (
      <EmbeddedComponent
        iframeUrl={`/research/${store}/${productId}/youtube/${encodeURIComponent(`${searchQuery} ${isSmall ? "" : t("reviews")}`)}`}
        className="sd-product-research__youtube_reviews"
      />
    )
  },
  {
    Label: t("product_photos"),
    Link: null,
    Icon: <ImageIcon sx={{ color: "#F4B400" }} />,
    Component: <Reviews productId={productId} store={store} isGalleryOnly />
  },
  {
    Label: t("web_reviews"),
    Link: `https://www.google.com/search?q=${encodeURIComponent(`${searchQuery} ${isSmall ? "" : t("product_reviews_query")}`)}`,
    Icon: <WebIcon sx={{ color: "#4285F4" }} />,
    Component: (
      <EmbeddedComponent
        iframeUrl={`/research/${store}/${productId}/web/${encodeURIComponent(`${searchQuery} ${isSmall ? "" : t("product_reviews_query")}`)}`}
        className="sd-product-research__google_reviews"
      />
    )
  },
  {
    Label: t("shopping_reviews"),
    Link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${searchQuery} ${isSmall ? "" : t("product_purchase_query")}`)}`,
    Icon: <ShoppingIcon sx={{ color: "#34A853" }} />,
    Component: (
      <EmbeddedComponent
        iframeUrl={`/research/${store}/${productId}/shopping/${encodeURIComponent(`${searchQuery} ${isSmall ? "" : t("product_purchase_query")}`)}`}
        className="sd-product-research__google_shopping"
      />
    )
  },
  {
    Label: t("reddit_reviews"),
    Link: `https://www.reddit.com/search/?q=${encodeURIComponent(searchQuery)}`,
    Icon: <RedditIcon sx={{ color: "#FF4500" }} />,
    Component: (
      <EmbeddedComponent
        iframeUrl={`/research/${store}/${productId}/reddit/${encodeURIComponent(searchQuery)}`}
        className="sd-product-research__reddit_opinions"
      />
    )
  }
];

interface IResearchContentProps {
  productId: string;
  productName: string;
  store: ProductStore;
  isSmall: boolean;
}

export const useProductResearch = ({ productId, productName, store, isSmall }: IResearchContentProps) => {
  const searchQuery = `${productName}`;
  const researchComponents = Content({
    productId,
    searchQuery,
    store,
    isSmall
  });
  return researchComponents;
};
