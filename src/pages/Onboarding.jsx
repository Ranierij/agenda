import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Building,
  Scissors,
  UserCheck,
  Check,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const STEPS = ["salao", "servicos", "profissionais", "pronto"];

const SERVICOS_SUGERIDOS = [
  {
    nome: "Corte Feminino",
    categoria: "Cabelo",
    duracao_minutos: 60,
    valor: 80,
  },
  { nome: "Escova", categoria: "Cabelo", duracao_minutos: 45, valor: 60 },
  { nome: "Coloração", categoria: "Cabelo", duracao_minutos: 120, valor: 200 },
  { nome: "Hidratação", categoria: "Cabelo", duracao_minutos: 60, valor: 90 },
  { nome: "Manicure", categoria: "Unhas", duracao_minutos: 45, valor: 50 },
  { nome: "Pedicure", categoria: "Unhas", duracao_minutos: 60, valor: 60 },
  {
    nome: "Sobrancelha",
    categoria: "Sobrancelha",
    duracao_minutos: 30,
    valor: 40,
  },
  {
    nome: "Maquiagem",
    categoria: "Maquiagem",
    duracao_minutos: 60,
    valor: 120,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState("salao");
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [salaoForm, setSalaoForm] = useState({
    nome_salao: "",
    slug: "",
    telefone: "",
    endereco: "",
  });
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [profForm, setProfForm] = useState({ nome: "", especialidade: "" });
  const [profissionais, setProfissionais] = useState([]);

  useEffect(() => {
    supabaseApi.auth.me().then((u) => {
      setUser(u);
      // Se já tem onboarding completo, redirecionar
      if (u.nome_salao && u.slug) navigate("/dashboard");
    });
  }, []);

  const toggleServico = (s) => {
    setServicosSelecionados((sel) =>
      sel.find((x) => x.nome === s.nome)
        ? sel.filter((x) => x.nome !== s.nome)
        : [...sel, s],
    );
  };

  const addProfissional = () => {
    if (!profForm.nome) return;
    setProfissionais((ps) => [...ps, { ...profForm }]);
    setProfForm({ nome: "", especialidade: "" });
  };

  const salvarSalao = async () => {
    if (!salaoForm.nome_salao) {
      toast({ title: "Digite o nome do salão", variant: "destructive" });
      return;
    }
    const slugNorm = (salaoForm.slug || salaoForm.nome_salao)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSaving(true);
    const updatedUser = await supabaseApi.auth.updateMe({ ...salaoForm, slug: slugNorm });
    setUser(updatedUser);
    setSalaoForm((s) => ({ ...s, slug: slugNorm }));
    setSaving(false);
    setStep("servicos");
  };

  const salvarServicos = async () => {
    setSaving(true);
    const company_id = user?.company_id || user?.id;
    if (servicosSelecionados.length > 0) {
      await supabaseApi.entities.Servico.bulkCreate(
        servicosSelecionados.map((s) => ({ ...s, company_id, ativo: true })),
      ).catch(() => {});
    }
    setSaving(false);
    setStep("profissionais");
  };

  const salvarProfissionais = async () => {
    setSaving(true);
    const company_id = user?.company_id || user?.id;
    const todos = [...profissionais];
    if (profForm.nome) todos.push({ ...profForm });
    if (todos.length > 0) {
      await supabaseApi.entities.Profissional.bulkCreate(
        todos.map((p) => ({
          ...p,
          company_id,
          ativo: true,
          dias_atendimento: ["seg", "ter", "qua", "qui", "sex"],
          hora_inicio: "09:00",
          hora_fim: "18:00",
        })),
      ).catch(() => {});
    }
    setSaving(false);
    setStep("pronto");
  };

  const progressStep = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rose-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Bem-vindo ao BeautyFlow AI
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Vamos configurar seu salão em poucos minutos
          </p>
        </div>

        {/* Progress */}
        {step !== "pronto" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {["salao", "servicos", "profissionais"].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${progressStep >= i ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-400"}`}
                >
                  {progressStep > i ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`w-12 h-0.5 ${progressStep > i ? "bg-rose-500" : "bg-slate-700"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Step 1: Salão */}
          {step === "salao" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Dados do Salão</p>
                  <p className="text-xs text-slate-500">
                    Como seu negócio vai aparecer
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Nome do Salão *
                </label>
                <Input
                  placeholder="Ex: Studio Ana Beleza"
                  value={salaoForm.nome_salao}
                  onChange={(e) =>
                    setSalaoForm((f) => ({ ...f, nome_salao: e.target.value }))
                  }
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Link do Salão
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    beautyflow.ai/agendar/
                  </span>
                  <Input
                    placeholder="meu-salao"
                    value={salaoForm.slug}
                    onChange={(e) =>
                      setSalaoForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    className="h-11 flex-1"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Deixe em branco para gerar automaticamente
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Telefone / WhatsApp
                </label>
                <Input
                  placeholder="(11) 99999-0000"
                  value={salaoForm.telefone}
                  onChange={(e) =>
                    setSalaoForm((f) => ({ ...f, telefone: e.target.value }))
                  }
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Endereço
                </label>
                <Input
                  placeholder="Rua, número, bairro, cidade"
                  value={salaoForm.endereco}
                  onChange={(e) =>
                    setSalaoForm((f) => ({ ...f, endereco: e.target.value }))
                  }
                  className="h-11"
                />
              </div>
              <Button
                onClick={salvarSalao}
                disabled={saving}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white h-11"
              >
                {saving ? "Salvando..." : "Continuar"}{" "}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 2: Serviços */}
          {step === "servicos" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Serviços Iniciais</p>
                  <p className="text-xs text-slate-500">
                    Selecione os que seu salão oferece
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SERVICOS_SUGERIDOS.map((s) => {
                  const sel = !!servicosSelecionados.find(
                    (x) => x.nome === s.nome,
                  );
                  return (
                    <button
                      key={s.nome}
                      onClick={() => toggleServico(s)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${sel ? "border-rose-400 bg-rose-50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {s.nome}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.duracao_minutos}min • R$ {s.valor}
                      </p>
                      {sel && (
                        <Check className="w-3.5 h-3.5 text-rose-500 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 text-center">
                Você pode adicionar e editar serviços depois
              </p>
              <Button
                onClick={salvarServicos}
                disabled={saving}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white h-11"
              >
                {saving
                  ? "Salvando..."
                  : servicosSelecionados.length > 0
                    ? `Adicionar ${servicosSelecionados.length} serviço(s)`
                    : "Pular"}{" "}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 3: Profissionais */}
          {step === "profissionais" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Sua Equipe</p>
                  <p className="text-xs text-slate-500">
                    Adicione os profissionais do salão
                  </p>
                </div>
              </div>
              {profissionais.length > 0 && (
                <div className="space-y-2">
                  {profissionais.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-slate-50 rounded-xl p-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">
                        {p.nome[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {p.nome}
                        </p>
                        {p.especialidade && (
                          <p className="text-xs text-slate-500">
                            {p.especialidade}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setProfissionais((ps) => ps.filter((_, j) => j !== i))
                        }
                        className="text-slate-400 hover:text-red-400 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do profissional"
                  value={profForm.nome}
                  onChange={(e) =>
                    setProfForm((f) => ({ ...f, nome: e.target.value }))
                  }
                  className="h-11"
                />
                <Input
                  placeholder="Especialidade"
                  value={profForm.especialidade}
                  onChange={(e) =>
                    setProfForm((f) => ({
                      ...f,
                      especialidade: e.target.value,
                    }))
                  }
                  className="h-11"
                />
                <Button
                  variant="outline"
                  onClick={addProfissional}
                  className="h-11 flex-shrink-0 px-3"
                >
                  +
                </Button>
              </div>
              <Button
                onClick={salvarProfissionais}
                disabled={saving}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white h-11"
              >
                {saving
                  ? "Salvando..."
                  : profissionais.length > 0 || profForm.nome
                    ? `Finalizar`
                    : "Pular"}{" "}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 4: Pronto */}
          {step === "pronto" && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Tudo pronto!
                </h2>
                <p className="text-slate-500 text-sm">
                  Seu salão está configurado e pronto para receber agendamentos.
                </p>
              </div>
              {salaoForm.slug && (
                <div className="bg-slate-50 rounded-xl p-4 text-sm">
                  <p className="text-slate-500 mb-1">
                    Seu link de agendamento público:
                  </p>
                  <p className="font-mono font-bold text-rose-600 text-xs break-all">
                    beautyflow.ai/agendar/{salaoForm.slug}
                  </p>
                </div>
              )}
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white h-11"
              >
                Ir para o Dashboard <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
