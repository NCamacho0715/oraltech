// Parseo de fechas del backend sin desfase de un día.
//
// El backend envía los LocalDate como "2026-09-26" (solo fecha). Hacer
// new Date("2026-09-26") lo interpreta como medianoche UTC y en Colombia
// (UTC-5) toLocaleDateString() muestra el día anterior. Por eso las fechas
// "YYYY-MM-DD" se construyen como fecha local: new Date(año, mes-1, día).
// Los datetimes ("2026-09-26T20:15:10") se parsean normal: al no traer zona,
// el navegador ya los trata como hora local.

/** Parsea un valor de fecha del backend como fecha local (nunca UTC). */
export const parseFechaLocal = (value) => {
  if (typeof value === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(value);
};

/** Formatea una fecha del backend a fecha local corta; '' si falta o es inválida. */
export const formatFechaCorta = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const d = parseFechaLocal(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
};
