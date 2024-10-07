import { SAFE_DEAL_OFF } from "../../../../../constants/sites";
import { SiteAnalyzerVerification } from "../site-analyzer-verification";

describe("SiteAnalyzerVerification", () => {
  describe("METHOD: verify", () => {
    describe(".com site domain", () => {
      describe("positive scenario", () => {
        it("should return true if site url is on the white list", () => {
          const expectedResult1: boolean = SiteAnalyzerVerification.verify("aliexpress.com/af/sdds/ds/ds");
          expect(expectedResult1).toBeTruthy();

          const expectedResult2: boolean = SiteAnalyzerVerification.verify("aliexpress.com/aaa/wholesale/fdfd");
          expect(expectedResult2).toBeTruthy();

          const expectedResult3: boolean = SiteAnalyzerVerification.verify("aliexpress.com/category/sdds");
          expect(expectedResult3).toBeTruthy();

          const expectedResult4: boolean = SiteAnalyzerVerification.verify(
            "https://shoppingcart.aliexpress.com/ds/dsa/dsa/"
          );
          expect(expectedResult4).toBeTruthy();

          const expectedResult5: boolean = SiteAnalyzerVerification.verify("https://aliexpress.com/premium/dsdsa/dsa/");
          expect(expectedResult5).toBeTruthy();
        });
      });

      describe("negative scenario", () => {
        it("should return false when site url is invalid", () => {
          const expectedResult1: boolean = SiteAnalyzerVerification.verify(`http://www.one.co.il${SAFE_DEAL_OFF}`);
          expect(expectedResult1).toBeFalsy();

          const expectedResult2: boolean = SiteAnalyzerVerification.verify(`http://www.ali.co.il${SAFE_DEAL_OFF}`);
          expect(expectedResult2).toBeFalsy();
        });
      });
    });

    describe(".ru site domain", () => {
      it("should return true if site url is on the white list", () => {
        const expectedResult1: boolean = SiteAnalyzerVerification.verify("aliexpress.ru/af/sdds/ds/ds");
        expect(expectedResult1).toBeTruthy();

        const expectedResult2: boolean = SiteAnalyzerVerification.verify("aliexpress.ru/aaa/wholesale/fdfd");
        expect(expectedResult2).toBeTruthy();

        const expectedResult3: boolean = SiteAnalyzerVerification.verify("aliexpress.ru/category/sdds");
        expect(expectedResult3).toBeTruthy();

        const expectedResult4: boolean = SiteAnalyzerVerification.verify(
          "https://shoppingcart.aliexpress.ru/ds/dsa/dsa/"
        );
        expect(expectedResult4).toBeTruthy();

        const expectedResult5: boolean = SiteAnalyzerVerification.verify("https://aliexpress.ru/premium/dsdsa/dsa/");
        expect(expectedResult5).toBeTruthy();
      });
    });
  });
});
