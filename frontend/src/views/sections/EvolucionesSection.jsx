import React, { useState, useEffect } from 'react';
import { PlusCircle, User, Calendar } from 'lucide-react';
import clinicaService from '../../services/clinicaService';
import { getAppointmentsByRange } from '../../services/appointmentService';
import { formatCOP, formatCOPInput, parseCOP } from '../../utils/copMoney';
import { parseFechaLocal } from '../../utils/fechas';
import SignatureCanvas from '../../components/clinica/SignatureCanvas';

// Decisión de modelo (documentada en docs/evoluciones-modelo.md):
// La UI captura exactamente los campos de EvolucionClinicaRequest:
// procedimiento (obligatorio), observaciones, numeroDiente, abono, saldo,
// citaId (selector de citas del día), esUrgencia (checkbox excluyente con cita),
// firmaPaciente, firmaOdontologo. No existe `descripcion`.
// La lista lee `fecha` (EvolucionClinicaListResponse), nunca createdAt/descripcion.

const EMPTY_EVO = {
  procedimiento: '',
  observaciones: '',
  numeroDiente: '',
  abono: '',
  saldo: '',
  citaId: '',
  esUrgencia: false,
  firmaPaciente: '',
  firmaOdontologo: ''
};

// Fecha local YYYY-MM-DD sin desfase UTC (para pedir las citas del día).
const hoyLocal = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

// Formatea `fecha` de EvolucionClinicaListResponse/Response.
// Nunca devuelve "Invalid Date": retorna '' si el valor falta o no es válido.
const formatFecha = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const d = parseFechaLocal(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};

const toSignatureSrc = (sig) => {
  if (!sig) return null;
  if (sig.startsWith('data:')) return sig;
  return `data:image/png;base64,${sig}`;
};

const extractErrorMessage = (err) =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Error al crear evolución';

const EvolucionesSection = ({ historiaId, patientId, readOnly }) => {
  const [evoluciones, setEvoluciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEvo, setNewEvo] = useState({ ...EMPTY_EVO });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [citasHoy, setCitasHoy] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);

  useEffect(() => {
    loadData();
  }, [historiaId]);

  // HU-3: al abrir el formulario se cargan las citas programadas del día.
  useEffect(() => {
    if (!showForm) return;
    const loadCitas = async () => {
      setLoadingCitas(true);
      try {
        const hoy = hoyLocal();
        const data = await getAppointmentsByRange(hoy, hoy);
        setCitasHoy(Array.isArray(data) ? data : []);
      } catch {
        setCitasHoy([]);
      } finally {
        setLoadingCitas(false);
      }
    };
    loadCitas();
  }, [showForm]);

  const loadData = async () => {
    setLoadError('');
    try {
      const res = await clinicaService.listEvoluciones(historiaId);
      setEvoluciones(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setEvoluciones([]);
        return;
      }
      setLoadError(extractErrorMessage(err));
    }
    finally { setLoading(false); }
  };

  const openDetail = async (evo) => {
    setLoadingDetail(true);
    try {
      const res = await clinicaService.getEvolucionDetail(historiaId, evo.id);
      setSelected(res.data);
      // Propagar presencia de firmas al listado (el list no expone firmas por seguridad).
      setEvoluciones((prev) => prev.map((it) =>
        it.id === evo.id
          ? { ...it, firmaOdontologo: res.data.firmaOdontologo ?? null, firmaPaciente: res.data.firmaPaciente ?? null }
          : it
      ));
    } catch {
      // Sin detalle, se muestra la tarjeta del listado (sin firmas).
      setSelected(evo);
    } finally {
      setLoadingDetail(false);
    }
  };

  const buildPayload = () => {
    const payload = {
      procedimiento: newEvo.procedimiento.trim(),
      observaciones: newEvo.observaciones?.trim() || null,
      esUrgencia: !!newEvo.esUrgencia,
      firmaPaciente: newEvo.firmaPaciente || null,
      firmaOdontologo: newEvo.firmaOdontologo || null
    };
    if (newEvo.numeroDiente !== '') payload.numeroDiente = Number(newEvo.numeroDiente);
    if (parseCOP(newEvo.abono) !== null) payload.abono = parseCOP(newEvo.abono);
    if (parseCOP(newEvo.saldo) !== null) payload.saldo = parseCOP(newEvo.saldo);
    // En urgencias la cita no aplica: nunca se envía citaId.
    if (!newEvo.esUrgencia && newEvo.citaId !== '') payload.citaId = Number(newEvo.citaId);
    return payload;
  };

  // HU-3: la cita seleccionada debe pertenecer al paciente de la historia.
  const citaSeleccionada = citasHoy.find((c) => String(c.id) === String(newEvo.citaId));
  const citaDeOtroPaciente = !!citaSeleccionada && Number(citaSeleccionada.patientId) !== Number(patientId);
  const esRecurrente = evoluciones.length > 0;

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newEvo.procedimiento?.trim()) {
      setFormError('El procedimiento es obligatorio');
      return;
    }
    if (!newEvo.firmaOdontologo) {
      setFormError('Se requiere la firma del odontólogo');
      return;
    }
    if (!newEvo.firmaPaciente) {
      setFormError('Se requiere la firma del paciente');
      return;
    }
    if (!newEvo.esUrgencia && citaDeOtroPaciente) {
      setFormError('La cita seleccionada pertenece a otro paciente');
      return;
    }
    setSaving(true);
    try {
      await clinicaService.createEvolucion(historiaId, buildPayload());
      setShowForm(false);
      setNewEvo({ ...EMPTY_EVO });
      loadData();
    } catch (err) {
      setFormError(extractErrorMessage(err));
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
        <form onSubmit={handleSave} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)', marginBottom: '2.5rem', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Nueva Entrada de Evolución</h4>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Procedimiento realizado *</label>
              <textarea
                value={newEvo.procedimiento}
                onChange={e => setNewEvo({...newEvo, procedimiento: e.target.value})}
                required
                style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '120px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)', resize: 'vertical', transition: 'border-color 0.3s' }}
                placeholder="Describe el procedimiento realizado hoy..."
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
              />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Observaciones</label>
              <textarea
                value={newEvo.observaciones}
                onChange={e => setNewEvo({...newEvo, observaciones: e.target.value})}
                style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '80px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)', resize: 'vertical', transition: 'border-color 0.3s' }}
                placeholder="Observaciones de la consulta..."
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
              />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Nro. Diente</label>
              <input
                type="number"
                value={newEvo.numeroDiente}
                onChange={e => setNewEvo({...newEvo, numeroDiente: e.target.value})}
                placeholder="Ej: 16"
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Abono</label>
              <input
                type="text"
                inputMode="numeric"
                value={newEvo.abono}
                onChange={e => setNewEvo({...newEvo, abono: formatCOPInput(e.target.value)})}
                placeholder="Ej: 150.000"
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Saldo</label>
              <input
                type="text"
                inputMode="numeric"
                value={newEvo.saldo}
                onChange={e => setNewEvo({...newEvo, saldo: formatCOPInput(e.target.value)})}
                placeholder="Ej: 150.000"
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Cita de hoy {esRecurrente && !newEvo.esUrgencia ? '(requerida)' : '(opcional)'}
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                Al registrar la evolución, la cita pasará a Completada en el calendario.
              </p>              <select
                value={newEvo.citaId}
                disabled={newEvo.esUrgencia || loadingCitas}
                onChange={e => setNewEvo({...newEvo, citaId: e.target.value})}
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', background: 'var(--surface)', color: 'var(--text-main)', opacity: newEvo.esUrgencia ? 0.5 : 1 }}
              >
                <option value="">{loadingCitas ? 'Cargando citas...' : (citasHoy.length === 0 ? 'Sin citas programadas hoy' : 'Selecciona la cita...')}</option>
                {citasHoy.map((c) => (
                  <option key={c.id} value={c.id}>
                    {(c.startTime || '').slice(0, 5)} · {c.patientName || `Paciente ${c.patientId}`} · {c.title || ''}
                  </option>
                ))}
              </select>
              {citaDeOtroPaciente && !newEvo.esUrgencia && (
                <p style={{ color: '#e63946', fontSize: '0.85rem', fontWeight: 600, margin: '0.4rem 0 0 0' }}>
                  Esta cita pertenece a otro paciente
                </p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', background: 'var(--secondary-soft)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.8rem 1rem' }}>
              <input
                type="checkbox"
                checked={!!newEvo.esUrgencia}
                onChange={e => setNewEvo({...newEvo, esUrgencia: e.target.checked, citaId: e.target.checked ? '' : newEvo.citaId})}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>
                Atención por urgencia (sin cita, esperó en sala)
              </span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
             <SignatureCanvas
                onSave={(sig) => setNewEvo({...newEvo, firmaOdontologo: sig})}
                label="Firma del Odontólogo"
             />
             <SignatureCanvas
                onSave={(sig) => setNewEvo({...newEvo, firmaPaciente: sig})}
                label="Firma del Paciente"
             />
          </div>
          {(newEvo.firmaOdontologo || newEvo.firmaPaciente) && (
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
              {newEvo.firmaOdontologo && <span>Firma del odontólogo registrada</span>}
              {newEvo.firmaPaciente && <span>Firma del paciente registrada</span>}
            </div>
          )}

          {formError && <p style={{ color: '#e63946', fontWeight: 600 }}>{formError}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ width: 'auto', padding: '0.8rem 2rem', margin: 0, opacity: saving ? 0.5 : 1 }}
            >
              {saving ? 'Guardando...' : 'Registrar Evolución'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loadError && (
          <div style={{ border: '1px solid var(--accent)', background: 'rgba(230, 57, 70, 0.08)', borderRadius: '8px', padding: '0.8rem 1rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <strong style={{ color: 'var(--accent)' }}>No se pudieron cargar las evoluciones. </strong>
            {loadError}
          </div>
        )}
        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando historial...</div>}
        {evoluciones.length === 0 && !loading && !showForm && (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--surface)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            No hay evoluciones registradas para esta historia.
          </div>
        )}

        {evoluciones.slice().sort((a,b) => b.id - a.id).map((evo) => (
          <div key={evo.id} onClick={() => openDetail(evo)} style={{ cursor: 'pointer', display: 'flex', gap: '1.5rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', transition: 'border-color 0.3s' }}
               onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-light)')}
               onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          >
            <div style={{ flexShrink: 0, width: '50px', height: '50px', background: 'var(--secondary-soft)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   {formatFecha(evo.fecha)}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--secondary-soft)', color: 'var(--success)', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Procedimiento
                </span>
                {evo.esUrgencia && (
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'rgba(230, 57, 70, 0.12)', color: 'var(--accent)', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase', marginLeft: '0.5rem' }}>
                    Urgencia
                  </span>
                )}
              </div>
              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{evo.procedimiento}</p>
              {evo.observaciones && <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{evo.observaciones}</p>}
              {(evo.numeroDiente != null || evo.abono != null || evo.saldo != null || evo.citaId != null) && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {evo.numeroDiente != null && <span>Diente: {evo.numeroDiente}</span>}
                  {evo.abono != null && <span>Abono: $ {formatCOP(evo.abono)}</span>}
                  {evo.saldo != null && <span>Saldo: $ {formatCOP(evo.saldo)}</span>}
                  {evo.citaId != null && <span>Cita #{evo.citaId}</span>}
                </div>
              )}
              <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                <User size={14} /> {evo.firmaOdontologo ? 'Firmado Digitalmente por Odontólogo' : 'Sin firma registrada'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(selected || loadingDetail) && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            {loadingDetail && !selected && <p style={{ color: 'var(--text-secondary)' }}>Cargando detalle...</p>}
            {selected && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>Evolución #{selected.id}</h4>
                  <button type="button" onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{formatFecha(selected.fecha)}</p>
                {(selected.esUrgencia || selected.citaId != null) && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {selected.esUrgencia ? 'Atención por urgencia (sin cita)' : `Cita #${selected.citaId}`}
                  </p>
                )}
                <p style={{ color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.procedimiento}</p>
                {selected.observaciones && <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.observaciones}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      {selected.firmaOdontologo ? 'Firmado Digitalmente por Odontólogo' : 'Sin firma registrada'}
                    </p>
                    {toSignatureSrc(selected.firmaOdontologo) && (
                      <img src={toSignatureSrc(selected.firmaOdontologo)} alt="Firma del odontólogo" style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff' }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      {selected.firmaPaciente ? 'Firmado por el Paciente' : 'Sin firma del paciente'}
                    </p>
                    {toSignatureSrc(selected.firmaPaciente) && (
                      <img src={toSignatureSrc(selected.firmaPaciente)} alt="Firma del paciente" style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff' }} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvolucionesSection;
