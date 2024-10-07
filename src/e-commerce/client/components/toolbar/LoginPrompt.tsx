import { Box, Button, Typography } from "@mui/material";
import { useAuthStore } from "@store/AuthState";
import React, { useState } from "react";
import { t } from "../../../../constants/messages";
import { IMAGE_SAFE_DEAL } from "../../../../constants/visual";
import { SAFE_DEAL_SIGN_UP_URL } from "../constants";
import "./LoginPrompt.scss";

const LoginPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { requestLogin } = useAuthStore((state) => ({
    requestLogin: state.requestLogin
  }));

  const handleLogin = () => requestLogin();

  const handleSignUp = () => {
    window.open(SAFE_DEAL_SIGN_UP_URL, "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="login-prompt">
      <img src={IMAGE_SAFE_DEAL} alt="Safe Deal Logo" className="login-prompt__logo" />
      <Typography variant="h5" component="h2" gutterBottom className="login-prompt__title">
        {t("welcome_safe_deal")}
      </Typography>
      <Typography variant="body1" align="center" className="login-prompt__description">
        {t("please_login_to_launch")}
      </Typography>
      <Box className="login-prompt__buttons">
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          className="login-prompt__button login-prompt__button--login"
        >
          {t("log_into_my_account")}
        </Button>
        <Typography variant="body2" align="center" className="login-prompt__separator">
          {t("or")}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSignUp}
          className="login-prompt__button login-prompt__button--signup"
        >
          {t("sign_up")}
        </Button>
      </Box>
    </div>
  );
};

export default LoginPrompt;
