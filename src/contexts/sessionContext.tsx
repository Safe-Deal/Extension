import React, { createContext, useContext, useEffect, useCallback } from "react";
import { AUTH_GLUE } from "@utils/extension/glue";
import { AuthMessagesEvents, SubscriptionStatus } from "@constants/supabase";
import { Session } from "@supabase/supabase-js";
import { useAuthStore } from "@store/AuthState";

interface SessionContextType {
  loading: boolean;
  session: Session | null;
  isPremiumUser: boolean;
  isLoggedIn: boolean;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SupabaseSessionProvider({ children }: { children: React.ReactNode }) {
  const { user, session, loading, isPremium, setSession, setLoading, setPremiumStatus } = useAuthStore((state) => ({
    user: state.user,
    session: state.session,
    loading: state.loading,
    isPremium: state.isPremium,
    setSession: state.setSession,
    setLoading: state.setLoading,
    setPremiumStatus: state.setPremiumStatus
  }));

  const handleAuthMessage = useCallback(
    (message: any) => {
      if (message.type === AuthMessagesEvents.GET_SESSION) {
        setSession(message.payload);
        setLoading(false);
        setPremiumStatus(message.payload?.user?.user_metadata?.subscription_status === SubscriptionStatus.Active);
      }
      if (message.type === AuthMessagesEvents.LOGOUT) {
        setSession(null);
        setLoading(false);
        setPremiumStatus(false);
      }
    },
    [setSession, setLoading, setPremiumStatus]
  );

  useEffect(() => {
    AUTH_GLUE.send({ type: AuthMessagesEvents.GET_SESSION, payload: {} });
    AUTH_GLUE.client(handleAuthMessage);
  }, [handleAuthMessage]);

  return (
    <SessionContext.Provider value={{ loading, session, isPremiumUser: isPremium, isLoggedIn: !!user }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSupabaseSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSupabaseSession must be used within a SupabaseSessionProvider");
  }
  return context;
}
