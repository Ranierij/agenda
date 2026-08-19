export const MIN_APPOINTMENT_INTERVAL_MINUTES = 15;

export function timeToMinutes(time) {
  const [hours = 0, minutes = 0] = String(time || "00:00")
    .split(":")
    .map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function isValidAppointmentInterval(time, durationMinutes) {
  const start = timeToMinutes(time);
  const duration = Number(durationMinutes || 0);

  return (
    Number.isFinite(start) &&
    Number.isFinite(duration) &&
    duration >= MIN_APPOINTMENT_INTERVAL_MINUTES &&
    start % MIN_APPOINTMENT_INTERVAL_MINUTES === 0 &&
    duration % MIN_APPOINTMENT_INTERVAL_MINUTES === 0
  );
}

export function getAppointmentRange(appointment) {
  const start = timeToMinutes(appointment.hora);
  const duration = Number(appointment.duracao_minutos || 60);
  return {
    start,
    end: start + duration,
  };
}

export function appointmentsOverlap(candidate, existing) {
  const candidateRange = getAppointmentRange(candidate);
  const existingRange = getAppointmentRange(existing);

  return candidateRange.start < existingRange.end && candidateRange.end > existingRange.start;
}

export function findAppointmentConflict({
  appointments,
  professionalId,
  date,
  time,
  durationMinutes,
  excludeId = null,
}) {
  if (!professionalId) return null;

  const candidate = {
    profissional_id: professionalId,
    data: date,
    hora: time,
    duracao_minutos: durationMinutes || 60,
  };

  return (
    appointments.find((appointment) => {
      if (appointment.id === excludeId) return false;
      if (appointment.status === "cancelado") return false;
      if (appointment.profissional_id !== professionalId) return false;
      if (date && appointment.data && appointment.data !== date) return false;
      return appointmentsOverlap(candidate, appointment);
    }) || null
  );
}

export function isExactAppointmentDuplicate({
  appointments,
  professionalId,
  date,
  time,
  durationMinutes,
  clientId,
  clientName,
  serviceId,
  serviceName,
  excludeId = null,
}) {
  const normalizedClientName = String(clientName || "").trim().toLowerCase();
  const normalizedServiceName = String(serviceName || "").trim().toLowerCase();

  return appointments.some((appointment) => {
    if (appointment.id === excludeId) return false;
    if (appointment.status === "cancelado") return false;
    if (appointment.profissional_id !== professionalId) return false;
    if (appointment.data !== date) return false;
    if (appointment.hora !== time) return false;
    if (Number(appointment.duracao_minutos || 60) !== Number(durationMinutes || 60)) {
      return false;
    }

    const sameClient = clientId
      ? appointment.cliente_id === clientId
      : String(appointment.cliente_nome || "").trim().toLowerCase() === normalizedClientName;
    const sameService = serviceId
      ? appointment.servico_id === serviceId
      : String(appointment.servico_nome || "").trim().toLowerCase() === normalizedServiceName;

    return sameClient && sameService;
  });
}

export function buildAppointmentLayout(appointments) {
  const sorted = appointments
    .map((appointment, index) => ({
      appointment,
      index,
      ...getAppointmentRange(appointment),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const layout = new Map();
  let cluster = [];
  let clusterEnd = null;

  const flushCluster = () => {
    if (cluster.length === 0) return;

    const lanes = [];
    const assigned = cluster.map((item) => {
      const laneIndex = lanes.findIndex((end) => end <= item.start);
      const lane = laneIndex >= 0 ? laneIndex : lanes.length;
      lanes[lane] = item.end;
      return { ...item, lane };
    });

    assigned.forEach((item) => {
      const key = item.appointment.id || item.index;
      layout.set(key, {
        lane: item.lane,
        laneCount: lanes.length,
      });
    });

    cluster = [];
    clusterEnd = null;
  };

  sorted.forEach((item) => {
    if (cluster.length > 0 && item.start >= clusterEnd) {
      flushCluster();
    }

    cluster.push(item);
    clusterEnd = Math.max(clusterEnd ?? item.end, item.end);
  });

  flushCluster();
  return layout;
}
