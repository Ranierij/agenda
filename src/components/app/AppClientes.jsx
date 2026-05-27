import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { normalizeNullableDates } from "@/lib/supabase-payload";
import { useCompany } from "@/hooks/useCompany";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ClientePerfilPanel from "./ClientePerfilPanel";

const EMPTY_FORM = {
  nome: "",
  telefone: "",
  email: "",
  data_nascimento: "",
  observacoes: "",
};

export default function AppClientes() {
  const { company_id, loading: loadingUser } = useCompany();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!company_id) return;
    const cls = await supabaseApi.entities.Cliente.filter(
      { company_id },
      "nome",
      500,
    ).catch(() => []);
    setClientes(cls);
    setLoading(false);
  };

  useEffect(() => {
    if (company_id) {
      load();
      return;
    }

    if (!loadingUser) {
      setLoading(false);
    }
  }, [company_id, loadingUser]);

  const filtered = clientes.filter(
    (c) =>
      c.nome?.toLowerCase().includes(search.toLowerCase()) ||
      c.telefone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      nome: c.nome,
      telefone: c.telefone || "",
      email: c.email || "",
      data_nascimento: c.data_nascimento || "",
      observacoes: c.observacoes || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.nome) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = normalizeNullableDates(
      { ...form, company_id },
      ["data_nascimento"],
    );

    try {
      if (editing) {
        await supabaseApi.entities.Cliente.update(editing.id, payload);
        toast({ title: "Cliente atualizado!" });
      } else {
        await supabaseApi.entities.Cliente.create(payload);
        toast({ title: "Cliente cadastrado!" });
      }
      setShowForm(false);
      load();
    } catch (error) {
      toast({
        title: "Erro ao salvar cliente",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteCliente = async () => {
    if (!editing) return;
    const confirmed = window.confirm(
      `Excluir o cliente "${editing.nome}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      await supabaseApi.entities.Cliente.delete(editing.id);
      toast({ title: "Cliente excluído!" });
      if (selected?.id === editing.id) {
        setSelected(null);
      }
      setShowForm(false);
      load();
    } catch (error) {
      toast({
        title: "Erro ao excluir cliente",
        description:
          error.message ||
          "Verifique se o cliente possui agendamentos vinculados.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm">
            {clientes.length} clientes cadastrados
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="w-full sm:w-auto text-white"
          style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome, telefone ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 sm:p-16 text-center">
          <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          </p>
          {!search && (
            <p className="text-slate-400 text-sm mt-1">
              Clique em "Novo Cliente" para começar.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-2">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c.id === selected?.id ? null : c)}
                className={`bg-white rounded-xl border p-3 sm:p-4 cursor-pointer hover:border-rose-200 hover:shadow-sm transition-all ${selected?.id === c.id ? "border-rose-300 shadow-sm" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {c.nome?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      {c.nome}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.telefone || c.email || "Sem contato"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(c);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div>
            {selected ? (
              <ClientePerfilPanel cliente={selected} onEdit={openEdit} />
            ) : (
              <div className="bg-white rounded-xl border p-8 text-center text-slate-400 text-sm">
                Clique em um cliente para ver detalhes
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Cliente" : "Novo Cliente"}
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
                E-mail
              </label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Data de Nascimento
              </label>
              <Input
                type="date"
                value={form.data_nascimento}
                onChange={(e) =>
                  setForm({ ...form, data_nascimento: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Observações
              </label>
              <Input
                placeholder="Preferências, alergias..."
                value={form.observacoes}
                onChange={(e) =>
                  setForm({ ...form, observacoes: e.target.value })
                }
              />
            </div>
            {editing && (
              <Button
                type="button"
                variant="outline"
                onClick={deleteCliente}
                disabled={saving}
                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Excluir cliente
              </Button>
            )}
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
                {saving ? "Salvando..." : editing ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
