import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, Save } from 'lucide-react';
import clinicaService from '../../services/clinicaService';
import SignatureCanvas from '../../components/clinica/SignatureCanvas';
import { useBloqueoSeccion } from '../../hooks/useBloqueoSeccion';
import DesbloqueoModal from '../../components/clinica/DesbloqueoModal';
import BloqueoBanner from '../../components/clinica/BloqueoBanner';
import { formatFechaCorta } from '../../utils/fechas';

const FirmaBox = ({ firma, label, onSave, locked }) => {
  if (firma) {
    return (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fbff', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={`data:image/png;base64,${firma}`} alt={label} style={{ maxHeight: '120px', filter: 'contrast(1.2)' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1rem' }}>{label} (Registrada)</span>
      </div>
    );
  }
  if (!locked) {
    return <SignatureCanvas label={label} onSave={onSave} />;
  }
  return null;
};

const ReadOnlyConsentimientoBanner = () => (
  <div style={{ background: 'var(--primary)', padding: '1.5rem', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0, 119, 182, 0.3)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
      <ShieldCheck size={32} />
      <div>
        <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 700, fontSize: '1.1rem' }}>Registro Validado y Bloqueado</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Este documento clínico no puede ser editado por medidas de seguridad legal.</p>
      </div>
    </div>
    <button
      type="button"
      aria-label="Descargar documento (deshabilitado)"
      disabled
      style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'not-allowed', opacity: 0.7 }}
    >
      <Download size={24} />
    </button>
  </div>
);

const ConsentimientoActions = ({ readOnly, bloqueado, handleSave, saving, disabled, saveError, saved }) => {
  if (readOnly || bloqueado) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
      <button
        onClick={handleSave}
        disabled={saving || disabled}
        className="btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 2.5rem', fontSize: '1.1rem', margin: 0, opacity: (saving || disabled) ? 0.6 : 1 }}
      >
        <Save size={22} /> {saving ? 'Guardando...' : 'Guardar Consentimiento Permanente'}
      </button>
      {saveError && <p style={{ color: 'var(--accent)', fontSize: '0.95rem', marginTop: '1rem', fontWeight: 700 }}>{saveError}</p>}
      {saved && <p style={{ color: 'var(--success)', fontSize: '0.95rem', marginTop: '1rem', fontWeight: 700 }}>¡Consentimiento Guardado Exitosamente!</p>}
    </div>
  );
};

const ConsentimientoSection = ({ historiaId, readOnly }) => {
  const [data, setData] = useState({
    contenido: `Yo, actuando en mi propio nombre o como tutor legal, autorizo al personal de OralTech a realizar los procedimientos odontológicos necesarios. Se me ha explicado la naturaleza, riesgos y beneficios del tratamiento.`,
    firmaPaciente: '',
    firmaTestigo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  const bloqueo = useBloqueoSeccion('consentimiento');
  const { marcarRegistrado } = bloqueo;
  const [meta, setMeta] = useState({ createdAt: null, createdBy: '' });
  const locked = readOnly || bloqueo.bloqueado;

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setLoadError('');
      try {
        const res = await clinicaService.getConsentimiento(historiaId);
        if (ignore) return;
        if (res.data) {
          setData(res.data);
          marcarRegistrado(res.data);
          setMeta({
            createdAt: res.data.createdAt ?? null,
            createdBy: res.data.createdBy ?? '',
            updatedAt: res.data.updatedAt ?? null,
            updatedBy: res.data.updatedBy ?? '',
          });
        }
      } catch (err) {
        if (ignore) return;
        // 404 = "aún no registrado": se conserva el contenido por defecto, no es error.
        if (err?.response?.status === 404) return;
        setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar el consentimiento');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [historiaId, marcarRegistrado]);

  // HU-2: tras guardar OK la sección queda bloqueada; un 409 del backend
  // marca el conflicto con su mensaje real (nunca falso "Guardado").
  const handleSave = async () => {
    if (!data.firmaPaciente) {
        setSaveError('Se requiere la firma del paciente');
        return;
    }
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      const res = await clinicaService.upsertConsentimiento(historiaId, data);
      if (res?.data) {
        setMeta({
          createdAt: res.data.createdAt ?? null,
          createdBy: res.data.createdBy ?? '',
          updatedAt: res.data.updatedAt ?? null,
          updatedBy: res.data.updatedBy ?? '',
        });
      }
      bloqueo.marcarGuardado();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err?.response?.status === 409) bloqueo.marcarConflicto();
      setSaved(false);
      setSaveError(err?.response?.data?.message || err?.message || 'Error al guardar consentimiento');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-10">Cargando...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'rgba(0, 119, 182, 0.05)', borderBottomLeftRadius: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '1rem', color: 'rgba(0, 119, 182, 0.15)' }}>
            <ShieldCheck size={64} style={{ transform: 'translate(10px, -10px)' }} />
        </div>

        <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem' }}>
            <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />
            Consentimiento Informado
        </h3>

        {loadError && (
          <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <strong style={{ color: 'var(--accent)' }}>No se pudo cargar el consentimiento. </strong>
            {loadError}
          </div>
        )}
        
        {/* HU-2: banner de bloqueo / desbloqueo de la sección inmutable */}
        <BloqueoBanner
          bloqueo={bloqueo}
          fechaBloqueo={formatFechaCorta(meta.updatedAt || meta.createdAt)}
          createdBy={meta.updatedBy || meta.createdBy}
          readOnly={readOnly}
        />
        
        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '1.05rem', fontStyle: 'italic', lineHeight: 1.6 }}>
            {locked ? (
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{data.contenido}</p>
            ) : (
                <textarea 
                    value={data.contenido}
                    onChange={e => setData({...data, contenido: e.target.value})}
                    aria-label="Texto del consentimiento informado"
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'vertical', minHeight: '120px', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', fontStyle: 'inherit', lineHeight: 'inherit' }}
                    placeholder="Escribe aquí el texto del consentimiento..."
                />
            )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <FirmaBox
              firma={data.firmaPaciente}
              label="Firma del Paciente / Tutor"
              onSave={(sig) => setData({...data, firmaPaciente: sig})}
              locked={locked}
            />
            <FirmaBox
              firma={data.firmaTestigo}
              label="Firma del Testigo (Opcional)"
              onSave={(sig) => setData({...data, firmaTestigo: sig})}
              locked={locked}
            />
        </div>

        <ConsentimientoActions
          readOnly={readOnly}
          bloqueado={bloqueo.bloqueado}
          handleSave={handleSave}
          saving={saving}
          disabled={!data.firmaPaciente}
          saveError={saveError}
          saved={saved}
        />
      </div>
      
      {readOnly && <ReadOnlyConsentimientoBanner />}

      {/* HU-2: desbloqueo excepcional ADMIN (un solo uso, con motivo) */}
      <DesbloqueoModal
        abierto={bloqueo.showUnlock}
        seccionNombre="Consentimiento Informado"
        onConfirm={(motivo) => bloqueo.solicitar(historiaId, motivo)}
        onCancel={() => bloqueo.setShowUnlock(false)}
        error={bloqueo.unlockError}
        enviando={bloqueo.unlocking}
      />
    </div>
  );
};

export default ConsentimientoSection;
