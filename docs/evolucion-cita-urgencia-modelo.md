# HU-3 — Cita obligatoria / urgencia en evoluciones: registro de decisión

## Decisión
La evolución exige trazabilidad de acceso: paciente recurrente (historia con
≥1 evolución) requiere cita del día o marca de urgencia, excluyentes.
Primera consulta: cita opcional.

## Modelo
- `evolucion_clinica.es_urgencia BOOLEAN NOT NULL DEFAULT FALSE` (migración
  `V20260927_0004`): históricos quedan en `false`. Expuesto en request,
  response y listado.
- Sin endpoint nuevo de citas: la UI usa `GET /api/appointments?start=hoy&end=hoy`
  (`getAppointmentsByRange`) y filtra/marca por paciente.

## Reglas backend (`EvolucionClinicaService.create`)
- `citaId` presente (siempre, primera o recurrente): existe (404), pertenece
  al paciente de la historia (400) y es de hoy (400).
- Recurrente: `citaId XOR esUrgencia` (400 en ambos casos inválidos, con
  mensaje; "citaId no aplica en urgencias").

## Frontend (`EvolucionesSection`)
- Checkbox "Atención por urgencia (sin cita, esperó en sala)": al marcarlo
  limpia y deshabilita el selector; al desmarcarlo lo rehabilita.
- Selector con las citas de hoy (`HH:mm · paciente · motivo`); si se elige una
  de otro paciente, error local que bloquea el guardado (el backend lo
  revalida). Etiqueta dinámica: requerida en recurrente, opcional en primera.
- Listado con sello "Urgencia" y "Cita #id"; el detalle indica la modalidad.
  Errores 400 del backend sin falso "Guardado".
- Al registrar con cita, esta pasa a `COMPLETADA` (verde `#2a9d8f` en el
  calendario de `Appointments.jsx`); las urgencias no tocan citas.

## Tests
- Servicio UT-EVO-13–18 (XOR, paciente, fecha, urgencia, primera con cita).
- Integración Postgres (3): primera libre → recurrente exige; validaciones de
  cita; columna `NOT NULL DEFAULT FALSE` en `information_schema`.
- Fixture `evolucion.json` + `esUrgencia: false` (el contrato exige claves no
  nulas; `citaId` se omite porque el payload real no lo envía vacío).
