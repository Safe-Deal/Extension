import { browserLocalStorage } from "../site-storage";

describe("local_storageFactory", () => {
  describe("when local_storage is not supported", () => {
    describe("setItem and getItem", () => {
      it("sets values and returns", () => {
        expect(browserLocalStorage.setItem("foo", "Foo")).toBeUndefined();
        expect(browserLocalStorage.getItem("foo")).toEqual("Foo");

        expect(browserLocalStorage.setItem("empty", "")).toBeUndefined();
        expect(browserLocalStorage.getItem("empty")).toEqual("");
      });

      it("converts values to strings", () => {
        expect(browserLocalStorage.setItem("one", "1")).toBeUndefined();
        expect(browserLocalStorage.getItem("one")).toEqual("1");

        expect(browserLocalStorage.setItem("null", null)).toBeUndefined();
        expect(browserLocalStorage.getItem("null")).toEqual("null");

        expect(browserLocalStorage.setItem("undefined", undefined)).toBeUndefined();
        expect(browserLocalStorage.getItem("undefined")).toEqual("undefined");
      });
    });

    describe("property: length", () => {
      it("is initialized at 0", () => {
        browserLocalStorage.clear();
        expect(browserLocalStorage.length).toEqual(0);
      });

      it("should increment with setItem", () => {
        browserLocalStorage.clear();
        browserLocalStorage.setItem("foo", "Foo");
        expect(browserLocalStorage.length).toEqual(1);
      });

      it("should reset to 0 when cleared", () => {
        browserLocalStorage.clear();
        browserLocalStorage.setItem("foo", "Foo");
        expect(browserLocalStorage.length).toEqual(1);
        browserLocalStorage.clear();
        expect(browserLocalStorage.length).toEqual(0);
      });
    });

    describe("property: get all", () => {
      it("get all items as an object", () => {
        browserLocalStorage.clear();

        browserLocalStorage.setItem("foo", "Foo");
        browserLocalStorage.setItem("foo2", "Foo2");
        browserLocalStorage.setItem("foo3", "Foo3");
        expect(browserLocalStorage.getAll()).toEqual({
          foo: "Foo",
          foo2: "Foo2",
          foo3: "Foo3"
        });
      });
    });
  });
});
