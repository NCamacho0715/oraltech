import React, { useState, useEffect } from 'react';
import clinicaService from '../../services/clinicaService';
import { Save, CheckCircle2 } from 'lucide-react';
import { useBloqueoSeccion } from '../../hooks/useBloqueoSeccion';
import DesbloqueoModal from '../../components/clinica/DesbloqueoModal';
import { formatFechaCorta } from '../../utils/fechas';

const AnalisisPulparForm = ({ historiaId, readOnly }) => {
  const [data, setData] = useState({
    cuellosSensibles: false,
    endoRealizada: false,
    endoDefectuosa: false,
    abcesoFistula: false,
    lesionesPeriapicales: false,
    qxEndodontica: false,
    exposicionPulpar: false,
    cambioColor: false,
    observaciones: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const bloqueo = useBloqueoSeccion('pulpar');
  const locked = readOnly || bloqueo.bloqueado;

  useEffect(() => {
    const loadData = async () => {
      setLoadError('');
      try {
        const res = await clinicaService.getAnalisisPulpar(historiaId);
        if (res.data) {
          setData(res.data);
          bloqueo.marcarRegistrado(res.data);
        }
      } catch (err) {
        // 404 = "aún no registrado": estado vacío, no error.
        if (err?.response?.status === 404) return;
        setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar el análisis pulpar');
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
      await clinicaService.upsertAnalisisPulpar(historiaId, data);
      bloqueo.marcarGuardado();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      if (err?.response?.status === 409) bloqueo.marcarConflicto();
      setSaveError(err?.response?.data?.message || err?.message || 'Error al guardar análisis pulpar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-5">Cargando Análisis Pulpar...</div>;

  const CheckboxRow = ({ id, label }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem', borderRadius: '8px', cursor: locked ? 'default' : 'pointer', background: 'var(--surface)', border: '1px solid var(--border-color)', transition: 'background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s, opacity 0.2s' }}>
      <input 
        type="checkbox" 
        checked={data[id] || false} 
        onChange={e => !locked && setData({ ...data, [id]: e.target.checked })} 
        disabled={locked}
        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
      />
      <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{label}</span>
    </label>
  );

  const fechaBloqueo = formatFechaCorta(data.createdAt);

  return (
    <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Análisis Pulpar - Endodóntico</h3>
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
              <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
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
          <strong style={{ color: 'var(--accent)' }}>No se pudo cargar el análisis pulpar. </strong>
          {loadError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <CheckboxRow id="cuellosSensibles" label="Cuellos sensibles" />
        <CheckboxRow id="endoRealizada" label="Endodoncia realizada" />
        <CheckboxRow id="endoDefectuosa" label="Endodoncia defectuosa" />
        <CheckboxRow id="abcesoFistula" label="Abceso - Fistula" />
        <CheckboxRow id="lesionesPeriapicales" label="Lesiones periapicales" />
        <CheckboxRow id="qxEndodontica" label="Qx endodóntica" />
        <CheckboxRow id="exposicionPulpar" label="Exposición pulpar" />
        <CheckboxRow id="cambioColor" label="Cambio color" />
      </div>

      <div>
        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Observaciones:</label>
        <textarea 
          value={data.observaciones || ''} 
          onChange={e => !locked && setData({ ...data, observaciones: e.target.value })}
          disabled={locked}
          placeholder="Escriba aquí cualquier observación adicional..."
          style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--secondary-soft)', color: 'var(--text-main)', minHeight: '100px', resize: 'vertical', fontSize: '1rem' }}
        />
      </div>
      <DesbloqueoModal
        abierto={bloqueo.showUnlock}
        seccionNombre="Análisis Pulpar"
        error={bloqueo.unlockError}
        enviando={bloqueo.unlocking}
        onCancel={() => bloqueo.setShowUnlock(false)}
        onConfirm={(motivo) => bloqueo.solicitar(historiaId, motivo)}
      />
    </div>
  );
};

export default AnalisisPulparForm;
