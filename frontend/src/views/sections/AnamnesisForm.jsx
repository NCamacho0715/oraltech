import React, { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import clinicaService from '../../services/clinicaService';
import { useBloqueoSeccion } from '../../hooks/useBloqueoSeccion';
import DesbloqueoModal from '../../components/clinica/DesbloqueoModal';
import { formatFechaCorta } from '../../utils/fechas';

const AnamnesisForm = ({ historiaId, readOnly }) => {
  const [data, setData] = useState({ motivoConsulta: '', estadoActual: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const bloqueo = useBloqueoSeccion('anamnesis');
  const locked = readOnly || bloqueo.bloqueado;

  useEffect(() => {
    const load = async () => {
      setLoadError('');
      try {
        const res = await clinicaService.getAnamnesis(historiaId);
        if (res.data) {
          setData(res.data);
          bloqueo.marcarRegistrado(res.data);
        }
      } catch (err) {
        // 404 = "aún no registrada": estado vacío, no error.
        if (err?.response?.status === 404) return;
        setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar la anamnesis');
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historiaId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setSaveError('');
    try {
      await clinicaService.upsertAnamnesis(historiaId, data);
      bloqueo.marcarGuardado();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err?.response?.status === 409) bloqueo.marcarConflicto();
      setSaveError(err?.response?.data?.message || err?.message || 'Error al guardar anamnesis');
    } finally {
      setSaving(false);
    }
  };

  const fechaBloqueo = formatFechaCorta(data.createdAt);

  return (
    <>
    <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Anamnesis
        </h3>

        {bloqueo.bloqueado && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
            Registro bloqueado
            {fechaBloqueo ? ` · ${fechaBloqueo}` : ''}
            {data.createdBy ? ` · ${data.createdBy}` : ''}
          </p>
        )}
        {!bloqueo.bloqueado && bloqueo.desbloqueo && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
            Desbloqueada por {bloqueo.desbloqueo.por}: {bloqueo.desbloqueo.motivo}
          </p>
        )}

        {loadError && (
          <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <strong style={{ color: 'var(--accent)' }}>No se pudo cargar la anamnesis. </strong>
            {loadError}
          </div>
        )}
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Motivo de Consulta</label>
          <textarea
            value={data.motivoConsulta}
            onChange={(e) => setData({ ...data, motivoConsulta: e.target.value })}
            readOnly={locked}
            style={{ 
                width: '100%', 
                padding: '1rem', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                minHeight: '120px', 
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                resize: 'vertical',
                transition: 'border-color 0.3s'
            }}
            placeholder="¿Por qué viene el paciente?"
            onFocus={(e) => !locked && (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => !locked && (e.target.style.borderColor = 'var(--border-color)')}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Estado Actual</label>
          <textarea
            value={data.estadoActual}
            onChange={(e) => setData({ ...data, estadoActual: e.target.value })}
            readOnly={locked}
            style={{ 
                width: '100%', 
                padding: '1rem', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                minHeight: '180px', 
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                resize: 'vertical',
                transition: 'border-color 0.3s'
            }}
            placeholder="Descripción detallada del estado actual..."
            onFocus={(e) => !locked && (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => !locked && (e.target.style.borderColor = 'var(--border-color)')}
          />
        </div>

        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '2px solid rgba(0, 119, 182, 0.1)' }}>
            {!locked && (
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ width: 'auto', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1, margin: 0 }}
              >
                <Save size={18} />
                {saving ? 'Guardando...' : 'Guardar Anamnesis'}
              </button>
            )}
            {!readOnly && bloqueo.bloqueado && bloqueo.isAdmin && (
              <button
                type="button"
                onClick={() => bloqueo.setShowUnlock(true)}
                style={{ width: 'auto', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}
              >
                Desbloquear (ADMIN)
              </button>
            )}
            {saveError && <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{saveError}</span>}
            {saved && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}><CheckCircle size={18} /> Guardado</span>}
          </div>
        )}
      </div>
    </form>
    <DesbloqueoModal
      abierto={bloqueo.showUnlock}
      seccionNombre="Anamnesis"
      error={bloqueo.unlockError}
      enviando={bloqueo.unlocking}
      onCancel={() => bloqueo.setShowUnlock(false)}
      onConfirm={(motivo) => bloqueo.solicitar(historiaId, motivo)}
    />
    </>
  );
};

export default AnamnesisForm;
