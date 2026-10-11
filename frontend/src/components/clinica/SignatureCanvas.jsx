import React, { useRef, useEffect, useState } from "react";

const SignatureCanvas = ({
  onSave,
  clearOnSave = true,
  width = 400,
  height = 200,
  label = "Firma",
}) => {
  const canvasRef = useRef(null);
  // Refs (no estados): el trazo genera decenas de eventos por segundo y no
  // debe re-renderizar el componente en cada mousemove.
  const isDrawing = useRef(false);
  const drewStroke = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
    drewStroke.current = false;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;

    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
    drewStroke.current = true;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    if (drewStroke.current) {
      drewStroke.current = false;
      setIsEmpty(false);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (isEmpty) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    // Remove metadata prefix "data:image/png;base64,"
    const base64 = dataUrl.split(",")[1];
    onSave(base64);
    if (clearOnSave) clear();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        border: "1px solid var(--border-color)",
        padding: "1rem",
        borderRadius: "12px",
        background: "var(--surface)",
        boxShadow: "var(--shadow)",
        width: "100%",
      }}
    >
      <span
        style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "var(--text-main)",
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: "8px",
          border: "1px dashed var(--border-color)",
          padding: "4px",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          aria-label={label}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            touchAction: "none",
            width: "100%",
            maxWidth: `${width}px`,
            height: "auto",
            display: "block",
            cursor: "crosshair",
            background: "#ffffff",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={clear}
          style={{
            padding: "0.4rem 0.85rem",
            fontSize: "0.8rem",
            background: "var(--secondary-soft)",
            color: "var(--text-secondary)",
            borderRadius: "6px",
            border: "1px solid var(--border-color)",
            fontWeight: 500,
          }}
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty}
          style={{
            padding: "0.4rem 1rem",
            fontSize: "0.8rem",
            background: "var(--primary)",
            color: "#ffffff",
            borderRadius: "6px",
            border: "none",
            fontWeight: 600,
            opacity: isEmpty ? 0.5 : 1,
            cursor: isEmpty ? "not-allowed" : "pointer",
          }}
        >
          Confirmar Firma
        </button>
      </div>
    </div>
  );
};

export default SignatureCanvas;
