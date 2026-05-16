import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake } from "lucide-react";

export default function AniversariantesCard({ clientes }) {
  const mesAtual = new Date().getMonth() + 1; // 1-12
  const hoje = new Date().getDate();

  const aniversariantes = clientes
    .filter((c) => {
      if (!c.data_nascimento) return false;
      const [, mes] = c.data_nascimento.split("-").map(Number);
      return mes === mesAtual;
    })
    .map((c) => {
      const dia = parseInt(c.data_nascimento.split("-")[2]);
      return { ...c, dia };
    })
    .sort((a, b) => a.dia - b.dia);

  if (aniversariantes.length === 0) return null;

  const aniversarioHoje = aniversariantes.filter((c) => c.dia === hoje);
  const proximosDias = aniversariantes.filter((c) => c.dia > hoje);
  const jaPassaram = aniversariantes.filter((c) => c.dia < hoje);

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-pink-700">
          <div className="w-7 h-7 bg-pink-100 rounded-lg flex items-center justify-center">
            <Cake className="w-4 h-4 text-pink-500" />
          </div>
          Aniversariantes do Mês
          <Badge className="ml-auto bg-pink-100 text-pink-700 border-0 text-xs">
            {aniversariantes.length} cliente
            {aniversariantes.length > 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Hoje */}
        {aniversarioHoje.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-pink-500 uppercase tracking-wide mb-2">
              🎂 Hoje!
            </p>
            <div className="space-y-1.5">
              {aniversarioHoje.map((c) => (
                <ClienteAniversario key={c.id} cliente={c} destaque />
              ))}
            </div>
          </div>
        )}

        {/* Próximos */}
        {proximosDias.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            {aniversarioHoje.length > 0 && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Próximos
              </p>
            )}
            <div className="space-y-1.5">
              {proximosDias.map((c) => (
                <ClienteAniversario key={c.id} cliente={c} />
              ))}
            </div>
          </div>
        )}

        {/* Já passaram */}
        {jaPassaram.length > 0 && (
          <div className="px-4 pt-3 pb-3">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
              Já passaram
            </p>
            <div className="space-y-1.5">
              {jaPassaram.map((c) => (
                <ClienteAniversario key={c.id} cliente={c} passado />
              ))}
            </div>
          </div>
        )}
        {jaPassaram.length === 0 && <div className="pb-3" />}
      </CardContent>
    </Card>
  );
}

function ClienteAniversario({ cliente, destaque, passado }) {
  const dia = String(cliente.dia).padStart(2, "0");
  const mesAtual = new Date().getMonth() + 1;
  const nomeMes = new Date(2000, mesAtual - 1, 1)
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
        destaque
          ? "bg-pink-50 border border-pink-200"
          : passado
            ? "opacity-50"
            : "hover:bg-slate-50"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
          destaque ? "bg-pink-500" : passado ? "bg-slate-300" : "bg-purple-400"
        }`}
      >
        {cliente.nome?.[0] || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${destaque ? "text-pink-800" : "text-slate-800"}`}
        >
          {cliente.nome}
          {destaque && " 🎉"}
        </p>
        {cliente.telefone && (
          <p className="text-xs text-slate-400 truncate">{cliente.telefone}</p>
        )}
      </div>
      <div
        className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${
          destaque
            ? "bg-pink-200 text-pink-700"
            : passado
              ? "bg-slate-100 text-slate-400"
              : "bg-purple-100 text-purple-700"
        }`}
      >
        {dia}/{nomeMes}
      </div>
    </div>
  );
}
