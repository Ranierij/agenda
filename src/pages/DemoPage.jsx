import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft, FlaskConical, ExternalLink } from "lucide-react";
import DemoLayout from "@/components/demo/DemoLayout";
import DemoDashboard from "@/components/demo/DemoDashboard";
import DemoAgenda from "@/components/demo/DemoAgenda";
import DemoClientes from "@/components/demo/DemoClientes";
import DemoFinanceiro from "@/components/demo/DemoFinanceiro";
import DemoAI from "@/components/demo/DemoAI";
import DemoServicos from "@/components/demo/DemoServicos";
import DemoProfissionais from "@/components/demo/DemoProfissionais";
import DemoPacotes from "@/components/demo/DemoPacotes";

export default function DemoPage() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DemoDashboard />;
      case "agenda":
        return <DemoAgenda />;
      case "clientes":
        return <DemoClientes />;
      case "servicos":
        return <DemoServicos />;
      case "profissionais":
        return <DemoProfissionais />;
      case "pacotes":
        return <DemoPacotes />;
      case "financeiro":
        return <DemoFinanceiro />;
      case "ai":
        return <DemoAI />;
      default:
        return <DemoDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── FAIXA FIXA DE DEMONSTRAÇÃO ── */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 text-white px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Ícone + mensagem */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 bg-rose-500/20 border border-rose-500/40 rounded-lg flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-medium text-white/90">
                <span className="text-rose-400 font-bold">
                  Modo Demonstração
                </span>
                <span className="hidden sm:inline text-white/60"> — </span>
                <span className="hidden sm:inline text-white/60">
                  Todos os dados exibidos são fictícios e servem apenas para
                  ilustrar as funcionalidades do sistema. Nenhuma informação
                  real é utilizada.
                </span>
              </span>
            </div>
          </div>

          {/* CTA TurboSaaS */}
          <a
            href=""
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 transition-colors text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-lg shadow-rose-500/20"
          >
            Quero esse sistema
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ── SUBHEADER: voltar + logo + badge ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar ao site</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-md flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">
            BeautyFlow
            <Badge className="ml-1.5 bg-rose-100 text-rose-600 border-0 text-xs">
              DEMO
            </Badge>
          </span>
        </div>
        <a target="_blank" rel="noreferrer">
          <Button
            size="sm"
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs gap-1.5"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </a>
      </div>

      <DemoLayout
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      >
        {renderSection()}
      </DemoLayout>
    </div>
  );
}
