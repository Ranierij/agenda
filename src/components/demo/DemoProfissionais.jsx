import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Clock,
  ToggleRight,
  Pencil,
  Phone,
} from "lucide-react";

const DIAS = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

const profissionais = [
  {
    id: 1,
    nome: "Ana Costa",
    especialidade: "Colorista & Estilista",
    telefone: "(11) 99901-0001",
    dias_atendimento: ["seg", "ter", "qua", "qui", "sex"],
    hora_inicio: "09:00",
    hora_fim: "18:00",
    ativo: true,
    totalAtendimentos: 312,
    avaliacao: 4.9,
  },
  {
    id: 2,
    nome: "Carla Lima",
    especialidade: "Colorista",
    telefone: "(11) 99901-0002",
    dias_atendimento: ["seg", "ter", "qua", "qui", "sex", "sab"],
    hora_inicio: "09:00",
    hora_fim: "17:00",
    ativo: true,
    totalAtendimentos: 248,
    avaliacao: 4.8,
  },
  {
    id: 3,
    nome: "Paula Ramos",
    especialidade: "Manicure & Pedicure",
    telefone: "(11) 99901-0003",
    dias_atendimento: ["ter", "qua", "qui", "sex", "sab"],
    hora_inicio: "10:00",
    hora_fim: "19:00",
    ativo: true,
    totalAtendimentos: 189,
    avaliacao: 4.7,
  },
  {
    id: 4,
    nome: "Fernanda Souza",
    especialidade: "Esteticista & Sobrancelha",
    telefone: "(11) 99901-0004",
    dias_atendimento: ["seg", "qua", "sex"],
    hora_inicio: "09:00",
    hora_fim: "16:00",
    ativo: true,
    totalAtendimentos: 145,
    avaliacao: 4.9,
  },
  {
    id: 5,
    nome: "Gabriela Mendes",
    especialidade: "Maquiadora",
    telefone: "(11) 99901-0005",
    dias_atendimento: ["sex", "sab"],
    hora_inicio: "10:00",
    hora_fim: "20:00",
    ativo: false,
    totalAtendimentos: 72,
    avaliacao: 4.6,
  },
];

export default function DemoProfissionais() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = profissionais.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.especialidade.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profissionais</h1>
          <p className="text-slate-500 text-sm">
            {profissionais.filter((p) => p.ativo).length} profissionais ativos
          </p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Profissional
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="Buscar profissional..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-rose-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Card
            key={p.id}
            onClick={() => setSelected(selected?.id === p.id ? null : p)}
            className={`border-0 shadow-sm cursor-pointer transition-all ${!p.ativo ? "opacity-50" : ""} ${selected?.id === p.id ? "ring-2 ring-rose-300" : "hover:shadow-md"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {p.nome[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{p.nome}</p>
                    {p.especialidade && (
                      <p className="text-xs text-slate-500">
                        {p.especialidade}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className={`p-1.5 rounded-lg transition-colors ${p.ativo ? "hover:bg-emerald-50 text-emerald-500" : "hover:bg-slate-100 text-slate-400"}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ToggleRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500">
                {p.telefone && (
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {p.telefone}
                  </p>
                )}
                <p className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {p.hora_inicio} – {p.hora_fim}
                </p>
                <div className="flex gap-1 flex-wrap mt-2">
                  {DIAS.map((d) => (
                    <span
                      key={d.key}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${p.dias_atendimento?.includes(d.key) ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-400"}`}
                    >
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-slate-500">
                <span>{p.totalAtendimentos} atendimentos</span>
                <span className="font-semibold text-amber-500">
                  ★ {p.avaliacao}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
