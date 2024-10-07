import React from "react";
import "./AnalysisProgressBars.scss";
import { SERIES_COLORS } from "@utils/react/theme";
import { CircularProgressBar } from "./components/CircularProgressBar";
import { LinearProgressBar } from "./components/LinearProgressBar";

type Product = {
  analysis: Record<string, { title: string; value: number; reason?: string }>;
  summary: {
    value: number;
    title: string;
    reason?: string;
  };
};

const AnalysisWholesaleResult = ({ product }: { product: Product }) => (
  <section className="analysis__progress-bars">
    <div className="progress-bar__container">
      <LinearProgressBar
        title={product.summary?.title}
        value={product.summary?.value}
        reason={product.summary?.reason}
      />
    </div>
    <div className="progress-bar__container progress-bar__container--gauges">
      {Object.entries(product.analysis).map(([key, value], index) => (
        <CircularProgressBar
          key={key}
          title={value.title}
          value={value.value}
          reason={value.reason}
          color={SERIES_COLORS[index % SERIES_COLORS.length]}
        />
      ))}
    </div>
  </section>
);

export default AnalysisWholesaleResult;
