import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import FaturamentoDetalhadoChart from "./FaturamentoDetalhadoChart";

const COLORS_PROF = [
  "#f43f5e",
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export default function AppRelatorios() {
  const { company_id, loading: loadingUser } = useCompany();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company_id) return;
    Promise.all([
      supabaseApi.entities.Agendamento.filter({ company_id }, "-data", 500).catch(
        () => [],
      ),
      supabaseApi.entities.Cliente.filter({ company_id }, "nome", 500).catch(
        () => [],
      ),
    ]).then(([ags, cls]) => {
      setAgendamentos(ags);
      setClientes(cls);
      setLoading(false);
    });
  }, [company_id]);

  // Por mês
  const byMonth = agendamentos.reduce((acc, a) => {
    if (!a.data) return acc;
    const m = a.data.substring(0, 7);
    if (!acc[m])
      acc[m] = { mes: m, total: 0, concluidos: 0, cancelados: 0, receita: 0 };
    acc[m].total += 1;
    if (a.status === "concluido") {
      acc[m].concluidos += 1;
      acc[m].receita += a.valor || 0;
    }
    if (a.status === "cancelado") acc[m].cancelados += 1;
    return acc;
  }, {});
  const chartData = Object.values(byMonth)
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .slice(-6)
    .map((d) => ({
      ...d,
      mesLabel: new Date(d.mes + "-02").toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      }),
    }));

  // Top serviços
  const byServico = agendamentos.reduce((acc, a) => {
    if (a.servico_nome && a.status === "concluido") {
      if (!acc[a.servico_nome])
        acc[a.servico_nome] = { nome: a.servico_nome, qtd: 0, receita: 0 };
      acc[a.servico_nome].qtd += 1;
      acc[a.servico_nome].receita += a.valor || 0;
    }
    return acc;
  }, {});
  const topServicos = Object.values(byServico)
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 10);

  // Top profissionais
  const byProf = agendamentos.reduce((acc, a) => {
    if (a.profissional_nome && a.status === "concluido") {
      if (!acc[a.profissional_nome])
        acc[a.profissional_nome] = {
          nome: a.profissional_nome,
          qtd: 0,
          receita: 0,
        };
      acc[a.profissional_nome].qtd += 1;
      acc[a.profissional_nome].receita += a.valor || 0;
    }
    return acc;
  }, {});
  const topProfissionais = Object.values(byProf)
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 10);

  const totalConcluidos = agendamentos.filter(
    (a) => a.status === "concluido",
  ).length;
  const receitaTotal = agendamentos
    .filter((a) => a.status === "concluido")
    .reduce((s, a) => s + (a.valor || 0), 0);
  const ticketMedio = totalConcluidos > 0 ? receitaTotal / totalConcluidos : 0;

  if (loadingUser || loading)
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-4 border-slate-200 rounded-full animate-spin"
          style={{ borderTopColor: "var(--company-primary, #f43f5e)" }}
        />
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
        <p className="text-slate-500 text-sm">
          Análise consolidada dos últimos 6 meses
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Atendimentos", value: totalConcluidos, icon: Calendar },
          {
            label: "Receita Total",
            value: `R$ ${receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
            icon: TrendingUp,
          },
          {
            label: "Ticket Médio",
            value: `R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
            icon: BarChart3,
          },
          {
            label: "Clientes Cadastrados",
            value: clientes.length,
            icon: Users,
          },
        ].map((kpi, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)15" }}
              >
                <kpi.icon
                  className="w-5 h-5"
                  style={{ color: "var(--company-primary, #f43f5e)" }}
                />
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Receita e volume */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Receita & Volume Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Sem dados consolidados ainda.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mesLabel" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="receita"
                  fill="var(--company-primary, #f43f5e)"
                  radius={[4, 4, 0, 0]}
                  name="Receita (R$)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="concluidos"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  name="Atendimentos"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Faturamento detalhado por colaborador */}
      <FaturamentoDetalhadoChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Top Serviços por Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topServicos.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Nenhum serviço concluído.
              </div>
            ) : (
              <div className="space-y-2">
                {topServicos.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {s.nome}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.qtd} atendimentos
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">
                      R${" "}
                      {s.receita.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Colaboradores — Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProfissionais.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Nenhum atendimento por profissional ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {topProfissionais.map((p, i) => {
                  const maxReceita = topProfissionais[0]?.receita || 1;
                  const pct = (p.receita / maxReceita) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{
                              backgroundColor:
                                COLORS_PROF[i % COLORS_PROF.length],
                            }}
                          >
                            {p.nome[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {p.nome}
                            </p>
                            <p className="text-xs text-slate-500">
                              {p.qtd} atend.
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-emerald-600">
                          R${" "}
                          {p.receita.toLocaleString("pt-BR", {
                            minimumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              COLORS_PROF[i % COLORS_PROF.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
