import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail =
      Deno.env.get("EMAIL_FROM") || "BeautyFlow AI <onboarding@resend.dev>";
    const payload = await req.json();

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY ausente. E-mail ignorado.", payload);
      return jsonResponse({ skipped: true, reason: "missing_resend_api_key" });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: payload.to,
        subject: payload.subject,
        text: payload.body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return jsonResponse({ error: data }, response.status);
    }

    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});
