import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCompany } from "@/hooks/useCompany";
import { useToast } from "@/components/ui/use-toast";
import { aiGrowthApi } from "@/services/aiGrowthApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  Copy,
  Gift,
  MessageSquare,
  PencilLine,
  Send,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
  UserRoundX,
  Users,
  Wand2,
} from "lucide-react";

const quickPrompts = [
  "Crie uma campanha para clientes que nao voltam ha 60 dias.",
  "Tenho poucos agendamentos essa semana.",
  "Crie mensagens para os aniversariantes de hoje.",
  "Quero aumentar meus agendamentos.",
  "Monte uma campanha para clientes VIP.",
  "Crie uma campanha para clientes que faltaram ou cancelaram.",
];

const defaultCampaign = {
  title: "",
  objective: "",
  targetAudience: "",
  audienceSize: 0,
  message: "",
  reason: "",
  cta: "",
  recommendedSendTime: "",
  tone: "casual",
  channel: "whatsapp",
  confidence: 0,
  suggestedActions: [],
  segments: [],
  warnings: [],
};

function metricCards(dashboard) {
  return [
    {
      label: "Clientes cadastrados",
      value: dashboard?.totalClientes || 0,
      icon: Users,
      color: "text-slate-800",
    },
    {
      label: "Clientes ativos",
      value: dashboard?.clientesAtivos || 0,
      icon: UserRoundCheck,
      color: "text-emerald-700",
    },
    {
      label: "Clientes inativos",
      value: dashboard?.clientesInativos || 0,
      icon: UserRoundX,
      color: "text-rose-700",
    },
    {
      label: "Aniversariantes hoje",
      value: dashboard?.aniversariantesHoje || 0,
      icon: Gift,
      color: "text-fuchsia-700",
    },
    {
      label: "Agendamentos futuros",
      value: dashboard?.agendamentosFuturos || 0,
      icon: CalendarClock,
      color: "text-blue-700",
    },
    {
      label: "Sem retorno 60d",
      value: dashboard?.clientesSemRetorno60Dias || 0,
      icon: TrendingUp,
      color: "text-orange-700",
    },
    {
      label: "Campanhas enviadas",
      value: dashboard?.campanhasEnviadas || 0,
      icon: Send,
      color: "text-slate-800",
    },
    {
      label: "Taxa de resposta",
      value: `${dashboard?.taxaResposta || 0}%`,
      icon: MessageSquare,
      color: "text-indigo-700",
    },
  ];
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "text-white rounded-br-md"
            : "bg-slate-100 text-slate-800 rounded-bl-md"
        }`}
        style={isUser ? { backgroundColor: "var(--company-primary, #f43f5e)" } : {}}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function AppAI() {
  const { company_id, loading: loadingCompany } = useCompany();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ola! Sou o agente AI Growth. Posso criar campanhas, analisar clientes inativos, aniversariantes, agenda, VIPs e oportunidades de retorno.",
    },
  ]);
  const [campaign, setCampaign] = useState(defaultCampaign);
  const [lastToolResults, setLastToolResults] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!company_id) return;

    let active = true;
    setLoading(true);

    aiGrowthApi
      .dashboard(company_id)
      .then((data) => {
        if (!active) return;
        setDashboardData(data);
      })
      .catch((error) => {
        toast({
          title: "AI Growth indisponivel",
          description: error.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [company_id, toast]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const metrics = useMemo(
    () => metricCards(dashboardData?.dashboard || {}),
    [dashboardData],
  );

  const updateCampaign = (field, value) => {
    setCampaign((current) => ({ ...current, [field]: value }));
  };

  const sendMessage = async (text = input) => {
    const message = text.trim();
    if (!message || !company_id || chatLoading) return;

    setInput("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setChatLoading(true);

    try {
      const response = await aiGrowthApi.chat({
        companyId: company_id,
        message,
        editorState: campaign,
      });
      const nextCampaign = { ...defaultCampaign, ...(response.campaign || {}) };
      setCampaign(nextCampaign);
      setLastToolResults(response.toolResults || null);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${nextCampaign.title}\n\n${nextCampaign.reason}\n\nSugestao: ${nextCampaign.message}`,
        },
      ]);

      if (response.fallback) {
        toast({
          title: "Modo fallback ativo",
          description:
            "O agente usou os dados do sistema, mas Gemini ainda nao respondeu ou nao esta configurado.",
        });
      }
    } catch (error) {
      toast({
        title: "Nao foi possivel acionar o agente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setChatLoading(false);
    }
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(campaign.message || "");
    toast({ title: "Mensagem copiada!" });
  };

  const saveDraft = async () => {
    if (!company_id || !campaign.message) return;

    setSavingDraft(true);
    try {
      await aiGrowthApi.saveDraft({ companyId: company_id, campaign });
      toast({ title: "Rascunho salvo!" });
      const refreshed = await aiGrowthApi.dashboard(company_id);
      setDashboardData(refreshed);
    } catch (error) {
      toast({
        title: "Nao foi possivel salvar o rascunho",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const prepareSend = () => {
    toast({
      title: "Envio preparado para revisao",
      description:
        "Conecte WhatsApp, Email, SMS ou Push para liberar disparos reais com confirmacao.",
    });
  };

  if (loadingCompany || loading) {
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Growth</h1>
            <p className="text-slate-500 text-sm">
              Agente de marketing e CRM baseado nos dados do sistema.
            </p>
          </div>
        </div>
        <Badge className="w-fit border-0 bg-emerald-50 text-emerald-700">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Agente com tools
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((item) => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-3 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Sugestoes inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(dashboardData?.insights || []).map((insight) => (
                <div
                  key={insight}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  {insight}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Atalhos do agente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={chatLoading}
                  className="w-full rounded-lg border border-slate-100 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="xl:col-span-5 border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Agente IA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[520px] flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((message, index) => (
                  <ChatBubble key={`${message.role}-${index}`} message={message} />
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-500">
                      Analisando dados, selecionando ferramentas e criando campanha...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t bg-white p-3">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Digite seu objetivo: quero aumentar agendamentos..."
                    disabled={chatLoading}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={chatLoading || !input.trim()}
                    style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PencilLine className="w-4 h-4" />
              Editor de campanha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Titulo">
              <Input
                value={campaign.title}
                onChange={(event) => updateCampaign("title", event.target.value)}
                placeholder="Campanha de reativacao"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Tom">
                <select
                  value={campaign.tone}
                  onChange={(event) => updateCampaign("tone", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="engracado">Engracado</option>
                  <option value="elegante">Elegante</option>
                  <option value="persuasivo">Persuasivo</option>
                </select>
              </Field>
              <Field label="Canal">
                <select
                  value={campaign.channel}
                  onChange={(event) =>
                    updateCampaign("channel", event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                  <option value="multi_channel">Multi canal</option>
                </select>
              </Field>
            </div>

            <Field label="Publico">
              <Input
                value={campaign.targetAudience}
                onChange={(event) =>
                  updateCampaign("targetAudience", event.target.value)
                }
                placeholder="Clientes sem retorno ha 60 dias"
              />
            </Field>

            <Field label="Mensagem">
              <Textarea
                value={campaign.message}
                onChange={(event) => updateCampaign("message", event.target.value)}
                placeholder="A campanha gerada pelo agente aparecera aqui."
                className="min-h-44 resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Quantidade sugerida</p>
                <p className="font-bold text-slate-900">
                  {campaign.audienceSize || 0}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Confianca</p>
                <p className="font-bold text-slate-900">
                  {Math.round((campaign.confidence || 0) * 100)}%
                </p>
              </div>
            </div>

            {campaign.reason && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                <strong className="text-slate-800">Motivo: </strong>
                {campaign.reason}
              </div>
            )}

            {campaign.warnings?.length > 0 && (
              <div className="space-y-2">
                {campaign.warnings.map((warning) => (
                  <div
                    key={warning}
                    className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"
                  >
                    {warning}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={copyMessage}
                disabled={!campaign.message}
                className="flex-1"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                disabled={!campaign.message || savingDraft}
                className="flex-1"
              >
                <PencilLine className="w-4 h-4" />
                {savingDraft ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                type="button"
                onClick={prepareSend}
                disabled={!campaign.message}
                className="flex-1"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Revisar envio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {lastToolResults && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ferramentas usadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.keys(lastToolResults).map((tool) => (
                <Badge key={tool} className="border-0 bg-slate-100 text-slate-700">
                  {tool}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
