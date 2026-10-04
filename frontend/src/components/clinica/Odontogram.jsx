import React, { useState, useMemo, useCallback, memo } from "react";

// FULL CONVENTION LIST MAPPED TO TipoEvento (EXACT ENUM VALUES).
// A nivel de módulo: no se recrea en cada render.
const CONVENTIONS = [
  { label: "Cariado", type: "CARIES", color: "#ef4444", symbol: "❚" },
  { label: "Obturado Resina", type: "OBTURACION", color: "#3b82f6", symbol: "❚R" },
  { label: "Obturado Amalgama", type: "OBTURACION", color: "#3b82f6", symbol: "❚A" },
  { label: "Diente Ausente", type: "EXTRACCION", color: "#3b82f6", symbol: "—" },
  { label: "Diente sin Erupcionar", type: "OTRO", color: "#3b82f6", symbol: "|" },
  { label: "Exodoncia Simple Ind.", type: "EXTRACCION", color: "#ef4444", symbol: "X" },
  { label: "Exodoncia Quirúrgica Ind.", type: "EXTRACCION", color: "#ef4444", symbol: "*" },
  { label: "Diente en Erupción", type: "OTRO", color: "#3b82f6", symbol: "∧" },
  { label: "Sellante Realizado", type: "SELLANTE", color: "#3b82f6", symbol: "S" },
  { label: "Sellante Indicado", type: "SELLANTE", color: "#ef4444", symbol: "S" },
  { label: "Endodoncia Realizada", type: "ENDODONCIA", color: "#3b82f6", symbol: "△" },
  { label: "Endodoncia Indicada", type: "ENDODONCIA", color: "#ef4444", symbol: "△" },
  { label: "Corona Buen Estado", type: "CORONA", color: "#3b82f6", symbol: "O" },
  { label: "Corona Mal Estado", type: "CORONA", color: "#ef4444", symbol: "O" },
  { label: "Temporal", type: "TEMPORAL", color: "#ef4444", symbol: "T" },
  { label: "Núcleo Buen Estado", type: "NUCLEO", color: "#3b82f6", symbol: "N" },
  { label: "Núcleo Mal Estado", type: "NUCLEO", color: "#ef4444", symbol: "N" },
  { label: "Abrasión/Erosión", type: "ABRASION", color: "#ef4444", symbol: "∩" },
  { label: "Diastema", type: "DIASTEMA", color: "#3b82f6", symbol: "||" },
  { label: "Rotación", type: "ROTACION", color: "#3b82f6", symbol: "⟳" },
  { label: "Implante", type: "IMPLANTE", color: "#3b82f6", symbol: "≡" },
  { label: "Procedimiento Realizado", type: "OTRO", color: "#3b82f6", symbol: "✓" },
];

const FACE_PATHS = {
  SUPERIOR: "M5,5 L35,5 L20,20 Z",
  INFERIOR: "M5,35 L35,35 L20,20 Z",
  DERECHA: "M35,5 L35,35 L20,20 Z",
  IZQUIERDA: "M5,5 L5,35 L20,20 Z",
};

const faceStyleFor = (event) => {
  if (!event)
    return { fill: "var(--surface)", stroke: "var(--text-secondary)" };

  // Exact match with conventions
  const obs = event.observacion || "";
  const convention = CONVENTIONS.find((c) => c.label === obs);

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

// Fuera del componente + memo: evita desmontar los 32 dientes en cada render.
const Tooth = memo(function Tooth({ number, isSelected, readOnly, faceMap, onSelectFace }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 0,
        padding: "3px",
        border: isSelected
          ? "2px solid var(--primary)"
          : "1px solid var(--border-color)",
        borderRadius: "8px",
        background: isSelected ? "var(--secondary-soft)" : "transparent",
        transition: "background-color 0.2s, border-color 0.2s",
      }}
    >
      <span
        style={{
          fontSize: "9px",
          fontWeight: 800,
          color: "var(--text-secondary)",
          marginBottom: "2px",
        }}
      >
        {number}
      </span>
      <svg
        viewBox="0 0 40 40"
        style={{ width: "100%", maxWidth: "52px", height: "auto", display: "block", cursor: readOnly ? "default" : "pointer" }}
      >
        {Object.entries(FACE_PATHS).map(([face, d]) => (
          <path
            key={face}
            d={d}
            {...faceStyleFor(faceMap.get(`${number}:${face}`))}
            strokeWidth="1"
            onClick={() => !readOnly && onSelectFace(number, face)}
          />
        ))}
        <rect
          x="12"
          y="12"
          width="16"
          height="16"
          {...faceStyleFor(faceMap.get(`${number}:CENTRO`))}
          strokeWidth="1"
          onClick={() => !readOnly && onSelectFace(number, "CENTRO")}
        />
      </svg>
    </div>
  );
});

const ADULT_TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [38, 37, 36, 35, 34, 33, 32, 31],
  lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
};

const CHILD_TEETH = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft: [61, 62, 63, 64, 65],
  lowerRight: [85, 84, 83, 82, 81],
  lowerLeft: [71, 72, 73, 74, 75],
};

const DEFAULT_DATA = [];

const Odontogram = ({ data = DEFAULT_DATA, onEventAdd, readOnly = false }) => {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedFace, setSelectedFace] = useState(null);
  const [viewMode, setViewMode] = useState("ADULTO");

  const currentTeeth = viewMode === "ADULTO" ? ADULT_TEETH : CHILD_TEETH;

  // Mapa diente:cara → evento, memoizado: O(n) una vez en vez de
  // 160 búsquedas lineales en cada render.
  const faceMap = useMemo(() => {
    const map = new Map();
    for (const e of data) {
      const num = e.dienteNumero ?? e.numeroDiente;
      if (num == null || !e.cara) continue;
      const key = `${num}:${e.cara}`;
      if (!map.has(key)) map.set(key, e);
    }
    return map;
  }, [data]);

  const onSelectFace = useCallback((number, face) => {
    setSelectedTooth(number);
    setSelectedFace(face);
  }, []);

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
        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${viewMode === "ADULTO" ? 16 : 10}, minmax(0, 1fr))`,
              gap: "6px",
              marginBottom: "2rem",
              paddingBottom: "1rem",
              borderBottom: "1px dashed var(--border-color)",
              minWidth: viewMode === "ADULTO" ? "560px" : "380px",
            }}
          >
            {currentTeeth.upperRight.map((n) => (
              <Tooth key={n} number={n} isSelected={selectedTooth === n} readOnly={readOnly} faceMap={faceMap} onSelectFace={onSelectFace} />
            ))}
            {currentTeeth.upperLeft.map((n) => (
              <Tooth key={n} number={n} isSelected={selectedTooth === n} readOnly={readOnly} faceMap={faceMap} onSelectFace={onSelectFace} />
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${viewMode === "ADULTO" ? 16 : 10}, minmax(0, 1fr))`,
              gap: "6px",
              minWidth: viewMode === "ADULTO" ? "560px" : "380px",
            }}
          >
          {viewMode === "ADULTO" ? (
            <>
              {[...ADULT_TEETH.lowerRight].reverse().map((n) => (
                <Tooth key={n} number={n} isSelected={selectedTooth === n} readOnly={readOnly} faceMap={faceMap} onSelectFace={onSelectFace} />
              ))}
              {[...ADULT_TEETH.lowerLeft].reverse().map((n) => (
                <Tooth key={n} number={n} isSelected={selectedTooth === n} readOnly={readOnly} faceMap={faceMap} onSelectFace={onSelectFace} />
              ))}
            </>
          ) : (
            <>
              {CHILD_TEETH.lowerRight.map((n) => (
                <Tooth key={n} number={n} isSelected={selectedTooth === n} readOnly={readOnly} faceMap={faceMap} onSelectFace={onSelectFace} />
              ))}
              {CHILD_TEETH.lowerLeft.map((n) => (
                <Tooth key={n} number={n} isSelected={selectedTooth === n} readOnly={readOnly} faceMap={faceMap} onSelectFace={onSelectFace} />
              ))}
            </>
          )}
          </div>
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
                type="button"
                aria-label="Cerrar selector de hallazgo"
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
              {CONVENTIONS.map((c) => (
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
                    transition: "background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s, opacity 0.2s",
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
