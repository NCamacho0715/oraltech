import React, { useState, useEffect } from 'react';
import clinicaService from '../../services/clinicaService';
import { useBloqueoSeccion } from '../../hooks/useBloqueoSeccion';
import DesbloqueoModal from '../../components/clinica/DesbloqueoModal';
import BloqueoBanner from '../../components/clinica/BloqueoBanner';
import SectionSaveFooter from '../../components/clinica/SectionSaveFooter';
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
    let ignore = false;
    const load = async () => {
      setLoadError('');
      try {
        const res = await clinicaService.getAnamnesis(historiaId);
        if (ignore) return;
        if (res.data) {
          setData(res.data);
          bloqueo.marcarRegistrado(res.data);
        }
      } catch (err) {
        if (ignore) return;
        // 404 = "aún no registrada": estado vacío, no error.
        if (err?.response?.status === 404) return;
        setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar la anamnesis');
      }
    };
    load();
    return () => {
      ignore = true;
    };
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

        <BloqueoBanner
          bloqueo={bloqueo}
          fechaBloqueo={fechaBloqueo}
          createdBy={data.createdBy}
        />

        {loadError && (
          <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <strong style={{ color: 'var(--accent)' }}>No se pudo cargar la anamnesis. </strong>
            {loadError}
          </div>
        )}
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="anamnesis-motivo-consulta" style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Motivo de Consulta</label>
          <textarea
            id="anamnesis-motivo-consulta"
            aria-label="Motivo de Consulta"
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
          <label htmlFor="anamnesis-estado-actual" style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Estado Actual</label>
          <textarea
            id="anamnesis-estado-actual"
            aria-label="Estado Actual"
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

        <SectionSaveFooter
          readOnly={readOnly}
          locked={locked}
          saving={saving}
          saved={saved}
          saveError={saveError}
          bloqueo={bloqueo}
          saveButtonText="Guardar Anamnesis"
        />
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
