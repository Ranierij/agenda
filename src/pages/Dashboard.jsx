import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Mantido por compatibilidade com links antigos.
 * Redireciona qualquer acesso a /dashboard para /app/dashboard, preservando query params (?slug=).
 */
export default function Dashboard() {
  const location = useLocation();
  return <Navigate to={`/app/dashboard${location.search}`} replace />;
}
