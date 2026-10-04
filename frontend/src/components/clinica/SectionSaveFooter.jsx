import React from 'react';
import { Save, CheckCircle } from 'lucide-react';

const SectionSaveFooter = ({
  readOnly,
  locked,
  saving,
  saved,
  saveError,
  bloqueo,
  onUnlock,
  saveButtonText = 'Guardar',
}) => {
  if (readOnly) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '2px solid rgba(0, 119, 182, 0.1)' }}>
      {!locked && (
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ width: 'auto', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1, margin: 0 }}
        >
          <Save size={18} />
          {saving ? 'Guardando...' : saveButtonText}
        </button>
      )}
      {bloqueo?.bloqueado && bloqueo?.isAdmin && (
        <button
          type="button"
          onClick={onUnlock || (() => bloqueo?.setShowUnlock?.(true))}
          style={{ width: 'auto', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}
        >
          Desbloquear (ADMIN)
        </button>
      )}
      {saveError && <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{saveError}</span>}
      {saved && (
        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
          <CheckCircle size={18} /> Guardado
        </span>
      )}
    </div>
  );
};

export default SectionSaveFooter;
