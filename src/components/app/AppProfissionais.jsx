import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  UserCheck,
  Phone,
  Clock,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DIAS = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

const EMPTY_FORM = {
  nome: "",
  especialidade: "",
  telefone: "",
  email: "",
  dias_atendimento: ["seg", "ter", "qua", "qui", "sex"],
  hora_inicio: "09:00",
  hora_fim: "18:00",
  ativo: true,
};

export default function AppProfissionais() {
  const { company_id, loading: loadingUser } = useCompany();
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!company_id) return;
    const data = await supabaseApi.entities.Profissional.filter(
      { company_id },
      "nome",
      100,
    ).catch(() => []);
    setProfissionais(data);
    setLoading(false);
  };

  useEffect(() => {
    if (company_id) load();
  }, [company_id]);

  const filtered = profissionais.filter(
    (p) =>
      p.nome?.toLowerCase().includes(search.toLowerCase()) ||
      p.especialidade?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      nome: p.nome,
      especialidade: p.especialidade || "",
      telefone: p.telefone || "",
      email: p.email || "",
      dias_atendimento: p.dias_atendimento || [
        "seg",
        "ter",
        "qua",
        "qui",
        "sex",
      ],
      hora_inicio: p.hora_inicio || "09:00",
      hora_fim: p.hora_fim || "18:00",
      ativo: p.ativo !== false,
    });
    setShowForm(true);
  };

  const toggleDia = (dia) => {
    const dias = form.dias_atendimento.includes(dia)
      ? form.dias_atendimento.filter((d) => d !== dia)
      : [...form.dias_atendimento, dia];
    setForm({ ...form, dias_atendimento: dias });
  };

  const save = async () => {
    if (!form.nome) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...form, company_id };
    if (editing) {
      await supabaseApi.entities.Profissional.update(editing.id, payload);
      toast({ title: "Profissional atualizado!" });
    } else {
      await supabaseApi.entities.Profissional.create(payload);
      toast({ title: "Profissional criado!" });
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const toggleAtivo = async (p) => {
    await supabaseApi.entities.Profissional.update(p.id, { ativo: !p.ativo });
    load();
  };

  if (loadingUser || loading)
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profissionais</h1>
          <p className="text-slate-500 text-sm">
            {profissionais.filter((p) => p.ativo !== false).length}{" "}
            profissionais ativos
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="w-full sm:w-auto text-white"
          style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Profissional
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar profissional..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 sm:p-16 text-center">
          <UserCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {search
              ? "Nenhum profissional encontrado"
              : "Nenhum profissional cadastrado"}
          </p>
          {!search && (
            <p className="text-slate-400 text-sm mt-1">
              Cadastre os profissionais para usar na agenda.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className={`border-0 shadow-sm transition-opacity ${p.ativo === false ? "opacity-50" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                      {p.nome?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{p.nome}</p>
                      {p.especialidade && (
                        <p className="text-xs text-slate-500">
                          {p.especialidade}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleAtivo(p)}
                      className={`p-1.5 rounded-lg transition-colors ${p.ativo !== false ? "hover:bg-emerald-50 text-emerald-500" : "hover:bg-slate-100 text-slate-400"}`}
                    >
                      {p.ativo !== false ? (
                        <ToggleRight className="w-3.5 h-3.5" />
                      ) : (
                        <ToggleLeft className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  {p.telefone && (
                    <p className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {p.telefone}
                    </p>
                  )}
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {p.hora_inicio} – {p.hora_fim}
                  </p>
                  <div className="flex gap-1 flex-wrap mt-2">
                    {DIAS.map((d) => (
                      <span
                        key={d.key}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${p.dias_atendimento?.includes(d.key) ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-400"}`}
                      >
                        {d.label}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Profissional" : "Novo Profissional"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Nome *
              </label>
              <Input
                placeholder="Nome completo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Especialidade
              </label>
              <Input
                placeholder="Ex: Colorista, Manicure"
                value={form.especialidade}
                onChange={(e) =>
                  setForm({ ...form, especialidade: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Telefone
                </label>
                <Input
                  placeholder="(11) 99999-0000"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="email@..."
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Dias de Atendimento
              </label>
              <div className="flex gap-2 flex-wrap">
                {DIAS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDia(d.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.dias_atendimento.includes(d.key) ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    style={
                      form.dias_atendimento.includes(d.key)
                        ? { backgroundColor: "var(--company-primary, #f43f5e)" }
                        : {}
                    }
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Início
                </label>
                <Input
                  type="time"
                  value={form.hora_inicio}
                  onChange={(e) =>
                    setForm({ ...form, hora_inicio: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Fim
                </label>
                <Input
                  type="time"
                  value={form.hora_fim}
                  onChange={(e) =>
                    setForm({ ...form, hora_fim: e.target.value })
                  }
                />
              </div>
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
                onClick={save}
                disabled={saving}
                className="flex-1 text-white"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
              >
                {saving ? "Salvando..." : editing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
