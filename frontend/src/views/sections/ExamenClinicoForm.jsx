import React, { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import clinicaService from '../../services/clinicaService';

// Reusable components outside to avoid focus/re-mount issues
const SelectField = ({ label, field, options, data, onChange, readOnly }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
        <select
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
        <label style={{ 
            display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 0.8rem', 
            background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px',
            cursor: readOnly ? 'default' : 'pointer', userSelect: 'none', minHeight: '45px', width: '100%',
            opacity: readOnly ? 0.8 : 1
        }}>
            <input
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

  useEffect(() => {
    loadData();
  }, [historiaId]);

  const loadData = async () => {
    try {
      const res = await clinicaService.getExamen(historiaId);
      if (res.data) {
          const cleanData = {};
          Object.keys(res.data).forEach(key => {
            if (res.data[key] !== null) cleanData[key] = res.data[key];
          });
          setData(prev => ({ ...prev, ...cleanData }));
      }
    } catch (e) {}
  };

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clinicaService.upsertExamen(historiaId, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error al guardar examen clínico');
    } finally {
      setSaving(false);
    }
  };

  const normalcyOptions = [{val: 'NORMAL', label: 'Normal'}, {val: 'ANORMAL', label: 'Anormal'}];
  const commonInputStyle = { width: '100%', padding: '0.5rem', border: '1px solid var(--primary)', borderRadius: '6px', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.85rem' };

  return (
    <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Examen Clínico
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
            
            {/* COLUMNA IZQUIERDA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Tejidos Blandos</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <SelectField label="Lengua" field="lengua" options={normalcyOptions} data={data} onChange={handleChange} readOnly={readOnly} />
                        <SelectField label="Carrillos" field="carrillos" options={normalcyOptions} data={data} onChange={handleChange} readOnly={readOnly} />
                        <SelectField label="Frenillos" field="frenillos" options={normalcyOptions} data={data} onChange={handleChange} readOnly={readOnly} />
                        <SelectField label="Paladar" field="paladar" options={normalcyOptions} data={data} onChange={handleChange} readOnly={readOnly} />
                        <SelectField label="Piso de Boca" field="pisoBoca" options={normalcyOptions} data={data} onChange={handleChange} readOnly={readOnly} />
                        <SelectField label="Labios" field="labios" options={normalcyOptions} data={data} onChange={handleChange} readOnly={readOnly} />
                        <SelectField label="Comisuras" field="comisuras" options={normalcyOptions} data={data} onChange={handleChange} readOnly={readOnly} />
                        <SelectField label="Glándulas Salivales" field="glandulas" options={normalcyOptions} data={data} onChange={handleChange} readOnly={readOnly} />
                        <SelectField label="Pigmentaciones" field="pigmentaciones" options={normalcyOptions} data={data} onChange={handleChange} readOnly={readOnly} />
                    </div>
                </section>

                <section>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Tejidos Duros</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <CheckboxField label="Hipoplasias" field="hipoplasias" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Amelogenesis" field="amelogenesis" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Manchas" field="manchas" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Desgastes" field="desgastes" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Fracturas" field="tdFracturas" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Agenesia" field="agenesia" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Supernumerario" field="supernumerario" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Diente Ausente" field="ausenteObs" checked={!!data.ausenteObs} onChange={(f, v) => handleChange('ausenteObs', v ? 'Sí' : '')} data={data} readOnly={readOnly}>
                            <input type="text" placeholder="¿Cuáles?" value={data.ausenteObs} onChange={e => handleChange('ausenteObs', e.target.value)} style={commonInputStyle} />
                        </CheckboxField>
                    </div>
                </section>

                <section>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Maxilares</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <CheckboxField label="Micrognasia" field="micrognasia" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Macrognasia" field="macrognasia" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Torus" field="torus" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Otros" field="maxOtros" checked={!!data.maxOtros} onChange={(f, v) => handleChange('maxOtros', v ? 'Sí' : '')} data={data} readOnly={readOnly}>
                             <input type="text" placeholder="¿Cuáles?" value={data.maxOtros} onChange={e => handleChange('maxOtros', e.target.value)} style={commonInputStyle} />
                        </CheckboxField>
                    </div>
                </section>
            </div>

            {/* COLUMNA DERECHA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>ATM</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <CheckboxField label="Dolor Articular" field="dolorArticular" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Dolor Muscular" field="dolorMuscular" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Ruidos" field="ruidos" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Limitación de Apertura" field="limitacion" data={data} onChange={handleChange} readOnly={readOnly} />
                        <CheckboxField label="Desviación" field="desviacion" data={data} onChange={handleChange} readOnly={readOnly} />
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Observaciones ATM</label>
                            <input type="text" value={data.atmObservaciones} onChange={e => handleChange('atmObservaciones', e.target.value)} placeholder="Detalle aquí..." />
                        </div>
                    </div>
                </section>

                <section>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Oclusión</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>S. Mordida Horiz (mm)</label>
                            <input type="number" step="0.1" value={data.sobremordidaH} onChange={e => handleChange('sobremordidaH', parseFloat(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label>S. Mordida Vert (mm)</label>
                            <input type="number" step="0.1" value={data.sobremordidaV} onChange={e => handleChange('sobremordidaV', parseFloat(e.target.value))} />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Tipo de Oclusión</label>
                            <input type="text" value={data.oclusionTipo} onChange={e => handleChange('oclusionTipo', e.target.value)} placeholder="Ej. Clase I Angle..." />
                        </div>
                        <div className="form-group">
                            <label>Línea Media</label>
                            <input type="text" value={data.lineaMedia} onChange={e => handleChange('lineaMedia', e.target.value)} placeholder="Desviación..." />
                        </div>
                        <div className="form-group">
                            <label>Patrón Masticación</label>
                            <select value={data.patronMasticacion} onChange={e => handleChange('patronMasticacion', e.target.value)}>
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
                            <label>Grado de Higiene Oral</label>
                            <select value={data.higiene} onChange={e => handleChange('higiene', e.target.value)}>
                                <option value="B">Buena</option>
                                <option value="R">Regular</option>
                                <option value="M">Mala</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            <CheckboxField label="Halitosis" field="habHalitosis" data={data} onChange={handleChange} readOnly={readOnly} />
                            <CheckboxField label="Bruxismo" field="bruxismo" data={data} onChange={handleChange} readOnly={readOnly} />
                        </div>
                        <div className="form-group">
                            <label>Otros Hábitos</label>
                            <textarea
                                value={data.habOtros}
                                onChange={e => handleChange('habOtros', e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '60px', background: 'var(--surface)', color: 'var(--text-main)', resize: 'none' }}
                                placeholder="Succión digital, deglución atípica..."
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>

        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border-color)', marginTop: '2rem' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ width: 'auto', padding: '0.8rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1, margin: 0 }}>
              <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Examen'}
            </button>
            {saved && <span style={{ color: 'var(--success)', fontWeight: 500 }}><CheckCircle size={18} /> Guardado</span>}
          </div>
        )}
    </form>
  );
};

export default ExamenClinicoForm;
