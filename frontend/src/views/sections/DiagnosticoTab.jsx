import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Plus, Send } from 'lucide-react';
import clinicaService from '../../services/clinicaService';

const DiagnosticoTab = ({ historiaId, readOnly }) => {
  const [diag, setDiag] = useState({ descripcion: '', cie10: '', otros: '' });
  const [pron, setPron] = useState({ descripcion: '' });
  const [inters, setInters] = useState([]);
  const [newInter, setNewInter] = useState({ especialidad: '', descripcion: '' });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    load();
  }, [historiaId]);

  const load = async () => {
    try {
      const [d, p, i] = await Promise.all([
        clinicaService.getDiagnostico(historiaId),
        clinicaService.getPronostico(historiaId),
        clinicaService.listInterconsultas(historiaId)
      ]);
      if (d.data) setDiag(d.data);
      if (p.data) setPron(p.data);
      setInters(i.data);
    } catch (e) {}
  };

  const handleSaveMain = async () => {
    setSaving(true);
    try {
      await Promise.all([
        clinicaService.upsertDiagnostico(historiaId, diag),
        clinicaService.upsertPronostico(historiaId, pron)
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleAddInter = async () => {
    if (!newInter.especialidad) return;
    try {
        await clinicaService.createInterconsulta(historiaId, newInter);
        setNewInter({ especialidad: '', descripcion: '' });
        const i = await clinicaService.listInterconsultas(historiaId);
        setInters(i.data);
    } catch (e) { alert('Error al crear interconsulta'); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Diagnostico & Pronostico */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Diagnóstico y Pronóstico
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>CIE-10 / Código</label>
                <input 
                    type="text" 
                    value={diag.cie10} 
                    readOnly={readOnly}
                    onChange={e => setDiag({...diag, cie10: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', background: readOnly ? '#f8fafc' : '#ffffff', outline: 'none', transition: 'border-color 0.3s' }}
                    onFocus={(e) => !readOnly && (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={(e) => !readOnly && (e.target.style.borderColor = '#e2e8f0')}
                    placeholder="Ej: K021"
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Otros Hallazgos</label>
                <input 
                    type="text" 
                    value={diag.otros} 
                    readOnly={readOnly}
                    onChange={e => setDiag({...diag, otros: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', background: readOnly ? '#f8fafc' : '#ffffff', outline: 'none', transition: 'border-color 0.3s' }}
                    onFocus={(e) => !readOnly && (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={(e) => !readOnly && (e.target.style.borderColor = '#e2e8f0')}
                />
            </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Descripción del Diagnóstico</label>
          <textarea
            value={diag.descripcion}
            readOnly={readOnly}
            onChange={(e) => setDiag({ ...diag, descripcion: e.target.value })}
            style={{ width: '100%', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: readOnly ? '#f8fafc' : '#ffffff', resize: 'vertical', transition: 'border-color 0.3s' }}
            onFocus={(e) => !readOnly && (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => !readOnly && (e.target.style.borderColor = '#e2e8f0')}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: '#e63946', marginBottom: '0.5rem' }}>Pronóstico Profesional</label>
          <textarea
            value={pron.descripcion}
            readOnly={readOnly}
            onChange={(e) => setPron({ ...pron, descripcion: e.target.value })}
            style={{ width: '100%', padding: '1rem', border: '1px solid #fca5a5', borderRadius: '8px', minHeight: '80px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: readOnly ? '#fef2f2' : '#fff5f5', resize: 'vertical', transition: 'border-color 0.3s' }}
            placeholder="Favorable, reservado, etc."
            onFocus={(e) => !readOnly && (e.target.style.borderColor = '#ef4444')}
            onBlur={(e) => !readOnly && (e.target.style.borderColor = '#fca5a5')}
          />
        </div>

        {!readOnly && (
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
          </div>
        )}
      </div>

      {/* Interconsultas */}
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Interconsultas</h3>
        
        {!readOnly && (
            <div style={{ display: 'flex', gap: '0.8rem', padding: '1rem', background: 'var(--secondary-soft)', borderRadius: '12px', marginBottom: '1.5rem', alignItems: 'center' }}>
                <input 
                    type="text" 
                    placeholder="Especialidad" 
                    value={newInter.especialidad}
                    onChange={e => setNewInter({...newInter, especialidad: e.target.value})}
                    style={{ flex: 1, padding: '0.6rem 1rem', border: '1px solid #90e0ef', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }}
                />
                <input 
                    type="text" 
                    placeholder="Descripción" 
                    value={newInter.descripcion}
                    onChange={e => setNewInter({...newInter, descripcion: e.target.value})}
                    style={{ flex: 2, padding: '0.6rem 1rem', border: '1px solid #90e0ef', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }}
                />
                <button 
                    onClick={handleAddInter}
                    style={{ padding: '0.6rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Plus size={20} />
                </button>
            </div>
        )}

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', overflow: 'hidden' }}>
            {inters.length === 0 && <p style={{ padding: '1.5rem', color: '#94a3b8', textAlign: 'center', margin: 0, fontStyle: 'italic' }}>No hay interconsultas registradas.</p>}
            {inters.map((i, idx) => (
                <div key={i.id} style={{ 
                    padding: '1.2rem 1.5rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: idx === inters.length - 1 ? 'none' : '1px solid #f1f5f9'
                }}>
                    <div>
                        <p style={{ margin: '0 0 0.3rem 0', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>{i.especialidad}</p>
                        <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>{i.descripcion}</p>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(i.createdAt).toLocaleDateString()}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticoTab;
