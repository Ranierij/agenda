import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isSuperAdmin as checkIsSuperAdmin } from "@/lib/isSuperAdmin";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setAuthError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setIsAuthenticated(true);

        const superAdmin = await checkIsSuperAdmin(user);
        setIsSuperAdmin(superAdmin);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(error);

      setAuthError({
        type: "auth_required",
        message: error.message,
      });
    } finally {
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw error;
      }
      setUser(user);
      setIsAuthenticated(true);
      const superAdmin = await checkIsSuperAdmin(user);
      setIsSuperAdmin(superAdmin);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error("User auth check failed:", error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);

      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: "auth_required",
          message: "Authentication required",
        });
      }
    }
  };

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();

    setUser(null);
    setIsAuthenticated(false);
    setIsSuperAdmin(false);

    if (shouldRedirect) {
      window.location.href = "/login";
    }
  };

  const navigateToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSuperAdmin,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
