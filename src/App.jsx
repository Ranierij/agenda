import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
// Add page imports here
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import DemoPage from "@/pages/DemoPage";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import AgendamentoPublico from "@/pages/AgendamentoPublico";
import MasterAdmin from "@/pages/MasterAdmin";
import SuperAdminRoute from "@/components/SuperAdminRoute";
import OnboardingGuard from "@/components/OnboardingGuard";
import AppRoute from "@/components/AppRoute";
import AppLayout from "@/components/app/AppLayout";
import AppDashboard from "@/components/app/AppDashboard";
import AppAgenda from "@/components/app/AppAgenda";
import AppClientes from "@/components/app/AppClientes";
import AppServicos from "@/components/app/AppServicos";
import AppProfissionais from "@/components/app/AppProfissionais";
import AppPacotes from "@/components/app/AppPacotes";
import AppFinanceiro from "@/components/app/AppFinanceiro";
import AppRelatorios from "@/components/app/AppRelatorios";
import AppAI from "@/components/app/AppAI";
import AppEquipe from "@/components/app/AppEquipe";
import AppConfiguracoes from "@/components/app/AppConfiguracoes";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } =
    useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    } else if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingGuard>
            <Onboarding />
          </OnboardingGuard>
        }
      />
      <Route path="/agendar/:slug" element={<AgendamentoPublico />} />
      <Route
        path="/master"
        element={
          <SuperAdminRoute>
            <MasterAdmin />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/app"
        element={
          <AppRoute>
            <AppLayout />
          </AppRoute>
        }
      >
        <Route index element={<AppDashboard />} />
        <Route path="dashboard" element={<AppDashboard />} />
        <Route path="agenda" element={<AppAgenda />} />
        <Route path="clientes" element={<AppClientes />} />
        <Route path="servicos" element={<AppServicos />} />
        <Route path="profissionais" element={<AppProfissionais />} />
        <Route path="pacotes" element={<AppPacotes />} />
        <Route path="financeiro" element={<AppFinanceiro />} />
        <Route path="relatorios" element={<AppRelatorios />} />
        <Route path="ai" element={<AppAI />} />
        <Route path="equipe" element={<AppEquipe />} />
        <Route path="configuracoes" element={<AppConfiguracoes />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
