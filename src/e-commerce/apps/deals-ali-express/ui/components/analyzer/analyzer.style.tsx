import { colors } from "../../styles/colors";

export const buttonStyle = {
  position: "fixed",
  bottom: "20px",
  right: "0",
  background: colors.floatButtonColor,
  color: colors.white,
  padding: "10px",
  borderRadius: "10px 0 0 10px",
  minWidth: "50px",
  "&:hover": {
    color: colors.white,
    background: colors.primary
  }
};

export const dialogToolbarStyle = {
  backgroundColor: colors.primary
};

export const dialogHeaderBtnLayoutStyle = { mr: 2, float: "right" };

export const dialogHeaderStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

export const dialogContentStyle = {
  padding: "0px 5px"
};

export const dialogContentSybTitleStyle = {
  display: "flex",
  alignItems: "center"
};

export const dialogActionsStyle = {
  justifyContent: "center",
  fontWeight: 400
};

export const numberOfSuperDealsStyle = {
  marginLeft: 4,
  fontSize: 20,
  color: colors.red
};
