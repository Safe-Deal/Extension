import upcomingShutafFile from "../../../const/shutafim.json";
import { ext } from "../../utils/extension/ext";
import { ShutafRemotesService } from "../logic/ShutafRemotesService";
import { ShutafTabManger } from "../logic/ShutafTabManger";
import { ProductShutaf } from "../logic/product-shutaff";

describe("ProductShutaf logic", () => {
  it("should work on AliExpress", async () => {
    ext.tabs = { onUpdated: jest.fn() };
    ShutafTabManger.requests.push = jest.fn();
    ext.tabs.onUpdated.addListener = jest.fn();

    const shutaf = new ProductShutaf("https://www.aliexpress.com/item/33029781134.html");

    await shutaf.execute();
    expect(ShutafTabManger.requests.push).toHaveBeenCalledWith(
      expect.stringContaining("https://s.click.aliexpress.com/e/")
    );
  });

  it("should AliExpress.ru", async () => {
    ext.tabs = { onUpdated: jest.fn() };
    ShutafTabManger.requests.push = jest.fn();
    ext.tabs.onUpdated.addListener = jest.fn();

    const shutaf = new ProductShutaf("https://www.aliexpress.ru/item/33029781134.html");

    await shutaf.execute();
    expect(ShutafTabManger.requests.push).toHaveBeenCalledWith(
      expect.stringContaining("https://s.click.aliexpress.com/e/")
    );
  });

  it("should work on lingualeo", async () => {
    ShutafRemotesService.setShutafList(upcomingShutafFile);
    ext.tabs = { onUpdated: jest.fn() };
    ShutafTabManger.requests.push = jest.fn();
    ext.tabs.onUpdated.addListener = jest.fn();

    const shutaf = new ProductShutaf("https://lingualeo.com");

    await shutaf.execute();
    expect(ShutafTabManger.requests.push).toHaveBeenCalledWith(
      "https://xcdus.com/g/e583077b6377b32f8c01c814d4b7c0/?erid=LatgBqXcc&ulp=https://lingualeo.com/"
    );
  });

  it("should work on temu.com", async () => {
    ShutafRemotesService.setShutafList(upcomingShutafFile);
    ext.tabs = { onUpdated: jest.fn() };
    ShutafTabManger.requests.push = jest.fn();
    ext.tabs.onUpdated.addListener = jest.fn();

    const shutaf = new ProductShutaf(
      "https://www.temu.com/eyebrow-trimmer-scissor-with-comb-lady-woman-men-hair-removal-grooming-shaping-stainless-steel-eyebrow-remover-makeup-tool-g-601099513357191.html?top_gallery_url=https%3A%2F%2Fimg.kwcdn.com%2Fproduct%2FFancyalgo%2FVirtualModelMatting%2Fdf45fbabe57495212fe9d4ac8d6af040.jpg&spec_gallery_id=10381990&refer_page_sn=10132&refer_source=0&freesia_scene=311&_oak_freesia_scene=311&_oak_rec_ext_1=OTc&refer_page_el_sn=207153&_x_channel_scene=spike&_x_channel_src=1&_x_sessn_id=s5sblve4v8&refer_page_name=lightning-deals&refer_page_id=10132_1695748626119_fqm6rhpaaw"
    );

    await shutaf.execute();
    expect(ShutafTabManger.requests.push).toHaveBeenCalledWith(
      "https://lg.provenpixel.com/plp.php?zoneid=8282&oadest=https://www.temu.com/eyebrow-trimmer-scissor-with-comb-lady-woman-men-hair-removal-grooming-shaping-stainless-steel-eyebrow-remover-makeup-tool-g-601099513357191.html?top_gallery_url=https%253A%252F%252Fimg.kwcdn.com%252Fproduct%252FFancyalgo%252FVirtualModelMatting%252Fdf45fbabe57495212fe9d4ac8d6af040.jpg&spec_gallery_id=10381990&refer_page_sn=10132&refer_source=0&freesia_scene=311&_oak_freesia_scene=311&_oak_rec_ext_1=OTc&refer_page_el_sn=207153&_x_channel_scene=spike&_x_channel_src=1&_x_sessn_id=s5sblve4v8&refer_page_name=lightning-deals&refer_page_id=10132_1695748626119_fqm6rhpaaw"
    );
  });

  it("should work on ivory.co.il", async () => {
    ShutafRemotesService.setShutafList(upcomingShutafFile);
    ext.tabs = { onUpdated: jest.fn() };
    ShutafTabManger.requests.push = jest.fn();
    ext.tabs.onUpdated.addListener = jest.fn();

    const shutaf = new ProductShutaf("https://www.ivory.co.il/catalog.php?id=79910");

    await shutaf.execute();
    expect(ShutafTabManger.requests.push).toHaveBeenCalledWith(
      "https://track.clickon.co.il/click/uwEw4FYmk5p2bH3/ph0vD7VLdfyKvza/TsuwEw4FYmk5p2bH3tS#u=https://www.ivory.co.il/catalog.php?id=79910"
    );
  });

  it("should work on AliBaba item", async () => {
    ShutafRemotesService.setShutafList(upcomingShutafFile);
    ext.tabs = { onUpdated: jest.fn() };
    ShutafTabManger.requests.push = jest.fn();
    ext.tabs.onUpdated.addListener = jest.fn();

    const shutaf = new ProductShutaf(
      "https://www.alibaba.com/product-detail/TWOTWINSTYLE-Elegant-Skirt-And-Top-Round_1601052175980.html"
    );

    await shutaf.execute();
    expect(ShutafTabManger.requests.push).toHaveBeenCalledWith(
      "https://acfe-vf2021.com/g/pm1aev55cl77b32f8c01219aa26f6f/?ulp=https://www.alibaba.com/product-detail/TWOTWINSTYLE-Elegant-Skirt-And-Top-Round_1601052175980.html"
    );
  });

  it("should not work on AliBaba not Item", async () => {
    ShutafRemotesService.setShutafList(upcomingShutafFile);
    ext.tabs = { onUpdated: jest.fn() };
    ShutafTabManger.requests.push = jest.fn();
    ext.tabs.onUpdated.addListener = jest.fn();

    const shutaf = new ProductShutaf(
      "https://sale.alibaba.com/p/rank/detail.html?spm=a2700.product_home_l0.top_ranking.products_0&wx_navbar_transparent=true&path=/p/rank/detail.html&ncms_spm=a27aq.rank_detail&cardType=101002745&cardId=340804&topOfferIds=1600391638617&templateBusinessCode=&splitCardType=&rankMaterialType=&filterId="
    );
    await shutaf.execute();
    expect(ShutafTabManger.requests.push).not.toHaveBeenCalled();
  });
});
