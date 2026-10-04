import React from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

const SectionHeaderActions = ({
  title,
  titleColor = 'var(--primary)',
  buttonColor = 'var(--primary)',
  readOnly,
  locked,
  saving,
  saveError,
  showSuccess,
  onSave,
  saveButtonText = 'Guardar Análisis',
  bloqueo,
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: titleColor, margin: 0 }}>{title}</h3>
    {!readOnly && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {saveError && (
          <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>
            {saveError}
          </span>
        )}
        {showSuccess && (
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, animation: 'fadeIn 0.3s' }}>
            <CheckCircle2 size={18} /> Guardado
          </span>
        )}
        {!locked && (
          <button onClick={onSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', background: buttonColor, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            <Save size={18} /> {saving ? 'Guardando...' : saveButtonText}
          </button>
        )}
        {!readOnly && bloqueo?.bloqueado && bloqueo?.isAdmin && (
          <button onClick={() => bloqueo.setShowUnlock(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
            Desbloquear (ADMIN)
          </button>
        )}
      </div>
    )}
  </div>
);

export default SectionHeaderActions;
