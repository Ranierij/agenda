import { campaignResponseSchema, buildAiGrowthPrompt } from "../prompts/aiGrowthPrompt.js";
import { createAiGrowthTools } from "../tools/aiGrowthTools.js";

function parseDays(message) {
  const match = String(message || "").match(/(\d{2,3})\s*dias?/i);
  return match ? Number(match[1]) : null;
}

function inferTools(message) {
  const text = String(message || "").toLowerCase();
  const days = parseDays(text);
  const tools = ["buscarResumoEmpresa"];

  if (text.includes("anivers")) tools.push("buscarAniversariantes");
  if (text.includes("inativo") || text.includes("não volt") || text.includes("nao volt") || text.includes("sem retorno")) {
    tools.push("buscarClientesInativos");
  }
  if (text.includes("agenda") || text.includes("agendamento") || text.includes("horário") || text.includes("horario") || text.includes("semana")) {
    tools.push("buscarAgendamentos");
  }
  if (text.includes("vip") || text.includes("gastam") || text.includes("fiéis") || text.includes("fieis")) {
    tools.push("buscarClientesVIP");
  }
  if (text.includes("cancel") || text.includes("falt") || text.includes("recuper")) {
    tools.push("buscarRecuperacaoClientes");
  }

  if (tools.length === 1) {
    tools.push("buscarClientesSemRetorno", "buscarClientesVIP", "buscarAgendamentos");
  }

  return {
    toolNames: [...new Set(tools)],
    params: {
      inactiveDays: days || 60,
      noReturnDays: days || 45,
    },
  };
}

function fallbackCampaign({ userMessage, dashboard, toolResults, selectedTools, error }) {
  const inactive =
    toolResults.buscarClientesInativos ||
    toolResults.buscarClientesSemRetorno ||
    [];
  const birthdayCount = toolResults.buscarAniversariantes?.length || 0;
  const audienceSize = Array.isArray(inactive)
    ? inactive.length
    : dashboard?.clientesSemRetorno60Dias || 0;

  return {
    type: "campaign",
    title: birthdayCount
      ? "Campanha de aniversario do dia"
      : "Campanha inteligente de reativacao",
    objective: userMessage || "Aumentar agendamentos e relacionamento com clientes.",
    targetAudience: birthdayCount
      ? "Clientes aniversariantes de hoje"
      : "Clientes sem retorno recente",
    audienceSize: birthdayCount || audienceSize,
    message: birthdayCount
      ? "Parabens, {{nome}}! 🎉 Toda a nossa equipe deseja um dia lindo para voce. Preparamos um carinho especial para seu proximo atendimento. Responda esta mensagem e agende seu horario."
      : "Oi, {{nome}}! Sentimos sua falta por aqui 💖 Que tal reservar um momento para se cuidar esta semana? Temos uma condicao especial esperando por voce. Responda esta mensagem para escolher seu melhor horario.",
    reason:
      "Usei os dados de clientes, aniversarios e historico de agendamentos disponiveis no sistema.",
    cta: "Responder para agendar",
    recommendedSendTime: "Hoje entre 10:00 e 12:00 ou entre 16:00 e 18:00",
    tone: "casual",
    channel: "whatsapp",
    confidence: error ? 0.72 : 0.88,
    suggestedActions: [
      {
        label: "Salvar rascunho",
        action: "save_draft",
        requiresConfirmation: false,
      },
      {
        label: "Preparar envio",
        action: "prepare_send",
        requiresConfirmation: true,
      },
    ],
    segments: [
      {
        name: "Publico principal",
        count: birthdayCount || audienceSize || 0,
        reason: "Segmento encontrado pelas ferramentas do agente.",
      },
    ],
    followUpQuestion: "Deseja ajustar o tom ou revisar a mensagem antes do envio?",
    warnings: error
      ? [`Gemini indisponivel ou nao configurado: ${error.message}`]
      : [],
    selectedTools,
  };
}

export class AiGrowthAgent {
  constructor({ repository, geminiClient }) {
    this.repository = repository;
    this.geminiClient = geminiClient;
  }

  createTools(authToken) {
    return createAiGrowthTools(this.repository.withAuth(authToken));
  }

  async buildDashboard(companyId, authToken) {
    const tools = this.createTools(authToken);
    const summary = await tools.buscarResumoEmpresa({ companyId });
    const [birthdays, inactive30, inactive60, inactive90, vip, weekAppointments] =
      await Promise.all([
        tools.buscarAniversariantes({ companyId }),
        tools.buscarClientesInativos({ companyId, days: 30 }),
        tools.buscarClientesInativos({ companyId, days: 60 }),
        tools.buscarClientesInativos({ companyId, days: 90 }),
        tools.buscarClientesVIP({ companyId, limit: 10 }),
        tools.buscarAgendamentos({ companyId, range: "week" }),
      ]);

    return {
      company: summary.company,
      dashboard: {
        ...summary.dashboard,
        aniversariantesHoje: birthdays.length,
        clientesInativos30Dias: inactive30.length,
        clientesInativos60Dias: inactive60.length,
        clientesInativos90Dias: inactive90.length,
        agendamentosSemana: weekAppointments.length,
      },
      insights: [
        birthdays.length > 0
          ? `Hoje existem ${birthdays.length} aniversariante(s).`
          : "Nao ha aniversariantes hoje.",
        inactive60.length > 0
          ? `Ha ${inactive60.length} clientes sem retorno ha 60+ dias.`
          : "A base nao tem clientes inativos ha 60+ dias.",
        weekAppointments.length === 0
          ? "Sua agenda da proxima semana esta vazia."
          : `Existem ${weekAppointments.length} agendamentos nos proximos 7 dias.`,
        vip.length > 0
          ? `${vip.length} clientes VIP podem receber uma campanha exclusiva.`
          : "Ainda nao ha clientes VIP suficientes para campanha exclusiva.",
      ],
      segments: {
        birthdays: birthdays.slice(0, 8),
        inactive60: inactive60.slice(0, 8),
        vip: vip.slice(0, 8),
      },
    };
  }

  async chat({ companyId, message, editorState, authToken }) {
    const tools = this.createTools(authToken);
    const { toolNames, params } = inferTools(message);
    const summary = await tools.buscarResumoEmpresa({ companyId });
    const toolResults = {};

    for (const toolName of toolNames) {
      if (toolName === "buscarResumoEmpresa") {
        toolResults[toolName] = summary;
      } else if (toolName === "buscarClientesInativos") {
        toolResults[toolName] = await tools[toolName]({
          companyId,
          days: params.inactiveDays,
        });
      } else if (toolName === "buscarClientesSemRetorno") {
        toolResults[toolName] = await tools[toolName]({
          companyId,
          days: params.noReturnDays,
        });
      } else if (toolName === "buscarAgendamentos") {
        toolResults[toolName] = await tools[toolName]({
          companyId,
          range: "week",
        });
      } else {
        toolResults[toolName] = await tools[toolName]({ companyId });
      }
    }

    const prompt = buildAiGrowthPrompt({
      userMessage: message,
      company: summary.company,
      dashboard: summary.dashboard,
      selectedTools: toolNames,
      toolResults,
      editorState,
    });

    try {
      const campaign = await this.geminiClient.generateJson({
        prompt,
        schema: campaignResponseSchema,
      });
      return { campaign, toolResults, selectedTools: toolNames, fallback: false };
    } catch (error) {
      return {
        campaign: fallbackCampaign({
          userMessage: message,
          dashboard: summary.dashboard,
          toolResults,
          selectedTools: toolNames,
          error,
        }),
        toolResults,
        selectedTools: toolNames,
        fallback: true,
      };
    }
  }

  async saveDraft({ companyId, campaign, authToken }) {
    const tools = this.createTools(authToken);
    return tools.salvarRascunho({ companyId, campaign });
  }
}
