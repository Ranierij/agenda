import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
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

const revenueData = [
  { mes: "Out", receita: 12400, despesas: 4200 },
  { mes: "Nov", receita: 14200, despesas: 4800 },
  { mes: "Dez", receita: 15800, despesas: 5100 },
  { mes: "Jan", receita: 13900, despesas: 4600 },
  { mes: "Fev", receita: 17200, despesas: 5400 },
  { mes: "Mar", receita: 18450, despesas: 5800 },
];

const servicosPie = [
  { name: "Coloração", value: 35, color: "#f43f5e" },
  { name: "Corte", value: 25, color: "#8b5cf6" },
  { name: "Escova", value: 18, color: "#3b82f6" },
  { name: "Manicure", value: 14, color: "#10b981" },
  { name: "Outros", value: 8, color: "#f59e0b" },
];

const transacoes = [
  {
    data: "06/04",
    cliente: "Maria Silva",
    servico: "Corte + Escova",
    valor: 280,
    forma: "Pix",
  },
  {
    data: "06/04",
    cliente: "Joana Pereira",
    servico: "Coloração",
    valor: 380,
    forma: "Cartão",
  },
  {
    data: "05/04",
    cliente: "Fernanda Lima",
    servico: "Manicure",
    valor: 80,
    forma: "Dinheiro",
  },
  {
    data: "05/04",
    cliente: "Beatriz Costa",
    servico: "Hidratação",
    valor: 150,
    forma: "Pix",
  },
  {
    data: "04/04",
    cliente: "Camila Santos",
    servico: "Corte",
    valor: 120,
    forma: "Cartão",
  },
  {
    data: "04/04",
    cliente: "Renata Alves",
    servico: "Escova",
    valor: 100,
    forma: "Pix",
  },
];

const formaColors = {
  Pix: "bg-emerald-100 text-emerald-700",
  Cartão: "bg-blue-100 text-blue-700",
  Dinheiro: "bg-amber-100 text-amber-700",
};

export default function DemoFinanceiro() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
        <p className="text-slate-500 text-sm">Visão geral — Março 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Receita Bruta",
            value: "R$ 18.450",
            change: "+12%",
            up: true,
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: "Despesas",
            value: "R$ 5.800",
            change: "+7%",
            up: false,
            icon: TrendingDown,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Lucro Líquido",
            value: "R$ 12.650",
            change: "+15%",
            up: true,
            icon: TrendingUp,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Ticket Médio",
            value: "R$ 196",
            change: "+8%",
            up: true,
            icon: ShoppingBag,
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
                <span
                  className={`text-xs font-semibold ${kpi.up ? "text-emerald-600" : "text-red-500"}`}
                >
                  {kpi.change}
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receita vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Bar
                  dataKey="receita"
                  fill="#f43f5e"
                  radius={[3, 3, 0, 0]}
                  name="Receita"
                />
                <Bar
                  dataKey="despesas"
                  fill="#94a3b8"
                  radius={[3, 3, 0, 0]}
                  name="Despesas"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mix de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={servicosPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  dataKey="value"
                >
                  {servicosPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
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
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    ></div>
                    <span className="text-slate-600">{s.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {s.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-50">
            {transacoes.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t.cliente}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.servico} • {t.data}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-xs border-0 ${formaColors[t.forma]}`}>
                    {t.forma}
                  </Badge>
                  <span className="font-bold text-slate-900 text-sm">
                    R$ {t.valor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
