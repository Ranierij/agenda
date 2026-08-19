import { addDays, daysBetween, sameMonthDay, toDateInput } from "../utils/date.js";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function lastAppointmentByClient(appointments) {
  return appointments.reduce((acc, appointment) => {
    const key = appointment.cliente_id || normalizeText(appointment.cliente_nome);
    if (!key || !appointment.data) return acc;
    const current = acc[key];
    if (!current || appointment.data > current.data) {
      acc[key] = appointment;
    }
    return acc;
  }, {});
}

function buildClientProfiles(clients, appointments) {
  const lastByClient = lastAppointmentByClient(appointments);

  return clients.map((client) => {
    const key = client.id || normalizeText(client.nome);
    const clientAppointments = appointments.filter(
      (appointment) =>
        appointment.cliente_id === client.id ||
        normalizeText(appointment.cliente_nome) === normalizeText(client.nome),
    );
    const completed = clientAppointments.filter((a) => a.status === "concluido");
    const totalSpent = completed.reduce((sum, a) => sum + Number(a.valor || 0), 0);
    const lastAppointment = lastByClient[key] || clientAppointments[0] || null;

    return {
      id: client.id,
      nome: client.nome,
      telefone: client.telefone,
      email: client.email,
      data_nascimento: client.data_nascimento,
      ativo: client.ativo,
      totalAgendamentos: clientAppointments.length,
      atendimentosConcluidos: completed.length,
      totalGasto: totalSpent,
      ticketMedio: completed.length ? totalSpent / completed.length : 0,
      ultimoAtendimento: lastAppointment?.data || null,
      ultimoServico: lastAppointment?.servico_nome || null,
      ultimoProfissional: lastAppointment?.profissional_nome || null,
      diasSemRetorno: daysBetween(lastAppointment?.data),
      statusMaisRecente: lastAppointment?.status || null,
    };
  });
}

function summarizeDashboard({ clients, appointments, campaignDrafts = [] }) {
  const today = toDateInput();
  const futureAppointments = appointments.filter(
    (a) => a.data >= today && a.status !== "cancelado" && a.status !== "faltou",
  );
  const lastByClient = lastAppointmentByClient(appointments);
  const activeClientNames = new Set(
    Object.values(lastByClient)
      .filter((a) => daysBetween(a.data) !== null && daysBetween(a.data) <= 60)
      .map((a) => a.cliente_id || normalizeText(a.cliente_nome)),
  );
  const birthdaysToday = clients.filter((client) =>
    sameMonthDay(client.data_nascimento),
  );
  const inactive60 = buildClientProfiles(clients, appointments).filter(
    (client) => client.diasSemRetorno === null || client.diasSemRetorno >= 60,
  );

  return {
    totalClientes: clients.length,
    clientesAtivos: activeClientNames.size,
    clientesInativos: Math.max(clients.length - activeClientNames.size, 0),
    aniversariantesHoje: birthdaysToday.length,
    agendamentosFuturos: futureAppointments.length,
    clientesSemRetorno60Dias: inactive60.length,
    campanhasEnviadas: campaignDrafts.filter((c) => c.status === "sent").length,
    taxaResposta: 0,
  };
}

export function createAiGrowthTools(repository) {
  const loadBase = async (companyId) => {
    const [company, clients, appointments, campaigns] = await Promise.all([
      repository.getCompany(companyId),
      repository.getClients(companyId),
      repository.getAppointments(companyId),
      repository.getCampaigns(companyId).catch(() => []),
    ]);

    return { company, clients, appointments, campaignDrafts: campaigns };
  };

  return {
    async buscarResumoEmpresa({ companyId }) {
      const base = await loadBase(companyId);
      return {
        company: base.company,
        dashboard: summarizeDashboard(base),
        totalAgendamentos: base.appointments.length,
      };
    },

    async buscarAniversariantes({ companyId }) {
      const { clients } = await loadBase(companyId);
      return clients
        .filter((client) => sameMonthDay(client.data_nascimento))
        .map((client) => ({
          id: client.id,
          nome: client.nome,
          telefone: client.telefone,
          email: client.email,
          data_nascimento: client.data_nascimento,
        }));
    },

    async buscarClientesInativos({ companyId, days = 60 }) {
      const { clients, appointments } = await loadBase(companyId);
      return buildClientProfiles(clients, appointments)
        .filter(
          (client) =>
            client.diasSemRetorno === null || client.diasSemRetorno >= days,
        )
        .sort((a, b) => (b.diasSemRetorno || 9999) - (a.diasSemRetorno || 9999))
        .slice(0, 300);
    },

    async buscarAgendamentos({ companyId, range = "future" }) {
      const { appointments } = await loadBase(companyId);
      const today = toDateInput();
      const weekEnd = toDateInput(addDays(new Date(), 7));

      if (range === "week") {
        return appointments.filter((a) => a.data >= today && a.data <= weekEnd);
      }
      if (range === "future") {
        return appointments.filter((a) => a.data >= today);
      }
      return appointments.slice(0, 500);
    },

    async buscarClientesVIP({ companyId, limit = 30 }) {
      const { clients, appointments } = await loadBase(companyId);
      return buildClientProfiles(clients, appointments)
        .filter((client) => client.totalGasto > 0)
        .sort((a, b) => b.totalGasto - a.totalGasto)
        .slice(0, limit);
    },

    async buscarClientesSemRetorno({ companyId, days = 45 }) {
      const { clients, appointments } = await loadBase(companyId);
      return buildClientProfiles(clients, appointments)
        .filter(
          (client) =>
            client.diasSemRetorno === null || client.diasSemRetorno >= days,
        )
        .slice(0, 300);
    },

    async buscarRecuperacaoClientes({ companyId }) {
      const { clients, appointments } = await loadBase(companyId);
      const profiles = buildClientProfiles(clients, appointments);
      const canceledOrMissedNames = new Set(
        appointments
          .filter((a) => a.status === "cancelado" || a.status === "faltou")
          .map((a) => a.cliente_id || normalizeText(a.cliente_nome)),
      );

      return {
        apenasUmAtendimento: profiles.filter((client) => client.totalAgendamentos === 1),
        nuncaVoltaram: profiles.filter(
          (client) => client.diasSemRetorno === null || client.diasSemRetorno >= 90,
        ),
        cancelaramOuFaltaram: profiles.filter((client) =>
          canceledOrMissedNames.has(client.id || normalizeText(client.nome)),
        ),
      };
    },

    async buscarHistoricoCliente({ companyId, clientName }) {
      const { clients, appointments } = await loadBase(companyId);
      const client = clients.find(
        (item) => normalizeText(item.nome) === normalizeText(clientName),
      );
      const records = appointments.filter(
        (a) =>
          a.cliente_id === client?.id ||
          normalizeText(a.cliente_nome) === normalizeText(clientName),
      );
      return { client, appointments: records };
    },

    async buscarCampanhas({ companyId }) {
      return repository.getCampaigns(companyId);
    },

    async salvarRascunho({ companyId, campaign }) {
      const saved = await repository.saveCampaignDraft(companyId, campaign);
      return {
        status: "draft_saved",
        campaign: saved,
        message: "Rascunho salvo para revisao.",
      };
    },

    async enviarCampanha() {
      return {
        status: "requires_confirmation",
        message:
          "Envio real ainda esta bloqueado. Conecte WhatsApp, Email, SMS ou Push e confirme antes de disparar.",
      };
    },
  };
}

export const toolDeclarations = [
  {
    name: "buscarResumoEmpresa",
    description: "Busca estatisticas consolidadas da empresa para o dashboard de CRM.",
  },
  {
    name: "buscarAniversariantes",
    description: "Localiza clientes aniversariantes do dia.",
  },
  {
    name: "buscarClientesInativos",
    description: "Localiza clientes sem atendimento recente por 30, 60, 90 ou 180 dias.",
  },
  {
    name: "buscarAgendamentos",
    description: "Busca agenda futura, semanal ou historica.",
  },
  {
    name: "buscarClientesVIP",
    description: "Identifica clientes com maior gasto e frequencia.",
  },
  {
    name: "buscarClientesSemRetorno",
    description: "Busca clientes que nao retornam ha X dias.",
  },
  {
    name: "buscarRecuperacaoClientes",
    description: "Busca clientes de recuperacao: uma compra, cancelamentos, faltas e abandono.",
  },
  {
    name: "buscarHistoricoCliente",
    description: "Busca historico individual de um cliente pelo nome.",
  },
  {
    name: "salvarRascunho",
    description: "Prepara um rascunho de campanha para revisao.",
  },
  {
    name: "enviarCampanha",
    description: "Representa envio real, sempre exigindo confirmacao humana.",
  },
];
