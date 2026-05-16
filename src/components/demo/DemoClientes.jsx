import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Star, Clock, DollarSign, Calendar } from "lucide-react";

const clientes = [
  {
    nome: "Maria Silva jose",
    email: "maria@email.com",
    telefone: "(11) 99999-3001",
    totalGasto: 2840,
    visitas: 18,
    ultimaVisita: "28/03/2026",
    status: "ativo",
    favorito: true,
    servicos: ["Corte", "Coloração", "Escova"],
  },
  {
    nome: "Joana Pereira",
    email: "joana@email.com",
    telefone: "(11) 99999-0002",
    totalGasto: 1920,
    visitas: 12,
    ultimaVisita: "15/03/2026",
    status: "ativo",
    favorito: false,
    servicos: ["Manicure", "Pedicure"],
  },
  {
    nome: "Beatriz Costa",
    email: "beatriz@email.com",
    telefone: "(11) 99999-0003",
    totalGasto: 3450,
    visitas: 24,
    ultimaVisita: "01/04/2026",
    status: "ativo",
    favorito: true,
    servicos: ["Coloração", "Hidratação", "Corte"],
  },
  {
    nome: "Camila Santos",
    email: "camila@email.com",
    telefone: "(11) 99999-0004",
    totalGasto: 680,
    visitas: 4,
    ultimaVisita: "10/02/2026",
    status: "inativo",
    favorito: false,
    servicos: ["Corte"],
  },
  {
    nome: "Renata Alves",
    email: "renata@email.com",
    telefone: "(11) 99999-0005",
    totalGasto: 1450,
    visitas: 9,
    ultimaVisita: "20/03/2026",
    status: "ativo",
    favorito: false,
    servicos: ["Escova", "Hidratação"],
  },
  {
    nome: "Sandra Melo",
    email: "sandra@email.com",
    telefone: "(11) 99999-0006",
    totalGasto: 420,
    visitas: 2,
    ultimaVisita: "15/01/2026",
    status: "inativo",
    favorito: false,
    servicos: ["Corte"],
  },
  {
    nome: "Fernanda Lima",
    email: "fernanda@email.com",
    telefone: "(11) 99999-0007",
    totalGasto: 2100,
    visitas: 15,
    ultimaVisita: "05/04/2026",
    status: "ativo",
    favorito: true,
    servicos: ["Manicure", "Pedicure", "Escova"],
  },
  {
    nome: "Patricia Oliveira",
    email: "patricia@email.com",
    telefone: "(11) 99999-0008",
    totalGasto: 890,
    visitas: 6,
    ultimaVisita: "18/02/2026",
    status: "inativo",
    favorito: false,
    servicos: ["Coloração"],
  },
];

export default function DemoClientes() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState(null);

  const filtered = clientes.filter((c) => {
    const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "todos" ||
      c.status === filter ||
      (filter === "vip" && c.favorito);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm">
            {clientes.length} clientes cadastrados
          </p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["todos", "ativo", "inativo", "vip"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-rose-500 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {filtered.map((c, i) => (
            <div
              key={i}
              onClick={() => setSelected(c)}
              className={`bg-white rounded-xl border p-4 cursor-pointer hover:border-rose-200 hover:shadow-sm transition-all ${selected?.nome === c.nome ? "border-rose-300 shadow-sm" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {c.nome[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm">
                      {c.nome}
                    </p>
                    {c.favorito && (
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{c.telefone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    R$ {c.totalGasto.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-slate-500">{c.visitas} visitas</p>
                </div>
                <Badge
                  className={`text-xs border-0 ${c.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {c.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <Card className="border-0 shadow-sm sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {selected.nome[0]}
                  </div>
                  <div>
                    <CardTitle className="text-base">{selected.nome}</CardTitle>
                    <p className="text-xs text-slate-500">{selected.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <DollarSign className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">
                      R$ {selected.totalGasto.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-slate-500">Total gasto</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <Calendar className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">
                      {selected.visitas}
                    </p>
                    <p className="text-xs text-slate-500">Visitas</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Última visita
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {selected.ultimaVisita}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Serviços preferidos
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.servicos.map((s, i) => (
                      <Badge
                        key={i}
                        className="bg-rose-50 text-rose-700 border-rose-200 text-xs"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white text-sm">
                  Agendar Serviço
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-xl border p-8 text-center text-slate-400 text-sm">
              Clique em um cliente para ver detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
