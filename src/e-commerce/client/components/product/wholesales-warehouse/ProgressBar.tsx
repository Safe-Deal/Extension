import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import React from "react";
import styled from "@emotion/styled";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import { colors } from "../../../../apps/deals-ali-express/ui/styles/colors";

type ProgressBarProps = {
  title: string;
  value: number;
  reason?: string;
};

const ProgressBarWrapper = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const determinePathColor = (value: number): string => {
  if (value > 8.5) {
    return colors.primary;
  }
  if (value > 7 && value <= 8.5) {
    return colors.orange;
  }
  return colors.red;
};

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }: any) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#000"
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#000",
    color: "#FFF",
    width: "300px"
  }
}));

const TooltipContent = ({ title }: { title: string }) => <div>{title}</div>;

const Label = styled.h5`
  text-align: center;
`;

const ProgressBar = ({ value, title, reason }: ProgressBarProps) => {
  const pathColor = determinePathColor(value);
  return (
    <ProgressBarWrapper>
      <BootstrapTooltip title={<TooltipContent title={reason} />} arrow>
        <div style={{ width: "60px", height: "80px" }}>
          <CircularProgressbar
            value={value}
            maxValue={10}
            text={`${value * 10}%`}
            styles={buildStyles({
              pathColor,
              textColor: "#0F172A",
              textSize: "20px",
              strokeLinecap: "butt",
              trailColor: "#eee"
            })}
          />
          <Label>{title}</Label>
        </div>
      </BootstrapTooltip>
    </ProgressBarWrapper>
  );
};

export default ProgressBar;
