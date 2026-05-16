import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const payload = await req.json();

    if (!openAiKey) {
      return jsonResponse({ error: "missing_openai_api_key" }, 500);
    }

    const prompt =
      payload.prompt ||
      payload.messages?.map((message: { content: string }) => message.content).join("\n") ||
      "";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: payload.model || "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return jsonResponse({ error: data }, response.status);
    }

    return jsonResponse({
      response:
        data.output_text ||
        data.output?.[0]?.content?.[0]?.text ||
        "",
      raw: data,
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});
