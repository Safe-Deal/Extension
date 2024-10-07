import React from "react";
import { motion } from "framer-motion";
import "./LinearProgressBar.scss";

export const LinearProgressBar = ({ title, value, reason }: { title: string; value: number; reason?: string }) => (
  <div className="linear-progress-bar">
    <div className="linear-progress-bar__header">
      <span className="linear-progress-bar__title">{title}</span>
      <span className="linear-progress-bar__value">{value}%</span>
    </div>
    <div className="linear-progress-bar__track">
      <motion.div
        className="linear-progress-bar__fill"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </div>
    {reason && <p className="linear-progress-bar__reason">{reason}</p>}
  </div>
);
