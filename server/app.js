import express from "express";
import cors from "cors";
import { SupabaseRepository } from "./repositories/supabaseRepository.js";
import { GeminiClient } from "./services/geminiClient.js";
import { AiGrowthAgent } from "./agents/aiGrowthAgent.js";
import { AiGrowthController } from "./controllers/aiGrowthController.js";
import { createAiGrowthRouter } from "./routes/aiGrowthRoutes.js";

export function createApp() {
  const app = express();
  const repository = new SupabaseRepository();
  const geminiClient = new GeminiClient();
  const agent = new AiGrowthAgent({ repository, geminiClient });
  const controller = new AiGrowthController(agent);

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true, service: "ai-growth" });
  });

  app.use("/api/ai-growth", createAiGrowthRouter(controller));

  app.use((error, _request, response, _next) => {
    console.error(error);
    const isSupabaseAuthError =
      error.message?.includes("401") ||
      error.message?.includes("403") ||
      error.message?.toLowerCase().includes("permission") ||
      error.message?.toLowerCase().includes("rls");

    response.status(isSupabaseAuthError ? 401 : 500).json({
      error: isSupabaseAuthError
        ? "Sessao do Supabase ausente ou sem permissao para consultar os dados."
        : "Erro interno no AI Growth.",
      detail: error.message,
    });
  });

  return app;
}
