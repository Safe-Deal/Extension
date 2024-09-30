const alibabaMockProductsOld = [
  {
    id: "1005006416626250",
    data: {
      product: {
        id: "1005006416626250",
        domain: "www.aliexpress.com",
        url: "https://www.aliexpress.com/item/1005006416626250.html?spm=a2g0o.productlist.main.3.2a744deeFmInMe&algo_pvid=84e9dccb-1a92-4f4b-9fa6-03c496f1428d&aem_p4p_detail=20240411194808599155191651780000997108&algo_exp_id=84e9dccb-1a92-4f4b-9fa6-03c496f1428d-1&pdp_npi=4%40dis%21USD%2152.63%2140.56%21%21%21379.69%21292.62%21%40211b600917128900879182011e7875%2112000037088453645%21sea%21IL%21136166329%21&curPageLogUid=SR2OFKsSi59e&utparam-url=scene%3Asearch%7Cquery_from%3A&search_p4p_id=20240411194808599155191651780000997108_2"
      },
      rules: [
        {
          name: "AliExpress Rating Item Details",
          value: 10,
          weight: 10,
          isValidRule: true,
          tooltipSummary: {
            description: "Reviews are extremely positive. Stars: 4.7, Orders: 1k",
            type: "SAFE",
            ruleExplanation:
              "The conclusion is based on: \n    1) To derive an overall view of product recommendations, we applied various statistical analysis and artificial intelligence techniques. \n    2) Reviews and ratings were analyzed, and we consider a rating of 4 and above to be an indication of a great product. \n    3) A meaningful result requires at least 100 orders, so the more orders we analyze, the more we trust the product rating conclusion more.",
            i18nExplanation: "explanations_review_and_ratings",
            i18n: "tooltip_product_feedback_safe_orders_only",
            i18nData: {
              ProductRatingValue: "4.7",
              ProductReviewAmount: "222",
              ProductOrdersAmount: "1k"
            }
          }
        },
        {
          name: "AliExpress Top Seller Item Details",
          value: 0,
          weight: 0,
          bonus: {
            isBonusRule: true,
            value: 10
          },
          isValidRule: true,
          tooltipSummary: {
            description: "A reliable seller",
            type: "SAFE",
            ruleExplanation: "AliExpress classifies the seller as a very reliable seller, with a high volume of sales",
            i18nExplanation: "explanations_top_seller_ali_express",
            i18n: "tooltip_top_seller_safe"
          }
        },
        {
          name: "AliExpress Shop Open Year Item Details",
          value: 0,
          weight: 0,
          bonus: {
            isBonusRule: true,
            value: -20
          },
          isValidRule: true,
          tooltipSummary: {
            description: "Beginner seller, in business   1 year ",
            type: "UNSAFE",
            ruleExplanation:
              "Our system measures store credibility using the store's age, since stores with more experience and positive reputations are more credible.",
            i18nExplanation: "explanations_store_age",
            i18n: "tooltip_shop_open_year_un_safe",
            i18nData: {
              yearsInBusinessIndicator: {
                i18n: "year_label"
              },
              shopOpenedYearValue: ""
            }
          }
        },
        {
          bonus: {
            isBonusRule: true,
            value: 0
          },
          name: "Pricing Item Details",
          value: 5,
          weight: 0,
          isValidRule: true,
          tooltipSummary: {
            description: "The price is excellent, 31% lower compared to the average",
            type: "SAFE",
            i18n: "tooltip_product_pricing_type_excellent",
            i18nData: {
              priceDifVsAverage: "31"
            },
            ruleExplanation:
              "A product's price history graph - This can help you spot real discounts from fake ones. We keep a record of the price and then monitor changes on a daily basis, making it possible to take advantage of sales and limited-time offers.",
            i18nExplanation: "explanations_price_history"
          },
          dataset: {
            currency: "USD",
            productID: "1005006416626250",
            minPrice: "40.87",
            maxPrice: "47.68",
            averagePrice: 49.92,
            price: [
              {
                date: "2024-01-13",
                price: 45.86
              },
              {
                date: "2024-02-03",
                price: 60.8
              },
              {
                date: "2024-02-12",
                price: 45.64
              },
              {
                date: "2024-02-15",
                price: 57.13
              },
              {
                date: "2024-02-16",
                price: 45.61
              },
              {
                date: "2024-02-17",
                price: 57.66
              },
              {
                date: "2024-02-21",
                price: 59.77
              },
              {
                date: "2024-02-28",
                price: 58.89
              },
              {
                date: "2024-04-12",
                price: 44.27
              },
              {
                date: "2024-01-13",
                price: 45.86
              },
              {
                date: "2024-01-18",
                price: 47.39
              },
              {
                date: "2024-01-23",
                price: 45.47
              },
              {
                date: "2024-01-26",
                price: 45.54
              },
              {
                date: "2024-01-29",
                price: 55.52
              },
              {
                date: "2024-02-03",
                price: 60.8
              },
              {
                date: "2024-02-04",
                price: 59.75
              },
              {
                date: "2024-02-05",
                price: 60.62
              },
              {
                date: "2024-02-08",
                price: 57.3
              },
              {
                date: "2024-02-09",
                price: 55.34
              },
              {
                date: "2024-02-10",
                price: 56.74
              },
              {
                date: "2024-02-12",
                price: 45.64
              },
              {
                date: "2024-02-15",
                price: 57.13
              },
              {
                date: "2024-02-16",
                price: 45.61
              },
              {
                date: "2024-02-17",
                price: 57.66
              },
              {
                date: "2024-02-21",
                price: 59.77
              },
              {
                date: "2024-02-23",
                price: 48.39
              },
              {
                date: "2024-02-24",
                price: 48.39
              },
              {
                date: "2024-02-25",
                price: 48.39
              },
              {
                date: "2024-02-28",
                price: 58.89
              },
              {
                date: "2024-02-29",
                price: 58.92
              },
              {
                date: "2024-03-01",
                price: 49.41
              },
              {
                date: "2024-03-02",
                price: 58.69
              },
              {
                date: "2024-03-03",
                price: 58.62
              },
              {
                date: "2024-03-04",
                price: 58.64
              },
              {
                date: "2024-03-05",
                price: 49.42
              },
              {
                date: "2024-03-08",
                price: 60.14
              },
              {
                date: "2024-03-11",
                price: 60.25
              },
              {
                date: "2024-03-12",
                price: 61.16
              },
              {
                date: "2024-03-15",
                price: 51.59
              },
              {
                date: "2024-03-17",
                price: 49.56
              },
              {
                date: "2024-03-18",
                price: 45.91
              },
              {
                date: "2024-03-19",
                price: 45.9
              },
              {
                date: "2024-03-20",
                price: 45.71
              },
              {
                date: "2024-03-21",
                price: 41.23
              },
              {
                date: "2024-03-22",
                price: 40.8
              },
              {
                date: "2024-03-24",
                price: 40.78
              },
              {
                date: "2024-03-25",
                price: 40.78
              },
              {
                date: "2024-03-26",
                price: 40.77
              },
              {
                date: "2024-03-27",
                price: 40.72
              },
              {
                date: "2024-03-28",
                price: 40.91
              },
              {
                date: "2024-03-31",
                price: 49.17
              },
              {
                date: "2024-04-01",
                price: 43.37
              },
              {
                date: "2024-04-02",
                price: 43.55
              },
              {
                date: "2024-04-03",
                price: 43.68
              },
              {
                date: "2024-04-04",
                price: 43.95
              },
              {
                date: "2024-04-05",
                price: 44.23
              },
              {
                date: "2024-04-07",
                price: 44.23
              },
              {
                date: "2024-04-08",
                price: 44.28
              },
              {
                date: "2024-04-09",
                price: 44.53
              },
              {
                date: "2024-04-10",
                price: 44.58
              },
              {
                date: "2024-04-11",
                price: 44.5
              },
              {
                date: "2024-04-12",
                price: 44.27
              },
              {
                date: "2024-04-12",
                price: 34.54
              }
            ],
            product: {
              warehouse: null,
              site: {
                id: "aliexpress",
                name: "AliExpress",
                imageUrl: "https://alitools-static.ams3.digitaloceanspaces.com/alitools/mobile/aliexpress.png",
                appId: null,
                brandColor: "#d54123"
              },
              brand: {},
              siteRegion: null,
              mobilePrice: null,
              currency: "USD",
              currencySign: "$",
              isPriceMinimal: true,
              priceDynamics: -14.17,
              timePriceChanged: "2024-04-12",
              timeDynamicsChanged: "2024-02-28",
              favoritesCount: 2,
              favoritesTarget: 50,
              isDiscount: true,
              ordersCount: 1000,
              videos: []
            }
          }
        },
        {
          name: "AliExpress Store Positive Feedback Item Details",
          value: 6,
          weight: 10,
          isValidRule: true,
          tooltipSummary: {
            description: "The majority of the store's customers are satisfied, 94.60%",
            type: "SAFE",
            ruleExplanation:
              "We check the overall store feedback score, the higher the score, the better the chances of getting a good service. Over 91% feedback is considered positive feedback.",
            i18nExplanation: "explanations_store_rating",
            i18n: "tooltip_seller_feedback_safe",
            i18nData: {
              percentOfPeople: 94.6
            }
          }
        }
      ],
      productConclusion: "RECOMMENDED"
    }
  }
];

export { alibabaMockProductsOld };
