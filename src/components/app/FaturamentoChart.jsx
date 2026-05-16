import React, { useEffect, useState } from "react";
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
import { TrendingUp } from "lucide-react";

function getUltimos6Meses() {
  const meses = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    meses.push({
      key: d.toISOString().substring(0, 7),
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    });
  }
  return meses;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-1.5 text-slate-500">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: p.color }}
            />
            {p.name}
          </span>
          <span className="font-medium text-slate-800">
            R$ {Number(p.value).toLocaleString("pt-BR")}
          </span>
        </div>
      ))}
      {payload.length > 1 && (
        <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between font-semibold text-slate-800">
          <span>Total</span>
          <span>R$ {total.toLocaleString("pt-BR")}</span>
        </div>
      )}
    </div>
  );
};

export default function FaturamentoChart() {
  const { company_id, cor_primaria } = useCompany();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totais, setTotais] = useState({ servicos: 0, pacotes: 0 });

  const primaryColor = cor_primaria || "#f43f5e";
  const secondaryColor = "#8b5cf6";

  useEffect(() => {
    if (!company_id) return;
    const meses = getUltimos6Meses();
    const mesAtual = new Date().toISOString().substring(0, 7);

    Promise.all([
      supabaseApi.entities.Agendamento.filter({ company_id }, "-data", 500).catch(
        () => [],
      ),
      supabaseApi.entities.PacoteCliente.filter(
        { company_id },
        "-data_inicio",
        300,
      ).catch(() => []),
    ]).then(([agendamentos, pacotesCliente]) => {
      const mapServicos = {};
      const mapPacotes = {};
      meses.forEach((m) => {
        mapServicos[m.key] = 0;
        mapPacotes[m.key] = 0;
      });

      agendamentos
        .filter(
          (a) =>
            a.status === "concluido" &&
            a.data &&
            a.forma_pagamento !== "Pacote",
        )
        .forEach((a) => {
          const m = a.data.substring(0, 7);
          if (mapServicos[m] !== undefined) mapServicos[m] += a.valor || 0;
        });

      pacotesCliente
        .filter((p) => p.data_inicio)
        .forEach((p) => {
          const m = p.data_inicio.substring(0, 7);
          if (mapPacotes[m] !== undefined) mapPacotes[m] += p.valor_pago || 0;
        });

      const chartData = meses.map((m) => ({
        mes: m.label,
        Serviços: Math.round(mapServicos[m.key] * 100) / 100,
        Pacotes: Math.round(mapPacotes[m.key] * 100) / 100,
      }));

      const mesServicos = Math.round(mapServicos[mesAtual] * 100) / 100;
      const mesPacotes = Math.round(mapPacotes[mesAtual] * 100) / 100;

      setData(chartData);
      setTotais({ servicos: mesServicos, pacotes: mesPacotes });
      setLoading(false);
    });
  }, [company_id]);

  const totalMes = totais.servicos + totais.pacotes;
  const hasData = data.some((d) => d.Serviços > 0 || d.Pacotes > 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: primaryColor }} />
              Faturamento do Mês
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Serviços realizados + Pacotes vendidos
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Total do mês</p>
              <p className="text-xl font-bold text-slate-900">
                R${" "}
                {loading
                  ? "—"
                  : totalMes.toLocaleString("pt-BR", {
                      minimumFractionDigits: 0,
                    })}
              </p>
            </div>
          </div>
        </div>

        {!loading && (
          <div className="flex gap-3 mt-3">
            <div
              className="flex-1 rounded-xl p-3"
              style={{ backgroundColor: primaryColor + "12" }}
            >
              <p className="text-xs text-slate-500">Serviços</p>
              <p
                className="text-base font-bold mt-0.5"
                style={{ color: primaryColor }}
              >
                R${" "}
                {totais.servicos.toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
            <div
              className="flex-1 rounded-xl p-3"
              style={{ backgroundColor: secondaryColor + "12" }}
            >
              <p className="text-xs text-slate-500">Pacotes</p>
              <p
                className="text-base font-bold mt-0.5"
                style={{ color: secondaryColor }}
              >
                R${" "}
                {totais.pacotes.toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        {loading ? (
          <div className="h-44 flex items-center justify-center">
            <div
              className="w-7 h-7 border-4 border-slate-200 rounded-full animate-spin"
              style={{ borderTopColor: primaryColor }}
            />
          </div>
        ) : !hasData ? (
          <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
            <TrendingUp className="w-8 h-8 opacity-30" />
            <p>Nenhum faturamento registrado ainda.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={data} barCategoryGap="30%" barGap={3}>
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
                cursor={{ fill: "#f8fafc", radius: 6 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }}
              />
              <Bar
                dataKey="Serviços"
                fill={primaryColor}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Pacotes"
                fill={secondaryColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
