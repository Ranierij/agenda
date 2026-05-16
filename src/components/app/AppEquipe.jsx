import React, { useState, useEffect } from "react";
import { supabaseApi } from "@/api/supabaseApi";
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
import { UserPlus, Mail, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ROLE_LABELS = { admin: "Admin", user: "Usuário" };
const ROLE_COLORS = {
  admin: "bg-rose-100 text-rose-700",
  user: "bg-slate-100 text-slate-600",
};

export default function AppEquipe() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "user" });
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const [me, all] = await Promise.all([
      supabaseApi.auth.me().catch(() => null),
      supabaseApi.entities.User.list("full_name", 50).catch(() => []),
    ]);
    setCurrentUser(me);
    setUsers(all);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const invite = async () => {
    if (!inviteForm.email) {
      toast({ title: "Digite o e-mail", variant: "destructive" });
      return;
    }
    setInviting(true);
    await supabaseApi.users.inviteUser(inviteForm.email, inviteForm.role);
    toast({ title: `Convite enviado para ${inviteForm.email}!` });
    setInviting(false);
    setShowInvite(false);
    setInviteForm({ email: "", role: "user" });
    load();
  };

  const isAdmin = currentUser?.role === "admin";

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Equipe & Acessos
          </h1>
          <p className="text-slate-500 text-sm">
            {users.length} usuário(s) no sistema
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowInvite(true)}
            className="text-white border-0"
            style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
          >
            <UserPlus className="w-4 h-4 mr-2" /> Convidar Usuário
          </Button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          <Shield className="w-4 h-4 inline mr-2" />
          Apenas administradores podem convidar e gerenciar usuários.
        </div>
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
                >
                  {u.full_name?.[0] || u.email?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {u.full_name || "Sem nome"}
                    </p>
                    {u.email === currentUser?.email && (
                      <Badge className="bg-rose-50 text-rose-600 border-0 text-xs">
                        Você
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <Badge
                  className={`text-xs border-0 ${ROLE_COLORS[u.role] || "bg-slate-100 text-slate-600"}`}
                >
                  {ROLE_LABELS[u.role] || u.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                E-mail *
              </label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Papel no sistema
              </label>
              <select
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm((f) => ({ ...f, role: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="user">Usuário — Acesso padrão</option>
                <option value="admin">Admin — Acesso total</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Usuários recebem acesso ao painel operacional. Admins podem
                convidar outros usuários.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowInvite(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={invite}
                disabled={inviting}
                className="flex-1 text-white"
                style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
              >
                <Mail className="w-4 h-4 mr-2" />
                {inviting ? "Enviando..." : "Enviar Convite"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
