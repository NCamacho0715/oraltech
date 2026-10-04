import React from 'react';

const BloqueoBanner = ({ bloqueo, fechaBloqueo, createdBy }) => {
  if (!bloqueo) return null;

  if (bloqueo.bloqueado) {
    return (
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
        Registro bloqueado
        {fechaBloqueo ? ` · ${fechaBloqueo}` : ''}
        {createdBy ? ` · ${createdBy}` : ''}
      </p>
    );
  }

  if (bloqueo.desbloqueo) {
    return (
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
        Desbloqueada por {bloqueo.desbloqueo.por}: {bloqueo.desbloqueo.motivo}
      </p>
    );
  }

  return null;
};

export default BloqueoBanner;
