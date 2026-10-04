# Decisión de modelo: Plan de tratamiento completo

> Historia: **Plan de tratamiento: registrar y consultar planes completos** (8 SP)

## 1. Problema detectado

- `POST /plan` fallaba siempre: la UI no enviaba `odontologoId` y
  `PlanTratamientoService.create` lo usaba directo en `userRepo.findById(null)`.
- `descripcion` (nivel plan) y `prioridad` (nivel ítem) no existían en ningún DTO ni
  entidad: se descartaban en silencio. La lista pintaba `p.descripcion`,
  `p.createdAt` e `item.prioridad`, inexistentes en `PlanTratamientoResponse`.

## 2. Decisión tomada (opción del criterio: modelo con odontólogo + entradas con tarifa/total)

**El plan cumple los campos del criterio; no se agrega `prioridad` en ninguna capa.**

| Campo | Dónde vive |
|-------|------------|
| Nombre del odontólogo prescriptor | `PlanTratamiento.odontologo` → `PlanTratamientoResponse.odontologoNombre`; se resuelve del `username` autenticado (`SecurityContextHolder` → `UserRepository.findByUsername`), **ya no** del cuerpo |
| Descripción general del plan | `PlanTratamiento.descripcion` (**nueva columna** `plan_tratamiento.descripcion TEXT`) |
| Entradas de tratamiento (N) | `PlanItem.{descripcion, tarifa, total}` |
| Fecha de creación | `PlanTratamiento.fecha` (dominio) + `createdAt` (auditoría); la UI usa `fecha` con respaldo en `createdAt` |

## 3. Cambios backend

- `entity/PlanTratamiento.java`: nueva columna `descripcion`; `@JsonManagedReference` en
  `items` (corta el ciclo de serialización plan↔ítem).
- `entity/PlanItem.java`: `@EntityListeners(AuditingEntityListener)` + `@Embedded
  AuditFields` (misma auditoría que el resto del módulo); `@JsonBackReference` en `plan`.
- `dto/PlanTratamientoRequest.java`: `{descripcion, items}` — **sin** `odontologoId`.
- `dto/PlanTratamientoResponse.java`: expone `descripcion` (+ `odontologoNombre`, `fecha`,
  `createdAt`, ítems con `descripcion/tarifa/total/createdAt` heredado).
- `service/PlanTratamientoService.java`: resuelve el odontólogo del usuario autenticado
  (401 sin auth, 404 si el username no existe); valida descripción obligatoria (400),
  ítems no vacíos (400), descripción por ítem obligatoria (400) y tarifa/total no
  negativos (400). `CERRADA` sigue dando 409 con el mensaje del guard.
- Migración `V20260927_0001__add_plan_fields.sql`: `ADD COLUMN IF NOT EXISTS` con
  NULL permitido — no pierde datos existentes.

## 4. Cambios frontend (`PlanTratamientoSection.jsx`)

- Formulario: descripción general + ítems `{descripcion, tarifa, total}` (inputs numéricos
  `min=0`); sin `prioridad` ni `odontologoId`; permite quitar ítems antes de guardar.
- Errores: mensaje real del backend (`e.response.data.message`) en `formError`, sin
  `alert()` genérico.
- Lista: renderiza `descripcion`, `Prescrito por {odontologoNombre}`, `fecha` (con
  respaldo `createdAt`, cero "Invalid Date") e ítems con tarifa/total + total del plan.
  Nunca `undefined`: `items ?? []`, montos con guarda numérica.
- Modo oscuro: todos los colores fijos (`#e2e8f0`, `#f8fbff`, `#ffffff`, …) reemplazados
  por vars del tema (`--surface`, `--background`, `--border-color`, `--text-*`).

## 5. Fix colateral requerido por "13 fixtures en verde" (fuera del plan, misma familia de bug)

`ExamenClinicoForm.jsx` enviaba `patronMasticacion: BILATERAL/DERECHA/IZQUIERDA` e
`higiene: BUENA/REGULAR/MALA`, pero los enums del backend son `BILAT/DER/IZQ` y `B/R/M`:
**todo** guardado de examen devolvía 400. Se cambiaron los `value` de los `<option>` a los
códigos del enum (etiquetas visibles intactas) y `fixtures/examen.json` en consecuencia.
Historia propia pendiente si se quiere mapeo etiqueta↔código más elaborado.

## 6. Tests y fixtures

- `fixtures/plan.json` (+ `plan-tratamiento.json` sincronizado): payload espejo de la UI
  (`descripcion` + ítems con `tarifa/total`).
- `contractPlanTratamiento` reescrito: autentica `dr_plan` en el `SecurityContext`,
  espera 201, verifica mapeo 1:1 del fixture y odontólogo = usuario autenticado.
- Inversos de plan reescritos sobre los DTO de respuesta (antes fallaban por diseño).
- `PlanTratamientoServiceTest`: 201 con ítems (round-trip + captor), 404 odontólogo
  inexistente, 409 historia cerrada con mensaje exacto, 400 ítems vacíos/null, listado
  completo con todos los campos.

## 7. Archivos tocados

- `frontend/src/views/sections/PlanTratamientoSection.jsx`
- `frontend/src/views/sections/ExamenClinicoForm.jsx` (colateral §5)
- `backend/.../entity/clinica/PlanTratamiento.java`, `PlanItem.java`
- `backend/.../dto/clinica/PlanTratamientoRequest.java`, `PlanTratamientoResponse.java`
- `backend/.../service/clinica/PlanTratamientoService.java`
- `backend/.../resources/db/migration/V20260927_0001__add_plan_fields.sql` (nueva)
- `backend/.../src/test/resources/fixtures/{plan,plan-tratamiento,examen}.json`
- `backend/.../service/clinica/PlanTratamientoServiceTest.java`
- `backend/.../controller/clinica/contract/ClinicalContractTest.java`
- Este documento (`docs/plan-tratamiento-modelo.md`)
