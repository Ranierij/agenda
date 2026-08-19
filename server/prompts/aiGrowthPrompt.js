export const campaignResponseSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["campaign", "insight", "question", "confirmation"],
    },
    title: { type: "string" },
    objective: { type: "string" },
    targetAudience: { type: "string" },
    audienceSize: { type: "integer" },
    message: { type: "string" },
    reason: { type: "string" },
    cta: { type: "string" },
    recommendedSendTime: { type: "string" },
    tone: {
      type: "string",
      enum: ["formal", "casual", "engracado", "elegante", "persuasivo"],
    },
    channel: {
      type: "string",
      enum: ["whatsapp", "email", "sms", "push", "multi_channel"],
    },
    confidence: { type: "number" },
    suggestedActions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          action: { type: "string" },
          requiresConfirmation: { type: "boolean" },
        },
        required: ["label", "action", "requiresConfirmation"],
      },
    },
    segments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          count: { type: "integer" },
          reason: { type: "string" },
        },
        required: ["name", "count", "reason"],
      },
    },
    followUpQuestion: { type: "string" },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "type",
    "title",
    "objective",
    "targetAudience",
    "audienceSize",
    "message",
    "reason",
    "cta",
    "recommendedSendTime",
    "tone",
    "channel",
    "confidence",
    "suggestedActions",
    "segments",
    "warnings",
  ],
};

export function buildAiGrowthPrompt({
  userMessage,
  company,
  dashboard,
  selectedTools,
  toolResults,
  editorState,
}) {
  return `
Voce e um agente senior de marketing, CRM e relacionamento para saloes de beleza.
Responda sempre em portugues do Brasil e SEMPRE retorne JSON valido no schema solicitado.

Regras operacionais:
- Nunca afirme que uma campanha foi enviada. O envio exige confirmacao humana.
- Use dados reais das ferramentas sempre que possivel.
- Se o publico for pequeno ou incerto, explique a limitacao em warnings.
- Crie mensagens prontas para WhatsApp, mas preparadas para email, SMS e push.
- Personalize com variaveis quando fizer sentido: {{nome}}, {{servico}}, {{data}}, {{hora}}, {{profissional}}.
- Para campanhas de aniversario, use nome e emojis com bom senso.
- Para clientes inativos, considere faixas de 30, 60, 90 e 180 dias.
- Para agenda futura, priorize confirmacao e reducao de faltas.
- Para pos atendimento, peca avaliacao e indicacao de forma elegante.
- Para VIPs, use exclusividade e reconhecimento.

Empresa:
${JSON.stringify(
  {
    nome: company?.nome_salao || "Salao",
    ramo: "Salao de beleza, estetica e servicos de cuidado pessoal",
    tomPadrao: company?.system_settings?.tom_comunicacao || "casual",
    whatsapp: company?.whatsapp,
    email: company?.email_salao,
    slogan: company?.slogan,
    descricao: company?.descricao,
  },
  null,
  2,
)}

Dashboard CRM:
${JSON.stringify(dashboard, null, 2)}

Ferramentas selecionadas pelo orquestrador:
${JSON.stringify(selectedTools, null, 2)}

Resultados das ferramentas:
${JSON.stringify(toolResults, null, 2)}

Estado atual do editor, se houver:
${JSON.stringify(editorState || {}, null, 2)}

Solicitacao do usuario:
"${userMessage}"

Gere uma resposta objetiva, com uma campanha ou insight acionavel.
`;
}
