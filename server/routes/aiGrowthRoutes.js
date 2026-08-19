import { Router } from "express";

export function createAiGrowthRouter(controller) {
  const router = Router();

  router.get("/dashboard", controller.dashboard);
  router.post("/chat", controller.chat);
  router.post("/draft", controller.saveDraft);

  return router;
}
