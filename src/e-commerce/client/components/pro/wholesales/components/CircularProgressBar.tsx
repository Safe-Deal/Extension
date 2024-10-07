import React from "react";
import { motion } from "framer-motion";
import "./CircularProgressBar.scss";

export const CircularProgressBar = ({
  title,
  value,
  reason,
  color
}: {
  title: string;
  value: number;
  reason?: string;
  color: string;
}) => (
  <div className="circular-progress-bar">
    <div className="circular-progress-bar__chart">
      <svg className="circular-progress-bar__svg" viewBox="0 0 36 36">
        <path
          className="circular-progress-bar__bg"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <motion.path
          className="circular-progress-bar__fill"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ stroke: color }}
        />
        <text x="50%" y="56.5%" className="circular-progress-bar__text">
          {value}%
        </text>
      </svg>
    </div>
    <div className="circular-progress-bar__info">
      <span className="circular-progress-bar__title">{title}</span>
      {reason && <div className="circular-progress-bar__reason">{reason}</div>}
    </div>
  </div>
);
