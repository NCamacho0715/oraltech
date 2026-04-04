import React, { useState } from 'react';

/**
 * Interactive Odontogram Component.
 * Displays 32 permanent teeth (simplified) arranged in 4 quadrants.
 */
const Odontogram = ({ data = [], onEventAdd, readOnly = false }) => {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedFace, setSelectedFace] = useState(null);

  // quadrants: 1 (UR), 2 (UL), 3 (LL), 4 (LR)
  const teethGroups = {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    lowerLeft: [38, 37, 36, 35, 34, 33, 32, 31],
    lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
  };

  const getFaceColor = (toothNum, face) => {
    const event = data.find(e => e.dienteNumero === toothNum && e.cara === face);
    if (!event) return 'white';
    
    switch (event.tipoEvento) {
      case 'CARIES': return '#ef4444'; // Red
      case 'OBTURADO': return '#3b82f6'; // Blue
      case 'SELLANTE': return '#10b981'; // Green
      case 'OTRO': return '#f59e0b'; // Amber
      default: return 'white';
    }
  };

  const Tooth = ({ number }) => {
    const isSelected = selectedTooth === number;
    
    return (
      <div className={`flex flex-col items-center p-1 border rounded ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
        <span className="text-[10px] font-bold text-gray-500">{number}</span>
        <svg width="40" height="40" viewBox="0 0 40 40" className="cursor-pointer">
          {/* Top Face */}
          <path 
            d="M5,5 L35,5 L20,20 Z" 
            fill={getFaceColor(number, 'SUPERIOR')} 
            stroke="black" strokeWidth="0.5"
            onClick={() => !readOnly && (setSelectedTooth(number), setSelectedFace('SUPERIOR'))}
          />
          {/* Bottom Face */}
          <path 
            d="M5,35 L35,35 L20,20 Z" 
            fill={getFaceColor(number, 'INFERIOR')} 
            stroke="black" strokeWidth="0.5"
            onClick={() => !readOnly && (setSelectedTooth(number), setSelectedFace('INFERIOR'))}
          />
          {/* Right Face */}
          <path 
            d="M35,5 L35,35 L20,20 Z" 
            fill={getFaceColor(number, 'DERECHA')} 
            stroke="black" strokeWidth="0.5"
            onClick={() => !readOnly && (setSelectedTooth(number), setSelectedFace('DERECHA'))}
          />
          {/* Left Face */}
          <path 
            d="M5,5 L5,35 L20,20 Z" 
            fill={getFaceColor(number, 'IZQUIERDA')} 
            stroke="black" strokeWidth="0.5"
            onClick={() => !readOnly && (setSelectedTooth(number), setSelectedFace('IZQUIERDA'))}
          />
          {/* Center Face */}
          <rect 
            x="12" y="12" width="16" height="16" 
            fill={getFaceColor(number, 'CENTRO')} 
            stroke="black" strokeWidth="0.5"
            onClick={() => !readOnly && (setSelectedTooth(number), setSelectedFace('CENTRO'))}
          />
        </svg>
      </div>
    );
  };

  const handleApply = (type) => {
    if (readOnly) return;
    onEventAdd({
      dienteNumero: selectedTooth,
      cara: selectedFace,
      tipoEvento: type,
      estadoEvento: 'ACTUAL'
    });
    setSelectedTooth(null);
    setSelectedFace(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-8 gap-1 border-b pb-4">
        {teethGroups.upperRight.map(n => <Tooth key={n} number={n} />)}
        {teethGroups.upperLeft.map(n => <Tooth key={n} number={n} />)}
      </div>
      <div className="grid grid-cols-8 gap-1 pt-4">
        {teethGroups.lowerRight.reverse().map(n => <Tooth key={n} number={n} />)}
        {teethGroups.lowerLeft.reverse().map(n => <Tooth key={n} number={n} />)}
      </div>

      {!readOnly && selectedTooth && (
        <div className="mt-4 p-4 border rounded bg-blue-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-sm">Registrar hallazgo: Diente {selectedTooth} ({selectedFace})</h4>
            <button onClick={() => setSelectedTooth(null)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleApply('CARIES')} className="px-3 py-1 bg-red-500 text-white text-xs rounded shadow-sm">Caries (Rojo)</button>
            <button onClick={() => handleApply('OBTURADO')} className="px-3 py-1 bg-blue-500 text-white text-xs rounded shadow-sm">Obturado (Azul)</button>
            <button onClick={() => handleApply('SELLANTE')} className="px-3 py-1 bg-green-500 text-white text-xs rounded shadow-sm">Sellante (Verde)</button>
            <button onClick={() => handleApply('AUSENTE')} className="px-3 py-1 bg-gray-400 text-white text-xs rounded shadow-sm">Ausente</button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-[10px] text-gray-500 italic">
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500"></div> Caries</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500"></div> Obturado</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500"></div> Sellante</div>
      </div>
    </div>
  );
};

export default Odontogram;
