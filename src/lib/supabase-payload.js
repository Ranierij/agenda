export function emptyToNull(value) {
  return value === "" ? null : value;
}

export function normalizeNullableDates(payload, fields) {
  return fields.reduce(
    (normalized, field) => ({
      ...normalized,
      [field]: emptyToNull(normalized[field]),
    }),
    { ...payload },
  );
}
