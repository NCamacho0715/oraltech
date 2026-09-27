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
    <div className="flex flex-col gap-2 border p-2 rounded bg-white shadow-sm">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="border border-dashed border-gray-300 cursor-crosshair bg-gray-50 rounded"
        style={{ touchAction: "none" }}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={clear}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty}
          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 transition-colors"
        >
          Confirmar Firma
        </button>
      </div>
    </div>
  );
};

export default SignatureCanvas;
