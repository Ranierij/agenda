import { supabase } from "@/lib/supabase";

const ENTITY_TABLES = [
  "Agendamento",
  "Campanha",
  "AppConfig",
  "Cliente",
  "ListaEspera",
  "Notificacao",
  "Pacote",
  "PacoteCliente",
  "Profissional",
  "Salao",
  "Servico",
  "User",
];

function parseOrder(order) {
  if (!order) return null;
  const descending = order.startsWith("-");
  const column = descending ? order.slice(1) : order;
  const mappedColumn = column === "created_date" ? "created_date" : column;
  return { column: mappedColumn, ascending: !descending };
}

function applyOrder(query, order) {
  const parsed = parseOrder(order);
  if (!parsed) return query;
  return query.order(parsed.column, { ascending: parsed.ascending });
}

function applyFilters(query, filters = {}) {
  return Object.entries(filters || {}).reduce((builder, [column, value]) => {
    if (Array.isArray(value)) return builder.in(column, value);
    if (value === null) return builder.is(column, null);
    return builder.eq(column, value);
  }, query);
}

function toSupabaseUser(user) {
  if (!user) return null;

  const metadata = user.user_metadata || {};
  const appMetadata = user.app_metadata || {};

  return {
    id: user.id,
    email: user.email,
    role: appMetadata.role || metadata.role || "user",
    full_name: metadata.full_name || metadata.name || user.email,
    ...metadata,
  };
}

function createEntity(table) {
  return {
    async list(order = "-created_date", limit = 1000) {
      let query = supabase.from(table).select("*");
      query = applyOrder(query, order);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async filter(filters = {}, order = "-created_date", limit = 1000) {
      let query = supabase.from(table).select("*");
      query = applyFilters(query, filters);
      query = applyOrder(query, order);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async create(payload) {
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async bulkCreate(payloads) {
      if (!payloads?.length) return [];

      const { data, error } = await supabase
        .from(table)
        .insert(payloads)
        .select();

      if (error) throw error;
      return data || [];
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return { id };
    },
  };
}

const entities = Object.fromEntries(
  ENTITY_TABLES.map((table) => [table, createEntity(table)]),
);

export const supabaseApi = {
  entities,

  auth: {
    async me() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) throw new Error("Usuario nao autenticado.");

      return toSupabaseUser(user);
    },

    async updateMe(payload) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) throw new Error("Usuario nao autenticado.");

      const { data: updatedAuth, error: authError } =
        await supabase.auth.updateUser({
          data: {
            ...(user.user_metadata || {}),
            ...payload,
          },
        });

      if (authError) throw authError;

      const salaoPayload = {
        ...payload,
        owner_email: user.email,
        admin_email: payload.admin_email || user.email,
        onboarding_concluido: true,
        status: payload.status || "ativo",
      };

      const { data: existing, error: existingError } = await supabase
        .from("Salao")
        .select("id")
        .or(`owner_email.eq.${user.email},admin_email.eq.${user.email}`)
        .limit(1)
        .maybeSingle();

      if (existingError) throw existingError;

      const query = existing
        ? supabase
            .from("Salao")
            .update(salaoPayload)
            .eq("id", existing.id)
            .select()
            .single()
        : supabase.from("Salao").insert(salaoPayload).select().single();

      const { data: salao, error: salaoError } = await query;
      if (salaoError) throw salaoError;

      return {
        ...toSupabaseUser(updatedAuth.user),
        ...salao,
        company_id: salao.id,
      };
    },

    async logout(redirectTo = "/") {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = redirectTo;
    },

    redirectToLogin() {
      window.location.href = "/login";
    },
  },

  users: {
    async inviteUser(email, role = "user") {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email, role },
      });

      if (error) throw error;
      return data;
    },
  },

  integrations: {
    Core: {
      async SendEmail(payload) {
        const { data, error } = await supabase.functions.invoke("send-email", {
          body: payload,
        });

        if (error) throw error;
        return data;
      },

      async InvokeLLM(payload) {
        const { data, error } = await supabase.functions.invoke("invoke-llm", {
          body: payload,
        });

        if (error) throw error;
        return data;
      },

      async UploadFile({ file, bucket = "uploads" }) {
        const extension = file.name?.split(".").pop();
        const filename = `${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filename, file, { upsert: false });

        if (error) throw error;

        const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
        return { file_url: data.publicUrl };
      },
    },
  },
};
