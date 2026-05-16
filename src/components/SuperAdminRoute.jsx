import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

/**
 * Permite acesso apenas para super admins.
 * - Se ainda carregando, mostra spinner.
 * - Se não autenticado, manda pro login.
 * - Se autenticado mas não é super admin, redireciona pra /dashboard.
 */
export default function SuperAdminRoute({ children }) {
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

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
