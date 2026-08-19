import { env, assertDataEnv } from "../config/env.js";

function authHeaders(authToken) {
  const bearer = authToken || env.supabaseKey;
  return {
    apikey: env.supabaseKey,
    Authorization: `Bearer ${bearer}`,
    "Content-Type": "application/json",
  };
}

function queryParams(params = {}) {
  return new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ).toString();
}

async function supabaseFetch(path, params = {}, authToken) {
  assertDataEnv();

  const query = queryParams({ select: "*", ...params });
  const url = `${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}?${query}`;
  const response = await fetch(url, {
    headers: authHeaders(authToken),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${path} ${response.status}: ${text}`);
  }

  return response.json();
}

export class SupabaseRepository {
  constructor(authToken = null) {
    this.authToken = authToken;
  }

  withAuth(authToken) {
    return new SupabaseRepository(authToken);
  }

  async insert(table, payload) {
    assertDataEnv();

    const url = `${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...authHeaders(this.authToken),
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase insert ${table} ${response.status}: ${text}`);
    }

    const rows = await response.json();
    return rows[0] || null;
  }

  async getCompany(companyId) {
    const rows = await supabaseFetch("Salao", {
      id: `eq.${companyId}`,
      limit: 1,
    }, this.authToken);
    return rows[0] || null;
  }

  async getClients(companyId) {
    return supabaseFetch("Cliente", {
      company_id: `eq.${companyId}`,
      order: "nome.asc",
      limit: 5000,
    }, this.authToken);
  }

  async getAppointments(companyId) {
    return supabaseFetch("Agendamento", {
      company_id: `eq.${companyId}`,
      order: "data.desc,hora.desc",
      limit: 5000,
    }, this.authToken);
  }

  async getAppointmentsBetween(companyId, startDate, endDate) {
    return supabaseFetch("Agendamento", {
      company_id: `eq.${companyId}`,
      data: `gte.${startDate}`,
      and: `(data.lte.${endDate})`,
      order: "data.asc,hora.asc",
      limit: 5000,
    }, this.authToken);
  }

  async getCampaigns(companyId) {
    return supabaseFetch("Campanha", {
      company_id: `eq.${companyId}`,
      order: "created_date.desc",
      limit: 1000,
    }, this.authToken);
  }

  async saveCampaignDraft(companyId, campaign) {
    return this.insert("Campanha", {
      company_id: companyId,
      title: campaign.title || "Campanha AI Growth",
      objective: campaign.objective || null,
      target_audience: campaign.targetAudience || null,
      audience_size: campaign.audienceSize || 0,
      message: campaign.message || "",
      cta: campaign.cta || null,
      channel: campaign.channel || "whatsapp",
      tone: campaign.tone || "casual",
      status: "draft",
      recommended_send_time: campaign.recommendedSendTime || null,
      metadata: {
        reason: campaign.reason,
        confidence: campaign.confidence,
        segments: campaign.segments || [],
        warnings: campaign.warnings || [],
      },
    });
  }
}
