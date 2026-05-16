import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Users, DollarSign, Clock } from "lucide-react";

const pacotes = [
  {
    id: 1,
    nome: "Pacote Hidratação Mensal",
    descricao: "4 sessões de hidratação profunda por mês",
    total_sessoes: 4,
    valor: 320,
    validade_dias: 30,
  },
  {
    id: 2,
    nome: "Pacote Manicure + Pedicure",
    descricao: "8 sessões de manicure ou pedicure",
    total_sessoes: 8,
    valor: 380,
    validade_dias: 60,
  },
  {
    id: 3,
    nome: "Pacote Coloração Premium",
    descricao: "3 colorações completas com hidratação inclusa",
    total_sessoes: 3,
    valor: 580,
    validade_dias: 90,
  },
  {
    id: 4,
    nome: "Pacote Beleza Total",
    descricao: "Corte + Escova + Sobrancelha — 6 sessões",
    total_sessoes: 6,
    valor: 750,
    validade_dias: 90,
  },
];

const pacotesClientes = [
  {
    id: 1,
    pacote_nome: "Pacote Hidratação Mensal",
    cliente_nome: "Maria Silva",
    sessoes_usadas: 2,
    total_sessoes: 4,
    valor_pago: 320,
    data_validade: "30/04/2026",
    status: "ativo",
  },
  {
    id: 2,
    pacote_nome: "Pacote Manicure + Pedicure",
    cliente_nome: "Beatriz Costa",
    sessoes_usadas: 5,
    total_sessoes: 8,
    valor_pago: 380,
    data_validade: "15/05/2026",
    status: "ativo",
  },
  {
    id: 3,
    pacote_nome: "Pacote Coloração Premium",
    cliente_nome: "Joana Pereira",
    sessoes_usadas: 3,
    total_sessoes: 3,
    valor_pago: 580,
    data_validade: "01/04/2026",
    status: "concluido",
  },
  {
    id: 4,
    pacote_nome: "Pacote Beleza Total",
    cliente_nome: "Fernanda Lima",
    sessoes_usadas: 1,
    total_sessoes: 6,
    valor_pago: 750,
    data_validade: "20/06/2026",
    status: "ativo",
  },
  {
    id: 5,
    pacote_nome: "Pacote Manicure + Pedicure",
    cliente_nome: "Renata Alves",
    sessoes_usadas: 0,
    total_sessoes: 8,
    valor_pago: 380,
    data_validade: "10/06/2026",
    status: "ativo",
  },
  {
    id: 6,
    pacote_nome: "Pacote Hidratação Mensal",
    cliente_nome: "Camila Santos",
    sessoes_usadas: 4,
    total_sessoes: 4,
    valor_pago: 280,
    data_validade: "31/03/2026",
    status: "vencido",
  },
];

const STATUS_COLORS = {
  ativo: "bg-emerald-100 text-emerald-700",
  concluido: "bg-slate-100 text-slate-600",
  vencido: "bg-red-100 text-red-700",
  cancelado: "bg-red-100 text-red-600",
};

export default function DemoPacotes() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacotes</h1>
          <p className="text-slate-500 text-sm">
            {pacotesClientes.filter((pc) => pc.status === "ativo").length}{" "}
            pacotes ativos em clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <Users className="w-4 h-4 mr-2" /> Vincular à Cliente
          </Button>
          <Button className="bg-rose-500 hover:bg-rose-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Novo Pacote
          </Button>
        </div>
      </div>

      <Tabs defaultValue="clientes">
        <TabsList>
          <TabsTrigger value="clientes">
            Pacotes de Clientes ({pacotesClientes.length})
          </TabsTrigger>
          <TabsTrigger value="modelos">
            Modelos de Pacote ({pacotes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="mt-4">
          <div className="space-y-3">
            {pacotesClientes.map((pc) => {
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
                      <p className="text-xs text-slate-400 mt-1">
                        Válido até {pc.data_validade}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm mb-2">
                    <span className="text-slate-600">
                      {pc.sessoes_usadas}/{pc.total_sessoes} sessões
                    </span>
                    <span className="text-emerald-600 font-medium">
                      R${" "}
                      {Number(pc.valor_pago).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="modelos" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pacotes.map((p) => (
              <Card key={p.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 mr-3">
                      <Package className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">
                        {p.nome}
                      </p>
                    </div>
                  </div>
                  {p.descricao && (
                    <p className="text-xs text-slate-500 mb-3">{p.descricao}</p>
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
                    Validade: {p.validade_dias} dias
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
