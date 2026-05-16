import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Scissors,
  Clock,
  DollarSign,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIAS = [
  "Cabelo",
  "Unhas",
  "Estética",
  "Maquiagem",
  "Massagem",
  "Sobrancelha",
  "Outro",
];

const EMPTY_FORM = {
  nome: "",
  categoria: "Cabelo",
  duracao_minutos: 60,
  valor: "",
  descricao: "",
  ativo: true,
};

export default function AppServicos() {
  const { company_id, loading: loadingUser } = useCompany();
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!company_id) return;
    const data = await supabaseApi.entities.Servico.filter(
      { company_id },
      "nome",
      200,
    ).catch(() => []);
    setServicos(data);
    setLoading(false);
  };

  useEffect(() => {
    if (company_id) load();
  }, [company_id]);

  const filtered = servicos.filter(
    (s) =>
      s.nome?.toLowerCase().includes(search.toLowerCase()) ||
      s.categoria?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      nome: s.nome,
      categoria: s.categoria || "Cabelo",
      duracao_minutos: s.duracao_minutos || 60,
      valor: s.valor || "",
      descricao: s.descricao || "",
      ativo: s.ativo !== false,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.nome || !form.valor) {
      toast({ title: "Nome e valor são obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      company_id,
      valor: parseFloat(form.valor),
      duracao_minutos: parseInt(form.duracao_minutos),
    };
    if (editing) {
      await supabaseApi.entities.Servico.update(editing.id, payload);
      toast({ title: "Serviço atualizado!" });
    } else {
      await supabaseApi.entities.Servico.create(payload);
      toast({ title: "Serviço criado!" });
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const toggleAtivo = async (s) => {
    await supabaseApi.entities.Servico.update(s.id, { ativo: !s.ativo });
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
          <h1 className="text-2xl font-bold text-slate-900">Serviços</h1>
          <p className="text-slate-500 text-sm">
            {servicos.filter((s) => s.ativo !== false).length} serviços ativos
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="w-full sm:w-auto text-white"
          style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Serviço
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 sm:p-16 text-center">
          <Scissors className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {search ? "Nenhum serviço encontrado" : "Nenhum serviço cadastrado"}
          </p>
          {!search && (
            <p className="text-slate-400 text-sm mt-1">
              Cadastre os serviços do seu salão para usar na agenda.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card
              key={s.id}
              className={`border-0 shadow-sm transition-opacity ${s.ativo === false ? "opacity-50" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{s.nome}</p>
                    <Badge className="bg-rose-50 text-rose-700 border-0 text-xs mt-1">
                      {s.categoria}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleAtivo(s)}
                      className={`p-1.5 rounded-lg transition-colors ${s.ativo !== false ? "hover:bg-emerald-50 text-emerald-500" : "hover:bg-slate-100 text-slate-400"}`}
                    >
                      {s.ativo !== false ? (
                        <ToggleRight className="w-3.5 h-3.5" />
                      ) : (
                        <ToggleLeft className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                {s.descricao && (
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    {s.descricao}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3.5 h-3.5" />
                    {s.duracao_minutos}min
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <DollarSign className="w-3.5 h-3.5" />
                    R${" "}
                    {Number(s.valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
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
              {editing ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Nome *
              </label>
              <Input
                placeholder="Ex: Corte Feminino"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Categoria
              </label>
              <select
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Duração (min)
                </label>
                <Input
                  type="number"
                  min="5"
                  step="5"
                  value={form.duracao_minutos}
                  onChange={(e) =>
                    setForm({ ...form, duracao_minutos: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Valor (R$) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Descrição
              </label>
              <Input
                placeholder="Descrição curta do serviço"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
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
                onClick={save}
                disabled={saving}
                className="flex-1 text-white"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
              >
                {saving ? "Salvando..." : editing ? "Salvar" : "Criar Serviço"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
