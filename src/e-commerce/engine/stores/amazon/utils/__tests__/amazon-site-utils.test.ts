import { AmazonSiteUtils } from "../amazon-site-utils"

describe("Amazon Site Utils", () => {
	it("should return true if it amazon url", () => {
		const url = "https://www.amazon.com/"
		expect(AmazonSiteUtils.isAmazonSite(url)).toBeTruthy()
	})

	it("should return false if it is NOT an amazon url", () => {
		const url = "https://www.aliexpress.com/"
		expect(AmazonSiteUtils.isAmazonSite(url)).toBeFalsy()
	})

	it("should return true if it amazon wholesale url", () => {
		const url =
      "https://www.amazon.com/s?k=cooling+fan&crid=1EYZ9QL7HRRPO&sprefix=cool%2Caps%2C390&ref=nb_sb_ss_ts-doa-p_4_4"
		expect(AmazonSiteUtils.isAmazonWholesale(url)).toBeTruthy()
	})

	it("should return false if it NOT an amazon wholesale url", () => {
		const url =
      "https://www.amazon.com/TaoTronics-Tower-Fan-Oscillating-Bladeless/dp/B087ZT7CZP/ref=sr_1_1_sspa?crid=1EYZ9QL7HRRPO&dchild=1&keywords=cooling+fan&qid=1617511933&sprefix=cool%2Caps%2C390&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFVQlZLSE5WR0xTQk8mZW5jcnlwdGVkSWQ9QTA4NzgwOTQxMUdLT0ZUOE5QMzFWJmVuY3J5cHRlZEFkSWQ9QTA5OTI3MTAxSTEyNDlLQU40NlQ5JndpZGdldE5hbWU9c3BfYXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ=="
		expect(AmazonSiteUtils.isAmazonWholesale(url)).toBeFalsy()
	})
})
describe("isAmazonSite", () => {
	it("should return true for an Amazon URL", () => {
		const url = "https://www.amazon.com/"
		expect(AmazonSiteUtils.isAmazonSite(url)).toBeTruthy()
	})

	it("should return false for a non-Amazon URL", () => {
		const url = "https://www.aliexpress.com/"
		expect(AmazonSiteUtils.isAmazonSite(url)).toBeFalsy()
	})
})
describe("isAmazonItemDetails", () => {
	it("should return true for an Amazon item details URL", () => {
		const url = "https://www.amazon.com/dp/B087ZT7CZP"
		expect(AmazonSiteUtils.isAmazonItemDetails(url)).toBeTruthy()
		const urlHref = "https://www.amazon.com/dp/B087ZT7CZP#blabla"
		expect(AmazonSiteUtils.isAmazonItemDetails(urlHref)).toBeTruthy()
	})

	it("should return false for a non-Amazon item details URL", () => {
		const url = "https://www.aliexpress.com/item/123456789"
		expect(AmazonSiteUtils.isAmazonItemDetails(url)).toBeFalsy()
	})
})
describe("isAmazonWholesale", () => {
	it("should return true for an Amazon wholesale URL", () => {
		const url =
      "https://www.amazon.com/s?k=cooling+fan&crid=1EYZ9QL7HRRPO&sprefix=cool%2Caps%2C390&ref=nb_sb_ss_ts-doa-p_4_4"
		expect(AmazonSiteUtils.isAmazonWholesale(url)).toBeTruthy()
	})

	it("should return false for a non-Amazon wholesale URL", () => {
		const url =
      "https://www.amazon.com/TaoTronics-Tower-Fan-Oscillating-Bladeless/dp/B087ZT7CZP/ref=sr_1_1_sspa?crid=1EYZ9QL7HRRPO&dchild=1&keywords=cooling+fan&qid=1617511933&sprefix=cool%2Caps%2C390&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFVQlZLSE5WR0xTQk8mZW5jcnlwdGVkSWQ9QTA4NzgwOTQxMUdLT0ZUOE5QMzFWJmVuY3J5cHRlZEFkSWQ9QTA5OTI3MTAxSTEyNDlLQU40NlQ5JndpZGdldE5hbWU9c3BfYXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==#haha"
		expect(AmazonSiteUtils.isAmazonWholesale(url)).toBeFalsy()
	})
})
