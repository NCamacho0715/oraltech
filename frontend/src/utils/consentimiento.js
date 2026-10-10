export const DEFAULT_CONSENTIMIENTO_TEXT = `Yo, en pleno uso de mis facultades mentales, autorizo al (a) Doctor(a) para que me realice los siguientes procedimientos, que a su juicio sean necesarios durante este **Tratamiento**.

El efecto y la naturaleza del tratamiento considerando los riesgos que implica. Así como todas las alternativas y métodos posibles me han sido perfectamente explicados, lo cual no garantiza los resultados que posiblemente sean obtenidos con el mismo.

Hago esta declaración en pleno conocimiento de hecho, ya que no se me puede asegurar que el tratamiento tenga éxito en todos los casos y doy autorización para proceder por mi libre voluntad y consiento en liberar expresamente al (a) Doctor(a) de toda responsabilidad, respecto a eventuales reivindicaciones o demandas o de daños y perjuicios por todas las lesiones y/o complicaciones que puedan provenir de este tratamiento, pues he sido perfectamente informado(a) de los riesgos, incertidumbres y demás circunstancias que puedan comprometer su buen resultado. El (los) odontólogo(s) aplicará(n) sus conocimientos como profesional(es) de la salud y utilizará(n) materiales de la mejor calidad. El paciente debe preveer al odontólogo de los medios diagnósticos necesarios para la realización del tratamiento.

**Nota: <u>Todo tratamiento será entregado previa cancelación del mismo.</u>**

Este orden de trabajo aprobada en Bogotá D.C. Asimila en todos sus efectos a una factura y/o letra de cambio según Ley 774 del Código de Comercio y causará intereses de mora de la misma, legal permitida según el Artículo 884 del Código de Comercio.

***Autorizo y acepto la realización del tratamiento.***`;

export const isLegacyUnformattedText = (text) => {
  if (!text) return true;
  const trimmed = text.trim();
  if (!trimmed.includes("\n") && trimmed.includes("facultades mentales")) {
    return true;
  }
  return false;
};

let inlineTokenSeq = 0;

export const parseInlineTokens = (str) => {
  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|<u>.*?<\/u>|\*[^*]+\*)/g;
  const parts = str.split(regex);
  const tokens = [];

  for (const part of parts) {
    if (!part) continue;
    inlineTokenSeq += 1;
    const id = `tok-${inlineTokenSeq}`;

    if (part.startsWith("***") && part.endsWith("***")) {
      tokens.push({
        id,
        type: "strong-em",
        children: parseInlineTokens(part.slice(3, -3)),
      });
    } else if (part.startsWith("**") && part.endsWith("**")) {
      tokens.push({
        id,
        type: "strong",
        children: parseInlineTokens(part.slice(2, -2)),
      });
    } else if (part.startsWith("<u>") && part.endsWith("</u>")) {
      tokens.push({
        id,
        type: "u",
        children: parseInlineTokens(part.slice(3, -4)),
      });
    } else if (part.startsWith("*") && part.endsWith("*")) {
      tokens.push({
        id,
        type: "em",
        children: parseInlineTokens(part.slice(1, -1)),
      });
    } else {
      tokens.push({
        id,
        type: "text",
        text: part,
      });
    }
  }

  return tokens;
};

export const parseMarkdownParagraphs = (text) => {
  if (!text) return [];
  const rawParagraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  let pSeq = 0;
  return rawParagraphs.map((p) => {
    pSeq += 1;
    return {
      id: `p-${pSeq}-${p.slice(0, 12).replace(/\W/g, "")}`,
      tokens: parseInlineTokens(p),
    };
  });
};
