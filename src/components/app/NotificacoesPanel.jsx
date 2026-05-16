import React, { useEffect, useState } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany } from "@/hooks/useCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, UserX, CheckCheck } from "lucide-react";

export default function NotificacoesPanel() {
  const { company_id } = useCompany();
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    if (!company_id) return;
    supabaseApi.entities.Notificacao.filter(
      { company_id, lida: false },
      "-created_date",
      20,
    )
      .then(setNotificacoes)
      .catch(() => {});
  }, [company_id]);

  const marcarLida = async (id) => {
    await supabaseApi.entities.Notificacao.update(id, { lida: true }).catch(
      () => {},
    );
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  const marcarTodasLidas = async () => {
    await Promise.all(
      notificacoes.map((n) =>
        supabaseApi.entities.Notificacao.update(n.id, { lida: true }).catch(
          () => {},
        ),
      ),
    );
    setNotificacoes([]);
  };

  if (notificacoes.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-orange-400">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-orange-700">
            <Bell className="w-4 h-4 text-orange-500" />
            Notificações
            <Badge className="bg-orange-100 text-orange-700 border-0">
              {notificacoes.length}
            </Badge>
          </CardTitle>
          <button
            onClick={marcarTodasLidas}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todas como lidas
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {notificacoes.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <UserX className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{n.titulo}</p>
              <p className="text-xs text-slate-500 mt-0.5">{n.mensagem}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(n.created_date).toLocaleString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button
              onClick={() => marcarLida(n.id)}
              className="text-xs text-slate-400 hover:text-slate-600 flex-shrink-0 p-1"
              title="Marcar como lida"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
