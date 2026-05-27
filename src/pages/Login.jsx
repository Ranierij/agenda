import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password || (isSignup && !fullName)) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: "user",
            },
          },
        });

        if (signupError) throw signupError;

        if (!data.session) {
          setMessage("Conta criada. Confirme seu e-mail para acessar.");
          return;
        }

        await checkAppState();
        navigate("/onboarding", { replace: true });
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      await checkAppState();
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Não foi possível acessar o sistema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-rose-500 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {isSignup ? "Criar acesso" : "Acessar sistema"}
              </h1>
              <p className="text-sm text-slate-500">
                BeautyFlow AI conectado ao Supabase
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Nome completo
                </label>
                <Input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                E-mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white h-11"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSignup ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setError("");
              setMessage("");
            }}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-900 mt-5"
          >
            {isSignup
              ? "Já tenho conta, quero entrar"
              : "Ainda não tenho conta, quero criar acesso"}
          </button>
        </div>
      </div>
    </div>
  );
}
