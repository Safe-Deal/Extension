import React from "react";
import { t } from "../../../../../../constants/messages";
import { STAR_ICON } from "../../../../../../constants/visual";

interface ReviewsDetailsProps {
  totalReviews: string | null;
  rating: string | null;
  isSupplier?: boolean;
}

export const ReviewsDetails: React.FC<ReviewsDetailsProps> = ({ totalReviews, rating, isSupplier = false }) => {
  const averageRating = rating ? parseFloat(rating).toFixed(2) : "0";

  return (
    <>
      {isSupplier && <h2 className="sd-review-summary__details__title">{t("store_reviews_title")}</h2>}
      <div className="sd-review-summary__details">
        <img className="sd-review-summary__details__star" src={STAR_ICON} alt="star" />
        <div className="sd-review-summary__details__rating">
          <span>{averageRating}</span>
          /5
        </div>
        <div className="sd-review-summary__details__reviews">{`(${totalReviews || "0"}) ${t("reviews")}`}</div>
      </div>
    </>
  );
};
