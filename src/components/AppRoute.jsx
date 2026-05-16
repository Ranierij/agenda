import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

/**
 * Guard para rotas /app/*.
 * - Não-autenticado → login.
 * - Super admin SEM ?slug= → redireciona para /master (super admin precisa escolher qual salão visualizar).
 * - Demais → libera acesso.
 */
export default function AppRoute({ children }) {
  const { isAuthenticated, isSuperAdmin, isLoadingAuth, navigateToLogin } =
    useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigateToLogin();
    return null;
  }

  const params = new URLSearchParams(location.search);
  const slugParam = params.get("slug");

  // Super admin sem slug → volta para /master (precisa escolher um salão)
  if (isSuperAdmin && !slugParam) {
    return <Navigate to="/master" replace />;
  }

  return children;
}
