import * as React from "react";
import { useAuthStore } from "@store/AuthState";
import { SAFE_DEAL_SIGN_UP_URL } from "../../constants";
import UserMenu from "../UserMenu/UserMenu";

export default function AccountMenu() {
  const { session, isLoggedIn, requestLogin, requestLogout } = useAuthStore((state) => ({
    session: state.session,
    isLoggedIn: state.user !== null,
    requestLogin: state.requestLogin,
    requestLogout: state.requestLogout
  }));

  const handleLoginLogout = () => {
    if (isLoggedIn) requestLogout();
    else requestLogin();
  };

  const handleSignUp = () => {
    window.open(SAFE_DEAL_SIGN_UP_URL, "_blank");
  };

  return (
    <UserMenu isLoggedIn={isLoggedIn} session={session} onLoginLogout={handleLoginLogout} onSignUp={handleSignUp} />
  );
}
