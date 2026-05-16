import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { email, role = "user" } = await req.json();

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "missing_supabase_admin_env" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { role },
    });

    if (error) {
      return jsonResponse({ error: error.message }, 400);
    }

    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});
