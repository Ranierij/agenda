import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";

const profissionais = [
  "Ana Costa",
  "Carla Lima",
  "Paula Ramos",
  "Fernanda Souza",
];

const agendamentos = {
  "09:00": [
    {
      prof: "Ana Costa",
      cliente: "Maria Silva",
      servico: "Corte + Escova",
      duracao: 90,
      cor: "bg-rose-100 border-rose-300 text-rose-800",
    },
    {
      prof: "Carla Lima",
      cliente: "Joana Pereira",
      servico: "Coloração",
      duracao: 120,
      cor: "bg-purple-100 border-purple-300 text-purple-800",
    },
  ],
  "11:00": [
    {
      prof: "Paula Ramos",
      cliente: "Fernanda Lima",
      servico: "Manicure",
      duracao: 60,
      cor: "bg-blue-100 border-blue-300 text-blue-800",
    },
    {
      prof: "Ana Costa",
      cliente: "Beatriz Costa",
      servico: "Escova",
      duracao: 60,
      cor: "bg-rose-100 border-rose-300 text-rose-800",
    },
  ],
  "14:00": [
    {
      prof: "Carla Lima",
      cliente: "Camila Santos",
      servico: "Corte",
      duracao: 45,
      cor: "bg-purple-100 border-purple-300 text-purple-800",
    },
    {
      prof: "Fernanda Souza",
      cliente: "Renata Alves",
      servico: "Hidratação",
      duracao: 90,
      cor: "bg-emerald-100 border-emerald-300 text-emerald-800",
    },
  ],
  "16:00": [
    {
      prof: "Ana Costa",
      cliente: "Sandra Melo",
      servico: "Coloração",
      duracao: 150,
      cor: "bg-rose-100 border-rose-300 text-rose-800",
    },
  ],
};

const horas = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export default function DemoAgenda() {
  const [selectedDate, setSelectedDate] = useState("06/04/2026");

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
          <p className="text-slate-500 text-sm">
            Visualização por profissional
          </p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
        </Button>
      </div>

      {/* Date Nav */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-900 px-4 py-2 bg-white rounded-lg shadow-sm border">
          Domingo, 06 de Abril de 2026
        </span>
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="ml-4 flex gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, i) => (
            <button
              key={i}
              className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${i === 0 ? "bg-rose-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50 border"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border shadow-sm overflow-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `80px repeat(${profissionais.length}, 1fr)`,
          }}
        >
          {/* Header */}
          <div className="h-12 border-b border-r bg-slate-50"></div>
          {profissionais.map((prof, i) => (
            <div
              key={i}
              className="h-12 border-b border-r bg-slate-50 flex items-center justify-center px-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                  {prof.split(" ")[0][0]}
                </div>
                <span className="text-xs font-medium text-slate-700 hidden lg:block">
                  {prof.split(" ")[0]}
                </span>
              </div>
            </div>
          ))}

          {/* Time rows */}
          {horas.map((hora) => (
            <React.Fragment key={hora}>
              <div className="h-20 border-b border-r flex items-start justify-center pt-2">
                <span className="text-xs text-slate-400 font-mono">{hora}</span>
              </div>
              {profissionais.map((prof, pi) => {
                const agAtThisTime = agendamentos[hora]?.find(
                  (a) => a.prof === prof,
                );
                return (
                  <div
                    key={pi}
                    className="h-20 border-b border-r p-1 relative group cursor-pointer hover:bg-slate-50"
                  >
                    {agAtThisTime && (
                      <div
                        className={`h-full rounded-lg border p-2 ${agAtThisTime.cor} text-xs overflow-hidden`}
                      >
                        <p className="font-semibold truncate">
                          {agAtThisTime.cliente}
                        </p>
                        <p className="opacity-75 truncate">
                          {agAtThisTime.servico}
                        </p>
                        <p className="opacity-60 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {agAtThisTime.duracao}min
                        </p>
                      </div>
                    )}
                    {!agAtThisTime && (
                      <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
