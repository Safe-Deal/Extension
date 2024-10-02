import React, { useEffect, useState } from "react"
import { getDomain } from "@utils/dom/html"
import { isDomainSmallLanguage } from "@utils/multilang/languages"
import { ProductStore } from "@e-commerce/engine/logic/conclusion/conclusion-product-entity.interface"
import { ResponsiveIframe } from "../../../shared/ResponsiveIframe"
import { LOCALE } from "../../../../../../utils/extension/locale"
import { LoaderSpinner } from "../../../shared/Loader"

import "./Opinions.scss"
import { t } from "../../../../../../constants/messages"
import { useProductName } from "../Research/hooks/useProductName"

interface IOpinions {
  productId: string;
  store: ProductStore;
}

export const Opinions = ({ productId, store }: IOpinions) => {
	const [loading, setLoading] = useState(true)
	const domain = getDomain()
	const isSmall = isDomainSmallLanguage(domain)
	const [productName] = useProductName({ productId, store, isSmall })
	const encodedProductName = encodeURIComponent(productName)
	const opinionUrl = `https://www.joinsafedeal.com/opinions/${store}/${productId}?lang=${LOCALE}&productName=${encodedProductName}`

	useEffect(() => {
		setLoading(true)
	}, [opinionUrl])

	return (
		<div className="sd_opinions">
			<h1 className="sd_opinions__title">{t("opinions_title")}</h1>
			<div className="sd_opinions__opinions">
				{loading && <LoaderSpinner />}
				<ResponsiveIframe src={opinionUrl} onLoad={() => setLoading(false)} />
			</div>
		</div>
	)
}
