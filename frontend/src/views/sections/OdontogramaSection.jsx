import React, { useState, useEffect } from 'react';
import Odontogram from '../../components/clinica/Odontogram';
import clinicaService from '../../services/clinicaService';
import { formatFechaCorta } from '../../utils/fechas';
import { Trash2, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

const OdontogramaSection = ({ historiaId, readOnly }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [protesis, setProtesis] = useState({
    totalSuperior: false,
    totalInferior: false,
    parcialAcriSuperior: false,
    parcialAcriInferior: false,
    removibleMetSuperior: false,
    removibleMetInferior: false,
    fijaSuperior: '',
    fijaInferior: ''
  });
  const [savingProtesis, setSavingProtesis] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
    loadProtesis();
  }, [historiaId]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const loadData = async () => {
    try {
      const res = await clinicaService.listOdontograma(historiaId);
      setData(res.data);
    } catch (e) {
      console.error('Error loading odontogram:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadProtesis = async () => {
    try {
      const res = await clinicaService.getProtesis(historiaId);
      if (res.data) setProtesis(res.data);
    } catch (e) {
      console.error('Error loading protesis:', e);
    }
  };

  const handleApplyEvent = async (event) => {
    try {
      const response = await clinicaService.createOdontogramaRegistro(historiaId, event);
      setData(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Error saving odontogram event:', err);
      alert('Error en Registro: ' + (err.response?.data?.message || 'Error de datos'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await clinicaService.deleteOdontogramaRegistro(historiaId, deleteConfirm);
      setData(prev => prev.filter(r => r.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      setDeleteConfirm(null);
    }
  };

  const handleSaveProtesis = async () => {
    setSavingProtesis(true);
    try {
      await clinicaService.upsertProtesis(historiaId, protesis);
      setShowSuccess(true);
    } catch (err) {
      console.error('Error saving protesis:', err);
    } finally {
      setSavingProtesis(false);
    }
  };

  if (loading) return <div className="text-center p-10">Cargando Odontograma...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Odontograma</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--secondary-soft)', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>
              Haz clic en una cara de un diente para registrar un hallazgo
          </span>
      </div>
      
      <Odontogram 
          data={data} 
          onEventAdd={handleApplyEvent} 
          readOnly={readOnly} 
      />

      {/* Historial de Hallazgos */}
      <div style={{ marginTop: '3rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>Historial de Hallazgos</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '15px', background: 'var(--surface)', fontSize: '0.95rem', boxShadow: 'var(--shadow)' }}>
              {data.length === 0 && <p style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>No se han registrado hallazgos clínicos.</p>}
              {data.slice().reverse().map((e, idx) => (
                  <div key={e.id} style={{ 
                      padding: '1rem 1.5rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      borderBottom: idx === data.length - 1 ? 'none' : '1px solid var(--border-color)',
                      transition: 'background 0.2s',
                      background: idx % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent'
                  }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700 }}>Diente {e.numeroDiente} ({e.cara}) — <span style={{ color: 'var(--primary)' }}>{e.observacion || e.tipoEvento}</span></span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{e.fecha ? formatFechaCorta(e.fecha) || 'Añadido hoy' : 'Añadido hoy'}</span>
                      </div>
                      {!readOnly && (
                          <button onClick={() => setDeleteConfirm(e.id)} style={{ padding: '0.5rem', background: 'transparent', color: 'var(--accent)', borderRadius: '8px' }}>
                              <Trash2 size={18} />
                          </button>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* Sección de Prótesis Extra */}
      <div style={{ marginTop: '3rem', background: 'var(--surface)', padding: '2rem', borderRadius: '15px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>Información Adicional de Prótesis</h4>
          {!readOnly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {showSuccess && (
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, animation: 'fadeIn 0.3s' }}>
                  <CheckCircle2 size={18} /> Guardado exitoso
                </span>
              )}
              <button 
                onClick={handleSaveProtesis} 
                disabled={savingProtesis}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px var(--primary-soft)', transition: 'all 0.3s', opacity: savingProtesis ? 0.7 : 1 }}
                onMouseEnter={e => !savingProtesis && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => !savingProtesis && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Save size={18} /> {savingProtesis ? 'Guardando...' : 'Guardar Prótesis'}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Arco Superior */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h5 style={{ fontWeight: 700, color: 'var(--text-main)', borderLeft: '4px solid var(--primary)', paddingLeft: '0.5rem' }}>Arco Superior</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--secondary-soft)', padding: '1.2rem', borderRadius: '12px' }}>
              {[
                { id: 'totalSuperior', label: 'Prótesis total superior' },
                { id: 'parcialAcriSuperior', label: 'Prótesis parcial acrílica superior' },
                { id: 'removibleMetSuperior', label: 'Prótesis removible metálica superior' }
              ].map(item => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: readOnly ? 'default' : 'pointer', fontSize: '0.95rem' }}>
                  <input 
                    type="checkbox" 
                    checked={protesis[item.id] || false} 
                    onChange={e => setProtesis({...protesis, [item.id]: e.target.checked})} 
                    disabled={readOnly} 
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                  />
                  <span>{item.label}</span>
                </label>
              ))}
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Prótesis fija superior:</span>
                <textarea 
                  value={protesis.fijaSuperior || ''} 
                  onChange={e => setProtesis({...protesis, fijaSuperior: e.target.value})}
                  disabled={readOnly}
                  placeholder="Detalles sobre puentes o coronas fijas..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-main)', minHeight: '80px', resize: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Arco Inferior */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h5 style={{ fontWeight: 700, color: 'var(--text-main)', borderLeft: '4px solid var(--accent)', paddingLeft: '0.5rem' }}>Arco Inferior</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--secondary-soft)', padding: '1.2rem', borderRadius: '12px' }}>
              {[
                { id: 'totalInferior', label: 'Prótesis total inferior' },
                { id: 'parcialAcriInferior', label: 'Prótesis parcial acrílica inferior' },
                { id: 'removibleMetInferior', label: 'Prótesis removible metálica inferior' }
              ].map(item => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: readOnly ? 'default' : 'pointer', fontSize: '0.95rem' }}>
                  <input 
                    type="checkbox" 
                    checked={protesis[item.id] || false} 
                    onChange={e => setProtesis({...protesis, [item.id]: e.target.checked})} 
                    disabled={readOnly} 
                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent)', cursor: 'pointer' }} 
                  />
                  <span>{item.label}</span>
                </label>
              ))}
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Prótesis fija inferior:</span>
                <textarea 
                  value={protesis.fijaInferior || ''} 
                  onChange={e => setProtesis({...protesis, fijaInferior: e.target.value})}
                  disabled={readOnly}
                  placeholder="Detalles sobre puentes o coronas fijas..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-main)', minHeight: '80px', resize: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ELIMINACIÓN */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '20px', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', textAlign: 'center', animation: 'fadeIn 0.2s' }}>
            <div style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><AlertCircle size={48} /></div>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>¿Eliminar Hallazgo?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>Esta acción no se puede deshacer y el diente recuperará su estado original.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}>CANCELAR</button>
              <button onClick={confirmDelete} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>ELIMINAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OdontogramaSection;
