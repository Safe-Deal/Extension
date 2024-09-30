import React, { useCallback, useEffect, useMemo } from "react";
import { t } from "../../../../../../constants/messages";
import { logError } from "../../../../../../utils/analytics/logger";
import { browserWindow } from "../../../../../../utils/dom/html";
import { REVIEW_SUMMARY_GLUE } from "../../../../../../utils/extension/glue";
import { SiteMetadata } from "../../../../../../utils/site/site-information";
import { ProductStore } from "../../../../../engine/logic/conclusion/conclusion-product-entity.interface";
import { createReviewsSummary } from "../../../../../reviews/reviews-utils";
import { LoaderSpinner } from "../../../shared/Loader";
import { ReviewsDetails } from "./ReviewsDetails";
import { ReviewsImages } from "./ReviewsImages";
import { ReviewsImagesBigGallery } from "./ReviewsImagesBigGallery";

interface IReviewsProps {
  productId: string;
  store: ProductStore;
  isGalleryOnly?: boolean;
}

export const Reviews = ({ productId, store, isGalleryOnly = false }: IReviewsProps) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isRequested, setIsRequested] = React.useState(false);
  const [reviews, setReviews] = React.useState([]);
  const [gallery, setGallery] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [totalReviews, setTotalReviews] = React.useState<string | null>(null);
  const [rating, setRating] = React.useState<string | null>(null);

  const handleReviewsSummary = useCallback((result) => {
    setIsLoaded(true);

    if (result?.error) {
      logError(new Error(result?.error), "Reviews Summarization Error");
      setError(result.error);
    }

    const reviewsSummary = createReviewsSummary(result.reviewsSummary);
    setGallery(result.reviewsImages);
    setReviews(reviewsSummary);
    setTotalReviews(result.totalReviews);
    setRating(result.rating);
  }, []);

  const requestReviewsSummary = useCallback(() => {
    if (isRequested) {
      return;
    }
    REVIEW_SUMMARY_GLUE.send({
      productId,
      document: SiteMetadata.getDomOuterHTML(browserWindow().document),
      siteUrl: SiteMetadata.getURL(),
      store
    });
    setIsRequested(true);
  }, [isRequested, productId, store]);

  useEffect(() => {
    REVIEW_SUMMARY_GLUE.client(handleReviewsSummary);
    requestReviewsSummary();
  }, [handleReviewsSummary, requestReviewsSummary]);

  const memoizedReviews = useMemo(
    () =>
      reviews?.map((review, reviewIndex) => (
        <li className="sd-review-summary__list__section" key={reviewIndex}>
          <h3 className="sd-review-summary__list__section__title">{review.header}</h3>
          <ul className="sd-review-summary__list__section__reasons">
            {review.items.map((item, itemIndex) => (
              <li key={itemIndex} className="sd-review-summary__list__section__reasons__item">
                <span
                  className={`sd-review-summary__list__section__reasons__item__bullet sd-review-summary__list__section__reasons__item__bullet--${item.className}`}
                />
                <span className="sd-review-summary__list__section__reasons__item__text">{item.text}</span>
              </li>
            ))}
          </ul>
        </li>
      )),
    [reviews]
  );

  if (!isLoaded) {
    return <LoaderSpinner />;
  }

  if (error) {
    return (
      <li className="sd-review-summary__list__section" style={{ height: "100%" }}>
        <h3 className="sd-review-summary__list__section__title">&nbsp;</h3>
        <ul className="sd-review-summary__list__section__reasons">
          <li className="sd-review-summary__error">{t("reviews_error")}</li>
        </ul>
      </li>
    );
  }
  if (isGalleryOnly) {
    return <ReviewsImagesBigGallery gallery={gallery} />;
  }

  return (
    <div className="sd-review-summary">
      <ReviewsDetails totalReviews={totalReviews} rating={rating} />
      <ReviewsImages gallery={gallery} />
      <ul className="sd-review-summary__list">{memoizedReviews}</ul>
    </div>
  );
};
