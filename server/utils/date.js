export function toDateInput(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function daysBetween(from, to = new Date()) {
  if (!from) return null;
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(to);
  return Math.floor((end - start) / 86400000);
}

export function sameMonthDay(dateValue, reference = new Date()) {
  if (!dateValue) return false;
  const date = new Date(`${dateValue}T12:00:00`);
  return date.getDate() === reference.getDate() && date.getMonth() === reference.getMonth();
}
