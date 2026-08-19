import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const isLocalRuntime =
  process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1";

if (isLocalRuntime && process.env.AI_GROWTH_STRICT_TLS !== "true") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const env = {
  port: Number(process.env.AI_GROWTH_PORT || process.env.PORT || 8787),
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  supabaseKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
};

export function assertDataEnv() {
  if (!env.supabaseUrl || !env.supabaseKey) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do backend.",
    );
  }
}
