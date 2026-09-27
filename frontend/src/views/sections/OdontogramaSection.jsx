import React, { useState, useEffect } from 'react';
import Odontogram from '../../components/clinica/Odontogram';
import DesbloqueoModal from '../../components/clinica/DesbloqueoModal';
import { useBloqueoSeccion } from '../../hooks/useBloqueoSeccion';
import clinicaService from '../../services/clinicaService';
import { formatFechaCorta } from '../../utils/fechas';
import { Lock, Save, CheckCircle2 } from 'lucide-react';

const OdontogramaSection = ({ historiaId, readOnly }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const bloqueo = useBloqueoSeccion('protesis');
  const bloqueoOdon = useBloqueoSeccion('odontograma');
  const [protesisMeta, setProtesisMeta] = useState({ createdAt: null, createdBy: '' });
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
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  // Gracia de llenado inicial: el odontograma se bloquea al haber evoluciones.
  const [tieneEvoluciones, setTieneEvoluciones] = useState(false);

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
      const lista = Array.isArray(res.data) ? res.data : [];
      setData(lista);
      // HU-2: con hallazgos Y evoluciones (atención en curso) la sección se bloquea.
      // Sin evoluciones es llenado inicial libre. Si no se puede verificar,
      // no se bloquea preventivo: el backend decide con 409.
      try {
        const evo = await clinicaService.listEvoluciones(historiaId);
        const hayEvo = Array.isArray(evo.data) && evo.data.length > 0;
        setTieneEvoluciones(hayEvo);
        if (lista.length > 0 && hayEvo) bloqueoOdon.bloquear();
      } catch {
        setTieneEvoluciones(false);
      }
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar el odontograma');
    } finally {
      setLoading(false);
    }
  };

  const loadProtesis = async () => {
    try {
      const res = await clinicaService.getProtesis(historiaId);
      if (res.data) {
        setProtesis(res.data);
        setProtesisMeta({ createdAt: res.data.createdAt || null, createdBy: res.data.createdBy || '' });
        bloqueo.marcarRegistrado(res.data);
      }
    } catch (err) {
      // 404 = "aún no registrada": estado vacío, no error.
      if (err?.response?.status === 404) return;
      setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar la prótesis');
    }
  };

  const handleApplyEvent = async (event) => {
    setActionError('');
    try {
      const response = await clinicaService.createOdontogramaRegistro(historiaId, event);
      setData(prev => [...prev, response.data]);
      // Con atención en curso cada hallazgo consume el desbloqueo (un solo uso).
      // En llenado inicial se sigue editable.
      if (tieneEvoluciones) bloqueoOdon.marcarGuardado();
    } catch (err) {
      if (err?.response?.status === 409) {
        bloqueoOdon.marcarConflicto();
      }
      setActionError(err?.response?.data?.message || err?.message || 'Error de datos');
    }
  };

  const handleSaveProtesis = async () => {
    setSavingProtesis(true);
    setActionError('');
    try {
      const res = await clinicaService.upsertProtesis(historiaId, protesis);
      if (res.data) {
        setProtesis(res.data);
        setProtesisMeta({ createdAt: res.data.createdAt || null, createdBy: res.data.createdBy || '' });
      }
      bloqueo.marcarGuardado();
      setShowSuccess(true);
    } catch (err) {
      if (err?.response?.status === 409) {
        // La prótesis ya estaba registrada: reflejar el bloqueo sin falso "Guardado".
        bloqueo.marcarConflicto();
      }
      setActionError(err?.response?.data?.message || err?.message || 'Error al guardar prótesis');
    } finally {
      setSavingProtesis(false);
    }
  };

  const locked = readOnly || bloqueo.bloqueado;
  const showUnlockBtn = !readOnly && bloqueo.bloqueado && bloqueo.isAdmin;
  const lockedOdon = readOnly || bloqueoOdon.bloqueado;
  const showUnlockOdonBtn = !readOnly && bloqueoOdon.bloqueado && bloqueoOdon.isAdmin;

  if (loading) return <div className="text-center p-10">Cargando Odontograma...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Odontograma</h3>
          {lockedOdon ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--secondary-soft)', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>
                <Lock size={14} /> Registro bloqueado
              </span>
              {showUnlockOdonBtn && (
                <button
                  onClick={() => bloqueoOdon.setShowUnlock(true)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Desbloquear (ADMIN)
                </button>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--secondary-soft)', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>
              {data.length > 0
                ? 'Llenado inicial: se bloqueará al registrar evoluciones'
                : 'Haz clic en una cara de un diente para registrar un hallazgo'}
            </span>
          )}
      </div>

      {bloqueoOdon.desbloqueo && !bloqueoOdon.bloqueado && (
        <div style={{ border: '1px solid var(--border-color)', background: 'var(--secondary-soft)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
          Desbloqueada por {bloqueoOdon.desbloqueo.por}: {bloqueoOdon.desbloqueo.motivo} (permite registrar un hallazgo)
        </div>
      )}
      
      <Odontogram 
          data={data} 
          onEventAdd={handleApplyEvent} 
          readOnly={lockedOdon} 
      />

      {/* Historial de Hallazgos */}
      <div style={{ marginTop: '3rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>Historial de Hallazgos</h4>
          {(loadError || actionError) && (
            <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <strong style={{ color: 'var(--accent)' }}>Ocurrió un problema. </strong>
              {loadError || actionError}
            </div>
          )}
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
                  </div>
              ))}
          </div>
      </div>

      {/* Sección de Prótesis Extra */}
      <div style={{ marginTop: '3rem', background: 'var(--surface)', padding: '2rem', borderRadius: '15px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>Información Adicional de Prótesis</h4>
          {!locked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {showSuccess && (
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, animation: 'fadeIn 0.3s' }}>
                  <CheckCircle2 size={18} /> Guardado exitoso
                </span>
              )}
              <button
                onClick={handleSaveProtesis}
                disabled={savingProtesis}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px var(--primary-soft)', transition: 'background-color 0.3s, border-color 0.3s, color 0.3s, transform 0.3s, box-shadow 0.3s, opacity 0.3s', opacity: savingProtesis ? 0.7 : 1 }}
                onMouseEnter={e => !savingProtesis && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => !savingProtesis && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Save size={18} /> {savingProtesis ? 'Guardando...' : 'Guardar Prótesis'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <Lock size={16} /> Registro bloqueado
                {protesisMeta.createdAt && ` · ${formatFechaCorta(protesisMeta.createdAt)}`}
                {protesisMeta.createdBy && ` · ${protesisMeta.createdBy}`}
              </span>
              {showUnlockBtn && (
                <button
                  onClick={() => bloqueo.setShowUnlock(true)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Desbloquear (ADMIN)
                </button>
              )}
            </div>
          )}
        </div>

        {bloqueo.desbloqueo && (
          <div style={{ border: '1px solid var(--border-color)', background: 'var(--secondary-soft)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Desbloqueada por {bloqueo.desbloqueo.por}: {bloqueo.desbloqueo.motivo}
          </div>
        )}

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
                <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: locked ? 'default' : 'pointer', fontSize: '0.95rem' }}>
                  <input 
                    type="checkbox" 
                    checked={protesis[item.id] || false} 
                    onChange={e => setProtesis({...protesis, [item.id]: e.target.checked})} 
                    disabled={locked} 
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
                  disabled={locked}
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
                <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: locked ? 'default' : 'pointer', fontSize: '0.95rem' }}>
                  <input 
                    type="checkbox" 
                    checked={protesis[item.id] || false} 
                    onChange={e => setProtesis({...protesis, [item.id]: e.target.checked})} 
                    disabled={locked} 
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
                  disabled={locked}
                  placeholder="Detalles sobre puentes o coronas fijas..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-main)', minHeight: '80px', resize: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DesbloqueoModal
        abierto={bloqueo.showUnlock}
        seccionNombre="Prótesis"
        onConfirm={(motivo) => bloqueo.solicitar(historiaId, motivo)}
        onCancel={() => bloqueo.setShowUnlock(false)}
        error={bloqueo.unlockError}
        enviando={bloqueo.unlocking}
      />

      <DesbloqueoModal
        abierto={bloqueoOdon.showUnlock}
        seccionNombre="Odontograma"
        onConfirm={(motivo) => bloqueoOdon.solicitar(historiaId, motivo)}
        onCancel={() => bloqueoOdon.setShowUnlock(false)}
        error={bloqueoOdon.unlockError}
        enviando={bloqueoOdon.unlocking}
      />
    </div>
  );
};

export default OdontogramaSection;
