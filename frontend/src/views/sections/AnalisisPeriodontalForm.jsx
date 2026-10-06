import React, { useState, useEffect } from 'react';
import clinicaService from '../../services/clinicaService';
import { useBloqueoSeccion } from '../../hooks/useBloqueoSeccion';
import DesbloqueoModal from '../../components/clinica/DesbloqueoModal';
import SectionHeaderActions from '../../components/clinica/SectionHeaderActions';
import { formatFechaCorta } from '../../utils/fechas';

const CheckboxRow = ({ id, label, checked, onChange, disabled }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', borderRadius: '10px', cursor: disabled ? 'default' : 'pointer', background: 'var(--surface)', border: '1px solid var(--border-color)', transition: 'background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s, opacity 0.2s', boxShadow: 'var(--shadow-sm)' }}>
    <input 
      type="checkbox" 
      checked={checked || false} 
      onChange={e => !disabled && onChange(id, e.target.checked)} 
      disabled={disabled}
      style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
    />
    <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>{label}</span>
  </label>
);

const AnalisisPeriodontalForm = ({ historiaId, readOnly }) => {
  const [data, setData] = useState({
    bolsaPeriodontal: false,
    pseudoBolsa: false,
    movilidadDental: false,
    perdidaOsea: false,
    retraccionGingival: false,
    calculosSupra: false,
    calculosSub: false,
    reabsorcionRadicular: false,
    sangrado: false,
    exudadoSupuracion: false,
    inflamacion: false,
    cambioColor: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const bloqueo = useBloqueoSeccion('periodontal');
  const locked = readOnly || bloqueo.bloqueado;

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setLoadError('');
      try {
        const res = await clinicaService.getAnalisisPeriodontal(historiaId);
        if (ignore) return;
        if (res.data) {
          setData(res.data);
          bloqueo.marcarRegistrado(res.data);
        }
      } catch (err) {
        if (ignore) return;
        // 404 = "aún no registrado": estado vacío, no error.
        if (err?.response?.status === 404) return;
        setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar el análisis periodontal');
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historiaId]);

  const handleCheckboxChange = (id, val) => {
    setData(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await clinicaService.upsertAnalisisPeriodontal(historiaId, data);
      if (res?.data) setData(res.data);
      bloqueo.marcarGuardado();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      if (err?.response?.status === 409) bloqueo.marcarConflicto();
      setSaveError(err?.response?.data?.message || err?.message || 'Error al guardar análisis periodontal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-5">Cargando Análisis Periodontal...</div>;

  const fechaBloqueo = formatFechaCorta(data.updatedAt || data.createdAt);

  return (
    <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
      <SectionHeaderActions
        title="Análisis Periodontal"
        titleColor="var(--accent)"
        buttonColor="var(--accent)"
        readOnly={readOnly}
        locked={locked}
        saving={saving}
        saveError={saveError}
        showSuccess={showSuccess}
        onSave={handleSave}
        bloqueo={bloqueo}
      />

      {bloqueo.bloqueado && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
          Registro bloqueado
          {fechaBloqueo ? ` · ${fechaBloqueo}` : ''}
          {(data.updatedBy || data.createdBy) ? ` · ${data.updatedBy || data.createdBy}` : ''}
        </p>
      )}
      {!bloqueo.bloqueado && bloqueo.desbloqueo && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
          Desbloqueada por {bloqueo.desbloqueo.por}: {bloqueo.desbloqueo.motivo}
        </p>
      )}

      {loadError && (
        <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
          <strong style={{ color: 'var(--accent)' }}>No se pudo cargar el análisis periodontal. </strong>
          {loadError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        <CheckboxRow id="bolsaPeriodontal" label="Bolsa periodontal" checked={data.bolsaPeriodontal} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="pseudoBolsa" label="Pseudo bolsa" checked={data.pseudoBolsa} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="movilidadDental" label="Movilidad dental" checked={data.movilidadDental} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="perdidaOsea" label="Pérdida osea" checked={data.perdidaOsea} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="retraccionGingival" label="Retracción gingival" checked={data.retraccionGingival} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="calculosSupra" label="Cálculos supragingivales" checked={data.calculosSupra} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="calculosSub" label="Cálculos subgingivales" checked={data.calculosSub} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="reabsorcionRadicular" label="Reabsorción radicular" checked={data.reabsorcionRadicular} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="sangrado" label="Sangrado" checked={data.sangrado} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="exudadoSupuracion" label="Exudado/supuración" checked={data.exudadoSupuracion} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="inflamacion" label="Inflamación" checked={data.inflamacion} onChange={handleCheckboxChange} disabled={locked} />
        <CheckboxRow id="cambioColor" label="Cambio color" checked={data.cambioColor} onChange={handleCheckboxChange} disabled={locked} />
      </div>
      <DesbloqueoModal
        abierto={bloqueo.showUnlock}
        seccionNombre="Análisis Periodontal"
        error={bloqueo.unlockError}
        enviando={bloqueo.unlocking}
        onCancel={() => bloqueo.setShowUnlock(false)}
        onConfirm={(motivo) => bloqueo.solicitar(historiaId, motivo)}
      />
    </div>
  );
};

export default AnalisisPeriodontalForm;
