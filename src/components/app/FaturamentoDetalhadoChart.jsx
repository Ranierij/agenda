import React, { useEffect, useState, useMemo } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Users } from "lucide-react";

const COLORS = [
  "#f43f5e",
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

function getUltimos6Meses() {
  const meses = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    meses.push({
      key: d.toISOString().substring(0, 7),
      label: d
        .toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
        .replace(".", ""),
    });
  }
  return meses;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3 text-xs max-w-56">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload
        .filter((p) => p.value > 0)
        .map((p) => (
          <div
            key={p.dataKey}
            className="flex items-center justify-between gap-3 py-0.5"
          >
            <span className="flex items-center gap-1.5 text-slate-500 truncate">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <span className="truncate">{p.name}</span>
            </span>
            <span className="font-medium text-slate-800 flex-shrink-0">
              R${" "}
              {Number(p.value).toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
        ))}
      <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between font-semibold text-slate-800">
        <span>Total</span>
        <span>
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
};

export default function FaturamentoDetalhadoChart() {
  const { company_id, cor_primaria } = useCompany();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const meses = useMemo(() => getUltimos6Meses(), []);
  const [tab, setTab] = useState("mensal"); // 'mensal' | 'colaborador'

  useEffect(() => {
    if (!company_id) return;
    supabaseApi.entities.Agendamento.filter({ company_id }, "-data", 1000)
      .then(setAgendamentos)
      .catch(() => setAgendamentos([]))
      .finally(() => setLoading(false));
  }, [company_id]);

  // Dados: faturamento mensal por colaborador (barras empilhadas)
  const { chartData, profissionais } = useMemo(() => {
    const concluidos = agendamentos.filter(
      (a) => a.status === "concluido" && a.data,
    );
    const profs = [
      ...new Set(
        concluidos.map((a) => a.profissional_nome || "Sem profissional"),
      ),
    ];

    const map = {};
    meses.forEach((m) => {
      map[m.key] = { mes: m.label };
      profs.forEach((p) => {
        map[m.key][p] = 0;
      });
    });

    concluidos.forEach((a) => {
      const m = a.data.substring(0, 7);
      if (map[m]) {
        const p = a.profissional_nome || "Sem profissional";
        map[m][p] = (map[m][p] || 0) + (a.valor || 0);
      }
    });

    return { chartData: Object.values(map), profissionais: profs };
  }, [agendamentos, meses]);

  // Dados: ranking de colaboradores no mês atual
  const mesAtual = new Date().toISOString().substring(0, 7);
  const rankingColaboradores = useMemo(() => {
    const map = {};
    agendamentos
      .filter((a) => a.status === "concluido" && a.data?.startsWith(mesAtual))
      .forEach((a) => {
        const nome = a.profissional_nome || "Sem profissional";
        if (!map[nome]) map[nome] = { nome, receita: 0, atendimentos: 0 };
        map[nome].receita += a.valor || 0;
        map[nome].atendimentos += 1;
      });
    return Object.values(map).sort((a, b) => b.receita - a.receita);
  }, [agendamentos, mesAtual]);

  const totalMesAtual = rankingColaboradores.reduce((s, c) => s + c.receita, 0);
  const hasData = chartData.some((d) => profissionais.some((p) => d[p] > 0));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp
                className="w-4 h-4"
                style={{ color: cor_primaria || "#f43f5e" }}
              />
              Faturamento Detalhado
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Por colaborador — últimos 6 meses
            </p>
          </div>
          <div className="flex border rounded-lg overflow-hidden bg-slate-50 text-xs">
            <button
              onClick={() => setTab("mensal")}
              className={`px-3 py-1.5 transition-colors font-medium ${tab === "mensal" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setTab("colaborador")}
              className={`px-3 py-1.5 transition-colors font-medium ${tab === "colaborador" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
            >
              Por Colaborador
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div
              className="w-7 h-7 border-4 border-slate-200 rounded-full animate-spin"
              style={{ borderTopColor: cor_primaria || "#f43f5e" }}
            />
          </div>
        ) : !hasData ? (
          <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
            <TrendingUp className="w-8 h-8 opacity-30" />
            <p>Nenhum faturamento registrado ainda.</p>
          </div>
        ) : tab === "mensal" ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                }
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f8fafc" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }}
              />
              {profissionais.map((p, i) => (
                <Bar
                  key={p}
                  dataKey={p}
                  stackId="a"
                  fill={COLORS[i % COLORS.length]}
                  radius={
                    i === profissionais.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 font-medium">Mês atual</p>
              <p className="text-xs font-bold text-slate-700">
                Total: R${" "}
                {totalMesAtual.toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
            {rankingColaboradores.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Nenhum atendimento concluído no mês.
              </div>
            ) : (
              rankingColaboradores.map((c, i) => {
                const pct =
                  totalMesAtual > 0 ? (c.receita / totalMesAtual) * 100 : 0;
                return (
                  <div key={c.nome} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        >
                          {c.nome[0]}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {c.nome}
                        </span>
                        <span className="text-xs text-slate-400">
                          {c.atendimentos} atend.
                        </span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">
                        R${" "}
                        {c.receita.toLocaleString("pt-BR", {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
