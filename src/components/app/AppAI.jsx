import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  MessageSquare,
  Users,
  Sparkles,
  Send,
  Copy,
  Check,
  TrendingUp,
} from "lucide-react";

export default function AppAI() {
  const { company_id, loading: loadingUser } = useCompany();
  const [clientes, setClientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [tipoMensagem, setTipoMensagem] = useState("reativacao");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company_id) return;
    Promise.all([
      supabaseApi.entities.Cliente.filter({ company_id }, "nome", 500).catch(
        () => [],
      ),
      supabaseApi.entities.Agendamento.filter({ company_id }, "-data", 300).catch(
        () => [],
      ),
    ]).then(([cls, ags]) => {
      setClientes(cls);
      setAgendamentos(ags);
      setLoading(false);
    });
  }, [company_id]);

  const hoje = new Date();
  const limite30 = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const clientesComAgendamento = new Set(
    agendamentos.filter((a) => a.data >= limite30).map((a) => a.cliente_nome),
  );
  const clientesInativos = clientes.filter(
    (c) => !clientesComAgendamento.has(c.nome),
  );

  // Serviços mais frequentes
  const servicoCount = agendamentos.reduce((acc, a) => {
    if (a.servico_nome) acc[a.servico_nome] = (acc[a.servico_nome] || 0) + 1;
    return acc;
  }, {});
  const servicoTop =
    Object.entries(servicoCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "seus serviços";

  const oportunidades = [
    {
      id: "reativacao",
      titulo: `${clientesInativos.length} clientes inativos há +30 dias`,
      descricao:
        clientesInativos.length > 0
          ? `${clientesInativos
              .slice(0, 3)
              .map((c) => c.nome)
              .join(
                ", ",
              )}${clientesInativos.length > 3 ? ` e mais ${clientesInativos.length - 3}` : ""} não voltaram recentemente.`
          : "Ótimo! Nenhum cliente inativo no momento.",
      cor: clientesInativos.length > 0 ? "alta" : "oportunidade",
      icone: Users,
    },
    {
      id: "agendamento",
      titulo: "Lembrete de agendamento futuro",
      descricao:
        "Envie lembretes 24h antes para reduzir no-show e aumentar confirmações.",
      cor: "media",
      icone: MessageSquare,
    },
    {
      id: "pacote",
      titulo: `Oferta de pacote — baseada em "${servicoTop}"`,
      descricao:
        "Clientes frequentes têm maior propensão a aderir a pacotes mensais.",
      cor: "oportunidade",
      icone: TrendingUp,
    },
    {
      id: "aniversario",
      titulo: "Mensagem de aniversário",
      descricao: "Crie conexão emocional com clientes no dia do aniversário.",
      cor: "oportunidade",
      icone: Sparkles,
    },
  ];

  const corConfig = {
    alta: "bg-red-100 text-red-700",
    media: "bg-yellow-100 text-yellow-700",
    oportunidade: "bg-emerald-100 text-emerald-700",
  };

  const gerarMensagem = async () => {
    setGerando(true);
    setMensagem("");
    const nomeSalao =
      (await supabaseApi.auth.me().catch(() => null))?.nome_salao || "nosso salão";
    const prompts = {
      reativacao: `Crie uma mensagem de WhatsApp para reativar clientes do salão "${nomeSalao}" que não voltaram há mais de 30 dias. Acolhedora, exclusividade, CTA suave. Emojis. Máximo 3 parágrafos. Apenas a mensagem.`,
      agendamento: `Crie uma mensagem de WhatsApp de lembrete de agendamento para o salão "${nomeSalao}". Amigável, confirmar horário com [HORÁRIO] e [DATA], orientar cancelamento. Emojis. Máximo 3 linhas. Apenas a mensagem.`,
      pacote: `Crie uma mensagem de WhatsApp do salão "${nomeSalao}" oferecendo pacote especial de "${servicoTop}" para cliente fiel. Exclusividade, valor percebido, urgência sutil. Emojis. Máximo 3 parágrafos. Apenas a mensagem.`,
      aniversario: `Crie uma mensagem de WhatsApp de aniversário do salão "${nomeSalao}" para cliente. Calorosa, brinde especial no próximo atendimento. Emojis de bolo/flores. Máximo 2 parágrafos. Apenas a mensagem.`,
    };
    const resultado = await supabaseApi.integrations.Core.InvokeLLM({
      prompt: prompts[tipoMensagem],
    });
    setMensagem(resultado);
    setGerando(false);
  };

  const copiar = () => {
    navigator.clipboard.writeText(mensagem);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const opSelecionada = oportunidades.find((o) => o.id === tipoMensagem);

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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            AI Growth Engine
          </h1>
          <p className="text-slate-500 text-sm">
            Insights baseados nos seus dados reais
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Ações recomendadas
          </h2>
          {oportunidades.map((op) => (
            <div
              key={op.id}
              onClick={() => setTipoMensagem(op.id)}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${tipoMensagem === op.id ? "border-rose-300 shadow-md" : "border-transparent hover:border-slate-200 shadow-sm"}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <op.icone className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {op.titulo}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {op.descricao}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                Gerar mensagem para: {opSelecionada?.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={gerarMensagem}
                disabled={gerando}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {gerando ? "Gerando com IA..." : "Gerar Mensagem com IA"}
              </Button>
              {gerando && (
                <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin flex-shrink-0" />
                  <p className="text-sm text-slate-500">
                    Analisando dados e gerando mensagem...
                  </p>
                </div>
              )}
              {mensagem && !gerando && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 relative">
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap pr-8">
                    {mensagem}
                  </p>
                  <button
                    onClick={copiar}
                    className="absolute top-3 right-3 p-1.5 bg-white rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    {copiado ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={copiar}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                    >
                      <Send className="w-3 h-3 mr-1" /> Copiar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={gerarMensagem}
                      className="text-xs"
                    >
                      Regerar
                    </Button>
                  </div>
                </div>
              )}
              {!mensagem && !gerando && (
                <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400 text-sm">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>
                    Clique em "Gerar Mensagem" para criar uma mensagem
                    personalizada com IA.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {clientes.length}
                </p>
                <p className="text-xs text-slate-500">Total Clientes</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-500">
                  {clientesInativos.length}
                </p>
                <p className="text-xs text-slate-500">Inativos 30d</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-500">
                  {agendamentos.filter((a) => a.status === "concluido").length}
                </p>
                <p className="text-xs text-slate-500">Concluídos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
