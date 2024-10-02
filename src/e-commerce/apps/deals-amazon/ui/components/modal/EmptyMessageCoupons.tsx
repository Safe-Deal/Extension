import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import Box from "@mui/material/Box"
import MuiLink from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import React from "react"
import { t } from "../../../../../../constants/messages"
import "./empty-message-coupons.scss"

export function EmptyMessageCoupons() {
	return (
		<Box className="empty-message-coupons-container" textAlign="center">
			<Box className="warning-section">
				<WarningAmberIcon className="warning-icon" />
				<Typography variant="body1">{t("extension_not_available")}</Typography>
				<Typography variant="body1">{t("search_for_any_other_keyword")}</Typography>
				<MuiLink
					href="https://safe-deal-assistant.com/coupons/?from-extension=true"
					target="_blank"
					sx={{ display: "block", fontSize: "20px", mb: "15px" }}
				>
					{t("want_more_coupons")}
				</MuiLink>
			</Box>
		</Box>
	)
}
