import React from "react";
import { FileText } from "lucide-react";
import { parseMarkdownParagraphs } from "../../utils/consentimiento";

const RenderToken = ({ token }) => {
  if (token.type === "strong-em") {
    return (
      <strong style={{ fontWeight: 700 }}>
        <em>
          {token.children.map((child) => (
            <RenderToken key={child.id} token={child} />
          ))}
        </em>
      </strong>
    );
  }
  if (token.type === "strong") {
    return (
      <strong style={{ fontWeight: 700 }}>
        {token.children.map((child) => (
          <RenderToken key={child.id} token={child} />
        ))}
      </strong>
    );
  }
  if (token.type === "u") {
    return (
      <u style={{ textUnderlineOffset: "3px" }}>
        {token.children.map((child) => (
          <RenderToken key={child.id} token={child} />
        ))}
      </u>
    );
  }
  if (token.type === "em") {
    return (
      <em>
        {token.children.map((child) => (
          <RenderToken key={child.id} token={child} />
        ))}
      </em>
    );
  }
  return <React.Fragment>{token.text}</React.Fragment>;
};

export const ConsentimientoDocumentView = ({ contenido }) => {
  const paragraphs = React.useMemo(
    () => parseMarkdownParagraphs(contenido),
    [contenido],
  );

  return (
    <div
      style={{
        background: "var(--background)",
        border: "1px solid var(--border-color)",
        borderRadius: "14px",
        padding: "1.75rem 2rem",
        color: "var(--text-main)",
        marginBottom: "2rem",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "0.85rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FileText size={20} style={{ color: "var(--primary)" }} />
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--text-main)",
              letterSpacing: "0.02em",
            }}
          >
            Términos y Declaración del Consentimiento
          </span>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            padding: "0.2rem 0.6rem",
            borderRadius: "999px",
            background: "rgba(0, 119, 182, 0.12)",
            color: "var(--primary)",
            fontWeight: 600,
          }}
        >
          Documento Oficial
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {paragraphs.map((para) => (
          <p
            key={para.id}
            style={{
              margin: 0,
              lineHeight: "1.8",
              fontSize: "1.02rem",
              color: "var(--text-main)",
              textAlign: "justify",
            }}
          >
            {para.tokens.map((tok) => (
              <RenderToken key={tok.id} token={tok} />
            ))}
          </p>
        ))}
      </div>
    </div>
  );
};
