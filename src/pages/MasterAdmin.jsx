import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Building2,
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Lock,
  Unlock,
  Settings,
  BarChart3,
  LogOut,
  Crown,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const PLANO_COLORS = {
  starter: "bg-slate-100 text-slate-600",
  pro: "bg-blue-100 text-blue-700",
  enterprise: "bg-purple-100 text-purple-700",
};

const STATUS_COLORS = {
  ativo: "bg-emerald-100 text-emerald-700",
  bloqueado: "bg-red-100 text-red-700",
  pendente: "bg-amber-100 text-amber-700",
};

const STATUS_ICONS = {
  ativo: CheckCircle2,
  bloqueado: XCircle,
  pendente: Clock,
};

export default function MasterAdmin() {
  const [user, setUser] = useState(null);
  const [saloes, setSaloes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome_salao: "",
    admin_email: "",
    telefone: "",
    plano: "starter",
    observacoes: "",
  });
  const { toast } = useToast();

  useDocumentTitle("Master | BeautyFlow AI");

  useEffect(() => {
    // Acesso já é validado pelo SuperAdminRoute. Aqui apenas carregamos dados.
    supabaseApi.auth
      .me()
      .then((u) => {
        setUser(u);
        loadSaloes();
      })
      .catch(() => supabaseApi.auth.redirectToLogin());
  }, []);

  const loadSaloes = async () => {
    const data = await supabaseApi.entities.Salao.list("-created_date", 200).catch(
      () => [],
    );
    setSaloes(data);
    setLoading(false);
  };

  const criarSalao = async () => {
    if (!form.nome_salao || !form.admin_email) {
      toast({
        title: "Preencha nome e email do admin",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const slug = form.nome_salao
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    await supabaseApi.entities.Salao.create({
      ...form,
      slug,
      owner_email: user?.email,
      status: "pendente",
    });
    // Convidar admin
    await supabaseApi.users.inviteUser(form.admin_email, "admin").catch(() => {});
    toast({ title: `Salão criado! Convite enviado para ${form.admin_email}` });
    setSaving(false);
    setShowForm(false);
    setForm({
      nome_salao: "",
      admin_email: "",
      telefone: "",
      plano: "starter",
      observacoes: "",
    });
    loadSaloes();
  };

  const toggleStatus = async (salao) => {
    const newStatus = salao.status === "ativo" ? "bloqueado" : "ativo";
    await supabaseApi.entities.Salao.update(salao.id, { status: newStatus });
    toast({
      title: `Salão ${newStatus === "ativo" ? "liberado" : "bloqueado"}!`,
    });
    loadSaloes();
  };

  const filtered = saloes.filter(
    (s) =>
      s.nome_salao?.toLowerCase().includes(search.toLowerCase()) ||
      s.admin_email?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalAtivos = saloes.filter((s) => s.status === "ativo").length;
  const totalPendentes = saloes.filter((s) => s.status === "pendente").length;
  const totalPro = saloes.filter(
    (s) => s.plano === "pro" || s.plano === "enterprise",
  ).length;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar Master */}
      <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Master Admin</p>
              <p className="text-xs text-slate-400">BeautyFlow AI</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { label: "Painel Geral", icon: BarChart3, active: true },
            { label: "Salões", icon: Building2, active: false },
            { label: "Usuários", icon: Users, active: false },
            { label: "Configurações", icon: Settings, active: false },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${item.active ? "bg-rose-500 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 cursor-pointer group"
            onClick={() => supabaseApi.auth.logout("/")}
          >
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold flex-shrink-0">
              {user?.full_name?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.full_name || user?.email}
              </p>
              <p className="text-xs text-slate-400">Super Admin</p>
            </div>
            <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-white">
              Visão Geral da Plataforma
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {saloes.length} salão(s) cadastrado(s) na plataforma
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Salão
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total de Salões",
                value: saloes.length,
                icon: Building2,
                color: "text-rose-400",
                bg: "bg-rose-500/10",
                change: "cadastrados",
              },
              {
                label: "Salões Ativos",
                value: totalAtivos,
                icon: CheckCircle2,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                change: "operando agora",
              },
              {
                label: "Plano Pro+",
                value: totalPro,
                icon: Crown,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                change: "premium",
              },
              {
                label: "Aguardando",
                value: totalPendentes,
                icon: Clock,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                change: "pendentes",
              },
            ].map((kpi, i) => (
              <Card
                key={i}
                className="border-slate-800 bg-slate-900/50 shadow-none"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}
                    >
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{kpi.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{kpi.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Salões List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">
                Todos os Salões
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Buscar salão..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-rose-500/30"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
                <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">
                  {search
                    ? "Nenhum salão encontrado"
                    : "Nenhum salão cadastrado ainda"}
                </p>
                {!search && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="mt-4 bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Cadastrar Primeiro Salão
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <div className="col-span-3">Salão</div>
                  <div className="col-span-2">Admin</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Plano</div>
                  <div className="col-span-2">Onboarding</div>
                  <div className="col-span-2 text-right">Ações</div>
                </div>
                {filtered.map((salao) => {
                  const StatusIcon = STATUS_ICONS[salao.status] || Clock;
                  return (
                    <div
                      key={salao.id}
                      className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors items-center"
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden"
                          style={{
                            backgroundColor: salao.cor_primaria || "#f43f5e",
                          }}
                        >
                          {salao.logo_url ? (
                            <img
                              src={salao.logo_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            salao.nome_salao?.[0] || "S"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {salao.nome_salao}
                          </p>
                          {salao.slug && (
                            <p className="text-xs text-slate-500 truncate">
                              /agendar/{salao.slug}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-300 truncate">
                          {salao.admin_email}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Badge
                          className={`text-xs border-0 gap-1 ${STATUS_COLORS[salao.status] || "bg-slate-800 text-slate-400"}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {salao.status || "pendente"}
                        </Badge>
                      </div>
                      <div className="col-span-1">
                        <Badge
                          className={`text-xs border-0 capitalize ${PLANO_COLORS[salao.plano] || "bg-slate-800 text-slate-400"}`}
                        >
                          {salao.plano || "starter"}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        {salao.onboarding_concluido ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Concluído
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <Clock className="w-3 h-3" />
                            Pendente
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setShowDetail(salao)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(salao)}
                          className={`p-1.5 rounded-lg transition-colors ${salao.status === "ativo" ? "hover:bg-red-500/20 text-red-400" : "hover:bg-emerald-500/20 text-emerald-400"}`}
                          title={
                            salao.status === "ativo" ? "Bloquear" : "Liberar"
                          }
                        >
                          {salao.status === "ativo" ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={`/app/dashboard?slug=${salao.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Abrir painel do salão (admin)"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar Salão */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-500" />
              Cadastrar Novo Salão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Nome do Salão *
              </label>
              <Input
                placeholder="Ex: Studio Ana Beleza"
                value={form.nome_salao}
                onChange={(e) =>
                  setForm({ ...form, nome_salao: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Email do Admin do Salão *
              </label>
              <Input
                type="email"
                placeholder="admin@seusalao.com"
                value={form.admin_email}
                onChange={(e) =>
                  setForm({ ...form, admin_email: e.target.value })
                }
              />
              <p className="text-xs text-slate-400 mt-1">
                Um convite será enviado para esse email automaticamente.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Telefone
              </label>
              <Input
                placeholder="(11) 99999-0000"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Plano
              </label>
              <select
                value={form.plano}
                onChange={(e) => setForm({ ...form, plano: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="starter">Starter — Até 2 profissionais</option>
                <option value="pro">Pro — Até 8 profissionais + AI</option>
                <option value="enterprise">Enterprise — Ilimitado</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Observações
              </label>
              <Input
                placeholder="Notas internas sobre este salão..."
                value={form.observacoes}
                onChange={(e) =>
                  setForm({ ...form, observacoes: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={criarSalao}
                disabled={saving}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              >
                {saving ? "Criando..." : "Criar & Convidar Admin"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes */}
      {showDetail && (
        <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Detalhes — {showDetail.nome_salao}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Admin</span>
                <span className="font-medium">{showDetail.admin_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Slug</span>
                <span className="font-mono text-xs text-rose-600">
                  /agendar/{showDetail.slug}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plano</span>
                <Badge
                  className={`text-xs border-0 capitalize ${PLANO_COLORS[showDetail.plano]}`}
                >
                  {showDetail.plano}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <Badge
                  className={`text-xs border-0 ${STATUS_COLORS[showDetail.status]}`}
                >
                  {showDetail.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Onboarding</span>
                <span>
                  {showDetail.onboarding_concluido
                    ? "✅ Concluído"
                    : "⏳ Pendente"}
                </span>
              </div>
              {showDetail.telefone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Telefone</span>
                  <span>{showDetail.telefone}</span>
                </div>
              )}
              {showDetail.observacoes && (
                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
                  {showDetail.observacoes}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/agendar/${showDetail.slug}`,
                    );
                    toast({ title: "Link copiado!" });
                  }}
                >
                  Copiar Link
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                  onClick={() => toggleStatus(showDetail)}
                >
                  {showDetail.status === "ativo" ? "Bloquear" : "Liberar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
