import React, { useState, useEffect } from 'react';
import clinicaService from '../../services/clinicaService';
import { formatFechaCorta } from '../../utils/fechas';
import { Save, CheckCircle2, Lock } from 'lucide-react';

const initialData = {
  rxPanoramica: false,
  rxPeriapical: false,
  rxPeriapicalComentario: '',
  paqueteOrtodoncia: false,
  otros: false,
  otrosTexto: ''
};

const CheckboxRow = ({ id, label, checked, locked, onToggle, textField, textValue, textPlaceholder, onTextChange }) => (
  <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: locked ? 'default' : 'pointer' }}>
      <input
        type="checkbox"
        checked={checked || false}
        onChange={e => !locked && onToggle(id, e.target.checked)}
        disabled={locked}
        style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
      />
      <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>{label}</span>
    </label>
    {textField && checked && (
      <input
        type="text"
        value={textValue}
        onChange={e => !locked && onTextChange(textField, e.target.value)}
        disabled={locked}
        placeholder={textPlaceholder}
        style={{ width: '100%', marginTop: '0.7rem', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', background: 'var(--surface)', color: 'var(--text-main)', outline: 'none' }}
      />
    )}
  </div>
);

// HU-4: sección inmutable (crear-una-vez). Guardada → read-only con aviso;
// vacía (204/404) → formulario editable sin ensuciar la consola.
const ExamenComplementarioForm = ({ historiaId, readOnly }) => {
  const [data, setData] = useState(initialData);
  const [meta, setMeta] = useState({ createdAt: null, createdBy: '' });
  const [bloqueado, setBloqueado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoadError('');
      try {
        const res = await clinicaService.getExamenComplementario(historiaId);
        // 204 = "aún no registrado" (res.data vacío): editable, no error.
        if (res.data && res.data.id) {
          setData({
            rxPanoramica: !!res.data.rxPanoramica,
            rxPeriapical: !!res.data.rxPeriapical,
            rxPeriapicalComentario: res.data.rxPeriapicalComentario || '',
            paqueteOrtodoncia: !!res.data.paqueteOrtodoncia,
            otros: !!res.data.otros,
            otrosTexto: res.data.otrosTexto || ''
          });
          setMeta({ createdAt: res.data.createdAt, createdBy: res.data.createdBy });
          setBloqueado(true);
        }
      } catch (err) {
        // 404 = "aún no registrado": estado vacío editable, no error.
        if (err?.response?.status === 404) return;
        setLoadError(err?.response?.data?.message || err?.message || 'No se pudieron cargar los exámenes complementarios');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [historiaId]);

  const validate = () => {
    if (!data.rxPanoramica && !data.rxPeriapical && !data.paqueteOrtodoncia && !data.otros) {
      return 'Debe seleccionar al menos un examen complementario';
    }
    if (data.rxPeriapical && !data.rxPeriapicalComentario.trim()) {
      return 'El comentario de Rx Periapical es obligatorio cuando se selecciona';
    }
    if (data.otros && !data.otrosTexto.trim()) {
      return 'La descripción de Otros es obligatoria cuando se selecciona';
    }
    return '';
  };

  const handleSave = async () => {
    const localError = validate();
    if (localError) {
      setSaveError(localError);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await clinicaService.upsertExamenComplementario(historiaId, data);
      setBloqueado(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      if (err?.response?.status === 409) {
        // Carrera o reintento: el backend ya lo bloqueó; reflejarlo sin falso "Guardado".
        setBloqueado(true);
      }
      setSaveError(err?.response?.data?.message || err?.message || 'Error al guardar exámenes complementarios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-5">Cargando Exámenes Complementarios...</div>;

  const locked = readOnly || bloqueado;
  const handleToggle = (id, checked) => setData(prev => ({ ...prev, [id]: checked }));
  const handleText = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  return (
    <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)', margin: 0 }}>Exámenes Complementarios</h3>
        {!locked ? (
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
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Exámenes'}
            </button>
          </div>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Lock size={16} /> Registro bloqueado
            {meta.createdAt && ` · ${formatFechaCorta(meta.createdAt)}`}
            {meta.createdBy && ` · ${meta.createdBy}`}
          </span>
        )}
      </div>

      {bloqueado && saveError && (
        <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
          {saveError}
        </div>
      )}

      {loadError && (
        <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
          <strong style={{ color: 'var(--accent)' }}>No se pudieron cargar los exámenes complementarios. </strong>
          {loadError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        <CheckboxRow id="rxPanoramica" label="Rx Panorámica" checked={data.rxPanoramica} locked={locked} onToggle={handleToggle} />
        <CheckboxRow id="rxPeriapical" label="Rx Periapical" checked={data.rxPeriapical} locked={locked} onToggle={handleToggle}
          textField="rxPeriapicalComentario" textValue={data.rxPeriapicalComentario} textPlaceholder="Comentario (obligatorio)" onTextChange={handleText} />
        <CheckboxRow id="paqueteOrtodoncia" label="Paquete Ortodoncia" checked={data.paqueteOrtodoncia} locked={locked} onToggle={handleToggle} />
        <CheckboxRow id="otros" label="Otros" checked={data.otros} locked={locked} onToggle={handleToggle}
          textField="otrosTexto" textValue={data.otrosTexto} textPlaceholder="Descripción (obligatoria)" onTextChange={handleText} />
      </div>
    </div>
  );
};

export default ExamenComplementarioForm;
