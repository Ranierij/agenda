import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  Package,
} from "lucide-react";

const STATUS_COLORS = {
  agendado: "bg-slate-100 text-slate-600",
  confirmado: "bg-blue-100 text-blue-700",
  chegou: "bg-amber-100 text-amber-700",
  concluido: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-red-100 text-red-700",
  faltou: "bg-orange-100 text-orange-700",
};

const PACOTE_STATUS_COLORS = {
  ativo: "bg-emerald-100 text-emerald-700",
  concluido: "bg-slate-100 text-slate-600",
  vencido: "bg-red-100 text-red-700",
  cancelado: "bg-red-100 text-red-600",
};

export default function ClientePerfilPanel({ cliente, onEdit }) {
  const [tab, setTab] = useState("info");
  const [agendamentos, setAgendamentos] = useState([]);
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cliente?.id || tab === "info") return;
    setLoading(true);
    if (tab === "historico") {
      supabaseApi.entities.Agendamento.filter(
        { cliente_id: cliente.id },
        "-data",
        100,
      )
        .then(setAgendamentos)
        .catch(() => setAgendamentos([]))
        .finally(() => setLoading(false));
    } else if (tab === "pacotes") {
      supabaseApi.entities.PacoteCliente.filter(
        { cliente_id: cliente.id },
        "-created_date",
        50,
      )
        .then(setPacotes)
        .catch(() => setPacotes([]))
        .finally(() => setLoading(false));
    }
  }, [cliente?.id, tab]);

  const tabs = [
    { id: "info", label: "Perfil" },
    { id: "historico", label: "Histórico" },
    { id: "pacotes", label: "Pacotes" },
  ];

  return (
    <Card className="border-0 shadow-sm sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {cliente.nome?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{cliente.nome}</CardTitle>
            {cliente.telefone && (
              <p className="text-xs text-slate-500 truncate">
                {cliente.telefone}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mt-3 -mx-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-current text-rose-500"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* ABA PERFIL */}
        {tab === "info" && (
          <div className="space-y-3">
            {cliente.telefone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{cliente.telefone}</span>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{cliente.email}</span>
              </div>
            )}
            {cliente.data_nascimento && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  {new Date(
                    cliente.data_nascimento + "T12:00:00",
                  ).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
            {cliente.observacoes && (
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
                {cliente.observacoes}
              </div>
            )}
            <p className="text-xs text-slate-400">
              Cadastrado em{" "}
              {new Date(cliente.created_date).toLocaleDateString("pt-BR")}
            </p>
            <Button
              onClick={() => onEdit(cliente)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Editar Cliente
            </Button>
          </div>
        )}

        {/* ABA HISTÓRICO */}
        {tab === "historico" && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-4 border-slate-200 border-t-rose-400 rounded-full animate-spin" />
              </div>
            ) : agendamentos.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum atendimento registrado</p>
              </div>
            ) : (
              agendamentos.map((ag) => (
                <div
                  key={ag.id}
                  className="rounded-xl border p-3 bg-slate-50 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {ag.servico_nome}
                    </p>
                    <Badge
                      className={`text-xs border-0 flex-shrink-0 ${STATUS_COLORS[ag.status] || "bg-slate-100 text-slate-600"}`}
                    >
                      {ag.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {ag.data
                      ? new Date(ag.data + "T12:00:00").toLocaleDateString(
                          "pt-BR",
                          { day: "numeric", month: "short", year: "numeric" },
                        )
                      : "—"}
                    {ag.hora ? ` às ${ag.hora}` : ""}
                    {ag.profissional_nome ? ` · ${ag.profissional_nome}` : ""}
                  </p>
                  {ag.valor > 0 && (
                    <p className="text-xs font-medium text-emerald-600">
                      R${" "}
                      {Number(ag.valor).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                      {ag.forma_pagamento ? ` · ${ag.forma_pagamento}` : ""}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ABA PACOTES */}
        {tab === "pacotes" && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-4 border-slate-200 border-t-rose-400 rounded-full animate-spin" />
              </div>
            ) : pacotes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum pacote adquirido</p>
              </div>
            ) : (
              pacotes.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border p-3 bg-slate-50 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {p.pacote_nome}
                    </p>
                    <Badge
                      className={`text-xs border-0 flex-shrink-0 ${PACOTE_STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}`}
                    >
                      {p.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      {p.sessoes_usadas || 0}/{p.total_sessoes} sessões
                    </span>
                    {p.data_validade && (
                      <span>
                        · válido até{" "}
                        {new Date(
                          p.data_validade + "T12:00:00",
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  {/* Barra de progresso */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(100, ((p.sessoes_usadas || 0) / p.total_sessoes) * 100)}%`,
                        backgroundColor: "var(--company-primary, #f43f5e)",
                      }}
                    />
                  </div>
                  {p.valor_pago > 0 && (
                    <p className="text-xs font-medium text-emerald-600">
                      R${" "}
                      {Number(p.valor_pago).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
