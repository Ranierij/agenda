import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { normalizeNullableDates } from "@/lib/supabase-payload";
import { useCompany } from "@/hooks/useCompany";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Plus, Trash2, Bell } from "lucide-react";

const STATUS_COLORS = {
  aguardando: "bg-amber-100 text-amber-700",
  notificado: "bg-blue-100 text-blue-700",
  agendado: "bg-emerald-100 text-emerald-700",
  desistiu: "bg-slate-100 text-slate-500",
};

const EMPTY_FORM = {
  cliente_nome: "",
  cliente_telefone: "",
  cliente_email: "",
  servico_nome: "",
  profissional_nome: "",
  data_preferencia: "",
  horario_preferencia: "qualquer",
  observacoes: "",
};

export default function ListaEsperaModal({ open, onClose, vagaInfo }) {
  const { company_id } = useCompany();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!company_id) return;
    const items = await supabaseApi.entities.ListaEspera.filter(
      { company_id, status: "aguardando" },
      "created_date",
      100,
    ).catch(() => []);
    setLista(items);
    setLoading(false);
  };

  useEffect(() => {
    if (open && company_id) load();
  }, [open, company_id]);

  const save = async () => {
    if (!form.cliente_nome) {
      toast({ title: "Nome do cliente é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    await supabaseApi.entities.ListaEspera.create({
      ...normalizeNullableDates(form, ["data_preferencia"]),
      company_id,
      status: "aguardando",
    });
    toast({ title: "Adicionado à lista de espera!" });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    load();
  };

  const remover = async (id) => {
    await supabaseApi.entities.ListaEspera.update(id, { status: "desistiu" });
    load();
  };

  const notificarCliente = async (item) => {
    const vagaData = vagaInfo?.data
      ? new Date(vagaInfo.data + "T12:00:00").toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : "em breve";
    const servicoStr = vagaInfo?.servico_nome
      ? ` para *${vagaInfo.servico_nome}*`
      : "";
    const horarioStr = vagaInfo?.hora ? ` às *${vagaInfo.hora}*` : "";
    const profStr = vagaInfo?.profissional_nome
      ? ` com ${vagaInfo.profissional_nome}`
      : "";

    const mensagem = `Olá, ${item.cliente_nome}! 🌸 Uma vaga abriu${servicoStr} para *${vagaData}*${horarioStr}${profStr}. Deseja confirmar seu agendamento? Responda para garantir sua vaga! 💅`;

    let enviado = false;

    // WhatsApp
    if (item.cliente_telefone) {
      const tel = item.cliente_telefone.replace(/\D/g, "");
      const numero = tel.startsWith("55") ? tel : `55${tel}`;
      window.open(
        `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`,
        "_blank",
      );
      enviado = true;
    }

    // E-mail
    if (item.cliente_email) {
      await supabaseApi.integrations.Core.SendEmail({
        to: item.cliente_email,
        subject: `🌸 Uma vaga abriu para você!`,
        body: mensagem.replace(/\*/g, ""),
      }).catch(() => {});
      enviado = true;
    }

    if (enviado) {
      await supabaseApi.entities.ListaEspera.update(item.id, {
        status: "notificado",
        notificado_em: new Date().toISOString(),
      });
      toast({ title: `Notificação enviada para ${item.cliente_nome}!` });
      load();
    } else {
      toast({
        title: "Cliente sem telefone ou e-mail cadastrado",
        variant: "destructive",
      });
    }
  };

  const notificarTodos = async () => {
    for (const item of lista) {
      await notificarCliente(item);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Lista de Espera
            {lista.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-0 ml-1">
                {lista.length}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Vaga aberta info */}
        {vagaInfo && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-xl p-3">
            <Bell className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-rose-700">
                Vaga disponível!
              </p>
              <p className="text-xs text-rose-600 truncate">
                {vagaInfo.servico_nome && `${vagaInfo.servico_nome} · `}
                {vagaInfo.data &&
                  new Date(vagaInfo.data + "T12:00:00").toLocaleDateString(
                    "pt-BR",
                    { day: "numeric", month: "short" },
                  )}
                {vagaInfo.hora && ` às ${vagaInfo.hora}`}
              </p>
            </div>
            {lista.length > 0 && (
              <Button
                size="sm"
                onClick={notificarTodos}
                className="text-white text-xs flex-shrink-0"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
              >
                Notificar todos
              </Button>
            )}
          </div>
        )}

        {/* Lista */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div
                className="w-6 h-6 border-4 border-slate-200 rounded-full animate-spin"
                style={{ borderTopColor: "var(--company-primary, #f43f5e)" }}
              />
            </div>
          ) : lista.length === 0 && !showForm ? (
            <div className="py-8 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Lista de espera vazia.</p>
              <p className="text-xs mt-1">
                Adicione clientes que desejam ser avisados quando surgir uma
                vaga.
              </p>
            </div>
          ) : (
            lista.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-xl p-3 flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
                >
                  {item.cliente_nome[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {item.cliente_nome}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {item.servico_nome || "Qualquer serviço"}
                    {item.data_preferencia &&
                      ` · ${new Date(item.data_preferencia + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`}
                    {item.cliente_telefone && ` · ${item.cliente_telefone}`}
                  </p>
                </div>
                <Badge
                  className={`text-xs border-0 flex-shrink-0 ${STATUS_COLORS[item.status]}`}
                >
                  {item.status}
                </Badge>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => notificarCliente(item)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 transition-colors"
                    title="Notificar cliente"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remover(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                    title="Remover da lista"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulário novo */}
        {showForm ? (
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              Adicionar à lista de espera
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Nome *"
                value={form.cliente_nome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cliente_nome: e.target.value }))
                }
              />
              <Input
                placeholder="Telefone / WhatsApp"
                value={form.cliente_telefone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cliente_telefone: e.target.value }))
                }
              />
              <Input
                placeholder="E-mail"
                value={form.cliente_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cliente_email: e.target.value }))
                }
              />
              <Input
                placeholder="Serviço desejado"
                value={form.servico_nome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, servico_nome: e.target.value }))
                }
              />
              <input
                type="date"
                value={form.data_preferencia}
                onChange={(e) =>
                  setForm((f) => ({ ...f, data_preferencia: e.target.value }))
                }
                className="border rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
              />
              <select
                value={form.horario_preferencia}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    horario_preferencia: e.target.value,
                  }))
                }
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="qualquer">Qualquer horário</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
              </select>
            </div>
            <Input
              placeholder="Observações"
              value={form.observacoes}
              onChange={(e) =>
                setForm((f) => ({ ...f, observacoes: e.target.value }))
              }
            />
            <div className="flex gap-2">
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
                {saving ? "Salvando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t pt-3 flex justify-end">
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Adicionar à lista
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
