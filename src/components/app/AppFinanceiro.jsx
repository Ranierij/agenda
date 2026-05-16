import React, { useEffect, useState, useMemo } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  CalendarDays,
  Users,
  Ticket,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FORMA_COLORS = {
  Pix: "bg-emerald-100 text-emerald-700",
  Cartão: "bg-blue-100 text-blue-700",
  Dinheiro: "bg-amber-100 text-amber-700",
  Transferência: "bg-purple-100 text-purple-700",
  Pacote: "bg-rose-100 text-rose-700",
};

const fmt = (v) =>
  `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function ColaboradorRow({ nome, atendimentos }) {
  const [open, setOpen] = useState(false);
  const total = atendimentos.reduce((s, a) => s + (a.valor || 0), 0);
  const ticket = atendimentos.length > 0 ? total / atendimentos.length : 0;

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
          >
            {(nome || "?")[0].toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">
              {nome || "Sem profissional"}
            </p>
            <p className="text-xs text-slate-500">
              {atendimentos.length} atendimento
              {atendimentos.length !== 1 ? "s" : ""} · ticket médio{" "}
              {fmt(ticket)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900">{fmt(total)}</span>
          {open ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="divide-y divide-slate-50 bg-slate-50/60 px-4">
          {atendimentos.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm text-slate-800 font-medium">
                  {a.cliente_nome}
                </p>
                <p className="text-xs text-slate-500">
                  {a.servico_nome} ·{" "}
                  {a.data
                    ? new Date(a.data + "T12:00:00").toLocaleDateString(
                        "pt-BR",
                        { day: "2-digit", month: "short" },
                      )
                    : "—"}
                  {a.hora ? ` às ${a.hora}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {a.forma_pagamento && (
                  <Badge
                    className={`text-xs border-0 ${FORMA_COLORS[a.forma_pagamento] || "bg-slate-100 text-slate-600"}`}
                  >
                    {a.forma_pagamento}
                  </Badge>
                )}
                <span className="text-sm font-bold text-slate-900">
                  {fmt(a.valor)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppFinanceiro() {
  const { company_id, loading: loadingUser } = useCompany();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (!company_id) return;
    supabaseApi.entities.Agendamento.filter(
      { company_id, status: "concluido" },
      "-data",
      1000,
    )
      .then((ags) => {
        setAgendamentos(ags);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [company_id]);

  const mesAtual = new Date().toISOString().substring(0, 7);

  const agendamentosDia = useMemo(
    () => agendamentos.filter((a) => a.data === selectedDate),
    [agendamentos, selectedDate],
  );

  const agendamentosMes = useMemo(
    () => agendamentos.filter((a) => a.data?.startsWith(mesAtual)),
    [agendamentos, mesAtual],
  );

  const totalDia = useMemo(
    () => agendamentosDia.reduce((s, a) => s + (a.valor || 0), 0),
    [agendamentosDia],
  );

  const receitaMes = useMemo(
    () => agendamentosMes.reduce((s, a) => s + (a.valor || 0), 0),
    [agendamentosMes],
  );

  const receitaTotal = useMemo(
    () => agendamentos.reduce((s, a) => s + (a.valor || 0), 0),
    [agendamentos],
  );

  const ticketMedio =
    agendamentos.length > 0 ? receitaTotal / agendamentos.length : 0;
  const ticketMedioDia =
    agendamentosDia.length > 0 ? totalDia / agendamentosDia.length : 0;

  // Por colaborador no dia selecionado
  const porColaboradorDia = useMemo(() => {
    const map = {};
    agendamentosDia.forEach((a) => {
      const key = a.profissional_nome || "__sem__";
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return Object.entries(map).sort((a, b) => {
      const tA = a[1].reduce((s, x) => s + (x.valor || 0), 0);
      const tB = b[1].reduce((s, x) => s + (x.valor || 0), 0);
      return tB - tA;
    });
  }, [agendamentosDia]);

  // Gráfico mensal
  const chartData = useMemo(() => {
    const byMonth = {};
    agendamentos.forEach((a) => {
      if (!a.data) return;
      const m = a.data.substring(0, 7);
      byMonth[m] = (byMonth[m] || 0) + (a.valor || 0);
    });
    return Object.entries(byMonth)
      .sort()
      .slice(-6)
      .map(([mes, receita]) => ({
        mes: new Date(mes + "-02").toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
        receita,
      }));
  }, [agendamentos]);

  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString(
    "pt-BR",
    { weekday: "long", day: "numeric", month: "long" },
  );

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
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
        <p className="text-slate-500 text-sm">
          {agendamentos.length} atendimentos concluídos no total
        </p>
      </div>

      {/* KPIs do mês */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Receita do Mês",
            value: fmt(receitaMes),
            icon: TrendingUp,
            brand: true,
            sub: `${agendamentosMes.length} atend. esse mês`,
          },
          {
            label: "Total Geral",
            value: fmt(receitaTotal),
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            sub: "todos os períodos",
          },
          {
            label: "Total de Agendamentos",
            value: agendamentos.length,
            icon: CalendarDays,
            color: "text-blue-500",
            bg: "bg-blue-50",
            sub: "atendimentos concluídos",
          },
          {
            label: "Ticket Médio Geral",
            value: fmt(ticketMedio),
            icon: Ticket,
            color: "text-purple-500",
            bg: "bg-purple-50",
            sub: "por atendimento",
          },
        ].map((kpi, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              {kpi.brand ? (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--company-primary, #f43f5e) 15%, transparent)",
                  }}
                >
                  <kpi.icon
                    className="w-5 h-5"
                    style={{ color: "var(--company-primary, #f43f5e)" }}
                  />
                </div>
              ) : (
                <div
                  className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}
                >
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              )}
              <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                {kpi.label}
              </p>
              <p className="text-xs text-slate-400">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seletor de dia + resumo do dia */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              Resumo do Dia
            </CardTitle>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm border rounded-lg px-3 py-1.5 text-slate-700 bg-white"
            />
          </div>
          <p className="text-xs text-slate-500 capitalize">{dateLabel}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* KPIs do dia */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-slate-900">
                {fmt(totalDia)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Total do Dia</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-slate-900">
                {agendamentosDia.length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Atendimentos</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-slate-900">
                {fmt(ticketMedioDia)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Ticket Médio</p>
            </div>
          </div>

          {/* Por colaborador */}
          {porColaboradorDia.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" /> Por Colaborador
              </p>
              {porColaboradorDia.map(([nome, ats]) => (
                <ColaboradorRow
                  key={nome}
                  nome={nome === "__sem__" ? "Sem profissional" : nome}
                  atendimentos={ats}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhum atendimento concluído neste dia.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico mensal */}
      {chartData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receita por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) =>
                    `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  }
                />
                <Bar
                  dataKey="receita"
                  fill="var(--company-primary, #f43f5e)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
