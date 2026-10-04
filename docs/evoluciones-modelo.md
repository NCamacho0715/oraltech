# Decisión de modelo: Evoluciones clínicas (procedimiento real y firmas)

> Historia: **Evoluciones clínicas: registrar y mostrar el procedimiento real** (5 SP)

## 1. Problema detectado

`frontend/src/views/sections/EvolucionesSection.jsx` enviaba `{descripcion, firmaOdontologo}`,
pero `EvolucionClinicaRequest` espera `{procedimiento, observaciones, citaId, numeroDiente,
abono, saldo, firmaPaciente, firmaOdontologo}`. **`descripcion` no mapeaba a nada**: la nota
clínica se guardaba como `procedimiento = NULL`. El listado leía `evo.descripcion` (vacío) y
`new Date(evo.createdAt)` → "Invalid Date" (`EvolucionClinicaListResponse` expone `fecha`,
que la UI nunca usaba). Solo se capturaba la firma del odontólogo, nunca la del paciente, y la
etiqueta "Firmado Digitalmente por Odontólogo" era texto hardcodeado.

## 2. Decisión tomada

**La UI captura explícitamente los campos del modelo. No se agrega `descripcion` al backend.**

| Campo | Origen | Regla |
|-------|--------|-------|
| `procedimiento` | `EvolucionClinicaRequest` | obligatorio FE + BE (400 si null/vacío) |
| `observaciones` | id. | opcional |
| `numeroDiente` | id. | opcional; 1–32 adulto / 51–85 temporal, 400 si fuera de rango |
| `abono`, `saldo` | id. | opcionales; no negativos, 400 si negativos |
| `citaId` | id. | opcional; si se envía debe ser > 0 (400) y existir en `appointments` (404) |
| `firmaPaciente`, `firmaOdontologo` | id. | se capturan ambas; validación de tamaño/Base64 existente en `HistoriaClinicaGuard` |

## 3. Cambios backend (`EvolucionClinicaService.java`)

- `create()` valida antes de guardar: procedimiento obligatorio, diente válido
  (`esDienteValido`: 1–32 o 51–85), abono/saldo no negativos, citaId positivo y existente
  (vía `AppointmentRepository.existsById`).
- Los errores usan `ResponseStatusException` con mensaje claro; `GlobalExceptionHandler`
  los expone como `{message}` para que la UI muestre el error real.
- Nueva dependencia `AppointmentRepository` (también mockeada en
  `AbstractClinicalContractTest` y `EvolucionClinicaServiceTest`).

## 4. Cambios frontend (`EvolucionesSection.jsx`)

- Formulario con `procedimiento` (requerido), `observaciones`, `numeroDiente`, `abono`,
  `saldo`, `citaId` opcional y **dos** `SignatureCanvas` (odontólogo + paciente).
  El payload solo contiene claves del modelo; ya no existe `descripcion`.
- La lista renderiza `evo.fecha` con `formatFecha()` (nunca "Invalid Date") y **no** lee
  `evo.createdAt` ni `evo.descripcion`.
- Clic en tarjeta → `getEvolucionDetail` → modal con `procedimiento`, `observaciones` y las
  **dos firmas** como imágenes `data:image/png;base64,...`.
- Etiqueta condicional: `Firmado Digitalmente por Odontólogo` solo si `firmaOdontologo`
  no es nula; si no, `Sin firma registrada` (ídem paciente). La presencia de firmas del
  detalle se propaga al listado en memoria (el `list` no expone firmas por seguridad).
- `readOnly` (historia `CERRADA`) oculta "Nueva Evolución". Defensa en capas: el backend
  ya bloquea con 409 (`guard.requireActiva`); la UI evita el intento.

## 5. Tests y fixtures

- `fixtures/evolucion.json` → payload espejo de la UI (procedimiento, observaciones,
  numeroDiente, abono, saldo, ambas firmas). `contractEvolucion` (US-03) en verde.
- `inverseContractEvolucion` actualizado: exige `procedimiento` + `fecha`, exige ausencia
  de `descripcion`.
- `EvolucionClinicaServiceTest`: UT-EVO-07 (400 procedimiento vacío), UT-EVO-08 (400
  diente fuera de rango), UT-EVO-09/10 (400 abono/saldo negativos), UT-EVO-11 (404 citaId).

## 6. Archivos tocados

- `frontend/src/views/sections/EvolucionesSection.jsx`
- `backend/.../service/clinica/EvolucionClinicaService.java`
- `backend/.../src/test/resources/fixtures/evolucion.json`
- `backend/.../service/clinica/EvolucionClinicaServiceTest.java`
- `backend/.../controller/clinica/contract/AbstractClinicalContractTest.java`
- `backend/.../controller/clinica/contract/ClinicalContractTest.java`
- Este documento (`docs/evoluciones-modelo.md`)
