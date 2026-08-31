import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DatabaseBackup, RefreshCw, RotateCcw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getBackups, getBackupWarnings, runBackup, restoreBackup } from '../services/backupService';

const fmt = (v) => v ? new Date(v).toLocaleString('es-CO') : '-';
const bytes = (n) => n ? `${(n / 1024 / 1024).toFixed(2)} MB` : '0 MB';

export default function BackupManagement() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [warnings, setWarnings] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      setBackups(await getBackups());
      setWarnings(await getBackupWarnings());
    } catch (e) {
      setMessage(e.response?.data?.message || 'No se pudieron consultar los respaldos.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/dashboard', { replace: true });
      return;
    }
    load();
  }, []);

  const doBackup = async () => {
    setWorking(true); setMessage('');
    try {
      const r = await runBackup();
      setMessage(r.success ? 'Backup realizado correctamente.' : 'El backup falló.');
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || 'Error al ejecutar el backup.');
    } finally { setWorking(false); }
  };

  const doRestore = async () => {
    if (!selected) return;
    if (confirmation !== 'RESTAURAR') {
      setMessage('La palabra debe coincidir exactamente con RESTAURAR.');
      return;
    }
    setWorking(true); setMessage('');
    try {
      const r = await restoreBackup(selected.filename, confirmation);
      setMessage(r.message);
      setSelected(null); setConfirmation('');
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || e.message || 'La restauración fue bloqueada.');
    } finally { setWorking(false); }
  };

  const latest = backups[0];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
        <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background:'var(--secondary-soft)', color:'var(--primary)', padding:'.6rem', borderRadius:10 }}>
            <ArrowLeft size={20}/>
          </button>
          <div>
            <h1 style={{ color:'var(--text-main)', fontSize:'2rem' }}>Respaldos</h1>
            <p style={{ color:'var(--text-secondary)' }}>Administración y restauración de copias de seguridad.</p>
          </div>
        </div>
        <button className="btn-primary" disabled={working} onClick={doBackup}
          style={{ width:'auto', padding:'.8rem 1.2rem', display:'flex', gap:'.5rem', alignItems:'center' }}>
          {working ? <RefreshCw className="animate-spin" size={18}/> : <DatabaseBackup size={18}/>}
          Ejecutar backup
        </button>
      </div>

      {message && <div className="auth-card" style={{ padding:'1rem', marginBottom:'1.5rem' }}>{message}</div>}

      {warnings.length > 0 && <div className="auth-card" style={{ padding:'1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--accent)' }}>
        <h3 style={{ color:'var(--text-main)', marginBottom:'.75rem' }}>Advertencias y errores registrados</h3>
        <div style={{ maxHeight:180, overflowY:'auto' }}>
          {warnings.slice(-20).reverse().map((w, i) => <div key={i} style={{ padding:'.35rem 0', color:'var(--text-secondary)' }}>{w}</div>)}
        </div>
      </div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
        <div className="auth-card" style={{ padding:'1.5rem' }}>
          <small>Último respaldo</small>
          <h3>{latest ? fmt(latest.timestamp) : 'Sin respaldos'}</h3>
          <p>{latest?.filename || '-'}</p>
        </div>
        <div className="auth-card" style={{ padding:'1.5rem' }}>
          <small>Estado</small>
          <h3>{latest?.status || '-'}</h3>
          <p>{latest ? bytes(latest.size) : '-'}</p>
        </div>
        <div className="auth-card" style={{ padding:'1.5rem' }}>
          <small>Copia externa</small>
          <h3>{latest?.externalCopy || 'NO CONFIGURADA'}</h3>
        </div>
      </div>

      <div className="auth-card" style={{ padding:'1.5rem', maxWidth:'100%' }}>
        <h2 style={{ marginBottom:'1rem', color:'var(--text-main)' }}>Respaldos disponibles</h2>
        {loading ? <p>Cargando...</p> : backups.length === 0 ? <p>No hay respaldos disponibles.</p> :
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                <th align="left">Archivo</th><th align="left">Fecha y hora</th><th align="left">Estado</th>
                <th align="left">Copia externa</th><th align="left">Tamaño</th><th></th>
              </tr></thead>
              <tbody>{backups.map(b => <tr key={b.filename}>
                <td style={{ padding:'.8rem 0' }}>{b.filename}</td>
                <td>{fmt(b.timestamp)}</td>
                <td>{b.status === 'EXITOSO' ? <CheckCircle size={17}/> : <AlertTriangle size={17}/>} {b.status}</td>
                <td>{b.externalCopy === 'REALIZADA' ? <CheckCircle size={17}/> : b.externalCopy === 'ERROR' ? <XCircle size={17}/> : 'NO CONFIGURADA'}</td>
                <td>{bytes(b.size)}</td>
                <td><button onClick={() => {setSelected(b);setConfirmation('');}}
                    style={{ background:'var(--accent)', color:'white', padding:'.55rem .8rem', borderRadius:8, display:'flex', gap:'.4rem', alignItems:'center' }}>
                    <RotateCcw size={16}/> Restaurar
                </button></td>
              </tr>)}</tbody>
            </table>
          </div>
        }
      </div>

      {selected && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', zIndex:100 }}>
        <div className="auth-card" style={{ maxWidth:560 }}>
          <h2 style={{ color:'var(--accent)' }}>Advertencia de restauración</h2>
          <p>Se restaurará el respaldo seleccionado y pueden perderse cambios realizados después de su fecha.</p>
          <p><strong>Respaldo:</strong> {selected.filename}</p>
          <p><strong>Timestamp:</strong> {fmt(selected.timestamp)}</p>
          <p><strong>Integridad:</strong> checksum SHA-256 verificado antes de restaurar.</p>
          <div className="form-group">
            <label>Escriba exactamente RESTAURAR</label>
            <input value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="off" />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'.8rem' }}>
            <button onClick={() => {setSelected(null);setConfirmation('');}} disabled={working}>Cancelar</button>
            <button className="btn-primary" onClick={doRestore} disabled={working || confirmation !== 'RESTAURAR'}
              style={{ width:'auto', marginTop:0 }}>
              {working ? 'Restaurando...' : 'Confirmar restauración'}
            </button>
          </div>
        </div>
      </div>}
    </div>
  );
}
