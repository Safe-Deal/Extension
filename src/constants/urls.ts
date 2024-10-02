export default Object.freeze({
	// Ali Express
	ALI_EXPRESS_CHECKOUT_URL: "order/confirm_order",
	ALI_EXPRESS_WHOLESALE_PATH_URL: "/wholesale|/af/|/popular|/premium|/category|/gcp/",
	ALI_EXPRESS_PRODUCT_PATH_REGEX: [/\/[a-zA-Z0-9_-]+\/\d+\.html/],
	ALI_EXPRESS_STORE_PATH_URL: "/store/",

	// Ebay
	EBAY_PRODUCT_PATH_URL: "/itm|/i/|/p/",
	EBAY_WHOLESALE_PATH_URL: "/sch|/b/",
	EBAY_WHOLESALE_LIST_MODE_QP: "_dmd=1",
	EBAY_WHOLESALE_GALLERY_MODE_QP: "_dmd=2",

	// Amazon
	AMAZON_WHOLESALE_PATH_URL: "/s?k=|/b?k=|/s?i=",
	AMAZON_ITEM_URL_REGEX: "/dp/|/gp/video/detail/|/product/|/product-reviews/",

	// Walmart
	WALMART_WHOLESALE_PATH_URL: "/search/|/browse/",
	WALMART_CATEGORY_WHOLESALE_PATH_URL: "",
	WALMART_PRODUCT_PATH_URL: "/ip/",

	// Alibaba
	ALIBABA_PRODUCT_PATH_URL: "/product-detail/"
})
