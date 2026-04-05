import React, { useState, useEffect } from 'react';
import { PlusCircle, MessageSquare, User, Calendar } from 'lucide-react';
import clinicaService from '../../services/clinicaService';
import SignatureCanvas from '../../components/clinica/SignatureCanvas';

const EvolucionesSection = ({ historiaId, readOnly }) => {
  const [evoluciones, setEvoluciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEvo, setNewEvo] = useState({ descripcion: '', firmaOdontologo: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [historiaId]);

  const loadData = async () => {
    try {
      const res = await clinicaService.listEvoluciones(historiaId);
      setEvoluciones(res.data);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newEvo.firmaOdontologo) {
      alert('Se requiere la firma del odontólogo');
      return;
    }
    setSaving(true);
    try {
      await clinicaService.createEvolucion(historiaId, newEvo);
      setShowForm(false);
      setNewEvo({ descripcion: '', firmaOdontologo: '' });
      loadData();
    } catch (err) {
      alert('Error al crear evolución');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Evoluciones Clínicas</h3>
        {!readOnly && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary"
            style={{ width: 'auto', padding: '0.6rem 1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
          >
            <PlusCircle size={18} /> Nueva Evolución
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)', border: '1px solid #90e0ef', marginBottom: '2.5rem', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Nueva Entrada de Evolución</h4>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
              <textarea
                value={newEvo.descripcion}
                onChange={e => setNewEvo({...newEvo, descripcion: e.target.value})}
                required
                style={{ width: '100%', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '120px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: '#f8fbff', resize: 'vertical', transition: 'border-color 0.3s' }}
                placeholder="Describe el procedimiento realizado hoy..."
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
          </div>

          <div style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
             <SignatureCanvas 
                onSave={(sig) => setNewEvo({...newEvo, firmaOdontologo: sig})}
                label="Firma del Odontólogo"
             />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
            <button
              type="submit"
              disabled={saving || !newEvo.firmaOdontologo}
              className="btn-primary"
              style={{ width: 'auto', padding: '0.8rem 2rem', margin: 0, opacity: (saving || !newEvo.firmaOdontologo) ? 0.5 : 1 }}
            >
              {saving ? 'Guardando...' : 'Registrar Evolución'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Cargando historial...</div>}
        {evoluciones.length === 0 && !loading && !showForm && (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'var(--surface)', color: '#94a3b8', fontStyle: 'italic' }}>
            No hay evoluciones registradas para esta historia.
          </div>
        )}
        
        {evoluciones.slice().sort((a,b) => b.id - a.id).map((evo) => (
          <div key={evo.id} style={{ display: 'flex', gap: '1.5rem', background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'border-color 0.3s' }}
               onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-light)')}
               onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            <div style={{ flexShrink: 0, width: '50px', height: '50px', background: 'var(--secondary-soft)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   {new Date(evo.createdAt).toLocaleString()}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#f0fdf4', color: '#16a34a', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Procedimiento
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{evo.descripcion}</p>
              <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                <User size={14} /> Firmado Digitalmente por Odontólogo
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvolucionesSection;
