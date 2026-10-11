import React, { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import clinicaService from '../../services/clinicaService';
import { useBloqueoSeccion } from '../../hooks/useBloqueoSeccion';
import DesbloqueoModal from '../../components/clinica/DesbloqueoModal';
import { formatFechaCorta } from '../../utils/fechas';

// Reusable components outside to avoid focus/re-mount issues
const SelectField = ({ label, field, options, data, onChange, readOnly }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label htmlFor={`ec-${field}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
        <select
            id={`ec-${field}`}
            aria-label={label}
            value={data[field] || ''}
            disabled={readOnly}
            onChange={(e) => onChange(field, e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.95rem', background: 'var(--surface)', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.3s', cursor: readOnly ? 'default' : 'pointer' }}
        >
            {options.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
        </select>
    </div>
);

const CheckboxField = ({ label, field, data, onChange, readOnly, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label htmlFor={`ec-chk-${field}`} style={{ 
            display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 0.8rem', 
            background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px',
            cursor: readOnly ? 'default' : 'pointer', userSelect: 'none', minHeight: '45px', width: '100%',
            opacity: readOnly ? 0.8 : 1
        }}>
            <input
                id={`ec-chk-${field}`}
                aria-label={label}
                type="checkbox"
                checked={data[field] || false}
                onChange={(e) => !readOnly && onChange(field, e.target.checked)}
                disabled={readOnly}
                style={{ width: '16px', height: '16px', flexShrink: 0, accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)', lineHeight: '1.2' }}>{label}</span>
        </label>
        {data[field] && children}
    </div>
);

const ExamenClinicoBloqueoBanner = ({ bloqueo, fechaBloqueo, createdBy }) => {
  if (bloqueo.bloqueado) {
    return (
      <div style={{ border: '1px solid var(--border-color)', background: 'var(--surface)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
        <strong>Registro bloqueado.</strong>
        {fechaBloqueo ? ` Registrado el ${fechaBloqueo}` : ''}
        {createdBy ? ` por ${createdBy}` : ''} Solo un ADMIN puede desbloquearlo para corregir un error de digitación.
      </div>
    );
  }
  if (!bloqueo.bloqueado && bloqueo.desbloqueo) {
    return (
      <div style={{ border: '1px solid var(--border-color)', background: 'var(--surface)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
        Desbloqueada por {bloqueo.desbloqueo.por}: {bloqueo.desbloqueo.motivo}
      </div>
    );
  }
  return null;
};

const ColumnaIzquierdaExamen = ({ data, handleChange, locked, normalcyOptions, commonInputStyle }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <section>
      <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Tejidos Blandos</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <SelectField label="Lengua" field="lengua" options={normalcyOptions} data={data} onChange={handleChange} readOnly={locked} />
        <SelectField label="Carrillos" field="carrillos" options={normalcyOptions} data={data} onChange={handleChange} readOnly={locked} />
        <SelectField label="Frenillos" field="frenillos" options={normalcyOptions} data={data} onChange={handleChange} readOnly={locked} />
        <SelectField label="Paladar" field="paladar" options={normalcyOptions} data={data} onChange={handleChange} readOnly={locked} />
        <SelectField label="Piso de Boca" field="pisoBoca" options={normalcyOptions} data={data} onChange={handleChange} readOnly={locked} />
        <SelectField label="Labios" field="labios" options={normalcyOptions} data={data} onChange={handleChange} readOnly={locked} />
        <SelectField label="Comisuras" field="comisuras" options={normalcyOptions} data={data} onChange={handleChange} readOnly={locked} />
        <SelectField label="Glándulas Salivales" field="glandulas" options={normalcyOptions} data={data} onChange={handleChange} readOnly={locked} />
        <SelectField label="Pigmentaciones" field="pigmentaciones" options={normalcyOptions} data={data} onChange={handleChange} readOnly={locked} />
      </div>
    </section>

    <section>
      <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Tejidos Duros</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <CheckboxField label="Hipoplasias" field="hipoplasias" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Amelogenesis" field="amelogenesis" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Manchas" field="manchas" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Desgastes" field="desgastes" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Fracturas" field="tdFracturas" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Agenesia" field="agenesia" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Supernumerario" field="supernumerario" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Diente Ausente" field="ausenteObs" checked={!!data.ausenteObs} onChange={(f, v) => handleChange('ausenteObs', v ? 'Sí' : '')} data={data} readOnly={locked}>
          <input type="text" placeholder="¿Cuáles?" aria-label="Especificar dientes ausentes" value={data.ausenteObs} disabled={locked} onChange={e => handleChange('ausenteObs', e.target.value)} style={commonInputStyle} />
        </CheckboxField>
      </div>
    </section>

    <section>
      <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Maxilares</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <CheckboxField label="Micrognasia" field="micrognasia" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Macrognasia" field="macrognasia" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Torus" field="torus" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Otros" field="maxOtros" checked={!!data.maxOtros} onChange={(f, v) => handleChange('maxOtros', v ? 'Sí' : '')} data={data} readOnly={locked}>
          <input type="text" placeholder="¿Cuáles?" aria-label="Especificar otros hallazgos en maxilares" value={data.maxOtros} disabled={locked} onChange={e => handleChange('maxOtros', e.target.value)} style={commonInputStyle} />
        </CheckboxField>
      </div>
    </section>
  </div>
);

const ColumnaDerechaExamen = ({ data, handleChange, locked }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <section>
      <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>ATM</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <CheckboxField label="Dolor Articular" field="dolorArticular" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Dolor Muscular" field="dolorMuscular" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Ruidos" field="ruidos" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Limitación de Apertura" field="limitacion" data={data} onChange={handleChange} readOnly={locked} />
        <CheckboxField label="Desviación" field="desviacion" data={data} onChange={handleChange} readOnly={locked} />
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="ec-atm-observaciones">Observaciones ATM</label>
          <input id="ec-atm-observaciones" aria-label="Observaciones ATM" type="text" value={data.atmObservaciones} disabled={locked} onChange={e => handleChange('atmObservaciones', e.target.value)} placeholder="Detalle aquí..." />
        </div>
      </div>
    </section>

    <section>
      <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Oclusión</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="ec-sobremordida-h">S. Mordida Horiz (mm)</label>
          <input id="ec-sobremordida-h" aria-label="Sobremordida horizontal en mm" type="number" step="0.1" value={data.sobremordidaH} disabled={locked} onChange={e => handleChange('sobremordidaH', e.target.value ? parseFloat(e.target.value) : 0)} />
        </div>
        <div className="form-group">
          <label htmlFor="ec-sobremordida-v">S. Mordida Vert (mm)</label>
          <input id="ec-sobremordida-v" aria-label="Sobremordida vertical en mm" type="number" step="0.1" value={data.sobremordidaV} disabled={locked} onChange={e => handleChange('sobremordidaV', e.target.value ? parseFloat(e.target.value) : 0)} />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="ec-oclusion-tipo">Tipo de Oclusión</label>
          <input id="ec-oclusion-tipo" aria-label="Tipo de Oclusión" type="text" value={data.oclusionTipo} disabled={locked} onChange={e => handleChange('oclusionTipo', e.target.value)} placeholder="Ej. Clase I Angle..." />
        </div>
        <div className="form-group">
          <label htmlFor="ec-linea-media">Línea Media</label>
          <input id="ec-linea-media" aria-label="Línea Media" type="text" value={data.lineaMedia} disabled={locked} onChange={e => handleChange('lineaMedia', e.target.value)} placeholder="Desviación..." />
        </div>
        <div className="form-group">
          <label htmlFor="ec-patron-masticacion">Patrón Masticación</label>
          <select id="ec-patron-masticacion" aria-label="Patrón Masticación" value={data.patronMasticacion} disabled={locked} onChange={e => handleChange('patronMasticacion', e.target.value)}>
            <option value="BILAT">Bilateral</option>
            <option value="DER">Derecha</option>
            <option value="IZQ">Izquierda</option>
          </select>
        </div>
      </div>
    </section>

    <section>
      <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Hábitos e Higiene</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
        <div className="form-group">
          <label htmlFor="ec-higiene">Grado de Higiene Oral</label>
          <select id="ec-higiene" aria-label="Grado de Higiene Oral" value={data.higiene} disabled={locked} onChange={e => handleChange('higiene', e.target.value)}>
            <option value="B">Buena</option>
            <option value="R">Regular</option>
            <option value="M">Mala</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <CheckboxField label="Halitosis" field="habHalitosis" data={data} onChange={handleChange} readOnly={locked} />
          <CheckboxField label="Bruxismo" field="bruxismo" data={data} onChange={handleChange} readOnly={locked} />
        </div>
        <div className="form-group">
          <label htmlFor="ec-hab-otros">Otros Hábitos</label>
          <textarea
            id="ec-hab-otros"
            aria-label="Otros Hábitos"
            value={data.habOtros}
            disabled={locked}
            onChange={e => handleChange('habOtros', e.target.value)}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '60px', background: 'var(--surface)', color: 'var(--text-main)', resize: 'none' }}
            placeholder="Succión digital, deglución atípica..."
          />
        </div>
      </div>
    </section>
  </div>
);

const ExamenClinicoFooter = ({ locked, saving, saveError, saved, readOnly, bloqueo }) => (
  <>
    {!locked && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border-color)', marginTop: '2rem' }}>
        <button type="submit" disabled={saving} className="btn-primary" style={{ width: 'auto', padding: '0.8rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1, margin: 0 }}>
          <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Examen'}
        </button>
        {saveError && <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{saveError}</span>}
        {saved && <span style={{ color: 'var(--success)', fontWeight: 500 }}><CheckCircle size={18} /> Guardado</span>}
      </div>
    )}
    {!readOnly && bloqueo.bloqueado && bloqueo.isAdmin && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border-color)', marginTop: '2rem' }}>
        <button
          type="button"
          onClick={() => bloqueo.setShowUnlock(true)}
          style={{ width: 'auto', padding: '0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', margin: 0 }}
        >
          Desbloquear (ADMIN)
        </button>
      </div>
    )}
  </>
);

const ExamenClinicoForm = ({ historiaId, readOnly }) => {
  const [data, setData] = useState({
    lengua: 'NORMAL', carrillos: 'NORMAL', frenillos: 'NORMAL', paladar: 'NORMAL', pisoBoca: 'NORMAL', labios: 'NORMAL', comisuras: 'NORMAL', glandulas: 'NORMAL', pigmentaciones: 'NORMAL',
    hipoplasias: false, amelogenesis: false, manchas: false, desgastes: false, tdFracturas: false, agenesia: false, supernumerario: false, ausenteObs: '',
    micrognasia: false, macrognasia: false, torus: false, maxOtros: '',
    dolorArticular: false, dolorMuscular: false, ruidos: false, limitacion: false, desviacion: false, atmObservaciones: '',
    sobremordidaH: 0.0, sobremordidaV: 0.0, oclusionTipo: '', lineaMedia: '', patronMasticacion: 'BILAT',
    higiene: 'B', habHalitosis: false, bruxismo: false, habOtros: ''
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  // HU-2: bloqueo de sección inmutable + desbloqueo excepcional ADMIN.
  const bloqueo = useBloqueoSeccion('examen');
  const { marcarRegistrado } = bloqueo;
  const [meta, setMeta] = useState({ createdAt: '', createdBy: '' });
  const locked = readOnly || bloqueo.bloqueado;

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setLoadError('');
      try {
        const res = await clinicaService.getExamen(historiaId);
        if (ignore) return;
        if (res.data) {
          const cleanData = {};
          Object.keys(res.data).forEach(key => {
            if (res.data[key] !== null) cleanData[key] = res.data[key];
          });
          setData(prev => ({ ...prev, ...cleanData }));
          // HU-2: si ya existe registro, la sección queda bloqueada.
          if (res.data.id) {
            marcarRegistrado(res.data);
            setMeta({
              createdAt: res.data.createdAt || '',
              createdBy: res.data.createdBy || '',
              updatedAt: res.data.updatedAt || '',
              updatedBy: res.data.updatedBy || '',
            });
          }
        }
      } catch (err) {
        if (ignore) return;
        // 404 = "aún no registrado": estado vacío, no error.
        if (err?.response?.status === 404) return;
        setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar el examen clínico');
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [historiaId, marcarRegistrado]);

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const res = await clinicaService.upsertExamen(historiaId, data);
      if (res?.data) {
        setMeta({
          createdAt: res.data.createdAt || '',
          createdBy: res.data.createdBy || '',
          updatedAt: res.data.updatedAt || '',
          updatedBy: res.data.updatedBy || '',
        });
      }
      // HU-2: tras guardar, la sección queda bloqueada.
      bloqueo.marcarGuardado();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      // HU-2: 409 = el backend ya la bloqueó: reflejarlo sin falso "Guardado".
      if (err?.response?.status === 409) bloqueo.marcarConflicto();
      setSaveError(err?.response?.data?.message || err?.message || 'Error al guardar examen clínico');
    } finally {
      setSaving(false);
    }
  };

  const normalcyOptions = [{val: 'NORMAL', label: 'Normal'}, {val: 'ANORMAL', label: 'Anormal'}];
  const commonInputStyle = { width: '100%', padding: '0.5rem', border: '1px solid var(--primary)', borderRadius: '6px', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.85rem' };

  // HU-2: fecha del registro bloqueado ('' si falta o es inválida, nunca 'Invalid Date').
  const fechaBloqueo = formatFechaCorta(meta.updatedAt || meta.createdAt);

  return (
    <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.4s ease-out', width: '100%' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Examen Clínico
        </h3>

        {loadError && (
          <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <strong style={{ color: 'var(--accent)' }}>No se pudo cargar el examen clínico. </strong>
            {loadError}
          </div>
        )}

      <ExamenClinicoBloqueoBanner
        bloqueo={bloqueo}
        fechaBloqueo={fechaBloqueo}
        createdBy={meta.updatedBy || meta.createdBy}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
        <ColumnaIzquierdaExamen
          data={data}
          handleChange={handleChange}
          locked={locked}
          normalcyOptions={normalcyOptions}
          commonInputStyle={commonInputStyle}
        />
        <ColumnaDerechaExamen
          data={data}
          handleChange={handleChange}
          locked={locked}
        />
      </div>

      <ExamenClinicoFooter
        locked={locked}
        saving={saving}
        saveError={saveError}
        saved={saved}
        readOnly={readOnly}
        bloqueo={bloqueo}
      />
        <DesbloqueoModal
          abierto={bloqueo.showUnlock}
          seccionNombre="Examen Clínico"
          onConfirm={(motivo) => bloqueo.solicitar(historiaId, motivo)}
          onCancel={() => bloqueo.setShowUnlock(false)}
          error={bloqueo.unlockError}
          enviando={bloqueo.unlocking}
        />
    </form>
  );
};

export default ExamenClinicoForm;
