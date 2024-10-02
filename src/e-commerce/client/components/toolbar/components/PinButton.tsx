import React from "react"
import PushPinIcon from "@mui/icons-material/PushPin"
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined"
import { t } from "../../../../../constants/messages"
import { Tooltips } from "../../shared/Tooltip"

export const PinButton = ({ isPinned, onClick }) =>
	isPinned ? (
		<Tooltips title={t("click_to_unpin")}>
			<PushPinIcon onClick={onClick} style={{ marginLeft: "8px", cursor: "pointer" }} />
		</Tooltips>
	) : (
		<Tooltips title={t("click_to_pin")}>
			<PushPinOutlinedIcon onClick={onClick} style={{ marginLeft: "8px", cursor: "pointer" }} />
		</Tooltips>
	)
