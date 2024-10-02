import { isSoldOrShipByAmazon, isSoldShipByAmazon } from "./amazon-sold-ship-rule-algorithm";

describe("Amazon - Rule product ship and sold algorithm", () => {
  describe("isSoldShipByAmazon", () => {
    it("should return true if item is sold and ship by amazon", () => {
      const shipEl: any = { textContent: "amazon" };
      const soldEl: any = { textContent: "amazon" };
      const result = isSoldShipByAmazon(shipEl, soldEl);
      expect(result).toBeTruthy();
    });

    it("should return false if item is sold by amazon but Not ship by amazon", () => {
      const shipEl: any = { textContent: "Test" };
      const soldEl: any = { textContent: "amazon" };
      const result = isSoldShipByAmazon(shipEl, soldEl);
      expect(result).toBeFalsy();
    });

    it("should return false if item is NOT sold by amazon but ship by amazon", () => {
      const shipEl: any = { textContent: "AMAZON" };
      const soldEl: any = { textContent: "test" };
      const result = isSoldShipByAmazon(shipEl, soldEl);
      expect(result).toBeFalsy();
    });

    it("should return false if item is NOT sold by amazon and Not ship by amazon", () => {
      const shipEl: any = { textContent: "test1" };
      const soldEl: any = { textContent: "test2" };
      const result = isSoldShipByAmazon(shipEl, soldEl);
      expect(result).toBeFalsy();
    });
  });

  describe("isSoldOrShipByAmazon", () => {
    it("should return true if item is sold or ship by amazon", () => {
      const shipEl1: any = { textContent: "amazon" };
      const soldEl1: any = { textContent: "amazon" };
      const result1 = isSoldOrShipByAmazon(shipEl1, soldEl1);
      expect(result1).toBeTruthy();

      const shipEl2: any = { textContent: "test" };
      const soldEl2: any = { textContent: "amazon" };
      const result2: any = isSoldOrShipByAmazon(shipEl2, soldEl2);
      expect(result2).toBeTruthy();

      const shipEl3: any = { textContent: "amazon" };
      const soldEl3: any = { textContent: "test" };
      const result3: any = isSoldOrShipByAmazon(shipEl3, soldEl3);
      expect(result2).toBeTruthy();
    });

    it("should return false if item is Not sold or Not ship by amazon", () => {
      const shipEl: any = { textContent: "test1" };
      const soldEl: any = { textContent: "test2" };
      const result = isSoldOrShipByAmazon(shipEl, soldEl);
      expect(result).toBeFalsy();
    });
  });
});
