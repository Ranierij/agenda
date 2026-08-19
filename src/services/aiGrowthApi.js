import axios from "axios";
import { supabase } from "@/lib/supabase";

const client = axios.create({
  baseURL: "/api/ai-growth",
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

function normalizeError(error) {
  if (error.response?.data?.error) {
    return new Error(error.response.data.detail || error.response.data.error);
  }
  return new Error(error.message || "Falha ao conectar ao AI Growth.");
}

export const aiGrowthApi = {
  async dashboard(companyId) {
    try {
      const { data } = await client.get("/dashboard", {
        params: { companyId },
      });
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async chat({ companyId, message, editorState }) {
    try {
      const { data } = await client.post("/chat", {
        companyId,
        message,
        editorState,
      });
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async saveDraft({ companyId, campaign }) {
    try {
      const { data } = await client.post("/draft", {
        companyId,
        campaign,
      });
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
};
