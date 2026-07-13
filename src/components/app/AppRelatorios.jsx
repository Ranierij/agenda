import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  Filter,
  TrendingUp,
  Users,
} from "lucide-react";
import { jsPDF } from "jspdf";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const STATUS_LABELS = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  chegou: "Chegou",
  concluido: "Concluido",
  faltou: "Faltou",
  cancelado: "Cancelado",
};

const STATUS_BADGES = {
  agendado: "bg-blue-50 text-blue-700",
  confirmado: "bg-indigo-50 text-indigo-700",
  chegou: "bg-amber-50 text-amber-700",
  concluido: "bg-emerald-50 text-emerald-700",
  faltou: "bg-orange-50 text-orange-700",
  cancelado: "bg-rose-50 text-rose-700",
};

const currency = (value, digits = 2) =>
  `R$ ${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;

const shortDate = (date) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")
    : "-";

const monthLabel = (month) =>
  new Date(`${month}-02T12:00:00`).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });

const toDateInput = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const getMonthStart = () => {
  const now = new Date();
  return toDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
};

const getToday = () => toDateInput(new Date());

function summarize(items) {
  const concluidos = items.filter((a) => a.status === "concluido");
  const receita = concluidos.reduce((sum, a) => sum + Number(a.valor || 0), 0);
  const cancelados = items.filter((a) => a.status === "cancelado").length;
  const faltas = items.filter((a) => a.status === "faltou").length;

  return {
    total: items.length,
    concluidos: concluidos.length,
    cancelados,
    faltas,
    receita,
    ticketMedio: concluidos.length > 0 ? receita / concluidos.length : 0,
  };
}

function groupByProfessional(items) {
  return Object.values(
    items.reduce((acc, item) => {
      const nome = item.profissional_nome || "Sem colaborador";
      if (!acc[nome]) acc[nome] = { nome, items: [] };
      acc[nome].items.push(item);
      return acc;
    }, {}),
  )
    .map((group) => ({ ...group, resumo: summarize(group.items) }))
    .sort((a, b) => b.resumo.receita - a.resumo.receita);
}

function compact(value, limit = 28) {
  const text = String(value || "-");
  return text.length > limit ? `${text.slice(0, limit - 1)}...` : text;
}

export default function AppRelatorios() {
  const { company_id, loading: loadingUser } = useCompany();
  const { toast } = useToast();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(getToday());
  const [reportMode, setReportMode] = useState("total");
  const [selectedProfessional, setSelectedProfessional] = useState("todos");

  useEffect(() => {
    if (!company_id) return;

    let active = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const appointmentsQuery = supabase
          .from("Agendamento")
          .select("*")
          .eq("company_id", company_id)
          .gte("data", startDate)
          .lte("data", endDate)
          .order("data", { ascending: true })
          .order("hora", { ascending: true });

        const [appointmentsResult, clientsResult] = await Promise.all([
          appointmentsQuery,
          supabaseApi.entities.Cliente.filter({ company_id }, "nome", 5000)
            .catch(() => []),
        ]);

        if (appointmentsResult.error) throw appointmentsResult.error;
        if (!active) return;

        setAgendamentos(appointmentsResult.data || []);
        setClientes(clientsResult || []);
      } catch (error) {
        if (!active) return;
        setAgendamentos([]);
        toast({
          title: "Nao foi possivel carregar o relatorio",
          description: error?.message || "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [company_id, endDate, startDate, toast]);

  const profissionais = useMemo(
    () =>
      [
        ...new Set(
          agendamentos.map((a) => a.profissional_nome || "Sem colaborador"),
        ),
      ].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [agendamentos],
  );

  useEffect(() => {
    if (
      selectedProfessional !== "todos" &&
      !profissionais.includes(selectedProfessional)
    ) {
      setSelectedProfessional("todos");
    }
  }, [profissionais, selectedProfessional]);

  const visibleAppointments = useMemo(() => {
    if (reportMode !== "colaborador" || selectedProfessional === "todos") {
      return agendamentos;
    }

    return agendamentos.filter(
      (a) => (a.profissional_nome || "Sem colaborador") === selectedProfessional,
    );
  }, [agendamentos, reportMode, selectedProfessional]);

  const summary = useMemo(
    () => summarize(visibleAppointments),
    [visibleAppointments],
  );

  const professionalGroups = useMemo(
    () => groupByProfessional(visibleAppointments),
    [visibleAppointments],
  );

  const chartData = useMemo(() => {
    const byMonth = visibleAppointments.reduce((acc, a) => {
      if (!a.data) return acc;
      const month = a.data.substring(0, 7);
      if (!acc[month]) {
        acc[month] = {
          mes: month,
          mesLabel: monthLabel(month),
          total: 0,
          concluidos: 0,
          cancelados: 0,
          receita: 0,
        };
      }
      acc[month].total += 1;
      if (a.status === "concluido") {
        acc[month].concluidos += 1;
        acc[month].receita += Number(a.valor || 0);
      }
      if (a.status === "cancelado") acc[month].cancelados += 1;
      return acc;
    }, {});

    return Object.values(byMonth).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [visibleAppointments]);

  const topServicos = useMemo(() => {
    const byService = visibleAppointments.reduce((acc, a) => {
      if (!a.servico_nome || a.status !== "concluido") return acc;
      if (!acc[a.servico_nome]) {
        acc[a.servico_nome] = { nome: a.servico_nome, qtd: 0, receita: 0 };
      }
      acc[a.servico_nome].qtd += 1;
      acc[a.servico_nome].receita += Number(a.valor || 0);
      return acc;
    }, {});

    return Object.values(byService)
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 10);
  }, [visibleAppointments]);

  const exportPdf = () => {
    if (visibleAppointments.length === 0) {
      toast({
        title: "Sem dados para exportar",
        description: "Selecione um periodo com agendamentos para gerar o PDF.",
      });
      return;
    }

    setExporting(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      let y = 14;

      const addPageIfNeeded = (height = 8) => {
        if (y + height > pageHeight - margin) {
          doc.addPage();
          y = 14;
        }
      };

      const line = (label, value, x = margin) => {
        addPageIfNeeded(8);
        doc.setFont("helvetica", "bold");
        doc.text(label, x, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(value), x + 42, y);
        y += 6;
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Relatorio de agendamentos", margin, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Periodo: ${shortDate(startDate)} ate ${shortDate(endDate)}`, margin, y);
      doc.text(
        `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
        pageWidth - margin,
        y,
        { align: "right" },
      );
      y += 8;

      line("Visualizacao", reportMode === "colaborador" ? "Por colaborador" : "Total");
      if (reportMode === "colaborador") {
        line("Colaborador", selectedProfessional === "todos" ? "Todos" : selectedProfessional);
      }
      line("Atendimentos", summary.total);
      line("Concluidos", summary.concluidos);
      line("Cancelados", summary.cancelados);
      line("Faltas", summary.faltas);
      line("Receita", currency(summary.receita));
      line("Ticket medio", currency(summary.ticketMedio));
      y += 4;

      if (reportMode === "colaborador") {
        addPageIfNeeded(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Resumo por colaborador", margin, y);
        y += 6;

        doc.setFontSize(8);
        professionalGroups.forEach((group) => {
          addPageIfNeeded(7);
          doc.setFont("helvetica", "normal");
          doc.text(compact(group.nome, 32), margin, y);
          doc.text(`${group.resumo.concluidos} concl.`, margin + 62, y);
          doc.text(`${group.resumo.cancelados} canc.`, margin + 92, y);
          doc.text(currency(group.resumo.receita), margin + 122, y);
          doc.text(currency(group.resumo.ticketMedio), margin + 158, y);
          y += 5;
        });
        y += 4;
      }

      addPageIfNeeded(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Detalhamento do periodo", margin, y);
      y += 7;

      const columns = [
        { title: "Data", x: margin, w: 20 },
        { title: "Hora", x: margin + 22, w: 16 },
        { title: "Cliente", x: margin + 40, w: 42 },
        { title: "Servico", x: margin + 84, w: 44 },
        { title: "Colaborador", x: margin + 130, w: 42 },
        { title: "Status", x: margin + 174, w: 28 },
        { title: "Pagamento", x: margin + 204, w: 28 },
        { title: "Valor", x: margin + 234, w: 22 },
      ];

      const drawHeader = () => {
        addPageIfNeeded(8);
        doc.setFillColor(245, 247, 250);
        doc.rect(margin - 1, y - 4, pageWidth - margin * 2 + 2, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        columns.forEach((col) => doc.text(col.title, col.x, y));
        y += 6;
      };

      drawHeader();
      doc.setFont("helvetica", "normal");

      visibleAppointments.forEach((a) => {
        if (y + 6 > pageHeight - margin) {
          doc.addPage();
          y = 14;
          drawHeader();
          doc.setFont("helvetica", "normal");
        }

        const values = [
          shortDate(a.data),
          a.hora || "-",
          compact(a.cliente_nome, 24),
          compact(a.servico_nome, 24),
          compact(a.profissional_nome || "Sem colaborador", 24),
          STATUS_LABELS[a.status] || a.status || "-",
          compact(a.forma_pagamento || "-", 14),
          currency(a.valor),
        ];

        columns.forEach((col, index) => {
          doc.text(String(values[index]), col.x, y, {
            maxWidth: col.w,
          });
        });
        y += 5;
      });

      doc.save(`relatorio-${startDate}-${endDate}.pdf`);
      toast({ title: "PDF gerado com sucesso!" });
    } catch (error) {
      toast({
        title: "Nao foi possivel gerar o PDF",
        description: error?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loadingUser || loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-4 border-slate-200 rounded-full animate-spin"
          style={{ borderTopColor: "var(--company-primary, #f43f5e)" }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatorios</h1>
          <p className="text-slate-500 text-sm">
            Analise o periodo por total geral ou por colaborador.
          </p>
        </div>
        <Button
          onClick={exportPdf}
          disabled={exporting || visibleAppointments.length === 0}
          className="w-full sm:w-auto"
          style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? "Gerando PDF..." : "Salvar em PDF"}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros do relatorio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">Inicio</span>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">Fim</span>
              <Input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                Visualizacao
              </span>
              <select
                value={reportMode}
                onChange={(event) => setReportMode(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="total">Total</option>
                <option value="colaborador">Por colaborador</option>
              </select>
            </label>
            <label className="space-y-1.5 xl:col-span-2">
              <span className="text-xs font-medium text-slate-500">
                Colaborador
              </span>
              <select
                value={selectedProfessional}
                disabled={reportMode !== "colaborador"}
                onChange={(event) => setSelectedProfessional(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="todos">Todos os colaboradores</option>
                {profissionais.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Agendamentos", value: summary.total, icon: Calendar },
          {
            label: "Receita no periodo",
            value: currency(summary.receita, 0),
            icon: TrendingUp,
          },
          {
            label: "Ticket medio",
            value: currency(summary.ticketMedio, 0),
            icon: BarChart3,
          },
          {
            label: "Clientes cadastrados",
            value: clientes.length,
            icon: Users,
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-0 shadow-sm">
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
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                {kpi.value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Concluidos", summary.concluidos, "text-emerald-700"],
          ["Cancelados", summary.cancelados, "text-rose-700"],
          ["Faltas", summary.faltas, "text-orange-700"],
          ["Colaboradores", professionalGroups.length, "text-slate-700"],
        ].map(([label, value, color]) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Receita e volume no periodo</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Sem dados para o periodo selecionado.
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

      {reportMode === "colaborador" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumo por colaborador</CardTitle>
          </CardHeader>
          <CardContent>
            {professionalGroups.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Nenhum colaborador no periodo selecionado.
              </div>
            ) : (
              <div className="space-y-3">
                {professionalGroups.map((group, index) => (
                  <div
                    key={group.nome}
                    className="rounded-lg border border-slate-100 p-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{
                            backgroundColor:
                              COLORS_PROF[index % COLORS_PROF.length],
                          }}
                        >
                          {group.nome[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {group.nome}
                          </p>
                          <p className="text-xs text-slate-500">
                            {group.resumo.total} agendamentos,{" "}
                            {group.resumo.concluidos} concluidos
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-slate-400">Receita</p>
                          <p className="font-bold text-emerald-700">
                            {currency(group.resumo.receita)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Ticket</p>
                          <p className="font-semibold text-slate-800">
                            {currency(group.resumo.ticketMedio)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Cancelados</p>
                          <p className="font-semibold text-rose-700">
                            {group.resumo.cancelados}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Faltas</p>
                          <p className="font-semibold text-orange-700">
                            {group.resumo.faltas}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top servicos por receita</CardTitle>
          </CardHeader>
          <CardContent>
            {topServicos.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Nenhum servico concluido no periodo.
              </div>
            ) : (
              <div className="space-y-2">
                {topServicos.map((service) => (
                  <div
                    key={service.nome}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {service.nome}
                      </p>
                      <p className="text-xs text-slate-500">
                        {service.qtd} atendimentos
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">
                      {currency(service.receita)}
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
              Colaboradores por receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {professionalGroups.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Nenhum atendimento por colaborador no periodo.
              </div>
            ) : (
              <div className="space-y-3">
                {professionalGroups.slice(0, 10).map((group, index) => {
                  const maxReceita = professionalGroups[0]?.resumo.receita || 1;
                  const pct =
                    maxReceita > 0
                      ? (group.resumo.receita / maxReceita) * 100
                      : 0;

                  return (
                    <div key={group.nome} className="space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{
                              backgroundColor:
                                COLORS_PROF[index % COLORS_PROF.length],
                            }}
                          >
                            {group.nome[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {group.nome}
                            </p>
                            <p className="text-xs text-slate-500">
                              {group.resumo.concluidos} atend.
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                          {currency(group.resumo.receita, 0)}
                        </p>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              COLORS_PROF[index % COLORS_PROF.length],
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

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Detalhamento do periodo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visibleAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Nenhum agendamento encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-400 border-b">
                    <th className="py-3 pr-3 font-semibold">Data</th>
                    <th className="py-3 pr-3 font-semibold">Hora</th>
                    <th className="py-3 pr-3 font-semibold">Cliente</th>
                    <th className="py-3 pr-3 font-semibold">Servico</th>
                    <th className="py-3 pr-3 font-semibold">Colaborador</th>
                    <th className="py-3 pr-3 font-semibold">Status</th>
                    <th className="py-3 pr-3 font-semibold">Pagamento</th>
                    <th className="py-3 pr-3 font-semibold text-right">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visibleAppointments.map((appointment) => (
                    <tr key={appointment.id} className="text-slate-700">
                      <td className="py-3 pr-3 whitespace-nowrap">
                        {shortDate(appointment.data)}
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        {appointment.hora || "-"}
                      </td>
                      <td className="py-3 pr-3 font-medium text-slate-900">
                        {appointment.cliente_nome || "-"}
                      </td>
                      <td className="py-3 pr-3">
                        {appointment.servico_nome || "-"}
                      </td>
                      <td className="py-3 pr-3">
                        {appointment.profissional_nome || "Sem colaborador"}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge
                          className={`border-0 ${STATUS_BADGES[appointment.status] || "bg-slate-50 text-slate-700"}`}
                        >
                          {STATUS_LABELS[appointment.status] ||
                            appointment.status ||
                            "-"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3">
                        {appointment.forma_pagamento || "-"}
                      </td>
                      <td className="py-3 pr-3 text-right font-semibold text-slate-900">
                        {currency(appointment.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
