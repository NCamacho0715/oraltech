import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Info } from 'lucide-react';
import clinicaService from '../../services/clinicaService';

const AntecedentesForm = ({ historiaId, patientId, readOnly }) => {
  const [data, setData] = useState({
    medTratamientoMedico: false,
    medTomaMedicamentos: false,
    medAlergias: false,
    medCardiacos: false,
    medDiabetes: false,
    medHepatitis: false,
    medHipertension: false,
    medHemorragias: false,
    medOtras: '',
    odoUltimaVisita: '',
    odoHigieneOral: 'BUENA',
    odoFuma: false,
    odoBruxismo: false,
    embarazo: false,
    observaciones: ''
  });
  const [patientSex, setPatientSex] = useState('M');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, [historiaId]);

  const loadData = async () => {
    try {
      const res = await clinicaService.getAntecedentes(historiaId);
      if (res.data) setData(res.data);
      
      // We need sex for pregnancy validation
      // Optimization: Fetch from a global store if available, but for now fetch patient detail
      const { data: patient } = await axios.get(`http://localhost:8080/api/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPatientSex(patient.sex);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clinicaService.upsertAntecedentes(historiaId, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar antecedentes');
    } finally {
      setSaving(false);
    }
  };

  const Checkbox = ({ label, field }) => (
    <label style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.8rem', 
        padding: '0.8rem 1rem', 
        background: 'var(--background)', 
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        cursor: readOnly ? 'default' : 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        opacity: readOnly ? 0.8 : 1
    }}
    onMouseEnter={(e) => !readOnly && (e.currentTarget.style.borderColor = 'var(--primary)')}
    onMouseLeave={(e) => !readOnly && (e.currentTarget.style.borderColor = '#e2e8f0')}
    >
      <input
        type="checkbox"
        checked={data[field]}
        onChange={(e) => !readOnly && setData({ ...data, [field]: e.target.checked })}
        disabled={readOnly}
        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: readOnly ? 'default' : 'pointer' }}
      />
      <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>{label}</span>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Antecedentes Médicos y Odontológicos
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Sistémicos / Médicos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Checkbox label="En Tratamiento Médico" field="medTratamientoMedico" />
              <Checkbox label="Toma Medicamentos" field="medTomaMedicamentos" />
              <Checkbox label="Alergias" field="medAlergias" />
              <Checkbox label="Problemas Cardiacos" field="medCardiacos" />
              <Checkbox label="Diabetes" field="medDiabetes" />
              <Checkbox label="Hipertensión" field="medHipertension" />
              <Checkbox label="Hemorragias" field="medHemorragias" />
              {patientSex === 'F' && <Checkbox label="Embarazo" field="embarazo" />}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Odontológicos / Otros
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <Checkbox label="Hábito de Fumar" field="odoFuma" />
              <Checkbox label="Bruxismo" field="odoBruxismo" />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Última Visita Odontólogo</label>
              <input
                type="text"
                value={data.odoUltimaVisita || ''}
                readOnly={readOnly}
                onChange={(e) => setData({...data, odoUltimaVisita: e.target.value})}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', background: readOnly ? '#f8fafc' : '#ffffff', outline: 'none', transition: 'border-color 0.3s' }}
                onFocus={(e) => !readOnly && (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => !readOnly && (e.target.style.borderColor = '#e2e8f0')}
                placeholder="Ej: Hace 6 meses"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Higiene Oral</label>
              <select
                value={data.odoHigieneOral}
                disabled={readOnly}
                onChange={(e) => setData({...data, odoHigieneOral: e.target.value})}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', background: readOnly ? '#f8fafc' : '#ffffff', outline: 'none', transition: 'border-color 0.3s', cursor: readOnly ? 'default' : 'pointer' }}
                onFocus={(e) => !readOnly && (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => !readOnly && (e.target.style.borderColor = '#e2e8f0')}
              >
                <option value="EXCELENTE">Excelente</option>
                <option value="BUENA">Buena</option>
                <option value="REGULAR">Regular</option>
                <option value="DEFICIENTE">Deficiente</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Otras Patologías / Observaciones</label>
          <textarea
            value={data.observaciones}
            onChange={(e) => setData({ ...data, observaciones: e.target.value })}
            readOnly={readOnly}
            style={{ width: '100%', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: readOnly ? '#f8fafc' : '#ffffff', resize: 'vertical', transition: 'border-color 0.3s' }}
            placeholder="Detalles adicionales..."
            onFocus={(e) => !readOnly && (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => !readOnly && (e.target.style.borderColor = '#e2e8f0')}
          />
        </div>

        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '2px solid rgba(0, 119, 182, 0.1)' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ width: 'auto', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1, margin: 0 }}
            >
              <Save size={18} /> 
              {saving ? 'Guardando...' : 'Guardar Antecedentes'}
            </button>
            {saved && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}><CheckCircle size={18} /> Guardado</span>}
          </div>
        )}
      </div>
    </form>
  );
};

// Internal axios needed here locally if not imported
import axios from 'axios';

export default AntecedentesForm;
