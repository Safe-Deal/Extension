import React, { useState } from "react"
import Button from "@mui/material/Button"
import RedditIcon from "@mui/icons-material/Reddit"
import YouTubeIcon from "@mui/icons-material/YouTube"
import ShoppingIcon from "@mui/icons-material/ShoppingCart"
import { isRtl, t } from "@constants/messages"
import { ProductStore } from "@e-commerce/engine/logic/conclusion/conclusion-product-entity.interface"
import ProductResearchLightbox from "./components/ProductResearchLightbox"

import "./ProductResearch.scss"

interface IProductResearch {
  productId: string;
  store: ProductStore;
}

export const ProductResearch = ({ productId, store }: IProductResearch) => {
	const [lightboxOpen, setLightboxOpen] = useState(false)

	return (
		<div className="sd-product-research">
			<Button
				variant="contained"
				color="secondary"
				size="medium"
				className="sd-product-research__button"
				disableElevation
				disableFocusRipple
				endIcon={
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "4px",
							height: "100%",
							marginRight: isRtl() ? "14px" : "0"
						}}
					>
						<YouTubeIcon sx={{ color: "#FF0000", height: "24px" }} />
						<RedditIcon sx={{ color: "#FF4500", height: "24px", marginBottom: "2px" }} />
						<ShoppingIcon sx={{ color: "#34A853", height: "24px" }} />
					</div>
				}
				onClick={() => setLightboxOpen(true)}
			>
				<div
					style={{
						display: "inline-block",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
						overflow: "hidden",
						maxWidth: "250px"
					}}
				>
					{t("research_online")}
				</div>
			</Button>
			<ProductResearchLightbox
				open={lightboxOpen}
				onClose={() => setLightboxOpen(false)}
				productId={productId}
				store={store}
			/>
		</div>
	)
}

export default ProductResearch
