# Decisión de modelo: Diagnóstico e Interconsultas (CIE-10)

> Historia: **Diagnóstico: persistir descripción y código CIE-10** (5 SP)

## 1. Problema detectado

`frontend/src/views/sections/DiagnosticoTab.jsx` manejaba `{descripcion, cie10, otros}`,
pero `DiagnosticoRequest` / `DiagnosticoResponse` / entidad `Diagnostico` solo tienen
8 campos clínicos. `descripcion` y `cie10` se descartaban en silencio (Jackson ignora
propiedades desconocidas) y el odontólogo veía el check verde "Guardado" aunque solo
sobrevivía "Otros Hallazgos".

En interconsultas ocurría lo inverso: la UI capturaba y leía `especialidad`, pero
`InterconsultaRequest` / `InterconsultaResponse` / entidad `Interconsulta` solo tienen
`descripcion`. Además la lista renderizaba `new Date(i.createdAt)`, que produce
"Invalid Date" cuando el audit es nulo.

## 2. Decisión tomada

**La UI se adapta al modelo clínico de 8 campos del backend (modelo richer, ya diseñado así).
No se agregan `descripcion` ni `cie10` al backend.**

| Capa | Campos de diagnóstico |
|------|-----------------------|
| `entity/clinica/Diagnostico.java` | `dental, periodontal, pulpar, articular, tejidosBlandos, funcional, esqueleticoFacial, otros` |
| `dto/clinica/DiagnosticoRequest.java` | los mismos 8 |
| `dto/clinica/DiagnosticoResponse.java` | los mismos 8 + audit |
| `DiagnosticoTab.jsx` (nuevo) | 8 textareas: `Dental, Periodontal, Pulpar, Articular, Tejidos Blandos, Funcional, Esqueletico Facial, Otros` |

- Cada etiqueta tiene su respectivo campo de descripción; ninguno es obligatorio.
- Se mantienen "Pronóstico Profesional" (`PronosticoRequest.descripcion`) e "Interconsultas".
- **Interconsultas:** se elimina el campo `especialidad`; queda únicamente `descripcion`
  (único campo de `InterconsultaRequest/Response`).
- La lista de interconsultas ya no renderiza `new Date(i.createdAt)` directamente:
  usa `createdAt ?? updatedAt` con validación (`formatInterconsultaDate`), y no muestra
  fecha si el valor falta o es inválido. Cero "Invalid Date".

## 3. Cambios frontend (`DiagnosticoTab.jsx`)

- `useState` inicial = 8 claves (`EMPTY_DIAG`); eliminados `descripcion`, `cie10`, `especialidad`.
- `load()` mapea explícitamente: `setDiag(mapDiagnosticoToState(d.data))` en lugar de
  `setDiag(d.data)`, para no mezclar formas de 3 y 8 claves al recargar.
- `handleSaveMain()` guarda snapshot previo (`prevDiag`, `prevPron`); en `catch` revierte
  el estado, no muestra "Guardado" y presenta el error real
  (`err.response.data.message || err.message`) en `saveError`.
- `handleAddInter()` exige `descripcion` no vacía y envía solo `{descripcion}`.
- Fixtures espejo actualizados en el mismo commit:
  - `fixtures/diagnostico.json` → 8 campos.
  - `fixtures/interconsulta.json` → solo `descripcion`.

## 4. Backend

Sin cambios de modelo (ya era el correcto). Se amplió cobertura:

- `DiagnosticoServiceTest`: setup y aserciones con los 8 campos + test de round-trip
  `shouldPersistAllEightFieldsRoundTrip` (verifica que `save()` recibe los 8 valores).
- `InterconsultaServiceTest`: nuevo `shouldPersistDescripcionRoundTrip`.
- `ClinicalContractTest.contractDiagnostico` (US-13) pasa en verde con el fixture de 8 campos.
- `ClinicalContractTest.contractInterconsulta` pasa en verde con fixture solo-`descripcion`.
- `inverseContractInterconsulta` actualizado: exige `descripcion` y exige ausencia de `especialidad`.

## 5. Archivos tocados

- `frontend/src/views/sections/DiagnosticoTab.jsx`
- `backend/oraltech/src/test/resources/fixtures/diagnostico.json`
- `backend/oraltech/src/test/resources/fixtures/interconsulta.json`
- `backend/oraltech/src/test/java/co/edu/unbosque/service/clinica/DiagnosticoServiceTest.java`
- `backend/oraltech/src/test/java/co/edu/unbosque/service/clinica/InterconsultaServiceTest.java`
- `backend/oraltech/src/test/java/co/edu/unbosque/controller/clinica/contract/ClinicalContractTest.java`
- Este documento (`docs/diagnostico-modelo.md`)
