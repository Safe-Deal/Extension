import { t } from "../../constants/messages";

export const SECTION_TYPES = {
  PROS: "Pros",
  CONS: "Cons",
  GOOD_TO_KNOW: "Good To Know"
};

const MAX_AMOUNT_DISPLAYED = 100;

const organizeReviewData = (reviewData) => {
  const pros = [];
  const cons = [];
  const others = [];

  for (const section of reviewData) {
    if (section?.reviews?.length === 0) {
      continue;
    }

    const sectionType = section?.section;
    let icon = "";
    let label = "";

    switch (sectionType) {
      case SECTION_TYPES.PROS:
        icon = " 👍 ";
        label = t("reviews_pros");
        break;
      case SECTION_TYPES.CONS:
        icon = " 👎 ";
        label = t("reviews_cons");
        break;
      case SECTION_TYPES.GOOD_TO_KNOW:
        icon = " ⓘ ";
        label = t("reviews_good_to_know");
        break;
      default:
        icon = "";
        label = "";
        break;
    }

    const header = `${icon} ${label}`;
    const items = section.reviews.slice(0, MAX_AMOUNT_DISPLAYED).map((review) => {
      switch (sectionType) {
        case SECTION_TYPES.PROS:
          return { text: `${review}`, className: "sd-reason-good" };
        case SECTION_TYPES.CONS:
          return { text: `${review}`, className: "sd-reason-bad" };
        case SECTION_TYPES.GOOD_TO_KNOW:
          return { text: `${review}`, className: "sd-reason-neutral" };
        default:
          return { text: `${review}`, className: "sd-reason-neutral" };
      }
    });

    const reviewSection = { header, items, section: section.section };

    if (section.section === SECTION_TYPES.PROS) {
      pros.push(reviewSection);
    } else if (section.section === SECTION_TYPES.CONS) {
      cons.push(reviewSection);
    } else {
      others.push(reviewSection);
    }
  }

  return [...cons, ...pros, ...others];
};

const getReviewsFeedbackText = (reviews: any[]) =>
  reviews
    .map((item) => item?.buyerTranslationFeedback || item?.buyerProductFeedBack)
    .filter((item) => item != null && item != "");

const getReviewImagesUrls = (reviews: any) =>
  reviews
    .filter((item) => item?.images && item?.images?.length)
    .map((item) => item?.images)
    .flat();

const createReviewsSummary = (reviewData: any[]): any[] => {
  if (!reviewData || reviewData.length === 0) {
    return [
      {
        header: t("reviews_no_reviews_header"),
        items: [
          { text: t("reviews_no_reviews_text"), className: "sd-reason-neutral" },
          { text: t("reviews_no_logged_in"), className: "sd-reason-bad" }
        ]
      }
    ];
  }

  const reviews = organizeReviewData(reviewData);

  return reviews;
};

export { createReviewsSummary, getReviewImagesUrls, getReviewsFeedbackText };
