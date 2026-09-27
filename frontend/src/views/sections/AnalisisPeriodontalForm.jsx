import React, { useState, useEffect } from 'react';
import clinicaService from '../../services/clinicaService';
import { Save, CheckCircle2 } from 'lucide-react';
import { useBloqueoSeccion } from '../../hooks/useBloqueoSeccion';
import DesbloqueoModal from '../../components/clinica/DesbloqueoModal';
import { formatFechaCorta } from '../../utils/fechas';

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
    const loadData = async () => {
      setLoadError('');
      try {
        const res = await clinicaService.getAnalisisPeriodontal(historiaId);
        if (res.data) {
          setData(res.data);
          bloqueo.marcarRegistrado(res.data);
        }
      } catch (err) {
        // 404 = "aún no registrado": estado vacío, no error.
        if (err?.response?.status === 404) return;
        setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar el análisis periodontal');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historiaId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await clinicaService.upsertAnalisisPeriodontal(historiaId, data);
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

  const CheckboxRow = ({ id, label }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', borderRadius: '10px', cursor: locked ? 'default' : 'pointer', background: 'var(--surface)', border: '1px solid var(--border-color)', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}>
      <input 
        type="checkbox" 
        checked={data[id] || false} 
        onChange={e => !locked && setData({ ...data, [id]: e.target.checked })} 
        disabled={locked}
        style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
      />
      <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>{label}</span>
    </label>
  );

  const fechaBloqueo = formatFechaCorta(data.createdAt);

  return (
    <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)', margin: 0 }}>Análisis Periodontal</h3>
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
              <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Análisis'}
              </button>
            )}
            {!readOnly && bloqueo.bloqueado && bloqueo.isAdmin && (
              <button onClick={() => bloqueo.setShowUnlock(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Desbloquear (ADMIN)
              </button>
            )}
          </div>
        )}
      </div>

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
          <strong style={{ color: 'var(--accent)' }}>No se pudo cargar el análisis periodontal. </strong>
          {loadError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        <CheckboxRow id="bolsaPeriodontal" label="Bolsa periodontal" />
        <CheckboxRow id="pseudoBolsa" label="Pseudo bolsa" />
        <CheckboxRow id="movilidadDental" label="Movilidad dental" />
        <CheckboxRow id="perdidaOsea" label="Pérdida osea" />
        <CheckboxRow id="retraccionGingival" label="Retracción gingival" />
        <CheckboxRow id="calculosSupra" label="Cálculos supragingivales" />
        <CheckboxRow id="calculosSub" label="Cálculos subgingivales" />
        <CheckboxRow id="reabsorcionRadicular" label="Reabsorción radicular" />
        <CheckboxRow id="sangrado" label="Sangrado" />
        <CheckboxRow id="exudadoSupuracion" label="Exudado/supuración" />
        <CheckboxRow id="inflamacion" label="Inflamación" />
        <CheckboxRow id="cambioColor" label="Cambio color" />
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
