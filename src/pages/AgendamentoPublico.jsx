import React, { useState, useEffect, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { supabaseApi } from "@/api/supabaseApi";
import { Input } from "@/components/ui/input";
import {
  Scissors,
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  Phone,
  Instagram,
  AtSign,
} from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

function gerarSlots(horaInicio, horaFim, duracaoMin) {
  const slots = [];
  const [hi, mi] = (horaInicio || "09:00").split(":").map(Number);
  const [hf, mf] = (horaFim || "18:00").split(":").map(Number);
  let cur = hi * 60 + mi;
  const fim = hf * 60 + mf;
  const dur = duracaoMin || 60;
  while (cur + dur <= fim) {
    const h = String(Math.floor(cur / 60)).padStart(2, "0");
    const m = String(cur % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    cur += dur;
  }
  return slots;
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToMinutes(time) {
  const [hour, minute] = (time || "00:00").split(":").map(Number);
  return hour * 60 + minute;
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

const DIAS_MAP = {
  0: "dom",
  1: "seg",
  2: "ter",
  3: "qua",
  4: "qui",
  5: "sex",
  6: "sab",
};

function useSalaoTheme(salao) {
  useLayoutEffect(() => {
    if (!salao) return;
    const root = document.documentElement;
    const primary = salao.cor_primaria || "#f43f5e";
    const secondary = salao.cor_secundaria || "#fda4af";
    root.style.setProperty("--brand-primary", primary);
    root.style.setProperty("--brand-secondary", secondary);
    // bg suave baseado na cor
    return () => {
      root.style.removeProperty("--brand-primary");
      root.style.removeProperty("--brand-secondary");
    };
  }, [salao?.cor_primaria, salao?.cor_secundaria]);
}

export default function AgendamentoPublico() {
  const { slug } = useParams();
  const [salao, setSalao] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [agendamentosExistentes, setAgendamentosExistentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState("servico");
  const [selected, setSelected] = useState({
    servico: null,
    profissional: null,
    hora: "",
  });
  const [form, setForm] = useState({ nome: "", telefone: "", observacoes: "" });
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDateValue());

  useSalaoTheme(salao);
  useDocumentTitle(
    salao?.nome_salao
      ? `Agendar | ${salao.nome_salao}`
      : "Agendar | BeautyFlow AI",
  );

  useEffect(() => {
    const init = async () => {
      const saloes = await supabaseApi.entities.Salao.filter(
        { slug },
        "nome_salao",
        1,
      ).catch(() => []);
      const s = saloes[0];
      if (!s || s.status === "bloqueado") {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setSalao(s);
      const cid = s.id;
      const [svs, profs] = await Promise.all([
        supabaseApi.entities.Servico.filter(
          { company_id: cid, ativo: true },
          "nome",
        ).catch(() => []),
        supabaseApi.entities.Profissional.filter(
          { company_id: cid, ativo: true },
          "nome",
        ).catch(() => []),
      ]);
      setServicos(svs);
      setProfissionais(profs);
      setLoading(false);
    };
    init();
  }, [slug]);

  useEffect(() => {
    if (!salao) return;
    supabaseApi.entities.Agendamento.filter(
      { company_id: salao.id, data: selectedDate },
      "hora",
    )
      .catch(() => [])
      .then(setAgendamentosExistentes);
  }, [salao, selectedDate]);

  const profsFiltrados = profissionais.filter((p) => {
    if (!selected.servico) return true;
    const dia = DIAS_MAP[new Date(selectedDate + "T12:00:00").getDay()];
    return !p.dias_atendimento?.length || p.dias_atendimento.includes(dia);
  });

  const slotsDisponiveis = () => {
    if (!selected.profissional || !selected.servico) return [];
    const prof = profissionais.find((p) => p.id === selected.profissional.id);
    const dur = selected.servico.duracao_minutos || 60;
    const todos = gerarSlots(prof?.hora_inicio, prof?.hora_fim, dur);
    return todos.filter((slot) => {
      const slotMin = timeToMinutes(slot);
      const slotFim = slotMin + dur;

      if (selectedDate === getLocalDateValue() && slotMin < getCurrentMinutes()) {
        return false;
      }

      return !agendamentosExistentes.some((ag) => {
        if (ag.profissional_id !== selected.profissional.id) return false;
        if (ag.status === "cancelado") return false;
        const agMin = timeToMinutes(ag.hora);
        const agFim = agMin + (ag.duracao_minutos || 60);
        return slotMin < agFim && slotFim > agMin;
      });
    });
  };

  const confirmar = async () => {
    if (!form.nome || !form.telefone) return;
    if (
      selectedDate === getLocalDateValue() &&
      timeToMinutes(selected.hora) < getCurrentMinutes()
    ) {
      setSelected((s) => ({ ...s, hora: "" }));
      return;
    }
    setSaving(true);
    await supabaseApi.entities.Agendamento.create({
      company_id: salao.id,
      cliente_nome: form.nome,
      servico_id: selected.servico.id,
      servico_nome: selected.servico.nome,
      profissional_id: selected.profissional?.id || "",
      profissional_nome: selected.profissional?.nome || "",
      data: selectedDate,
      hora: selected.hora,
      duracao_minutos: selected.servico.duracao_minutos || 60,
      valor: selected.servico.valor || 0,
      status: "agendado",
      observacoes: form.observacoes,
    });
    setSaving(false);
    setStep("confirmado");
  };

  const changeDate = (delta) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
    setSelected((s) => ({ ...s, hora: "" }));
  };

  const primary = salao?.cor_primaria || "#f43f5e";
  const secondary = salao?.cor_secundaria || "#fda4af";
  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString(
    "pt-BR",
    { weekday: "long", day: "numeric", month: "long" },
  );

  const btnPrimary = { backgroundColor: primary, color: "#fff" };
  const borderActive = {
    borderColor: primary,
    backgroundColor: `${primary}10`,
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${primary}15, ${secondary}20)`,
        }}
      >
        <div
          className="w-8 h-8 border-4 border-white rounded-full animate-spin"
          style={{ borderTopColor: primary }}
        />
      </div>
    );

  if (notFound)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-50/40 to-white">
        <div className="max-w-sm w-full text-center">
          <div
            className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 border border-rose-100"
            style={{
              background: "linear-gradient(135deg, #f43f5e18, #f43f5e08)",
            }}
          >
            <Scissors className="w-9 h-9" style={{ color: "#f43f5e80" }} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">
            Salão não encontrado
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            O link acessado não corresponde a nenhum salão cadastrado ou ativo
            na plataforma.
          </p>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-left text-xs text-slate-500 space-y-2 shadow-sm">
            <p className="font-medium text-slate-700 mb-2">
              Possíveis motivos:
            </p>
            <p>• O link foi digitado incorretamente</p>
            <p>• O salão pode ter alterado seu endereço</p>
            <p>• O salão pode estar temporariamente inativo</p>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Agendamento Online por{" "}
            <span className="font-semibold" style={{ color: "#f43f5e" }}>
              BeautyFlow AI
            </span>
          </p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(160deg, ${primary}12 0%, #f8fafc 40%, ${secondary}10 100%)`,
      }}
    >
      {/* Header branded */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow overflow-hidden flex-shrink-0"
            style={{ backgroundColor: primary }}
          >
            {salao?.logo_url ? (
              <img
                src={salao.logo_url}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {salao?.nome_salao?.[0] || "S"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 truncate">
              {salao?.nome_salao || "Salão"}
            </p>
            {salao?.slogan ? (
              <p className="text-xs truncate" style={{ color: primary }}>
                {salao.slogan}
              </p>
            ) : (
              <p className="text-xs text-slate-400">Agendamento Online</p>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-4">
        {/* Step: Serviço */}
        {step === "servico" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Escolha o serviço
              </h2>
              <p className="text-slate-500 text-sm">
                Selecione o que você deseja realizar
              </p>
            </div>
            {servicos.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm">
                <Scissors className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Nenhum serviço disponível no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servicos.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelected((sel) => ({
                        ...sel,
                        servico: s,
                        profissional: null,
                        hora: "",
                      }));
                      setStep("profissional");
                    }}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm border-2 border-transparent hover:shadow-md transition-all text-left group"
                    style={{ "--hover-border": primary }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = primary)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "transparent")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{s.nome}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {s.categoria} • {s.duracao_minutos}min
                        </p>
                      </div>
                      <p
                        className="font-bold text-lg"
                        style={{ color: primary }}
                      >
                        R${" "}
                        {Number(s.valor).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    {s.descricao && (
                      <p className="text-xs text-slate-400 mt-2">
                        {s.descricao}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Profissional */}
        {step === "profissional" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("servico")}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Escolha o profissional
              </h2>
              <p className="text-sm" style={{ color: primary }}>
                Serviço: <strong>{selected.servico?.nome}</strong>
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelected((sel) => ({ ...sel, profissional: null }));
                  setStep("data");
                }}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border-2 border-transparent hover:shadow-md transition-all text-left"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = primary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "transparent")
                }
              >
                <p className="font-semibold text-slate-900">Sem preferência</p>
                <p className="text-sm text-slate-500">Próximo disponível</p>
              </button>
              {profsFiltrados.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelected((sel) => ({ ...sel, profissional: p }));
                    setStep("data");
                  }}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border-2 border-transparent hover:shadow-md transition-all text-left"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = primary)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "transparent")
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: primary }}
                    >
                      {p.nome[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{p.nome}</p>
                      {p.especialidade && (
                        <p className="text-sm text-slate-500">
                          {p.especialidade}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Data e Hora */}
        {step === "data" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("profissional")}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Data e horário
              </h2>
              <p className="text-sm text-slate-500">
                {selected.profissional
                  ? `Com ${selected.profissional.nome}`
                  : "Próximo disponível"}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <p className="text-sm font-semibold text-slate-900 capitalize">
                  {dateLabel}
                </p>
                <button
                  onClick={() => changeDate(1)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelected((s) => ({ ...s, hora: "" }));
                }}
                className="w-full border rounded-xl px-3 py-2 text-sm text-slate-600 bg-slate-50"
              />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Horários disponíveis
              </p>
              {slotsDisponiveis().length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  Nenhum horário disponível. Tente outra data.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slotsDisponiveis().map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelected((s) => ({ ...s, hora: slot }))}
                      className="py-2 rounded-xl text-sm font-medium transition-all border"
                      style={
                        selected.hora === slot
                          ? { ...btnPrimary, border: `1px solid ${primary}` }
                          : {}
                      }
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selected.hora && (
              <button
                onClick={() => setStep("dados")}
                className="w-full py-3 rounded-xl text-white text-base font-semibold transition-opacity hover:opacity-90"
                style={btnPrimary}
              >
                Continuar — {selected.hora}
              </button>
            )}
          </div>
        )}

        {/* Step: Dados */}
        {step === "dados" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("data")}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Seus dados
              </h2>
              <p className="text-slate-500 text-sm">
                Para finalizar o agendamento
              </p>
            </div>
            {/* Resumo */}
            <div
              className="rounded-2xl p-4 space-y-2 border"
              style={{
                backgroundColor: `${primary}08`,
                borderColor: `${primary}30`,
              }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: primary }}
              >
                Resumo
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Serviço</span>
                <span className="font-medium text-slate-900">
                  {selected.servico?.nome}
                </span>
              </div>
              {selected.profissional && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Profissional</span>
                  <span className="font-medium text-slate-900">
                    {selected.profissional.nome}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Data</span>
                <span className="font-medium capitalize">{dateLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Horário</span>
                <span className="font-medium">{selected.hora}</span>
              </div>
              <div
                className="flex justify-between text-sm font-bold pt-2 border-t"
                style={{ borderColor: `${primary}30` }}
              >
                <span style={{ color: primary }}>Total</span>
                <span style={{ color: primary }}>
                  R${" "}
                  {Number(selected.servico?.valor || 0).toLocaleString(
                    "pt-BR",
                    { minimumFractionDigits: 2 },
                  )}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Seu nome *
                </label>
                <Input
                  placeholder="Nome completo"
                  value={form.nome}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nome: e.target.value }))
                  }
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Telefone / WhatsApp *
                </label>
                <Input
                  placeholder="(11) 99999-0000"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telefone: e.target.value }))
                  }
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Observações
                </label>
                <Input
                  placeholder="Preferências ou informações adicionais"
                  value={form.observacoes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, observacoes: e.target.value }))
                  }
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <button
              onClick={confirmar}
              disabled={saving || !form.nome || !form.telefone}
              className="w-full py-3.5 rounded-xl text-white text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={btnPrimary}
            >
              {saving ? "Confirmando..." : "Confirmar Agendamento"}
            </button>
          </div>
        )}

        {/* Step: Confirmado */}
        {step === "confirmado" && (
          <div className="text-center py-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${primary}20` }}
            >
              <Check className="w-10 h-10" style={{ color: primary }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Agendado com sucesso!
            </h2>
            <p className="text-slate-500 mb-6">
              Aguardamos você, {form.nome.split(" ")[0]}!
            </p>
            <div className="bg-white rounded-2xl p-5 shadow-sm text-left space-y-3 mb-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: primary }}
                >
                  {salao?.logo_url ? (
                    <img
                      src={salao.logo_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {salao?.nome_salao?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {salao?.nome_salao}
                  </p>
                  {salao?.slogan && (
                    <p className="text-xs" style={{ color: primary }}>
                      {salao.slogan}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Serviço</span>
                <span className="font-medium">{selected.servico?.nome}</span>
              </div>
              {selected.profissional && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Profissional</span>
                  <span className="font-medium">
                    {selected.profissional.nome}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Data</span>
                <span className="font-medium capitalize">{dateLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Horário</span>
                <span className="font-medium">{selected.hora}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-3">
                <span>Total</span>
                <span style={{ color: primary }}>
                  R${" "}
                  {Number(selected.servico?.valor || 0).toLocaleString(
                    "pt-BR",
                    { minimumFractionDigits: 2 },
                  )}
                </span>
              </div>
            </div>
            {/* CTA WhatsApp */}
            {(salao?.whatsapp || salao?.telefone) && (
              <a
                href={`https://wa.me/55${(salao.whatsapp || salao.telefone).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 mb-3 bg-emerald-500"
              >
                Confirmar pelo WhatsApp
              </a>
            )}
          </div>
        )}
      </div>

      {/* Rodapé do salão */}
      <footer className="mt-auto bg-white border-t py-6 px-4">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: primary }}
            >
              {salao?.logo_url ? (
                <img
                  src={salao.logo_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xs">
                  {salao?.nome_salao?.[0]}
                </span>
              )}
            </div>
            <p className="font-semibold text-slate-800 text-sm">
              {salao?.nome_salao}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            {salao?.endereco && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{salao.endereco}</span>
              </div>
            )}
            {salao?.telefone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <a href={`tel:${salao.telefone}`}>{salao.telefone}</a>
              </div>
            )}
            {salao?.instagram && (
              <div className="flex items-center gap-1.5">
                <Instagram className="w-3 h-3 flex-shrink-0" />
                <a
                  href={`https://instagram.com/${salao.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {salao.instagram}
                </a>
              </div>
            )}
            {salao?.email_salao && (
              <div className="flex items-center gap-1.5">
                <AtSign className="w-3 h-3 flex-shrink-0" />
                <a href={`mailto:${salao.email_salao}`}>{salao.email_salao}</a>
              </div>
            )}
          </div>
          {salao?.descricao && (
            <p className="text-xs text-slate-400">{salao.descricao}</p>
          )}
        </div>
      </footer>
    </div>
  );
}
