import React from "react"
import { ErrorBoundary } from "../../../../utils/analytics/ErrorBoundary"
import AliSuperDealsAnalyzer from "./components/analyzer/analyzer"

function AliSuperDealsApp() {
	return (
		<ErrorBoundary>
			<AliSuperDealsAnalyzer />
		</ErrorBoundary>
	)
}

export default AliSuperDealsApp
