import React, { useState } from "react";

const Odontogram = ({ data = [], onEventAdd, readOnly = false }) => {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedFace, setSelectedFace] = useState(null);
  const [viewMode, setViewMode] = useState("ADULTO");

  const adultTeeth = {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    lowerLeft: [38, 37, 36, 35, 34, 33, 32, 31],
    lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
  };

  const childTeeth = {
    upperRight: [55, 54, 53, 52, 51],
    upperLeft: [61, 62, 63, 64, 65],
    lowerRight: [85, 84, 83, 82, 81],
    lowerLeft: [71, 72, 73, 74, 75],
  };

  const currentTeeth = viewMode === "ADULTO" ? adultTeeth : childTeeth;

  const getEventForFace = (toothNum, face) => {
    return data.find(
      (e) =>
        (e.dienteNumero === toothNum || e.numeroDiente === toothNum) &&
        e.cara === face,
    );
  };

  // FULL CONVENTION LIST MAPPED TO TipoEvento (EXACT ENUM VALUES)
  const conventions = [
    { label: "Cariado", type: "CARIES", color: "#ef4444", symbol: "❚" },
    {
      label: "Obturado Resina",
      type: "OBTURACION",
      color: "#3b82f6",
      symbol: "❚R",
    },
    {
      label: "Obturado Amalgama",
      type: "OBTURACION",
      color: "#3b82f6",
      symbol: "❚A",
    },
    {
      label: "Diente Ausente",
      type: "EXTRACCION",
      color: "#3b82f6",
      symbol: "—",
    },
    {
      label: "Diente sin Erupcionar",
      type: "OTRO",
      color: "#3b82f6",
      symbol: "|",
    },
    {
      label: "Exodoncia Simple Ind.",
      type: "EXTRACCION",
      color: "#ef4444",
      symbol: "X",
    },
    {
      label: "Exodoncia Quirúrgica Ind.",
      type: "EXTRACCION",
      color: "#ef4444",
      symbol: "*",
    },
    {
      label: "Diente en Erupción",
      type: "OTRO",
      color: "#3b82f6",
      symbol: "∧",
    },
    {
      label: "Sellante Realizado",
      type: "SELLANTE",
      color: "#3b82f6",
      symbol: "S",
    },
    {
      label: "Sellante Indicado",
      type: "SELLANTE",
      color: "#ef4444",
      symbol: "S",
    },
    {
      label: "Endodoncia Realizada",
      type: "ENDODONCIA",
      color: "#3b82f6",
      symbol: "△",
    },
    {
      label: "Endodoncia Indicada",
      type: "ENDODONCIA",
      color: "#ef4444",
      symbol: "△",
    },
    {
      label: "Corona Buen Estado",
      type: "CORONA",
      color: "#3b82f6",
      symbol: "O",
    },
    {
      label: "Corona Mal Estado",
      type: "CORONA",
      color: "#ef4444",
      symbol: "O",
    },
    { label: "Temporal", type: "TEMPORAL", color: "#ef4444", symbol: "T" },
    {
      label: "Núcleo Buen Estado",
      type: "NUCLEO",
      color: "#3b82f6",
      symbol: "N",
    },
    {
      label: "Núcleo Mal Estado",
      type: "NUCLEO",
      color: "#ef4444",
      symbol: "N",
    },
    {
      label: "Abrasión/Erosión",
      type: "ABRASION",
      color: "#ef4444",
      symbol: "∩",
    },
    { label: "Diastema", type: "DIASTEMA", color: "#3b82f6", symbol: "||" },
    { label: "Rotación", type: "ROTACION", color: "#3b82f6", symbol: "⟳" },
    { label: "Implante", type: "IMPLANTE", color: "#3b82f6", symbol: "≡" },
    {
      label: "Procedimiento Realizado",
      type: "OTRO",
      color: "#3b82f6",
      symbol: "✓",
    },
  ];

  const getFaceStyle = (toothNum, face) => {
    const event = getEventForFace(toothNum, face);
    if (!event)
      return { fill: "var(--surface)", stroke: "var(--text-secondary)" };

    // Exact match with conventions
    const obs = event.observacion || "";
    const convention = conventions.find((c) => c.label === obs);

    if (convention) {
      if (convention.color === "#ef4444") {
        return { fill: "#ef4444", stroke: "#991b1b" };
      } else {
        return { fill: "#3b82f6", stroke: "#1e3a8a" };
      }
    }

    // Fallback based on type if no exact label matched
    const type = (event.tipoEvento || "").toUpperCase();
    if (
      ["CARIES", "TEMPORAL", "ABRASION"].includes(type) ||
      obs.toUpperCase().includes("IND.")
    ) {
      return { fill: "#ef4444", stroke: "#991b1b" };
    }

    return { fill: "#3b82f6", stroke: "#1e3a8a" };
  };

  const Tooth = ({ number }) => {
    const isSelected = selectedTooth === number;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "4px",
          border: isSelected
            ? "2px solid var(--primary)"
            : "1px solid var(--border-color)",
          borderRadius: "8px",
          background: isSelected ? "var(--secondary-soft)" : "transparent",
          transition: "all 0.2s",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "var(--text-secondary)",
            marginBottom: "4px",
          }}
        >
          {number}
        </span>
        <svg
          width="45"
          height="45"
          viewBox="0 0 40 40"
          style={{ cursor: readOnly ? "default" : "pointer" }}
        >
          <path
            d="M5,5 L35,5 L20,20 Z"
            {...getFaceStyle(number, "SUPERIOR")}
            strokeWidth="1"
            onClick={() =>
              !readOnly &&
              (setSelectedTooth(number), setSelectedFace("SUPERIOR"))
            }
          />
          <path
            d="M5,35 L35,35 L20,20 Z"
            {...getFaceStyle(number, "INFERIOR")}
            strokeWidth="1"
            onClick={() =>
              !readOnly &&
              (setSelectedTooth(number), setSelectedFace("INFERIOR"))
            }
          />
          <path
            d="M35,5 L35,35 L20,20 Z"
            {...getFaceStyle(number, "DERECHA")}
            strokeWidth="1"
            onClick={() =>
              !readOnly &&
              (setSelectedTooth(number), setSelectedFace("DERECHA"))
            }
          />
          <path
            d="M5,5 L5,35 L20,20 Z"
            {...getFaceStyle(number, "IZQUIERDA")}
            strokeWidth="1"
            onClick={() =>
              !readOnly &&
              (setSelectedTooth(number), setSelectedFace("IZQUIERDA"))
            }
          />
          <rect
            x="12"
            y="12"
            width="16"
            height="16"
            {...getFaceStyle(number, "CENTRO")}
            strokeWidth="1"
            onClick={() =>
              !readOnly && (setSelectedTooth(number), setSelectedFace("CENTRO"))
            }
          />
        </svg>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setViewMode("ADULTO")}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            background:
              viewMode === "ADULTO" ? "var(--primary)" : "var(--surface)",
            color: viewMode === "ADULTO" ? "white" : "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          ADULTO
        </button>
        <button
          onClick={() => setViewMode("NINO")}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            background:
              viewMode === "NINO" ? "var(--primary)" : "var(--surface)",
            color: viewMode === "NINO" ? "white" : "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          NIÑO
        </button>
      </div>

      <div
        style={{
          background: "var(--surface)",
          padding: "2rem",
          borderRadius: "15px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${viewMode === "ADULTO" ? 16 : 10}, 1fr)`,
            gap: "6px",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "1px dashed var(--border-color)",
          }}
        >
          {currentTeeth.upperRight.map((n) => (
            <Tooth key={n} number={n} />
          ))}
          {currentTeeth.upperLeft.map((n) => (
            <Tooth key={n} number={n} />
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${viewMode === "ADULTO" ? 16 : 10}, 1fr)`,
            gap: "6px",
          }}
        >
          {viewMode === "ADULTO" ? (
            <>
              {adultTeeth.lowerRight.reverse().map((n) => (
                <Tooth key={n} number={n} />
              ))}
              {adultTeeth.lowerLeft.reverse().map((n) => (
                <Tooth key={n} number={n} />
              ))}
            </>
          ) : (
            <>
              {childTeeth.lowerRight.map((n) => (
                <Tooth key={n} number={n} />
              ))}
              {childTeeth.lowerLeft.map((n) => (
                <Tooth key={n} number={n} />
              ))}
            </>
          )}
        </div>

        {!readOnly && selectedTooth && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              maxWidth: "90vw",
              background: "var(--surface)",
              border: "2px solid var(--primary)",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
              zIndex: 1000,
              backdropFilter: "blur(10px)",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "1rem",
              }}
            >
              <h4
                style={{ fontWeight: 800, color: "var(--primary)", margin: 0 }}
              >
                Hallazgo: Diente {selectedTooth} - Cara {selectedFace}
              </h4>
              <button
                onClick={() => setSelectedTooth(null)}
                style={{
                  background: "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "0.8rem",
                maxHeight: "400px",
                overflowY: "auto",
                padding: "0.5rem",
              }}
            >
              {conventions.map((c) => (
                <button
                  key={c.label}
                  onClick={() => {
                    onEventAdd({
                      numeroDiente: selectedTooth,
                      cara: selectedFace,
                      tipoEvento: c.type,
                      estado: "ACTIVO",
                      observacion: c.label,
                    });
                    setSelectedTooth(null);
                    setSelectedFace(null);
                  }}
                  style={{
                    padding: "0.8rem",
                    border: `1px solid var(--border-color)`,
                    background: "var(--secondary-soft)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = c.color;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span>{c.label}</span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: c.color,
                      fontSize: "1rem",
                    }}
                  >
                    {c.symbol}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Odontogram;
