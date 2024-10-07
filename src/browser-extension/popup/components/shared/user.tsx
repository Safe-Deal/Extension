import React from "react";
import { SAFE_DEAL_SIGN_UP_URL } from "@e-commerce/client/components/constants";
import UserMenu from "@e-commerce/client/components/shared/UserMenu/UserMenu";
import { useAuthStore } from "@store/AuthState";

const User = () => {
  const { session, requestLogin, requestLogout } = useAuthStore((state) => ({
    session: state.session,
    requestLogin: state.requestLogin,
    requestLogout: state.requestLogout
  }));

  const handleLoginLogout = () => {
    if (session) requestLogout();
    else requestLogin();
  };

  const handleSignUp = () => {
    window.open(SAFE_DEAL_SIGN_UP_URL, "_blank");
  };

  return (
    <>
      <UserMenu isLoggedIn={!!session} session={session} onLoginLogout={handleLoginLogout} onSignUp={handleSignUp} />
    </>
  );
};

export default User;
