import * as React from "react";
import { t } from "../../../../constants/messages";

export default function WebsitesList({ toggle }: { toggle: () => void }) {
  return (
    <>
      <div>Websites list</div>
      <div className="mdl-card__actions" style={{ paddingTop: "0", marginTop: "0" }}>
        <a href="#" onClick={toggle} className="mdl-button  mdl-js-ripple-effect">
          {t("affiliated_websites")}
        </a>
      </div>
    </>
  );
}
