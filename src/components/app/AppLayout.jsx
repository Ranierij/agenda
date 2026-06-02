import React, { useEffect, useState } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { useBrand } from "@/hooks/useBrand";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Brain,
  Settings,
  Sparkles,
  LogOut,
  Scissors,
  UserCheck,
  Package,
  Bell,
  UsersRound,
  ArrowLeft,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { to: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "agenda", label: "Agenda", icon: Calendar },
  { to: "clientes", label: "Clientes", icon: Users },
  { to: "servicos", label: "Serviços", icon: Scissors },
  { to: "profissionais", label: "Profissionais", icon: UserCheck },
  { to: "pacotes", label: "Pacotes", icon: Package },
  { to: "financeiro", label: "Financeiro", icon: DollarSign },
  { to: "relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "ai", label: "AI Growth", icon: Brain },
  { to: "equipe", label: "Equipe", icon: UsersRound },
  { to: "configuracoes", label: "Configurações", icon: Settings },
];

export default function AppLayout() {
  const { isSuperAdmin, user } = useAuth();
  const { salao, nome_salao, logo_url, isImpersonating, loading } =
    useCompany();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useBrand(salao);
  useDocumentTitle(
    nome_salao ? `${nome_salao} | BeautyFlow AI` : "BeautyFlow AI",
  );

  const params = new URLSearchParams(location.search);
  const slugParam = params.get("slug");
  const search = slugParam ? `?slug=${slugParam}` : "";
  const currentSection =
    location.pathname.split("/app/")[1]?.split("/")[0] || "dashboard";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    supabaseApi.auth.logout("/");
  };

  const openMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!salao && !isSuperAdmin) {
    return <Navigate to="/onboarding" replace />;
  }

  const brandBlock = (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0"
        style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
      >
        {logo_url ? (
          <img src={logo_url} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-sm font-bold">
            {nome_salao?.[0] || <Sparkles className="w-4 h-4 text-white" />}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-white truncate">
          {nome_salao || "BeautyFlow AI"}
        </p>
        {isImpersonating ? (
          <p className="text-xs truncate text-amber-400">Modo Super Admin</p>
        ) : (
          <p className="text-xs text-slate-400">Painel do Salão</p>
        )}
      </div>
    </div>
  );

  const navList = (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={{ pathname: `/app/${item.to}`, search }}
          end={item.to === "dashboard"}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive
                ? "text-white shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`
          }
          style={({ isActive }) =>
            isActive
              ? { backgroundColor: "var(--company-primary, #f43f5e)" }
              : {}
          }
        >
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
          {item.to === "ai" && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-white/10 text-white/70">
              IA
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );

  const userFooter = user && (
    <>
      {isSuperAdmin && (
        <div className="px-3 pb-1">
          <NavLink
            to="/master"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-amber-400 hover:bg-slate-800 hover:text-amber-300 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Master
          </NavLink>
        </div>
      )}
      <div className="p-3 border-t border-slate-700/50">
        <div
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 cursor-pointer group"
          onClick={handleLogout}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
          >
            {user.full_name?.[0] || user.email?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user.full_name || user.email}
            </p>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
          </div>
          <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh bg-slate-50">
      <aside className="hidden md:flex w-60 bg-slate-900 text-white flex-col shadow-xl flex-shrink-0">
        <div className="p-4 border-b border-slate-700/50">{brandBlock}</div>
        {navList}
        {userFooter}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 z-0 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 h-full w-[min(18rem,85vw)] bg-slate-900 text-white flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between gap-3">
              {brandBlock}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {navList}
            {userFooter}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header
          className="h-14 bg-white border-b flex items-center justify-between px-3 sm:px-6 flex-shrink-0"
          style={{ borderBottomColor: "var(--company-primary, #f43f5e)22" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onPointerDown={(event) => {
                if (event.pointerType !== "mouse") {
                  event.preventDefault();
                  openMobileMenu();
                }
              }}
              onClick={openMobileMenu}
              className="md:hidden -ml-1 flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-100"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div
              className="w-1 h-5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
            />
            <h2 className="text-sm font-semibold text-slate-900 capitalize truncate">
              {currentSection}
            </h2>
          </div>
          <button
            className="relative p-2 rounded-lg transition-colors hover:bg-slate-50"
            style={{ color: "var(--company-primary, #f43f5e)" }}
          >
            <Bell className="w-4 h-4" />
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
            />
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
