# HU-2 — Secciones inmutables con desbloqueo ADMIN: registro de decisión

## Decisión
Las 10 secciones singleton pasan a crear-una-vez: el segundo PUT/POST sin
desbloqueo vigente responde 409 ("{Sección} ya registrada y bloqueada").
Secciones: anamnesis, antecedentes, examen, pulpar, periodontal,
complementario (HU-4), diagnostico, pronostico, consentimiento, protesis.
Mutables sin cambios: interconsultas (solo crear/listar), plan, evoluciones
(append-only). Odontograma-registros: append-only; se eliminó el DELETE
(servicio, controller, UI y tests).

## Desbloqueo excepcional (un solo uso)
- `POST /api/historias/{id}/{seccion}/desbloqueo` solo ADMIN
  (`@PreAuthorize("hasAuthority('ADMIN')"`) → 201; otro rol → 403 con mensaje
  (nuevo handler `AccessDeniedException` en `GlobalExceptionHandler`).
- Motivo obligatorio ≥10 caracteres → 400; sección desconocida → 400;
  historia inexistente → 404.
- Cada servicio singleton llama `DesbloqueoService.consumirSiVigente()`: sin
  desbloqueo vigente → 409; con desbloqueo → edita una vez y lo marca
  `usado=true`. El siguiente PUT vuelve a 409 (re-bloqueo automático).
- Auditoría en `desbloqueo_seccion` (migración `V20260927_0003`): historia,
  sección, motivo, `usado`, `createdBy/createdAt` = admin. Las filas nunca se
  editan ni borran (el cleanup de tests las borra primero por la FK).
- `updatedBy/updatedAt` de la sección quedan a nombre de quien guardó tras el
  desbloqueo (auditoría JPA estándar, sin código extra).

## Frontend
Hook compartido `useBloqueoSeccion` + `DesbloqueoModal` (modal propio, sin
`window.confirm`): sección guardada → read-only con "Registro bloqueado";
desbloqueo → "Desbloqueada por {admin}: {motivo}" y Guardar una vez; botón
solo visible con `role === 'ADMIN'`. Diagnóstico maneja dos bloqueos
independientes (diagnostico/pronostico) con guardado secuencial;
interconsultas siempre operables. Odontograma: con hallazgos la cuadrícula
queda read-only (el componente ya soportaba `readOnly`) con sello de bloqueo
y desbloqueo propio; la cuadrícula es responsive (dientes fluidos con
`minmax(0,1fr)` + scroll horizontal solo bajo 560/380px).

## Endurecimientos posteriores
- Odontograma: gracia de llenado inicial — hallazgos libres mientras la
  historia no tenga evoluciones; con atención en curso, cada hallazgo exige y
  consume un desbloqueo ADMIN (`existsByHistoriaClinicaId` en ambos
  repositorios). La UI bloquea preventivo solo con hallazgos + evoluciones y
  avisa "se bloqueará al registrar evoluciones" durante la gracia.
- Sin acumulación: `solicitar()` responde 409 si ya hay un desbloqueo vigente
  ("Úselo antes de solicitar otro"); el un-solo-uso es estricto en cadena.

## Regresiones asumidas y adaptadas
- `AuditoriaTrazabilidadTest` (doble PUT) → reescrito al flujo
  PUT → 409 → desbloqueo → PUT → 409, conservando las aserciones de
  createdBy/updatedBy. Su cleanup ahora borra desbloqueos primero.
- Tests "actualizar preexistente" (9 servicios) → convertidos a tests 409.
- Tests del DELETE de odontograma → eliminados.
