const alibabaProductMock = {
  productId: "1601044225299",
  storeId: "245427093",
  responseJson: {
    analysis: {
      paymentMethods: {
        title: "Payment Methods",
        value: 9,
        reason:
          "Multiple secure payment methods available such as Alibaba Trade Assurance and credit card. This provides buyers with options to choose the most secure payment method."
      },
      paymentSafety: {
        title: "Payment Safety",
        value: 8,
        reason:
          "Alibaba offers payment protection through systems like Alibaba Trade Assurance, which safeguards buyers' funds until they confirm receipt of the order. This adds a layer of security to the payment process."
      },
      reviewsFeedback: {
        title: "Reviews and Feedback",
        value: 7,
        reason:
          "Positive reviews and feedback from previous buyers indicate a level of trustworthiness. However, some reviews may be biased or fake, so it's essential to analyze them critically."
      },
      certification: {
        title: "Certification",
        value: 6,
        reason:
          "Certifications such as 'Gold Supplier' on Alibaba can provide some assurance of the seller's credibility. However, it's important to verify the legitimacy of these certifications."
      }
    },
    details: {
      paymentMethods: {
        pros: ["Multiple secure payment options available", "Alibaba Trade Assurance for payment protection"],
        cons: ["Some payment methods may not be available in all regions"]
      },
      paymentSafety: {
        pros: ["Alibaba Trade Assurance protects buyer's funds", "Secure payment gateways"],
        cons: ["Potential delays in fund release after order confirmation"]
      },
      reviewsFeedback: {
        pros: ["Insight into previous buyers' experiences", "Helps in evaluating seller's reputation"],
        cons: ["Possibility of fake or biased reviews"]
      },
      certification: {
        pros: ["Adds credibility to the seller's profile", "Indicates a certain level of commitment to quality"],
        cons: ["Certifications can be misleading or falsely claimed"]
      }
    },
    summary: {
      title: "Summary",
      value: 7.5,
      reason:
        "Overall, the product seems relatively safe to buy with secure payment methods, positive reviews, and certifications. However, there are some risks associated with payment safety and credibility of reviews."
    },
    conclusion: "RECOMMENDED"
  }
};

const convertedAlibabaProductMock = [
  {
    id: "1005006416626250",
    data: {
      product: {
        id: "1005006416626250",
        domain: "www.aliexpress.com",
        url: "https://www.aliexpress.com/item/1005006416626250.html?spm=a2g0o.productlist.main.3.2a744deeFmInMe&algo_pvid=84e9dccb-1a92-4f4b-9fa6-03c496f1428d&aem_p4p_detail=20240411194808599155191651780000997108&algo_exp_id=84e9dccb-1a92-4f4b-9fa6-03c496f1428d-1&pdp_npi=4%40dis%21USD%2152.63%2140.56%21%21%21379.69%21292.62%21%40211b600917128900879182011e7875%2112000037088453645%21sea%21IL%21136166329%21&curPageLogUid=SR2OFKsSi59e&utparam-url=scene%3Asearch%7Cquery_from%3A&search_p4p_id=20240411194808599155191651780000997108_2",
        ...alibabaProductMock.responseJson
      },
      productConclusion: "RECOMMENDED"
    }
  }
];

function convertedAlibabaProduct(aiProduct: any, urlObj: any, storeFeedbackUrl: string) {
  return [
    {
      id: aiProduct.productId,
      data: {
        product: {
          id: aiProduct.productId,
          domain: urlObj.domainURL,
          url: urlObj.url,
          storeFeedbackUrl,
          ...aiProduct.responseJson
        },
        productConclusion: aiProduct.responseJson?.conclusion
      }
    }
  ];
}

export { alibabaProductMock, convertedAlibabaProductMock, convertedAlibabaProduct };
