# HU-4 — Exámenes Complementarios: registro de decisión

## Decisión
Nueva sección singleton `examen-complementario` entre Análisis Periodontal y
Diagnóstico, **inmutable desde su creación** (anticipa HU-2): el segundo PUT
responde 409 y no modifica el registro.

## Modelo
- Tabla `examen_complementario` (migración `V20260927_0002`): `OneToOne` a
  historia (`UNIQUE`), booleanos `NOT NULL DEFAULT FALSE`, textos `TEXT`
  nulables, auditoría `AuditFields`.
- Campos: `rxPanoramica` (check), `rxPeriapical` (check) +
  `rxPeriapicalComentario` (obligatorio si marcado), `paqueteOrtodoncia`
  (check), `otros` (check) + `otrosTexto` (obligatorio si marcado).

## Reglas
- 400: ningún checkbox marcado; comentario/texto faltante con su checkbox activo.
- PUT → 201 primera vez, 409 después. GET → 200, 204 si aún no registrado
  (mismo patrón anti-404 de consola que las demás secciones).
- Frontend: pestaña "Exám. Complementarios"; guardada → read-only con sello
  de bloqueo (fecha + profesional); vacía → formulario editable.

## regresión colateral
`AuditoriaTrazabilidadTest` falló al correr la suite completa: el POST
`/api/historias` ahora resuelve el odontólogo desde el JWT (cambio HU-5) y los
usuarios `dr_andrea`/`dr_carlos` no existían en la BD de desarrollo. Se corrige
solo el test (crea los usuarios si faltan, los borra solo si los creó).
