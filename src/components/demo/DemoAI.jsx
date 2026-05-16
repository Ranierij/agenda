import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  MessageSquare,
  Users,
  Sparkles,
  Send,
  Copy,
  Check,
} from "lucide-react";
import { supabaseApi } from "@/api/supabaseApi";

const oportunidades = [
  {
    tipo: "reativacao",
    urgencia: "alta",
    titulo: "8 clientes sem retorno há +45 dias",
    descricao:
      "Maria Silva, Camila Santos e mais 6 clientes não voltaram ao salão. Potencial de recuperação estimado: R$ 2.340.",
    clientes: [
      "Maria Silva",
      "Camila Santos",
      "Sandra Melo",
      "Patricia Oliveira",
    ],
    potencial: "R$ 2.340",
  },
  {
    tipo: "agenda",
    urgencia: "media",
    titulo: "Horários ociosos às terças 14h-16h",
    descricao:
      "Nos últimos 4 terças-feiras, a faixa 14h-16h ficou com menos de 40% de ocupação.",
    clientes: [],
    potencial: "R$ 960/mês",
  },
  {
    tipo: "pacote",
    urgencia: "oportunidade",
    titulo: "Pacote facial com alta taxa de conversão",
    descricao:
      "Clientes que fizeram hidratação têm 60% de chance de fechar pacote facial mensal.",
    clientes: ["Beatriz Costa", "Fernanda Lima", "Renata Alves"],
    potencial: "R$ 1.800/mês",
  },
  {
    tipo: "fidelidade",
    urgencia: "oportunidade",
    titulo: "5 clientes próximos de completar 10 visitas",
    descricao:
      "Enviar mensagem de reconhecimento e oferecer benefício especial pode acelerar a recorrência.",
    clientes: ["Maria Silva", "Beatriz Costa", "Fernanda Lima"],
    potencial: "Fidelização",
  },
];

const urgenciaConfig = {
  alta: {
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-400",
    label: "Urgente",
  },
  media: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-400",
    label: "Atenção",
  },
  oportunidade: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
    label: "Oportunidade",
  },
};

export default function DemoAI() {
  const [selected, setSelected] = useState(oportunidades[0]);
  const [mensagem, setMensagem] = useState("");
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const gerarMensagem = async () => {
    setGerando(true);
    setMensagem("");
    try {
      const resultado = await supabaseApi.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em marketing para salões de beleza. Crie uma mensagem de WhatsApp personalizada e persuasiva para a seguinte situação:

Tipo: ${selected.tipo}
Situação: ${selected.titulo}
Detalhes: ${selected.descricao}
${selected.clientes.length > 0 ? `Cliente exemplo: ${selected.clientes[0]}` : ""}

A mensagem deve:
- Ser em português brasileiro informal mas profissional
- Ter no máximo 3 parágrafos curtos
- Incluir emoji relevante no início
- Criar senso de exclusividade ou urgência sutil
- Terminar com uma CTA clara
- SEM incluir links ou valores específicos de desconto (a empresa decide isso)

Retorne APENAS a mensagem, sem explicações adicionais.`,
      });
      setMensagem(resultado);
    } catch (e) {
      setMensagem("Não foi possível gerar a mensagem agora. Tente novamente.");
    }
    setGerando(false);
  };

  const copiar = () => {
    navigator.clipboard.writeText(mensagem);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            AI Growth Engine
          </h1>
          <p className="text-slate-500 text-sm">
            Oportunidades identificadas pela inteligência artificial
          </p>
        </div>
        <Badge className="ml-auto bg-rose-100 text-rose-700 border-rose-200">
          <Sparkles className="w-3 h-3 mr-1" /> {oportunidades.length}{" "}
          oportunidades
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Lista de oportunidades */}
        <div className="lg:col-span-2 space-y-3">
          {oportunidades.map((op, i) => {
            const conf = urgenciaConfig[op.urgencia];
            return (
              <div
                key={i}
                onClick={() => setSelected(op)}
                className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${selected === op ? "border-rose-300 shadow-md" : "border-transparent hover:border-slate-200 shadow-sm"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={`text-xs ${conf.color} border`}>
                    {conf.label}
                  </Badge>
                  {op.potencial && (
                    <span className="text-xs font-bold text-emerald-600">
                      {op.potencial}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {op.titulo}
                </p>
                {op.clientes.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {op.clientes.slice(0, 2).join(", ")}
                    {op.clientes.length > 2
                      ? ` +${op.clientes.length - 2}`
                      : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Painel de ação */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${urgenciaConfig[selected.urgencia].dot}`}
                ></div>
                {selected.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                {selected.descricao}
              </p>

              {selected.clientes.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Clientes envolvidos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.clientes.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold">
                          {c[0]}
                        </div>
                        <span className="text-xs text-slate-700">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-rose-500" />
                    Gerar mensagem com IA
                  </p>
                  <Button
                    onClick={gerarMensagem}
                    disabled={gerando}
                    size="sm"
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {gerando ? "Gerando..." : "Gerar Mensagem"}
                  </Button>
                </div>

                {gerando && (
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin flex-shrink-0"></div>
                    <p className="text-sm text-slate-500">
                      IA analisando e gerando mensagem personalizada...
                    </p>
                  </div>
                )}

                {mensagem && !gerando && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 relative">
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
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
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                      >
                        <Send className="w-3 h-3 mr-1" /> Enviar via WhatsApp
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
