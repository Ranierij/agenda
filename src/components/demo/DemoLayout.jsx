import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Brain,
  Sparkles,
  Scissors,
  UserCheck,
  Package,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "servicos", label: "Serviços", icon: Scissors },
  { id: "profissionais", label: "Profissionais", icon: UserCheck },
  { id: "pacotes", label: "Pacotes", icon: Package },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "ai", label: "AI Growth", icon: Brain },
];

export default function DemoLayout({
  activeSection,
  setActiveSection,
  children,
}) {
  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Studio Demo</p>
              <p className="text-xs text-slate-400">Dados de exemplo</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeSection === item.id
                  ? "bg-rose-500 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.id === "ai" && (
                <span className="ml-auto text-xs bg-rose-400/20 text-rose-300 px-1.5 py-0.5 rounded-full">
                  IA
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400 text-center">
            <p className="font-medium text-slate-300 mb-1">Modo Demo Ativo</p>
            <p>Explore sem limitações</p>
          </div>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
    </div>
  );
}
