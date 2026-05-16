import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Clock,
  DollarSign,
  ToggleRight,
  Pencil,
} from "lucide-react";

const servicos = [
  {
    id: 1,
    nome: "Corte Feminino",
    categoria: "Cabelo",
    duracao_minutos: 60,
    valor: 80,
    descricao: "Corte moderno com acabamento profissional",
    ativo: true,
  },
  {
    id: 2,
    nome: "Coloração Completa",
    categoria: "Cabelo",
    duracao_minutos: 120,
    valor: 220,
    descricao: "Coloração com produtos profissionais de alta qualidade",
    ativo: true,
  },
  {
    id: 3,
    nome: "Escova Progressiva",
    categoria: "Cabelo",
    duracao_minutos: 180,
    valor: 320,
    descricao: "Progressiva com alinhamento e hidratação",
    ativo: true,
  },
  {
    id: 4,
    nome: "Hidratação Profunda",
    categoria: "Cabelo",
    duracao_minutos: 60,
    valor: 90,
    descricao: "Tratamento intensivo de hidratação capilar",
    ativo: true,
  },
  {
    id: 5,
    nome: "Manicure Tradicional",
    categoria: "Unhas",
    duracao_minutos: 45,
    valor: 50,
    descricao: "Manicure completa com esmaltação",
    ativo: true,
  },
  {
    id: 6,
    nome: "Pedicure Spa",
    categoria: "Unhas",
    duracao_minutos: 60,
    valor: 65,
    descricao: "Pedicure com esfoliação e hidratação",
    ativo: true,
  },
  {
    id: 7,
    nome: "Design de Sobrancelha",
    categoria: "Sobrancelha",
    duracao_minutos: 30,
    valor: 45,
    descricao: "Modelagem e design com henna",
    ativo: true,
  },
  {
    id: 8,
    nome: "Maquiagem Social",
    categoria: "Maquiagem",
    duracao_minutos: 60,
    valor: 130,
    descricao: "Make completa para eventos e occasiões especiais",
    ativo: true,
  },
  {
    id: 9,
    nome: "Escova Relaxante",
    categoria: "Cabelo",
    duracao_minutos: 45,
    valor: 60,
    descricao: "Escova com massagem no couro cabeludo",
    ativo: false,
  },
];

const categoriaColors = {
  Cabelo: "bg-rose-50 text-rose-700",
  Unhas: "bg-purple-50 text-purple-700",
  Sobrancelha: "bg-amber-50 text-amber-700",
  Maquiagem: "bg-pink-50 text-pink-700",
  Estética: "bg-blue-50 text-blue-700",
};

export default function DemoServicos() {
  const [search, setSearch] = useState("");
  const filtered = servicos.filter(
    (s) =>
      s.nome.toLowerCase().includes(search.toLowerCase()) ||
      s.categoria.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Serviços</h1>
          <p className="text-slate-500 text-sm">
            {servicos.filter((s) => s.ativo).length} serviços ativos
          </p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Serviço
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="Buscar serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-rose-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <Card
            key={s.id}
            className={`border-0 shadow-sm transition-opacity ${!s.ativo ? "opacity-50" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{s.nome}</p>
                  <Badge
                    className={`text-xs border-0 mt-1 ${categoriaColors[s.categoria] || "bg-slate-100 text-slate-600"}`}
                  >
                    {s.categoria}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className={`p-1.5 rounded-lg transition-colors ${s.ativo ? "hover:bg-emerald-50 text-emerald-500" : "hover:bg-slate-100 text-slate-400"}`}
                  >
                    <ToggleRight className="w-3.5 h-3.5" />
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
    </div>
  );
}
