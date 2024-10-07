import React from "react";
import "react-circular-progressbar/dist/styles.css";
import AnalysisWholesaleResult from "./wholesales/AnalysisProgressBars";

export function ProductEvaluation({ product }: { product: any }) {
  return <AnalysisWholesaleResult product={product.product} />;
}
