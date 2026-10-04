import { useState, useCallback } from 'react';
import clinicaService from '../services/clinicaService';
import { getCurrentUser } from '../services/authService';

// HU-2: estado de bloqueo de una sección inmutable + desbloqueo excepcional ADMIN.
// Uso por formulario:
//   const bloqueo = useBloqueoSeccion('anamnesis');
//   - Al cargar con registro existente: bloqueo.marcarRegistrado(datos)
//   - Tras guardar OK: bloqueo.marcarGuardado()
//   - Tras 409 del backend: bloqueo.marcarConflicto()
//   - inputs deshabilitados y Guardar oculto cuando: readOnly || bloqueo.bloqueado
//   - botón "Desbloquear (ADMIN)" visible cuando: !readOnly && bloqueo.bloqueado && bloqueo.isAdmin
//   - tras desbloquear: banner "Desbloqueada por {por}: {motivo}" con bloqueo.desbloqueo
export const useBloqueoSeccion = (seccion) => {
  const [bloqueado, setBloqueado] = useState(false);
  const [desbloqueo, setDesbloqueo] = useState(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const isAdmin = getCurrentUser()?.role === 'ADMIN';

  const marcarRegistrado = useCallback((datos) => {
    if (datos && datos.id) setBloqueado(true);
  }, []);

  const marcarGuardado = useCallback(() => {
    setBloqueado(true);
    setDesbloqueo(null);
    setShowUnlock(false);
    setUnlockError('');
  }, []);

  const marcarConflicto = useCallback(() => {
    // El backend ya lo bloqueó (409): reflejarlo sin falso "Guardado".
    setBloqueado(true);
    setDesbloqueo(null);
    setShowUnlock(false);
  }, []);

  const bloquear = useCallback(() => {
    // Bloqueo directo (p. ej. al cargar una lista de odontograma no vacía).
    setBloqueado(true);
  }, []);

  const solicitar = useCallback(async (historiaId, motivo) => {
    setUnlocking(true);
    setUnlockError('');
    try {
      const res = await clinicaService.solicitarDesbloqueo(historiaId, seccion, motivo);
      setBloqueado(false);
      setDesbloqueo({ por: res.data?.solicitadoPor || '', motivo: res.data?.motivo || motivo });
      setShowUnlock(false);
      return true;
    } catch (err) {
      setUnlockError(err?.response?.data?.message || err?.message || 'No se pudo solicitar el desbloqueo');
      return false;
    } finally {
      setUnlocking(false);
    }
  }, [seccion]);

  return {
    bloqueado,
    desbloqueo,
    showUnlock,
    setShowUnlock,
    unlockError,
    unlocking,
    isAdmin,
    solicitar,
    marcarRegistrado,
    marcarGuardado,
    marcarConflicto,
    bloquear,
  };
};
