import React, { useEffect, useMemo } from "react";
import { t } from "@constants/messages";
import { browserWindow } from "@utils/dom/html";
import { SiteMetadata } from "@utils/site/site-information";
import { useReviewSummaryStore, reviewSummaryStoreReady } from "@store/ReviewSummaryState";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { IReviewSummaryMessageBus, ReviewSummaryMessageType } from "@e-commerce/reviews/reviews-worker";
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
  isSupplier?: boolean;
  storeFeedbackUrl?: string;
}

export const Reviews = ({ productId, store, isGalleryOnly = false, isSupplier, storeFeedbackUrl }: IReviewsProps) => {
  const { reviewData, isLoading, error } = useReviewSummaryStore();
  const { sendMessage } = definePegasusMessageBus<IReviewSummaryMessageBus>();

  const [reviews, setReviews] = React.useState([]);
  const [gallery, setGallery] = React.useState([]);
  const [totalReviews, setTotalReviews] = React.useState<string | null>(null);
  const [rating, setRating] = React.useState<string | null>(null);

  useEffect(() => {
    if (!store || !productId) return;
    const data = {
      productId,
      document: SiteMetadata.getDomOuterHTML(browserWindow().document),
      siteUrl: SiteMetadata.getURL(),
      store,
      ...(isSupplier !== undefined && { isSupplier }),
      ...(storeFeedbackUrl !== undefined && { storeFeedbackUrl })
    };
    reviewSummaryStoreReady().then(() => {
      sendMessage(ReviewSummaryMessageType.GENERATE_REVIEW_SUMMARY, data);
    });
  }, [productId, store]);

  useEffect(() => {
    if (!reviewData) return;
    const reviewsSummary = createReviewsSummary(reviewData?.reviewsSummary || []);
    setGallery(reviewData?.reviewsImages || []);
    setReviews(reviewsSummary || []);
    setTotalReviews(reviewData?.totalReviews?.toString() || null);
    setRating(reviewData?.rating?.toString() || null);
  }, [reviewData]);

  const memoizedReviews = useMemo(
    () =>
      reviews?.map((review, reviewIndex) => (
        <li className="sd-review-summary__list__section" key={reviewIndex}>
          <h3 className="sd-review-summary__list__section__title">{review.header}</h3>
          <ul className="sd-review-summary__list__section__reasons">
            {review?.items?.map((item, itemIndex) => (
              <li key={itemIndex} className="sd-review-summary__list__section__reasons__item">
                <span
                  className={`sd-review-summary__list__section__reasons__item__bullet sd-review-summary__list__section__reasons__item__bullet--${item.className}`}
                />
                <span className="sd-review-summary__list__section__reasons__item__text">{item.text}</span>
              </li>
            ))}
          </ul>
        </li>
      )) || [],
    [reviews]
  );

  if (isLoading) {
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
      <ReviewsDetails totalReviews={totalReviews} rating={rating} isSupplier={isSupplier} />
      <ReviewsImages gallery={gallery} />
      <ul className="sd-review-summary__list">{memoizedReviews}</ul>
    </div>
  );
};
