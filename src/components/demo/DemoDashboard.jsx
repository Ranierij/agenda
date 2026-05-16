import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Brain,
  ArrowUpRight,
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

const revenueData = [
  { mes: "Out", receita: 12400 },
  { mes: "Nov", receita: 14200 },
  { mes: "Dez", receita: 15800 },
  { mes: "Jan", receita: 13900 },
  { mes: "Fev", receita: 17200 },
  { mes: "Mar", receita: 18450 },
];

const agendamentosHoje = [
  {
    hora: "09:00",
    cliente: "Maria Silva",
    servico: "Corte + Escova",
    profissional: "Ana",
    status: "confirmado",
  },
  {
    hora: "10:30",
    cliente: "Joana Pereira",
    servico: "Coloração",
    profissional: "Carla",
    status: "confirmado",
  },
  {
    hora: "11:00",
    cliente: "Fernanda Lima",
    servico: "Manicure",
    profissional: "Paula",
    status: "chegou",
  },
  {
    hora: "14:00",
    cliente: "Beatriz Costa",
    servico: "Hidratação",
    profissional: "Ana",
    status: "agendado",
  },
  {
    hora: "15:30",
    cliente: "Camila Santos",
    servico: "Corte",
    profissional: "Carla",
    status: "agendado",
  },
];

const statusColors = {
  confirmado: "bg-blue-100 text-blue-700",
  chegou: "bg-green-100 text-green-700",
  agendado: "bg-slate-100 text-slate-600",
};

export default function DemoDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm">Domingo, 6 de Abril de 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Agendamentos Hoje",
            value: "24",
            icon: Calendar,
            color: "text-rose-500",
            bg: "bg-rose-50",
            change: "+3 vs ontem",
          },
          {
            label: "Receita do Mês",
            value: "R$ 18.450",
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            change: "+12% vs anterior",
          },
          {
            label: "Clientes Ativos",
            value: "312",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50",
            change: "+18 esse mês",
          },
          {
            label: "Taxa de Retorno",
            value: "78%",
            icon: TrendingUp,
            color: "text-purple-500",
            bg: "bg-purple-50",
            change: "+5% vs anterior",
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
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => [
                    `R$ ${v.toLocaleString("pt-BR")}`,
                    "Receita",
                  ]}
                />
                <Bar dataKey="receita" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Widget */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-rose-400" />
              AI Growth Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { text: "8 clientes inativos há +45 dias", urgency: "alta" },
              { text: "Terças 14h-16h: 3 slots vagos", urgency: "media" },
              {
                text: "Pacote facial: 60% de conversão",
                urgency: "oportunidade",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-3 text-sm">
                <div className="flex items-start gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      item.urgency === "alta"
                        ? "bg-red-400"
                        : item.urgency === "media"
                          ? "bg-yellow-400"
                          : "bg-emerald-400"
                    }`}
                  />
                  <p className="text-slate-200 leading-snug">{item.text}</p>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white text-xs py-2 rounded-lg transition-colors font-medium">
              Ver todas as oportunidades →
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Agenda Hoje */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-900">
            Próximos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agendamentosHoje.map((ag, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-14 text-sm font-mono font-semibold text-slate-700">
                  {ag.hora}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {ag.cliente}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ag.servico} • {ag.profissional}
                  </p>
                </div>
                <Badge
                  className={`text-xs ${statusColors[ag.status]} border-0`}
                >
                  {ag.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
