import React, { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import clinicaService from '../../services/clinicaService';

const ExamenClinicoForm = ({ historiaId, readOnly }) => {
  const [data, setData] = useState({
    examenFisico: '',
    tmAticulacion: 'NORMAL',
    tmMusculos: 'NORMAL',
    tmLabios: 'NORMAL',
    tmLengua: 'NORMAL',
    tmPaladar: 'NORMAL',
    tmPisoBoca: 'NORMAL',
    tmEnciana: 'NORMAL',
    tmGlandulas: 'NORMAL',
    tmOrofaringe: 'NORMAL',
    idxHigiene: 'BUENA',
    idxPlaca: 0.0,
    idxCalculo: 0.0,
    idxGingivitis: 0.0,
    idxRecidiva: 0.0,
    ocuMasticacion: 'BILATERAL',
    ocuApertura: 0.0,
    ocuProyeccion: 0.0,
    ocuLateralidad: 0.0,
    habSuccDig: false,
    habDegliAtip: false,
    habSuccLabial: false,
    habRespBucal: false,
    habOtros: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, [historiaId]);

  const loadData = async () => {
    try {
      const res = await clinicaService.getExamen(historiaId);
      if (res.data) setData(res.data);
    } catch (e) {}
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

  const Select = ({ label, field, options }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</label>
      <select
        value={data[field]}
        disabled={readOnly}
        onChange={(e) => setData({...data, [field]: e.target.value})}
        style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', background: readOnly ? '#f8fafc' : '#ffffff', outline: 'none', transition: 'border-color 0.3s', cursor: readOnly ? 'default' : 'pointer' }}
        onFocus={(e) => !readOnly && (e.target.style.borderColor = 'var(--primary)')}
        onBlur={(e) => !readOnly && (e.target.style.borderColor = '#e2e8f0')}
      >
        {options.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
      </select>
    </div>
  );

  const CheckboxText = ({ label, field }) => (
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

  const normalcyOptions = [
    {val: 'NORMAL', label: 'Normal'},
    {val: 'ANORMAL', label: 'Anormal'}
  ];

  return (
    <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Examen Clínico
        </h3>

        {/* Tejidos Blandos */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.2rem' }}>Examen de Tejidos Blandos (ATM y Mucosa)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <Select label="Articulación TM" field="tmAticulacion" options={normalcyOptions} />
            <Select label="Músculos" field="tmMusculos" options={normalcyOptions} />
            <Select label="Labios" field="tmLabios" options={normalcyOptions} />
            <Select label="Lengua" field="tmLengua" options={normalcyOptions} />
            <Select label="Paladar" field="tmPaladar" options={normalcyOptions} />
            <Select label="Piso de Boca" field="tmPisoBoca" options={normalcyOptions} />
            <Select label="Encía" field="tmEnciana" options={normalcyOptions} />
            <Select label="Glándulas Salivales" field="tmGlandulas" options={normalcyOptions} />
            <Select label="Orofaringe" field="tmOrofaringe" options={normalcyOptions} />
          </div>
        </div>

        {/* Hábitos */}
        <div style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.2rem' }}>Hábitos</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                <CheckboxText label="Succión Digital" field="habSuccDig" />
                <CheckboxText label="Deglución Atípica" field="habDegliAtip" />
                <CheckboxText label="Succión Labial" field="habSuccLabial" />
                <CheckboxText label="Respiración Bucal" field="habRespBucal" />
            </div>
        </div>

        {/* General Physical */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Examen Físico General</label>
          <textarea
            value={data.examenFisico}
            onChange={(e) => setData({ ...data, examenFisico: e.target.value })}
            readOnly={readOnly}
            style={{ width: '100%', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '120px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: readOnly ? '#f8fafc' : '#ffffff', resize: 'vertical', transition: 'border-color 0.3s' }}
            placeholder="Descripción general..."
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
              {saving ? 'Guardando...' : 'Guardar Examen'}
            </button>
            {saved && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}><CheckCircle size={18} /> Guardado</span>}
          </div>
        )}
      </div>
    </form>
  );
};

export default ExamenClinicoForm;
