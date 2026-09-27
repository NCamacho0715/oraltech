# Decisión: defectos de frontend del módulo de historias clínicas (5 SP)

## A. Sexo del paciente y campo de embarazo (`AntecedentesForm.jsx`)

- `loadData` único dividido en `loadAntecedentes` + `loadPatient` (bloques independientes).
- `GET antecedentes` 404 = "sin antecedentes aún" (vacío, sin error); el sexo se carga igual.
- `patientSex` inicia en `null`; "Embarazada" solo se renderiza con `sex === 'F'`.
- Fail-safe: si falla la carga del paciente → mensaje + `locked` (solo lectura), nunca se
  muestra "Embarazada" a un hombre ni se oculta a una mujer por un fallo de red.

## B. Fechas inválidas

- Las 10 secciones ya usaban helpers seguros (`formatPlanFecha`, `formatFecha`,
  `formatInterconsultaDate`, `formatFechaCorta`) sobre campos reales (`fecha`,
  `createdAt/updatedAt`); cero `new Date(<campo inexistente>)` (auditoría por grep).
- `ClinicalHistory.formatFechaHora` endurecido con `parseFechaLocal` + guarda NaN.
- Pendiente manual: recorrer las 10 pestañas y confirmar que no aparece "Invalid Date".

## C. Errores silenciosos

- Los 4 `catch` vacíos (Plan, Evoluciones, Consentimiento, Diagnóstico) ahora fijan
  `loadError` visible; lo mismo en Anamnesis, Examen, Pulpar, Periodontal y Odontograma.
- Convención: 404 en GET unitario = vacío (no error); otro fallo = banner rojo
  (`--accent`), visualmente distinto del vacío (itálica gris).
- Todos los `alert('Error al guardar…')` genéricos → mensaje real del backend
  (`err.response?.data?.message`) en texto inline (`saveError`/`formError`/`actionError`).

## D. Doble creación de historia (`ClinicalHistory.jsx`)

- Eliminada la auto-creación en 404. Sin historia → estado vacío con botón explícito
  "Crear historia clínica" (con `creating` anti-doble-clic; 409 → recarga en vez de duplicar).
- La creación canónica sigue en `PatientDetail.handleCreateHistoria` (con `hasHistoria`).
- Sin POST al montar, `React.StrictMode` ya no puede duplicar nada.
- El backend ya devolvía 409 ante duplicados (`HistoriaClinicaService.create`); ahora la UI
  también lo maneja. Pendiente manual: abrir ficha sin historia con StrictMode y navegar
  directo a `/patients/{id}/clinica`.

## E. Limpieza

- Imports eliminados: `Save` (ClinicalHistory), `Send` (DiagnosticoTab), `MessageSquare`
  (EvolucionesSection). `Lock` se conserva (icono de pestaña), `Trash2` se usa.
- `npm run lint`: cero `no-unused-vars` (catches con cuerpo, `Dashboard` sin params
  sobrantes, `PatientList`/`PatientDetail`/`BackupManager` con vars usadas, `_key` con
  `eslint-disable-next-line`). Quedan 71 avisos preexistentes de `react-hooks/*`,
  fuera del alcance de esta historia.

## Archivos tocados (solo frontend)

- `views/ClinicalHistory.jsx`, `views/PatientDetail.jsx`, `views/PatientList.jsx`,
  `views/Dashboard.jsx`, `views/BackupManager.jsx`
- `views/sections/AntecedentesForm.jsx`, `AnamnesisForm.jsx`, `ExamenClinicoForm.jsx`,
  `AnalisisPulparForm.jsx`, `AnalisisPeriodontalForm.jsx`, `OdontogramaSection.jsx`,
  `DiagnosticoTab.jsx`, `EvolucionesSection.jsx`, `PlanTratamientoSection.jsx`,
  `ConsentimientoSection.jsx`
- Este documento (`docs/frontend-historia-defectos.md`)

## Adenda: 404s esperados y borrado de pacientes

1. **Sonda sin historia (ficha del paciente):** nuevo `GET
   /api/historias/paciente/{id}/exists` (siempre 200, `{exists}`); `PatientDetail` y
   `ClinicalHistory` lo usan antes del GET real. Cero 404 en consola.
2. **Secciones sin datos:** los 9 GET singleton (anamnesis, antecedentes, examen,
   diagnóstico, pronóstico, consentimiento, pulpar, periodontal, prótesis) devuelven
   **204** cuando no hay registro en vez de 404. La UI ya trataba el cuerpo vacío como
   "vacío"; los servicios y sus tests 404 siguen intactos (el mapeo vive en el controller).
3. **Borrado de pacientes:** `DELETE /api/patients/{id}` con
   `@PreAuthorize("hasAuthority('ADMIN')")` (403 si no es admin); `PatientService`
   distingue 404 (inexistente) de 409 (tiene historia clínica) en vez del 404 genérico
   que enmascaraba la violación de FK. En la UI el botón solo existe para `role ===
   'ADMIN'` y el borrado exige modal propio donde hay que escribir `CONFIRMAR`
   (sin `window.confirm`), con mensajes reales del backend (403/409/404).
