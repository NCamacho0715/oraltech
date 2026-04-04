import React, { useState, useEffect } from 'react';
import Odontogram from '../../components/clinica/Odontogram';
import clinicaService from '../../services/clinicaService';

const OdontogramaSection = ({ historiaId, readOnly }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [historiaId]);

  const loadData = async () => {
    try {
      const res = await clinicaService.listOdontograma(historiaId);
      setData(res.data);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleApplyEvent = async (event) => {
    try {
      // Optimistic update
      setData([...data, { ...event, id: Date.now() }]);
      await clinicaService.createOdontogramaRegistro(historiaId, event);
      // Reload to get real database IDs
      loadData();
    } catch (err) {
      alert('Error al registrar evento en odontograma');
      loadData();
    }
  };

  if (loading) return <div className="text-center p-10">Cargando Odontograma...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0, 119, 182, 0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
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

        <div style={{ marginTop: '3rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>Historial de Registros</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', fontSize: '0.95rem' }}>
                {data.length === 0 && <p style={{ padding: '1.5rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>No hay registros aún.</p>}
                {data.slice().reverse().map((e, idx) => (
                    <div key={e.id} style={{ 
                        padding: '1rem 1.5rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        borderBottom: idx === data.length - 1 ? 'none' : '1px solid #f1f5f9',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(el) => (el.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(el) => (el.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        <span>Diente <b style={{ color: 'var(--text-main)' }}>{e.dienteNumero}</b> ({e.cara}) - <b style={{ color: 'var(--primary)' }}>{e.tipoEvento}</b></span>
                        <span style={{ color: 'var(--text-secondary)' }}>{new Date(e.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default OdontogramaSection;
