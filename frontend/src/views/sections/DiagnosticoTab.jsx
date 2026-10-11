import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Plus } from 'lucide-react';
import clinicaService from '../../services/clinicaService';
import { parseFechaLocal, formatFechaCorta } from '../../utils/fechas';
import { useBloqueoSeccion } from '../../hooks/useBloqueoSeccion';
import DesbloqueoModal from '../../components/clinica/DesbloqueoModal';

// Decisión de modelo (documentada en docs/diagnostico-modelo.md):
// La UI se adapta al modelo clínico de 8 campos del backend
// (DiagnosticoRequest/Response + entidad Diagnostico).
// No existen `descripcion` ni `cie10` en el backend: se eliminan del useState.
// Interconsulta solo tiene `descripcion` (sin `especialidad`).
const EMPTY_DIAG = {
  dental: '',
  periodontal: '',
  pulpar: '',
  articular: '',
  tejidosBlandos: '',
  funcional: '',
  esqueleticoFacial: '',
  otros: ''
};

const DIAG_FIELDS = [
  { key: 'dental', label: 'Dental' },
  { key: 'periodontal', label: 'Periodontal' },
  { key: 'pulpar', label: 'Pulpar' },
  { key: 'articular', label: 'Articular' },
  { key: 'tejidosBlandos', label: 'Tejidos Blandos' },
  { key: 'funcional', label: 'Funcional' },
  { key: 'esqueleticoFacial', label: 'Esqueletico Facial' },
  { key: 'otros', label: 'Otros' }
];

const mapDiagnosticoToState = (data) => ({
  dental: data?.dental ?? '',
  periodontal: data?.periodontal ?? '',
  pulpar: data?.pulpar ?? '',
  articular: data?.articular ?? '',
  tejidosBlandos: data?.tejidosBlandos ?? '',
  funcional: data?.funcional ?? '',
  esqueleticoFacial: data?.esqueleticoFacial ?? '',
  otros: data?.otros ?? ''
});

// Formatea una fecha de InterconsultaResponse (createdAt/updatedAt).
// Nunca devuelve "Invalid Date": retorna '' si el valor falta o no es válido.
const formatInterconsultaDate = (inter) => {
  const raw = inter?.createdAt ?? inter?.updatedAt ?? null;
  if (!raw) return '';
  const d = parseFechaLocal(raw);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};

const extractErrorMessage = (err) =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Error al guardar';

const isNotFound = (err) => err?.response?.status === 404;

const SubseccionBloqueoBanner = ({ bloqueo, meta, seccionKey, readOnly }) => (
  <>
    {bloqueo.desbloqueo ? (
      <div style={{ border: '1px solid var(--success)', background: 'var(--secondary-soft)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
        Desbloqueada por {bloqueo.desbloqueo.por}: {bloqueo.desbloqueo.motivo}
      </div>
    ) : bloqueo.bloqueado && (
      <div style={{ border: '1px solid var(--border-color)', background: 'var(--secondary-soft)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
        Registro bloqueado
        {(meta.updatedAt || meta.createdAt) && ` · ${formatFechaCorta(meta.updatedAt || meta.createdAt)}`}
        {(meta.updatedBy || meta.createdBy) && ` · ${meta.updatedBy || meta.createdBy}`}
      </div>
    )}
    {!readOnly && bloqueo.bloqueado && bloqueo.isAdmin && (
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => bloqueo.setShowUnlock(true)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}>
          Desbloquear (ADMIN) · {seccionKey}
        </button>
      </div>
    )}
  </>
);

const DiagnosticoFields = ({ diag, setDiag, lockedDiag }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2.5rem', marginBottom: '2rem' }}>
    {DIAG_FIELDS.map(({ key, label }) => (
      <div key={key}>
        <label htmlFor={`diag-${key}`} style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{label}</label>
        <textarea
          id={`diag-${key}`}
          aria-label={label}
          value={diag[key]}
          disabled={lockedDiag}
          onChange={(e) => setDiag(prev => ({ ...prev, [key]: e.target.value }))}
          style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '80px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)', resize: 'vertical', transition: 'border-color 0.3s' }}
          onFocus={(e) => !lockedDiag && (e.target.style.borderColor = 'var(--primary)')}
          onBlur={(e) => !lockedDiag && (e.target.style.borderColor = 'var(--border-color)')}
        />
      </div>
    ))}
  </div>
);

const PronosticoSection = ({ pron, setPron, lockedPron }) => (
  <div style={{ marginBottom: '2rem' }}>
    <label htmlFor="pronostico-profesional" style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: '#e63946', marginBottom: '0.5rem' }}>Pronóstico Profesional</label>
    <textarea
      id="pronostico-profesional"
      aria-label="Pronóstico Profesional"
      value={pron.descripcion}
      disabled={lockedPron}
      onChange={(e) => setPron(prev => ({ ...prev, descripcion: e.target.value }))}
      style={{ width: '100%', padding: '1rem', border: '1px solid rgba(230, 57, 70, 0.4)', borderRadius: '8px', minHeight: '80px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)', resize: 'vertical', transition: 'border-color 0.3s' }}
      placeholder="Favorable, reservado, etc."
      onFocus={(e) => !lockedPron && (e.target.style.borderColor = 'var(--accent)')}
      onBlur={(e) => !lockedPron && (e.target.style.borderColor = 'rgba(230, 57, 70, 0.4)')}
    />
  </div>
);

const InterconsultasSection = ({ readOnly, newInter, setNewInter, handleAddInter, inters }) => (
  <div>
    <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Interconsultas</h3>

    {!readOnly && (
      <div style={{ display: 'flex', gap: '0.8rem', padding: '1rem', background: 'var(--secondary-soft)', borderRadius: '12px', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Descripción"
          aria-label="Descripción de la interconsulta"
          value={newInter.descripcion}
          onChange={e => setNewInter({ descripcion: e.target.value })}
          style={{ flex: 2, padding: '0.6rem 1rem', border: '1px solid var(--primary-light)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', background: 'var(--surface)', color: 'var(--text-main)' }}
        />
        <button
          type="button"
          aria-label="Agregar interconsulta"
          onClick={handleAddInter}
          style={{ padding: '0.6rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={20} />
        </button>
      </div>
    )}

    <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--surface)', overflow: 'hidden' }}>
      {inters.length === 0 && <p style={{ padding: '1.5rem', color: '#94a3b8', textAlign: 'center', margin: 0, fontStyle: 'italic' }}>No hay interconsultas registradas.</p>}
      {inters.map((i, idx) => {
        const fecha = formatInterconsultaDate(i);
        return (
          <div key={i.id} style={{
            padding: '1.2rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: idx === inters.length - 1 ? 'none' : '1px solid #f1f5f9'
          }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>{i.descripcion}</p>
            </div>
            {fecha && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{fecha}</span>}
          </div>
        );
      })}
    </div>
  </div>
);

const DiagnosticoTabSaveFooter = ({ readOnly, bloqueoDiag, bloqueoPron, handleSaveMain, saving, saved, saveError }) => {
  if (readOnly || (bloqueoDiag.bloqueado && bloqueoPron.bloqueado)) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '2px solid rgba(0, 119, 182, 0.1)' }}>
      <button
        onClick={handleSaveMain}
        disabled={saving}
        className="btn-primary"
        style={{ width: 'auto', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1, margin: 0 }}
      >
        <Save size={18} />
        {saving ? 'Guardando...' : 'Guardar Diagnóstico'}
      </button>
      {saved && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}><CheckCircle size={18} /> Guardado</span>}
      {saveError && <span style={{ color: '#e63946', fontWeight: 500 }}>{saveError}</span>}
    </div>
  );
};

const DiagnosticoTab = ({ historiaId, readOnly }) => {
  const [diag, setDiag] = useState({ ...EMPTY_DIAG });
  const [pron, setPron] = useState({ descripcion: '' });
  const [inters, setInters] = useState([]);
  const [newInter, setNewInter] = useState({ descripcion: '' });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loadError, setLoadError] = useState('');

  // HU-2: bloqueo independiente por subsección inmutable.
  const bloqueoDiag = useBloqueoSeccion('diagnostico');
  const bloqueoPron = useBloqueoSeccion('pronostico');
  const { marcarRegistrado: marcarDiagRegistrado } = bloqueoDiag;
  const { marcarRegistrado: marcarPronRegistrado } = bloqueoPron;
  const [diagMeta, setDiagMeta] = useState({ createdAt: null, createdBy: '' });
  const [pronMeta, setPronMeta] = useState({ createdAt: null, createdBy: '' });

  const lockedDiag = readOnly || bloqueoDiag.bloqueado;
  const lockedPron = readOnly || bloqueoPron.bloqueado;

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoadError('');
      const [d, p, i] = await Promise.allSettled([
        clinicaService.getDiagnostico(historiaId),
        clinicaService.getPronostico(historiaId),
        clinicaService.listInterconsultas(historiaId)
      ]);
      if (ignore) return;
      // 404 = "aún no registrado": estado vacío, no error.
      if (d.status === 'fulfilled') {
        if (d.value.data) {
          setDiag(mapDiagnosticoToState(d.value.data));
          marcarDiagRegistrado(d.value.data);
          setDiagMeta({
            createdAt: d.value.data.createdAt ?? null,
            createdBy: d.value.data.createdBy ?? '',
            updatedAt: d.value.data.updatedAt ?? null,
            updatedBy: d.value.data.updatedBy ?? '',
          });
        }
      } else if (!isNotFound(d.reason)) {
        setLoadError(extractErrorMessage(d.reason));
        return;
      }
      if (p.status === 'fulfilled') {
        if (p.value.data) {
          setPron({ descripcion: p.value.data.descripcion ?? '' });
          marcarPronRegistrado(p.value.data);
          setPronMeta({
            createdAt: p.value.data.createdAt ?? null,
            createdBy: p.value.data.createdBy ?? '',
            updatedAt: p.value.data.updatedAt ?? null,
            updatedBy: p.value.data.updatedBy ?? '',
          });
        }
      } else if (!isNotFound(p.reason)) {
        setLoadError(extractErrorMessage(p.reason));
        return;
      }
      if (i.status === 'fulfilled') {
        setInters(Array.isArray(i.value.data) ? i.value.data : []);
      } else if (!isNotFound(i.reason)) {
        setLoadError(extractErrorMessage(i.reason));
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [historiaId, marcarDiagRegistrado, marcarPronRegistrado]);

  // HU-2: guardado SECUENCIAL (primero diagnóstico, luego pronóstico).
  // Cada éxito marca su propio bloqueo; cada 409 marca ese conflicto y
  // acumula el mensaje real del backend (nunca falso "Guardado").
  // Las secciones ya bloqueadas no se reintentan.
  const handleSaveMain = async () => {
    const prevDiag = { ...diag };
    const prevPron = { ...pron };
    setSaving(true);
    setSaveError('');
    setSaved(false);
    const errores = [];
    let exitoAlguno = false;
    if (!bloqueoDiag.bloqueado) {
      try {
        const dRes = await clinicaService.upsertDiagnostico(historiaId, diag);
        // Re-mapear explícitamente desde la respuesta para no mezclar formas.
        if (dRes?.data) {
          setDiag(mapDiagnosticoToState(dRes.data));
          setDiagMeta({
            createdAt: dRes.data.createdAt ?? null,
            createdBy: dRes.data.createdBy ?? '',
            updatedAt: dRes.data.updatedAt ?? null,
            updatedBy: dRes.data.updatedBy ?? '',
          });
        }
        bloqueoDiag.marcarGuardado();
        exitoAlguno = true;
      } catch (err) {
        // Revertir al estado previo: nunca mostrar "Guardado" si falló.
        setDiag(prevDiag);
        if (err?.response?.status === 409) bloqueoDiag.marcarConflicto();
        errores.push(extractErrorMessage(err));
      }
    }
    if (!bloqueoPron.bloqueado) {
      try {
        const pRes = await clinicaService.upsertPronostico(historiaId, pron);
        if (pRes?.data) {
          setPron({ descripcion: pRes.data.descripcion ?? prevPron.descripcion });
          setPronMeta({
            createdAt: pRes.data.createdAt ?? null,
            createdBy: pRes.data.createdBy ?? '',
            updatedAt: pRes.data.updatedAt ?? null,
            updatedBy: pRes.data.updatedBy ?? '',
          });
        }
        bloqueoPron.marcarGuardado();
        exitoAlguno = true;
      } catch (err) {
        // Revertir al estado previo: nunca mostrar "Guardado" si falló.
        setPron(prevPron);
        if (err?.response?.status === 409) bloqueoPron.marcarConflicto();
        errores.push(extractErrorMessage(err));
      }
    }
    if (errores.length > 0) {
      setSaved(false);
      setSaveError(errores.join(' | '));
    } else if (exitoAlguno) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleAddInter = async () => {
    if (!newInter.descripcion?.trim()) return;
    try {
        await clinicaService.createInterconsulta(historiaId, { descripcion: newInter.descripcion.trim() });
        setNewInter({ descripcion: '' });
        const i = await clinicaService.listInterconsultas(historiaId);
        setInters(Array.isArray(i.data) ? i.data : []);
    } catch (e) { setSaveError(extractErrorMessage(e)); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', width: '100%' }}>
      {/* Diagnostico & Pronostico */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Diagnóstico y Pronóstico
        </h3>

        {loadError && (
          <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <strong style={{ color: 'var(--accent)' }}>No se pudieron cargar los datos. </strong>
            {loadError}
          </div>
        )}

        {/* HU-2: banner de bloqueo / desbloqueo de Diagnóstico */}
        <SubseccionBloqueoBanner
          bloqueo={bloqueoDiag}
          meta={diagMeta}
          seccionKey="diagnostico"
          readOnly={readOnly}
        />

        <DiagnosticoFields
          diag={diag}
          setDiag={setDiag}
          lockedDiag={lockedDiag}
        />

        {/* HU-2: banner de bloqueo / desbloqueo de Pronóstico */}
        <SubseccionBloqueoBanner
          bloqueo={bloqueoPron}
          meta={pronMeta}
          seccionKey="pronostico"
          readOnly={readOnly}
        />

        <PronosticoSection
          pron={pron}
          setPron={setPron}
          lockedPron={lockedPron}
        />

        <DiagnosticoTabSaveFooter
          readOnly={readOnly}
          bloqueoDiag={bloqueoDiag}
          bloqueoPron={bloqueoPron}
          handleSaveMain={handleSaveMain}
          saving={saving}
          saved={saved}
          saveError={saveError}
        />
      </div>

      {/* Interconsultas */}
      <InterconsultasSection
        readOnly={readOnly}
        newInter={newInter}
        setNewInter={setNewInter}
        handleAddInter={handleAddInter}
        inters={inters}
      />

      {/* HU-2: desbloqueo excepcional ADMIN, un modal por subsección */}
      <DesbloqueoModal
        abierto={bloqueoDiag.showUnlock}
        seccionNombre="Diagnóstico"
        onConfirm={(motivo) => bloqueoDiag.solicitar(historiaId, motivo)}
        onCancel={() => bloqueoDiag.setShowUnlock(false)}
        error={bloqueoDiag.unlockError}
        enviando={bloqueoDiag.unlocking}
      />
      <DesbloqueoModal
        abierto={bloqueoPron.showUnlock}
        seccionNombre="Pronóstico"
        onConfirm={(motivo) => bloqueoPron.solicitar(historiaId, motivo)}
        onCancel={() => bloqueoPron.setShowUnlock(false)}
        error={bloqueoPron.unlockError}
        enviando={bloqueoPron.unlocking}
      />
    </div>
  );
};

export default DiagnosticoTab;
