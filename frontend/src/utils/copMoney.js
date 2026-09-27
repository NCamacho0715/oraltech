// Utilidades de moneda para pesos colombianos (COP).
// Convención COP: el punto separa miles ("150.000" = ciento cincuenta mil)
// y la coma separa decimales. Los <input type="number"> del navegador
// interpretan el punto como decimal ("150.000" -> 150), por eso los campos
// de dinero usan type="text" + estas funciones.

/** Formatea en vivo lo que digita el usuario: "150000" -> "150.000". */
export const formatCOPInput = (raw) => {
  if (raw === null || raw === undefined) return "";
  const [intPart = "", ...decParts] = String(raw).split(",");
  const intDigits = intPart.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!intDigits && decParts.length === 0) return "";
  const grouped = (intDigits === "" ? "0" : Number(intDigits)).toLocaleString("es-CO");
  if (decParts.length === 0) return grouped;
  const decDigits = decParts.join("").replace(/\D/g, "").slice(0, 2);
  return `${grouped},${decDigits}`;
};

/** Convierte un valor con formato COP a número para el payload: "150.000" -> 150000. */
export const parseCOP = (formatted) => {
  if (formatted === null || formatted === undefined || formatted === "") return null;
  const n = Number(String(formatted).replace(/\./g, "").replace(",", "."));
  return Number.isNaN(n) ? null : n;
};

/** Formatea un valor numérico para mostrar: 150000 -> "150.000". */
export const formatCOP = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n.toLocaleString("es-CO", { maximumFractionDigits: 2 });
};
