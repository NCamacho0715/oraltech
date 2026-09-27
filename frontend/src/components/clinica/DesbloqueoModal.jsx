import React, { useState } from 'react';

// HU-2: modal propio (sin window.confirm) para el desbloqueo excepcional ADMIN.
// Exige escribir el motivo (mínimo 10 caracteres, validado también en backend).
const DesbloqueoModal = ({ abierto, seccionNombre, onConfirm, onCancel, error, enviando }) => {
  const [motivo, setMotivo] = useState('');
  const [localError, setLocalError] = useState('');

  if (!abierto) return null;

  const confirmar = () => {
    if (!motivo.trim() || motivo.trim().length < 10) {
      setLocalError('Describe el error de digitación (mínimo 10 caracteres)');
      return;
    }
    setLocalError('');
    onConfirm(motivo.trim());
  };

  const cancelar = () => {
    setMotivo('');
    setLocalError('');
    onCancel();
  };

  return (
    <div onClick={cancelar} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '16px', width: '480px', maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.2rem' }}>Desbloquear {seccionNombre}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
          Desbloqueo excepcional de <strong style={{ color: 'var(--accent)' }}>un solo uso</strong>, solo para
          corregir un error de digitación. Quedará registrado con tu usuario y este motivo.
        </p>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Describe el error de digitación a corregir (mínimo 10 caracteres)"
          rows={3}
          style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '1rem', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)', resize: 'vertical', marginBottom: '1rem' }}
        />
        {(localError || error) && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>{localError || error}</p>}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={cancelar} disabled={enviando} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
          <button
            onClick={confirmar}
            disabled={enviando || motivo.trim().length < 10}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, cursor: motivo.trim().length < 10 ? 'not-allowed' : 'pointer', opacity: (enviando || motivo.trim().length < 10) ? 0.5 : 1 }}
          >
            {enviando ? 'Solicitando...' : 'Desbloquear una vez'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesbloqueoModal;
