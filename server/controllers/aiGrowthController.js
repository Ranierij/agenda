export class AiGrowthController {
  constructor(agent) {
    this.agent = agent;
  }

  getAuthToken(request) {
    return request.headers.authorization?.replace(/^Bearer\s+/i, "") || null;
  }

  dashboard = async (request, response, next) => {
    try {
      const { companyId } = request.query;
      if (!companyId) {
        response.status(400).json({ error: "companyId e obrigatorio." });
        return;
      }

      const data = await this.agent.buildDashboard(
        companyId,
        this.getAuthToken(request),
      );
      response.json(data);
    } catch (error) {
      next(error);
    }
  };

  chat = async (request, response, next) => {
    try {
      const { companyId, message, editorState } = request.body || {};
      if (!companyId || !message) {
        response
          .status(400)
          .json({ error: "companyId e message sao obrigatorios." });
        return;
      }

      const data = await this.agent.chat({
        companyId,
        message,
        editorState,
        authToken: this.getAuthToken(request),
      });
      response.json(data);
    } catch (error) {
      next(error);
    }
  };

  saveDraft = async (request, response, next) => {
    try {
      const { companyId, campaign } = request.body || {};
      if (!companyId || !campaign?.message) {
        response
          .status(400)
          .json({ error: "companyId e campaign.message sao obrigatorios." });
        return;
      }

      const data = await this.agent.saveDraft({
        companyId,
        campaign,
        authToken: this.getAuthToken(request),
      });
      response.json(data);
    } catch (error) {
      next(error);
    }
  };
}
