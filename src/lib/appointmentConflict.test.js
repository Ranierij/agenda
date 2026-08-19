import test from "node:test";
import assert from "node:assert/strict";
import {
  findAppointmentConflict,
  buildAppointmentLayout,
  isExactAppointmentDuplicate,
  isValidAppointmentInterval,
} from "./appointmentConflict.js";

const existing = [
  {
    id: "a1",
    profissional_id: "p1",
    cliente_id: "c1",
    cliente_nome: "Maria",
    servico_id: "s1",
    servico_nome: "Manicure",
    data: "2026-08-19",
    hora: "14:00",
    duracao_minutos: 120,
    status: "agendado",
  },
];

test("permite fluxo normal quando nao existe conflito", () => {
  const conflict = findAppointmentConflict({
    appointments: existing,
    professionalId: "p1",
    date: "2026-08-19",
    time: "16:00",
    durationMinutes: 60,
  });

  assert.equal(conflict, null);
});

test("detecta novo agendamento dentro de intervalo existente", () => {
  const conflict = findAppointmentConflict({
    appointments: existing,
    professionalId: "p1",
    date: "2026-08-19",
    time: "15:15",
    durationMinutes: 45,
  });

  assert.equal(conflict.id, "a1");
});

test("respeita limite final sem marcar conflito quando comeca exatamente no fim", () => {
  const conflict = findAppointmentConflict({
    appointments: existing,
    professionalId: "p1",
    date: "2026-08-19",
    time: "16:00",
    durationMinutes: 15,
  });

  assert.equal(conflict, null);
});

test("detecta conflito quando comeca exatamente no inicio existente", () => {
  const conflict = findAppointmentConflict({
    appointments: existing,
    professionalId: "p1",
    date: "2026-08-19",
    time: "14:00",
    durationMinutes: 15,
  });

  assert.equal(conflict.id, "a1");
});

test("valida granularidade minima de 15 minutos", () => {
  assert.equal(isValidAppointmentInterval("15:15", 45), true);
  assert.equal(isValidAppointmentInterval("15:10", 45), false);
  assert.equal(isValidAppointmentInterval("15:15", 10), false);
  assert.equal(isValidAppointmentInterval("15:15", 20), false);
});

test("bloqueia duplicacao exata acidental", () => {
  assert.equal(
    isExactAppointmentDuplicate({
      appointments: existing,
      professionalId: "p1",
      date: "2026-08-19",
      time: "14:00",
      durationMinutes: 120,
      clientId: "c1",
      serviceId: "s1",
    }),
    true,
  );
});

test("divide visualmente agendamentos sobrepostos em faixas", () => {
  const layout = buildAppointmentLayout([
    ...existing,
    {
      id: "a2",
      profissional_id: "p1",
      cliente_nome: "Joao",
      servico_nome: "Pedicure",
      data: "2026-08-19",
      hora: "15:30",
      duracao_minutos: 30,
      status: "agendado",
    },
    {
      id: "a3",
      profissional_id: "p1",
      cliente_nome: "Ana",
      servico_nome: "Escova",
      data: "2026-08-19",
      hora: "16:00",
      duracao_minutos: 30,
      status: "agendado",
    },
  ]);

  assert.equal(layout.get("a1").laneCount, 2);
  assert.equal(layout.get("a2").laneCount, 2);
  assert.equal(layout.get("a3").laneCount, 1);
});
