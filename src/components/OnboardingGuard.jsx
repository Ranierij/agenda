import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

/**
 * Guarda da rota de onboarding.
 * - Super admin nunca passa pelo onboarding: vai direto para /master.
 * - Demais usuários seguem o fluxo normal.
 */
export default function OnboardingGuard({ children }) {
  const { isAuthenticated, isSuperAdmin, isLoadingAuth, navigateToLogin } =
    useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigateToLogin();
    return null;
  }

  if (isSuperAdmin) {
    return <Navigate to="/master" replace />;
  }

  return children;
}
