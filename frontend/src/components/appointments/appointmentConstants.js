export const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 – 19:00

export const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const STATUS_CONFIG = {
  PENDIENTE: {
    label: "Pendiente",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    dot: "#f59e0b",
  },
  CONFIRMADA: {
    label: "Confirmada",
    color: "#0077b6",
    bg: "rgba(0,119,182,0.15)",
    dot: "#0077b6",
  },
  COMPLETADA: {
    label: "Completada",
    color: "#2a9d8f",
    bg: "rgba(42,157,143,0.15)",
    dot: "#2a9d8f",
  },
  CANCELADA: {
    label: "Cancelada",
    color: "#e63946",
    bg: "rgba(230,57,70,0.15)",
    dot: "#e63946",
  },
};

export const toISO = (d) => d.toISOString().split("T")[0];

export const getWeekStart = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

export const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};
