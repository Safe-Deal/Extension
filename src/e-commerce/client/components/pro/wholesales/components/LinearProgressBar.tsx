import { motion } from "framer-motion";
import React from "react";
import "./LinearProgressBar.scss";

export interface LinearProgressBarProps {
  title: string;
  value: number;
  reason?: string;
  plannerMode?: boolean;
  targetValue?: number;
}

export const LinearProgressBar = ({
  title,
  value,
  reason,
  plannerMode = false,
  targetValue = 0
}: LinearProgressBarProps) => {
  const getColorClass = (value: number) => {
    if (value >= 90) return "green";
    if (value >= 70) return "orange";
    return "red";
  };

  const currentValue = value;
  const formattedTargetValue = targetValue;
  const gap = plannerMode ? Math.max(0, formattedTargetValue - currentValue) : 0;

  return (
    <div className="linear-progress-bar">
      <div className="linear-progress-bar__header">
        <span className="linear-progress-bar__title">{title}</span>
        <div className="linear-progress-bar__values">
          <span className={`linear-progress-bar__value linear-progress-bar__value--${getColorClass(currentValue)}`}>
            {currentValue}%
          </span>
          {plannerMode && targetValue > 0 && (
            <>
              <span className="linear-progress-bar__target-separator">/</span>
              <span className="linear-progress-bar__target-value">{formattedTargetValue}%</span>
            </>
          )}
        </div>
      </div>
      <div className="linear-progress-bar__track">
        <motion.div
          className={`linear-progress-bar__fill linear-progress-bar__fill--${getColorClass(currentValue)}`}
          initial={{ width: 0 }}
          animate={{ width: `${currentValue}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        {plannerMode && targetValue > 0 && (
          <>
            <div className="linear-progress-bar__target-marker" style={{ left: `${formattedTargetValue}%` }} />
            {gap > 0 && (
              <div
                className="linear-progress-bar__gap"
                style={{
                  left: `${currentValue}%`,
                  width: `${gap}%`
                }}
              />
            )}
          </>
        )}
      </div>
      {reason && <p className="linear-progress-bar__reason">{reason}</p>}
      {plannerMode && gap > 0 && <p className="linear-progress-bar__gap-text">{gap}% to reach target</p>}
    </div>
  );
};
