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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Users, DollarSign, Clock, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const STATUS_COLORS = {
  ativo: "bg-emerald-100 text-emerald-700",
  concluido: "bg-slate-100 text-slate-600",
  vencido: "bg-red-100 text-red-700",
  cancelado: "bg-red-100 text-red-600",
};

export default function AppPacotes() {
  const { company_id, loading: loadingUser } = useCompany();
  const [pacotes, setPacotes] = useState([]);
  const [pacotesCliente, setPacotesCliente] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormPacote, setShowFormPacote] = useState(false);
  const [showFormVincular, setShowFormVincular] = useState(false);
  const [editingPacote, setEditingPacote] = useState(null);
  const [formPacote, setFormPacote] = useState({
    nome: "",
    descricao: "",
    total_sessoes: "",
    valor: "",
    validade_dias: 90,
  });
  const [formVincular, setFormVincular] = useState({
    pacote_id: "",
    cliente_id: "",
    valor_pago: "",
    data_inicio: new Date().toISOString().split("T")[0],
    observacoes: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!company_id) return;
    const [p, pc, cl] = await Promise.all([
      supabaseApi.entities.Pacote.filter({ company_id }, "nome").catch(() => []),
      supabaseApi.entities.PacoteCliente.filter(
        { company_id },
        "-created_date",
        100,
      ).catch(() => []),
      supabaseApi.entities.Cliente.filter({ company_id }, "nome", 100).catch(
        () => [],
      ),
    ]);
    setPacotes(p);
    setPacotesCliente(pc);
    setClientes(cl);
    setLoading(false);
  };

  useEffect(() => {
    if (company_id) load();
  }, [company_id]);

  const savePacote = async () => {
    if (!formPacote.nome || !formPacote.total_sessoes || !formPacote.valor) {
      toast({
        title: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const payload = {
      ...formPacote,
      company_id,
      total_sessoes: parseInt(formPacote.total_sessoes),
      valor: parseFloat(formPacote.valor),
      validade_dias: parseInt(formPacote.validade_dias) || 90,
      ativo: true,
    };
    if (editingPacote) {
      await supabaseApi.entities.Pacote.update(editingPacote.id, payload);
      toast({ title: "Pacote atualizado!" });
    } else {
      await supabaseApi.entities.Pacote.create(payload);
      toast({ title: "Pacote criado!" });
    }
    setSaving(false);
    setShowFormPacote(false);
    load();
  };

  const vincularPacote = async () => {
    if (!formVincular.pacote_id || !formVincular.cliente_id) {
      toast({
        title: "Selecione o pacote e o cliente",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const pacote = pacotes.find((p) => p.id === formVincular.pacote_id);
    const cliente = clientes.find((c) => c.id === formVincular.cliente_id);
    const dataInicio = formVincular.data_inicio;
    const dataValidade = new Date(dataInicio);
    dataValidade.setDate(
      dataValidade.getDate() + (pacote?.validade_dias || 90),
    );
    await supabaseApi.entities.PacoteCliente.create({
      company_id,
      pacote_id: formVincular.pacote_id,
      pacote_nome: pacote?.nome || "",
      cliente_id: formVincular.cliente_id,
      cliente_nome: cliente?.nome || "",
      total_sessoes: pacote?.total_sessoes || 0,
      sessoes_usadas: 0,
      valor_pago: parseFloat(formVincular.valor_pago) || pacote?.valor || 0,
      data_inicio: dataInicio,
      data_validade: dataValidade.toISOString().split("T")[0],
      status: "ativo",
      observacoes: formVincular.observacoes,
    });
    toast({ title: "Pacote vinculado à cliente!" });
    setSaving(false);
    setShowFormVincular(false);
    setFormVincular({
      pacote_id: "",
      cliente_id: "",
      valor_pago: "",
      data_inicio: new Date().toISOString().split("T")[0],
      observacoes: "",
    });
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
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacotes</h1>
          <p className="text-slate-500 text-sm">
            {pacotesCliente.filter((pc) => pc.status === "ativo").length}{" "}
            pacotes ativos em clientes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFormVincular(true)}
            className="w-full sm:w-auto border-rose-200 hover:bg-rose-50"
            style={{ color: "var(--company-primary, #f43f5e)" }}
          >
            <Users className="w-4 h-4 mr-2" /> Vincular à Cliente
          </Button>
          <Button
            onClick={() => {
              setEditingPacote(null);
              setFormPacote({
                nome: "",
                descricao: "",
                total_sessoes: "",
                valor: "",
                validade_dias: 90,
              });
              setShowFormPacote(true);
            }}
            className="w-full sm:w-auto text-white"
            style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Pacote
          </Button>
        </div>
      </div>

      <Tabs defaultValue="clientes">
        <TabsList>
          <TabsTrigger value="clientes">
            Pacotes de Clientes ({pacotesCliente.length})
          </TabsTrigger>
          <TabsTrigger value="modelos">
            Modelos de Pacote ({pacotes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="mt-4">
          {pacotesCliente.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                Nenhum pacote vinculado ainda
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Clique em "Vincular à Cliente" para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pacotesCliente.map((pc) => {
                const restantes = pc.total_sessoes - pc.sessoes_usadas;
                const pct =
                  pc.total_sessoes > 0
                    ? (pc.sessoes_usadas / pc.total_sessoes) * 100
                    : 0;
                return (
                  <div key={pc.id} className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {pc.pacote_nome}
                        </p>
                        <p className="text-sm text-slate-500">
                          {pc.cliente_nome}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`text-xs border-0 ${STATUS_COLORS[pc.status] || "bg-slate-100 text-slate-600"}`}
                        >
                          {pc.status}
                        </Badge>
                        {pc.data_validade && (
                          <p className="text-xs text-slate-400 mt-1">
                            Válido até {pc.data_validade}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className="text-slate-600">
                        {pc.sessoes_usadas}/{pc.total_sessoes} sessões
                      </span>
                      <span className="text-emerald-600 font-medium">
                        R${" "}
                        {Number(pc.valor_pago || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: "var(--company-primary, #f43f5e)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="modelos" className="mt-4">
          {pacotes.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                Nenhum modelo de pacote
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Clique em "Novo Pacote" para criar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pacotes.map((p) => (
                <Card key={p.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-slate-900">{p.nome}</p>
                      <button
                        onClick={() => {
                          setEditingPacote(p);
                          setFormPacote({
                            nome: p.nome,
                            descricao: p.descricao || "",
                            total_sessoes: p.total_sessoes,
                            valor: p.valor,
                            validade_dias: p.validade_dias || 90,
                          });
                          setShowFormPacote(true);
                        }}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {p.descricao && (
                      <p className="text-xs text-slate-500 mb-3">
                        {p.descricao}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5" />
                        {p.total_sessoes} sessões
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />
                        R${" "}
                        {Number(p.valor).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Validade: {p.validade_dias || 90} dias
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Modelo de Pacote */}
      <Dialog open={showFormPacote} onOpenChange={setShowFormPacote}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPacote ? "Editar Pacote" : "Novo Modelo de Pacote"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Nome *
              </label>
              <Input
                placeholder="Ex: Pacote Hidratação Mensal"
                value={formPacote.nome}
                onChange={(e) =>
                  setFormPacote({ ...formPacote, nome: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Descrição
              </label>
              <Input
                placeholder="Descrição do pacote"
                value={formPacote.descricao}
                onChange={(e) =>
                  setFormPacote({ ...formPacote, descricao: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Sessões *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formPacote.total_sessoes}
                  onChange={(e) =>
                    setFormPacote({
                      ...formPacote,
                      total_sessoes: e.target.value,
                    })
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
                  value={formPacote.valor}
                  onChange={(e) =>
                    setFormPacote({ ...formPacote, valor: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Validade (dias)
                </label>
                <Input
                  type="number"
                  value={formPacote.validade_dias}
                  onChange={(e) =>
                    setFormPacote({
                      ...formPacote,
                      validade_dias: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowFormPacote(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={savePacote}
                disabled={saving}
                className="flex-1 text-white"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
              >
                {saving
                  ? "Salvando..."
                  : editingPacote
                    ? "Salvar"
                    : "Criar Pacote"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Vincular à Cliente */}
      <Dialog open={showFormVincular} onOpenChange={setShowFormVincular}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Pacote à Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Pacote *
              </label>
              <select
                value={formVincular.pacote_id}
                onChange={(e) => {
                  const p = pacotes.find((x) => x.id === e.target.value);
                  setFormVincular({
                    ...formVincular,
                    pacote_id: e.target.value,
                    valor_pago: p?.valor || "",
                  });
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Selecione o pacote</option>
                {pacotes
                  .filter((p) => p.ativo !== false)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — {p.total_sessoes} sessões — R$ {p.valor}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Cliente *
              </label>
              <select
                value={formVincular.cliente_id}
                onChange={(e) =>
                  setFormVincular({
                    ...formVincular,
                    cliente_id: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Selecione a cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Valor pago (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formVincular.valor_pago}
                  onChange={(e) =>
                    setFormVincular({
                      ...formVincular,
                      valor_pago: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Data início
                </label>
                <Input
                  type="date"
                  value={formVincular.data_inicio}
                  onChange={(e) =>
                    setFormVincular({
                      ...formVincular,
                      data_inicio: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Observações
              </label>
              <Input
                placeholder="Observações..."
                value={formVincular.observacoes}
                onChange={(e) =>
                  setFormVincular({
                    ...formVincular,
                    observacoes: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowFormVincular(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={vincularPacote}
                disabled={saving}
                className="flex-1 text-white"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
              >
                {saving ? "Vinculando..." : "Vincular Pacote"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
