import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  X,
  Pencil,
  RefreshCw,
  Bell,
  LayoutGrid,
  List,
  UserX,
  Search,
  CheckCheck,
  Clock,
  Undo2,
} from "lucide-react";
import { ptBR } from "date-fns/locale";
import AgendaColunas from "./AgendaColunas";
import ListaEsperaModal from "./ListaEsperaModal";
import { useToast } from "@/components/ui/use-toast";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  findAppointmentConflict,
  isExactAppointmentDuplicate,
  isValidAppointmentInterval,
  minutesToTime,
  timeToMinutes,
} from "@/lib/appointmentConflict";

const STATUS_COLORS = {
  agendado: "bg-slate-100 text-slate-600",
  confirmado: "bg-blue-100 text-blue-700",
  chegou: "bg-amber-100 text-amber-700",
  concluido: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-red-100 text-red-700",
  faltou: "bg-orange-100 text-orange-700",
};

const EMPTY_FORM = {
  cliente_id: "",
  cliente_nome: "",
  servico_id: "",
  servico_nome: "",
  profissional_id: "",
  profissional_nome: "",
  hora: "09:00",
  duracao_minutos: 60,
  valor: "",
  forma_pagamento: "",
  observacoes: "",
  repetir_dias: 0,
};

const REPEAT_OPTIONS = [
  { label: "Não repetir", value: 0 },
  { label: "A cada 7 dias (semanal)", value: 7 },
  { label: "A cada 14 dias (quinzenal)", value: 14 },
  { label: "A cada 21 dias (mensal)", value: 21 },
  { label: "A cada 28 dias", value: 28 },
];

export default function AppAgenda() {
  const { company_id, loading: loadingUser } = useCompany();
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosSemana, setAgendamentosSemana] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [vistaColuna, setVistaColuna] = useState(false);
  const [search, setSearch] = useState("");
  const [listaEsperaOpen, setListaEsperaOpen] = useState(false);
  const [canceladosOpen, setCanceladosOpen] = useState(false);
  const [vagaInfo, setVagaInfo] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pendingConflict, setPendingConflict] = useState(null);
  const { toast } = useToast();

  const getWeekRange = (dateValue) => {
    const start = new Date(dateValue + "T12:00:00");
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  const loadAgendamentos = async () => {
    if (!company_id) return;

    const { data, error } = await supabase
      .from("Agendamento")
      .select("*")
      .eq("company_id", company_id)
      .eq("data", selectedDate)
      .order("hora", { ascending: true });

    if (error) {
      console.error(error);
      setAgendamentos([]);
    } else {
      setAgendamentos(data || []);
    }

    setLoading(false);
  };

  const loadAgendamentosSemana = async () => {
    if (!company_id) return;

    const { start, end } = getWeekRange(selectedDate);
    const { data, error } = await supabase
      .from("Agendamento")
      .select("*")
      .eq("company_id", company_id)
      .gte("data", start)
      .lte("data", end)
      .order("data", { ascending: true })
      .order("hora", { ascending: true });

    if (error) {
      console.error(error);
      setAgendamentosSemana([]);
    } else {
      setAgendamentosSemana(data || []);
    }
  };

  const loadRefs = async () => {
    if (!company_id) return;
    const [cls, svs, profs] = await Promise.all([
      supabaseApi.entities.Cliente.filter({ company_id }, "nome", 200).catch(
        () => [],
      ),
      supabaseApi.entities.Servico.filter(
        { company_id, ativo: true },
        "nome",
        100,
      ).catch(() => []),
      supabaseApi.entities.Profissional.filter(
        { company_id, ativo: true },
        "nome",
        50,
      ).catch(() => []),
    ]);
    setClientes(cls);
    setServicos(svs);
    setProfissionais(profs);
  };

  useEffect(() => {
    if (company_id) {
      loadRefs();
    }
  }, [company_id]);
  useEffect(() => {
    if (company_id) {
      setLoading(true);
      loadAgendamentos();
      loadAgendamentosSemana();
    }
  }, [company_id, selectedDate]);

  const changeDate = (delta) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const selectedDateObject = new Date(selectedDate + "T12:00:00");

  const formatDateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const isPastTimeToday = (date, time) =>
    date === formatDateValue(new Date()) &&
    timeToMinutes(time) < getCurrentMinutes();

  // Verifica conflito de horário: mesmo profissional, mesmo dia, horário sobrepostos
  const getAppointmentsForValidation = (date) =>
    date === selectedDate ? agendamentos : agendamentosSemana;

  const getConflict = (date, profId, hora, duracao, excludeId = null) =>
    findAppointmentConflict({
      appointments: getAppointmentsForValidation(date),
      professionalId: profId,
      date,
      time: hora,
      durationMinutes: duracao,
      excludeId,
    });

  const buildRepeticoes = (
    payload,
    dataInicial,
    repetirDias,
    status = "agendado",
  ) => {
    if (!repetirDias) return [];

    const repeticoes = [];
    const dataBase = new Date(dataInicial + "T12:00:00");
    const limite = new Date(dataBase);
    limite.setMonth(limite.getMonth() + 3);

    let nextDate = new Date(dataBase);
    nextDate.setDate(nextDate.getDate() + repetirDias);

    while (nextDate <= limite) {
      repeticoes.push({
        ...payload,
        data: nextDate.toISOString().split("T")[0],
        status,
      });
      nextDate = new Date(nextDate);
      nextDate.setDate(nextDate.getDate() + repetirDias);
    }

    return repeticoes;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };
  const openEdit = (ag) => {
    // Clique em slot vazio: abre novo agendamento pré-preenchido
    if (ag._novo) {
      if (ag.data && ag.data !== selectedDate) {
        setSelectedDate(ag.data);
      }
      setEditing(null);
      setForm({
        ...EMPTY_FORM,
        hora: ag.hora || "09:00",
        profissional_id: ag.profissional_id || "",
        profissional_nome: ag.profissional_nome || "",
      });
      setShowForm(true);
      return;
    }
    setEditing(ag);
    setForm({
      cliente_id: ag.cliente_id || "",
      cliente_nome: ag.cliente_nome || "",
      servico_id: ag.servico_id || "",
      servico_nome: ag.servico_nome || "",
      profissional_id: ag.profissional_id || "",
      profissional_nome: ag.profissional_nome || "",
      hora: ag.hora,
      duracao_minutos: ag.duracao_minutos || 60,
      valor: ag.valor || "",
      forma_pagamento: ag.forma_pagamento || "",
      observacoes: ag.observacoes || "",
      repetir_dias: ag.repetir_dias || 0,
      data_reagendamento: ag.data || selectedDate,
    });
    setShowForm(true);
  };

  const onSelectCliente = (id) => {
    const c = clientes.find((x) => x.id === id);
    setForm((f) => ({ ...f, cliente_id: id, cliente_nome: c?.nome || "" }));
  };

  const onSelectServico = (id) => {
    const s = servicos.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      servico_id: id,
      servico_nome: s?.nome || "",
      duracao_minutos: s?.duracao_minutos || 60,
      valor: s?.valor || f.valor,
    }));
  };

  const onSelectProfissional = (id) => {
    const p = profissionais.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      profissional_id: id,
      profissional_nome: p?.nome || "",
    }));
  };

  // Envia e-mail de confirmação para o cliente
  const sendConfirmationEmail = async (agendamento) => {
    if (!agendamento.cliente_id) return;
    const cliente = clientes.find((c) => c.id === agendamento.cliente_id);
    if (!cliente?.email) return;
    const dataFormatada = new Date(
      agendamento.data + "T12:00:00",
    ).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const profStr = agendamento.profissional_nome
      ? `\nProfissional: ${agendamento.profissional_nome}`
      : "";
    await supabaseApi.integrations.Core.SendEmail({
      to: cliente.email,
      subject: `Confirmação de agendamento — ${agendamento.servico_nome}`,
      body: `Olá, ${agendamento.cliente_nome}!\n\nSeu agendamento está confirmado:\n\nServiço: ${agendamento.servico_nome}\nData: ${dataFormatada}\nHorário: ${agendamento.hora}${profStr}\n\nAguardamos você! Em caso de dúvidas ou para remarcar, entre em contato conosco.\n\nAté logo! 💅`,
    }).catch(() => {});
  };

  const save = async ({ allowOverlap = false } = {}) => {
    if (!form.cliente_nome || !form.servico_nome || !form.hora) {
      toast({
        title: "Preencha cliente, serviço e horário",
        variant: "destructive",
      });
      return;
    }
    const dataFinal = editing ? form.data_reagendamento || selectedDate : selectedDate;
    const duration = parseInt(form.duracao_minutos) || 60;
    const repetirDias = parseInt(form.repetir_dias) || 0;
    if (!editing && isPastTimeToday(dataFinal, form.hora)) {
      toast({
        title: "Horário indisponível",
        description: "Este horário já passou para o dia de hoje.",
        variant: "destructive",
      });
      return;
    }
    const excludeId = editing?.id || null;
    if (!isValidAppointmentInterval(form.hora, duration)) {
      toast({
        title: "HorÃ¡rio invÃ¡lido",
        description:
          "Use horÃ¡rios e duraÃ§Ãµes em intervalos de 15 minutos ou mais.",
        variant: "destructive",
      });
      return;
    }

    if (
      isExactAppointmentDuplicate({
        appointments: getAppointmentsForValidation(dataFinal),
        professionalId: form.profissional_id,
        date: dataFinal,
        time: form.hora,
        durationMinutes: duration,
        clientId: form.cliente_id,
        clientName: form.cliente_nome,
        serviceId: form.servico_id,
        serviceName: form.servico_nome,
        excludeId,
      })
    ) {
      toast({
        title: "Agendamento duplicado",
        description: "JÃ¡ existe um agendamento igual para este profissional.",
        variant: "destructive",
      });
      return;
    }

    const conflict = getConflict(
      dataFinal,
      form.profissional_id,
      form.hora,
      duration,
      excludeId,
    );

    if (conflict && !allowOverlap) {
      setPendingConflict({
        appointment: conflict,
        requestedTime: form.hora,
        requestedDate: dataFinal,
      });
      return;
    }

    setSaving(true);
    const basePayload = {
      company_id,
      cliente_id: form.cliente_id,
      cliente_nome: form.cliente_nome,
      servico_id: form.servico_id,
      servico_nome: form.servico_nome,
      profissional_id: form.profissional_id,
      profissional_nome: form.profissional_nome,
      hora: form.hora,
      duracao_minutos: duration,
      valor: parseFloat(form.valor) || 0,
      forma_pagamento: form.forma_pagamento,
      observacoes: form.observacoes,
      repetir_dias: repetirDias,
    };

    try {
      if (editing) {
        await supabaseApi.entities.Agendamento.update(editing.id, {
          ...basePayload,
          status: editing.status,
          data: dataFinal,
        });
        if (repetirDias > 0) {
          const repeticoes = buildRepeticoes(
            basePayload,
            dataFinal,
            repetirDias,
            "agendado",
          );
          if (repeticoes.length > 0) {
            await supabaseApi.entities.Agendamento.bulkCreate(repeticoes);
            toast({
              title: `Agendamento atualizado com ${repeticoes.length} repetição(ões)!`,
            });
          } else {
            toast({ title: "Agendamento atualizado!" });
          }
        } else {
          toast({ title: "Agendamento atualizado!" });
        }
        if (dataFinal !== editing.data) {
          setSelectedDate(dataFinal);
        }
      } else {
        // Cria o agendamento principal
        await supabaseApi.entities.Agendamento.create({
          ...basePayload,
          data: selectedDate,
          status: "agendado",
        });

        // Cria repetições (até 3 meses à frente)
        if (repetirDias > 0) {
          const repeticoes = buildRepeticoes(
            basePayload,
            selectedDate,
            repetirDias,
          );
          if (repeticoes.length > 0) {
            await supabaseApi.entities.Agendamento.bulkCreate(repeticoes);
            toast({
              title: `Agendamento criado com ${repeticoes.length} repetição(ões)!`,
            });
          } else {
            toast({ title: "Agendamento criado!" });
          }
        } else {
          toast({ title: "Agendamento criado!" });
        }

        // Envia e-mail de confirmação
        await sendConfirmationEmail({ ...basePayload, data: selectedDate });
      }

      setShowForm(false);
      setPendingConflict(null);
      loadAgendamentos();
      loadAgendamentosSemana();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao salvar agendamento",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendConfirmacaoStatus = async (ag) => {
    const dataFormatada = new Date(ag.data + "T12:00:00").toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    );
    const profStr = ag.profissional_nome ? ` com ${ag.profissional_nome}` : "";
    const mensagem = `Olá, ${ag.cliente_nome}! Seu agendamento de *${ag.servico_nome}* foi confirmado para *${dataFormatada}* às *${ag.hora}*${profStr}. Aguardamos você! 💅`;

    // E-mail
    if (ag.cliente_id) {
      const cliente = clientes.find((c) => c.id === ag.cliente_id);
      if (cliente?.email) {
        await supabaseApi.integrations.Core.SendEmail({
          to: cliente.email,
          subject: `Agendamento confirmado — ${ag.servico_nome}`,
          body: mensagem.replace(/\*/g, ""),
        }).catch(() => {});
      }

      // WhatsApp (abre link wa.me se tiver telefone)
      if (cliente?.telefone) {
        const tel = cliente.telefone.replace(/\D/g, "");
        const numero = tel.startsWith("55") ? tel : `55${tel}`;
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, "_blank");
      }
    }
  };

  const abrirListaEsperaVaga = (ag) => {
    setVagaInfo({
      data: ag.data,
      hora: ag.hora,
      servico_nome: ag.servico_nome,
      profissional_nome: ag.profissional_nome,
    });
    setListaEsperaOpen(true);
  };

  const updateStatus = async (id, status) => {
    const ag = agendamentos.find((a) => a.id === id);
    await supabaseApi.entities.Agendamento.update(id, { status });

    // Automação: ao confirmar, envia notificação ao cliente
    if (status === "confirmado" && ag) {
      await sendConfirmacaoStatus(ag);
      toast({
        title: "Agendamento confirmado!",
        description: `Notificação enviada para ${ag.cliente_nome}.`,
      });
    }

    // Automação: ao cancelar, notifica lista de espera
    if (status === "cancelado" && ag) {
      await supabaseApi.entities.Notificacao.create({
        company_id,
        tipo: "cancelamento",
        titulo: `Vaga aberta: ${ag.servico_nome}`,
        mensagem: `${ag.cliente_nome} cancelou. Vaga disponível em ${new Date(ag.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} às ${ag.hora}${ag.profissional_nome ? ` com ${ag.profissional_nome}` : ""}.`,
        agendamento_id: ag.id,
        cliente_nome: ag.cliente_nome,
        lida: false,
      }).catch(() => {});
      toast({
        title: "Vaga liberada!",
        description: "Deseja notificar a lista de espera?",
        action: (
          <button
            onClick={() => abrirListaEsperaVaga(ag)}
            className="text-xs font-semibold underline"
          >
            Ver lista
          </button>
        ),
      });
    }

    loadAgendamentos();
    loadAgendamentosSemana();
  };

  const restaurarCancelado = async (ag) => {
    await updateStatus(ag.id, "agendado");
    toast({
      title: "Agendamento restaurado!",
      description: `${ag.cliente_nome} voltou para a agenda.`,
    });
  };

  const marcarFaltou = async (ag) => {
    await supabaseApi.entities.Agendamento.update(ag.id, { status: "faltou" });

    const dataFormatada = new Date(ag.data + "T12:00:00").toLocaleDateString(
      "pt-BR",
      { day: "numeric", month: "long" },
    );
    await supabaseApi.entities.Notificacao.create({
      company_id,
      tipo: "falta",
      titulo: `Vaga aberta (falta): ${ag.servico_nome}`,
      mensagem: `${ag.cliente_nome} não compareceu em ${dataFormatada} às ${ag.hora}${ag.profissional_nome ? ` com ${ag.profissional_nome}` : ""}. Vaga pode ser ocupada.`,
      agendamento_id: ag.id,
      cliente_nome: ag.cliente_nome,
      lida: false,
    }).catch(() => {});

    toast({
      title: "Cliente marcado como faltou",
      description: "Deseja notificar a lista de espera sobre a vaga?",
      action: (
        <button
          onClick={() => abrirListaEsperaVaga(ag)}
          className="text-xs font-semibold underline"
        >
          Ver lista
        </button>
      ),
    });
    loadAgendamentos();
    loadAgendamentosSemana();
  };

  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString(
    "pt-BR",
    { weekday: "long", day: "numeric", month: "long" },
  );

  const agendamentosAtivos = agendamentos.filter(
    (ag) => ag.status !== "cancelado",
  );
  const agendamentosCancelados = agendamentos.filter(
    (ag) => ag.status === "cancelado",
  );

  const matchesSearch = (ag) =>
    ag.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    ag.servico_nome?.toLowerCase().includes(search.toLowerCase()) ||
    ag.profissional_nome?.toLowerCase().includes(search.toLowerCase());

  const agendamentosFiltrados = search.trim()
    ? agendamentosAtivos.filter(matchesSearch)
    : agendamentosAtivos;

  const canceladosFiltrados = search.trim()
    ? agendamentosCancelados.filter(matchesSearch)
    : agendamentosCancelados;

  const formatConflictRange = (ag) => {
    if (!ag?.hora) return "";
    const start = timeToMinutes(ag.hora);
    const end = start + (parseInt(ag.duracao_minutos) || 60);
    return `${ag.hora} - ${minutesToTime(end)}`;
  };

  if (loadingUser)
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-4 border-slate-200 rounded-full animate-spin"
          style={{ borderTopColor: "var(--company-primary, #f43f5e)" }}
        />
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
          <p className="text-slate-500 text-sm capitalize">{dateLabel}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Toggle lista / colunas */}
          <div className="flex border rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setVistaColuna(false)}
              className={`p-2 transition-colors ${!vistaColuna ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:bg-slate-50"}`}
              title="Vista lista"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVistaColuna(true)}
              className={`p-2 transition-colors ${vistaColuna ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:bg-slate-50"}`}
              title="Vista por profissional"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setVagaInfo(null);
              setListaEsperaOpen(true);
            }}
            className="w-full sm:w-auto gap-2"
          >
            <Clock className="w-4 h-4 text-amber-500" /> Lista de Espera
          </Button>
          <Button
            variant="outline"
            onClick={() => setCanceladosOpen(true)}
            className="w-full sm:w-auto gap-2 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <X className="w-4 h-4" /> Cancelados
            {agendamentosCancelados.length > 0 && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                {agendamentosCancelados.length}
              </span>
            )}
          </Button>
          <Button
            onClick={openCreate}
            className="w-full sm:w-auto text-white"
            style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Date Nav */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() =>
            setSelectedDate(new Date().toISOString().split("T")[0])
          }
          className="px-4 py-2 bg-white rounded-lg border text-sm font-semibold hover:bg-slate-50 text-slate-700 flex-shrink-0"
        >
          Hoje
        </button>
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-lg hover:bg-white border transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <button className="min-w-0 flex-1 sm:flex-none sm:min-w-56 px-4 py-2 bg-white rounded-lg border text-sm font-medium capitalize text-slate-700 truncate flex items-center justify-center gap-2">
              <span className="truncate">{dateLabel}</span>
              <CalendarIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <CalendarPicker
              mode="single"
              selected={selectedDateObject}
              defaultMonth={selectedDateObject}
              onSelect={(date) => {
                if (!date) return;
                setSelectedDate(formatDateValue(date));
                setDatePickerOpen(false);
              }}
              captionLayout="dropdown-buttons"
              fromYear={new Date().getFullYear() - 5}
              toYear={new Date().getFullYear() + 5}
              locale={ptBR}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-lg hover:bg-white border transition-colors flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Busca */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar cliente, serviço ou profissional..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div
            className="w-8 h-8 border-4 border-slate-200 rounded-full animate-spin"
            style={{ borderTopColor: "var(--company-primary, #f43f5e)" }}
          />
        </div>
      ) : vistaColuna ? (
        <AgendaColunas
          agendamentos={agendamentosSemana}
          profissionais={profissionais}
          onEdit={openEdit}
          onStatusChange={updateStatus}
          onFaltou={marcarFaltou}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      ) : agendamentosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 sm:p-16 text-center">
          <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {search
              ? "Nenhum resultado encontrado"
              : "Nenhum agendamento neste dia"}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {search
              ? `Sem resultados para "${search}"`
              : 'Clique em "Novo Agendamento" para começar.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {agendamentosFiltrados.map((ag) => (
            <div
              key={ag.id}
              className="bg-white rounded-xl border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="w-full sm:w-12 text-left sm:text-center flex-shrink-0">
                <p className="text-sm font-bold text-slate-900">{ag.hora}</p>
                <p className="text-xs text-slate-400">
                  {ag.duracao_minutos}min
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
              >
                {ag.cliente_nome?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {ag.cliente_nome}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {ag.servico_nome}
                  {ag.profissional_nome ? ` • ${ag.profissional_nome}` : ""}
                </p>
                {ag.valor > 0 && (
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                    R${" "}
                    {Number(ag.valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>
              <Badge
                className={`text-xs border-0 flex-shrink-0 ${STATUS_COLORS[ag.status] || "bg-slate-100 text-slate-600"}`}
              >
                {ag.status}
              </Badge>
              <div className="flex gap-1 flex-shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => openEdit(ag)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {ag.status !== "concluido" &&
                  ag.status !== "cancelado" &&
                  ag.status !== "faltou" && (
                    <>
                      {ag.status !== "confirmado" && (
                        <button
                          onClick={() => updateStatus(ag.id, "confirmado")}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          title="Confirmar (envia WhatsApp/e-mail)"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(ag.id, "concluido")}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors"
                        title="Concluir"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => marcarFaltou(ag)}
                        className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-400 transition-colors"
                        title="Cliente não compareceu"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(ag.id, "cancelado")}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={canceladosOpen} onOpenChange={setCanceladosOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agendamentos cancelados</DialogTitle>
          </DialogHeader>
          {canceladosFiltrados.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">
              Nenhum agendamento cancelado neste dia.
            </div>
          ) : (
            <div className="max-h-[60dvh] space-y-2 overflow-y-auto pr-1">
              {canceladosFiltrados.map((ag) => (
                <div
                  key={ag.id}
                  className="rounded-xl border border-red-100 bg-red-50/40 p-3 flex items-center gap-3"
                >
                  <div className="w-14 flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">
                      {ag.hora}
                    </p>
                    <p className="text-xs text-slate-400">
                      {ag.duracao_minutos}min
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {ag.cliente_nome}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {ag.servico_nome}
                      {ag.profissional_nome ? ` - ${ag.profissional_nome}` : ""}
                    </p>
                    {ag.valor > 0 && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        R${" "}
                        {Number(ag.valor).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    )}
                  </div>
                  <Badge className="border-0 bg-red-100 text-red-700">
                    cancelado
                  </Badge>
                  <button
                    onClick={() => restaurarCancelado(ag)}
                    className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                    title="Desfazer cancelamento"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(ag)}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lista de Espera Modal */}
      <ListaEsperaModal
        open={listaEsperaOpen}
        onClose={() => setListaEsperaOpen(false)}
        vagaInfo={vagaInfo}
      />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Agendamento" : "Novo Agendamento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Cliente */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Cliente *
              </label>
              {clientes.length > 0 ? (
                <select
                  value={form.cliente_id}
                  onChange={(e) => onSelectCliente(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">Selecione a cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="Nome da cliente"
                  value={form.cliente_nome}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cliente_nome: e.target.value }))
                  }
                />
              )}
              {clientes.length > 0 && !form.cliente_id && (
                <Input
                  className="mt-2"
                  placeholder="Ou digite o nome manualmente"
                  value={form.cliente_nome}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      cliente_nome: e.target.value,
                      cliente_id: "",
                    }))
                  }
                />
              )}
            </div>

            {/* Serviço */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Serviço *
              </label>
              {servicos.length > 0 ? (
                <select
                  value={form.servico_id}
                  onChange={(e) => onSelectServico(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">Selecione o serviço</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} — {s.duracao_minutos}min — R$ {s.valor}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="Nome do serviço"
                  value={form.servico_nome}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, servico_nome: e.target.value }))
                  }
                />
              )}
              {servicos.length > 0 && !form.servico_id && (
                <Input
                  className="mt-2"
                  placeholder="Ou digite o serviço manualmente"
                  value={form.servico_nome}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      servico_nome: e.target.value,
                      servico_id: "",
                    }))
                  }
                />
              )}
            </div>

            {/* Profissional */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Profissional
              </label>
              {profissionais.length > 0 ? (
                <select
                  value={form.profissional_id}
                  onChange={(e) => onSelectProfissional(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">Selecione o profissional</option>
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                      {p.especialidade ? ` — ${p.especialidade}` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="Nome do profissional"
                  value={form.profissional_nome}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      profissional_nome: e.target.value,
                    }))
                  }
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Horário *
                </label>
                <Input
                  type="time"
                  step="900"
                  value={form.hora}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hora: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Duração (min)
                </label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={form.duracao_minutos}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duracao_minutos: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Valor (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, valor: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Pagamento
                </label>
                <select
                  value={form.forma_pagamento}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, forma_pagamento: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">Selecionar</option>
                  <option value="Pix">Pix</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Pacote">Pacote</option>
                </select>
              </div>
            </div>

            {/* Repetir atendimento */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-400" />
                Repetir atendimento
              </label>
              <select
                value={form.repetir_dias}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    repetir_dias: parseInt(e.target.value),
                  }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                {REPEAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {form.repetir_dias > 0 && (
                <p className="text-xs text-slate-500 mt-1.5">
                  Serão criados agendamentos recorrentes por até 3 meses.
                </p>
              )}
            </div>

            {/* Reagendar (apenas ao editar) */}
            {editing && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                <label className="text-sm font-medium text-blue-700 mb-1.5 flex items-center gap-2 block">
                  <CalendarIcon className="w-4 h-4 text-blue-400" />
                  Reagendar para outra data
                </label>
                <input
                  type="date"
                  value={form.data_reagendamento || selectedDate}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      data_reagendamento: e.target.value,
                    }))
                  }
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Observações
              </label>
              <Input
                placeholder="Observações adicionais..."
                value={form.observacoes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, observacoes: e.target.value }))
                }
              />
            </div>

            {/* Aviso de confirmação por e-mail */}
            {!editing &&
              form.cliente_id &&
              clientes.find((c) => c.id === form.cliente_id)?.email && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                  <Bell className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    Um e-mail de confirmação será enviado automaticamente para o
                    cliente.
                  </span>
                </div>
              )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={save}
                disabled={saving}
                className="flex-1 text-white"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
              >
                {saving
                  ? "Salvando..."
                  : editing
                    ? "Salvar"
                    : "Criar Agendamento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingConflict)}
        onOpenChange={(open) => {
          if (!open) setPendingConflict(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>AtenÃ§Ã£o!</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                JÃ¡ existe um agendamento nesse perÃ­odo. Deseja realmente
                realizar um novo agendamento para este horÃ¡rio?
              </span>
              {pendingConflict?.appointment && (
                <span className="block rounded-lg bg-slate-50 p-3 text-slate-700">
                  <strong>{pendingConflict.appointment.cliente_nome}</strong>
                  <br />
                  {pendingConflict.appointment.servico_nome} em{" "}
                  {formatConflictRange(pendingConflict.appointment)}
                </span>
              )}
              <span className="block">
                Novo horÃ¡rio solicitado:{" "}
                <strong>{pendingConflict?.requestedTime}</strong>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConflict(null)}>
              NÃ£o
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const confirmedConflict = pendingConflict;
                setPendingConflict(null);
                if (confirmedConflict) save({ allowOverlap: true });
              }}
              className="text-white"
              style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
            >
              Sim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
