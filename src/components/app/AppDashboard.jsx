import React, { useEffect, useState } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Link,
  Brain,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import FaturamentoChart from "./FaturamentoChart";
import FaturamentoDetalhadoChart from "./FaturamentoDetalhadoChart";
import AniversariantesCard from "./AniversariantesCard";
import NotificacoesPanel from "./NotificacoesPanel";

const STATUS_COLORS = {
  confirmado: "bg-blue-100 text-blue-700",
  concluido: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-red-100 text-red-700",
  chegou: "bg-amber-100 text-amber-700",
  agendado: "bg-slate-100 text-slate-600",
};

const COLORS_PIE_STATIC = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
];

export default function AppDashboard() {
  const { company_id, slug, loading: loadingUser, cor_primaria } = useCompany();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const COLORS_PIE = [cor_primaria || "#f43f5e", ...COLORS_PIE_STATIC];

  useEffect(() => {
    if (!company_id) return;
    Promise.all([
      supabaseApi.entities.Agendamento.filter({ company_id }, "-data", 300).catch(
        () => [],
      ),
      supabaseApi.entities.Cliente.filter({ company_id }, "nome", 500).catch(
        () => [],
      ),
    ]).then(([ags, cls]) => {
      setAgendamentos(ags);
      setClientes(cls);
      setLoading(false);
      // Envia lembretes do dia seguinte
      sendLembretesAmanha(ags, cls);
    });
  }, [company_id]);

  const sendLembretesAmanha = async (ags, cls) => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const amanhaStr = amanha.toISOString().split("T")[0];
    const paraLembrar = ags.filter(
      (a) =>
        a.data === amanhaStr &&
        a.status !== "cancelado" &&
        !a.confirmacao_enviada &&
        a.cliente_id,
    );
    for (const ag of paraLembrar) {
      const cliente = cls.find((c) => c.id === ag.cliente_id);
      if (!cliente?.email) continue;
      const dataFormatada = amanha.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      await supabaseApi.integrations.Core.SendEmail({
        to: cliente.email,
        subject: `Lembrete: seu agendamento é amanhã — ${ag.servico_nome}`,
        body: `Olá, ${ag.cliente_nome}!\n\nEste é um lembrete do seu agendamento de amanhã:\n\nServiço: ${ag.servico_nome}\nData: ${dataFormatada}\nHorário: ${ag.hora}${ag.profissional_nome ? `\nProfissional: ${ag.profissional_nome}` : ""}\n\nAguardamos você! 💅\n\nCaso precise remarcar, entre em contato conosco.`,
      }).catch(() => {});
      await supabaseApi.entities.Agendamento.update(ag.id, {
        confirmacao_enviada: true,
      }).catch(() => {});
    }
  };

  const hoje = new Date().toISOString().split("T")[0];
  const mesAtual = new Date().toISOString().substring(0, 7);
  const agendamentosHoje = agendamentos.filter(
    (a) => a.data === hoje && a.status !== "cancelado",
  );
  const receitaMes = agendamentos
    .filter((a) => a.status === "concluido" && a.data?.startsWith(mesAtual))
    .reduce((s, a) => s + (a.valor || 0), 0);
  const receitaTotal = agendamentos
    .filter((a) => a.status === "concluido")
    .reduce((s, a) => s + (a.valor || 0), 0);
  const taxaCancelamento =
    agendamentos.length > 0
      ? Math.round(
          (agendamentos.filter((a) => a.status === "cancelado").length /
            agendamentos.length) *
            100,
        )
      : 0;

  // Receita por mês (últimos 6 meses)
  const byMonth = agendamentos
    .filter((a) => a.status === "concluido")
    .reduce((acc, a) => {
      if (!a.data) return acc;
      const m = a.data.substring(0, 7);
      acc[m] = (acc[m] || 0) + (a.valor || 0);
      return acc;
    }, {});
  const chartMeses = Object.entries(byMonth)
    .sort()
    .slice(-6)
    .map(([m, v]) => ({
      mes: new Date(m + "-02").toLocaleDateString("pt-BR", { month: "short" }),
      receita: v,
    }));

  // Serviços mais populares
  const byServico = agendamentos.reduce((acc, a) => {
    if (a.servico_nome) acc[a.servico_nome] = (acc[a.servico_nome] || 0) + 1;
    return acc;
  }, {});
  const servicosPie = Object.entries(byServico)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Clientes recentes e inativos
  const limite30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const clientesAtivos = new Set(
    agendamentos.filter((a) => a.data >= limite30).map((a) => a.cliente_nome),
  );
  const clientesInativos = clientes.filter(
    (c) => !clientesAtivos.has(c.nome),
  ).length;

  if (loadingUser || loading)
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-4 border-slate-200 rounded-full animate-spin"
          style={{ borderTopColor: "var(--company-primary, #f43f5e)" }}
        />
      </div>
    );

  const slugLink = slug ? `${window.location.origin}/agendar/${slug}` : null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm capitalize">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {slugLink && (
          <div
            className="rounded-xl px-3 py-2 flex items-center gap-2 border"
            style={{
              backgroundColor: "var(--company-primary, #f43f5e)" + "15",
              borderColor: "var(--company-primary, #f43f5e)" + "40",
            }}
          >
            <Link
              className="w-3.5 h-3.5"
              style={{ color: "var(--company-primary, #f43f5e)" }}
            />
            <div>
              <p
                className="text-xs font-medium"
                style={{ color: "var(--company-primary, #f43f5e)" }}
              >
                Seu link público
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(slugLink);
                }}
                className="text-xs font-mono truncate max-w-40"
                style={{ color: "var(--company-primary, #f43f5e)" }}
              >
                /agendar/{slug}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Agendamentos Hoje",
            value: agendamentosHoje.length,
            icon: Calendar,
            color: "text-rose-500",
            bg: "bg-rose-50",
          },
          {
            label: "Receita do Mês",
            value: `R$ ${receitaMes.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: "Clientes Inativos 30d",
            value: clientesInativos,
            icon: Users,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: "Taxa Cancelamento",
            value: `${taxaCancelamento}%`,
            icon: TrendingUp,
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
        ].map((kpi, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}
                >
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Faturamento do Mês */}
      <FaturamentoChart />

      {/* Faturamento Detalhado por Colaborador */}
      <FaturamentoDetalhadoChart />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {chartMeses.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
                <p>Conclua agendamentos para ver a receita.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartMeses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR")}`}
                  />
                  <Bar
                    dataKey="receita"
                    fill="var(--company-primary, #f43f5e)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            {servicosPie.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-slate-400 text-sm text-center">
                <p>Nenhum serviço realizado ainda.</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={servicosPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      dataKey="value"
                    >
                      {servicosPie.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS_PIE[i % COLORS_PIE.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {servicosPie.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: COLORS_PIE[i % COLORS_PIE.length],
                          }}
                        />
                        <span className="text-slate-600 truncate">
                          {s.name}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {s.value}x
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agenda de Hoje */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Agenda de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agendamentosHoje.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum agendamento para hoje.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agendamentosHoje
                .sort((a, b) => (a.hora || "").localeCompare(b.hora || ""))
                .map((ag) => (
                  <div
                    key={ag.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50"
                  >
                    <span className="text-sm font-mono font-bold text-slate-700 w-12 flex-shrink-0">
                      {ag.hora}
                    </span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{
                        backgroundColor: "var(--company-primary, #f43f5e)",
                      }}
                    >
                      {ag.cliente_nome?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {ag.cliente_nome}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {ag.servico_nome}
                        {ag.profissional_nome
                          ? ` • ${ag.profissional_nome}`
                          : ""}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs border-0 flex-shrink-0 ${STATUS_COLORS[ag.status] || "bg-slate-100 text-slate-600"}`}
                    >
                      {ag.status}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificações de faltas */}
      <NotificacoesPanel />

      {/* Aniversariantes do Mês */}
      <AniversariantesCard clientes={clientes} />

      {/* AI insights rápidos */}
      {clientesInativos > 0 && (
        <Card
          className="border-0 shadow-sm text-white overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--company-primary, #f43f5e), color-mix(in srgb, var(--company-primary, #f43f5e) 70%, black))`,
          }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                AI Growth — {clientesInativos} clientes inativos detectados
              </p>
              <p className="text-xs text-white/70 mt-0.5">
                Acesse o módulo AI Growth para gerar mensagens de reativação
                personalizadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
