# Trazabilidad de los registros clínicos (quién creó y quién modificó)

> **Historia de usuario:** *Trazabilidad: saber quién creó y modificó cada registro clínico* (8 SP)

Este documento describe cómo OralTech registra el autor y la fecha de creación y de última
modificación de cada registro clínico, qué decisiones se tomaron y cuáles son sus limitaciones.

---

## 1. Alcance

Los campos de auditoría están disponibles en **las 10 secciones clínicas de la historia** y en
la historia misma:

| # | Sección (pestaña de la UI) | Endpoint | DTO de respuesta |
|---|----------------------------|----------|------------------|
| 1 | Anamnesis | `GET/PUT /api/historias/{id}/anamnesis` | `AnamnesisResponse` |
| 2 | Antecedentes | `GET/PUT /api/historias/{id}/antecedentes` | `AntecedentesResponse` |
| 3 | Examen Clínico | `GET/PUT /api/historias/{id}/examen` | `ExamenClinicoResponse` |
| 4 | Odontograma | `GET/PUT /api/historias/{id}/odontograma` | `OdontogramaRegistroResponse` |
| 5 | Análisis Pulpar | `GET/PUT /api/historias/{id}/pulpar` | `AnalisisPulparResponse` |
| 6 | Análisis Periodontal | `GET/PUT /api/historias/{id}/periodontal` | `AnalisisPeriodontalResponse` |
| 7 | Diagnóstico | `GET/PUT /api/historias/{id}/diagnostico` | `DiagnosticoResponse` |
| 8 | Plan de Tratamiento | `GET/PUT /api/historias/{id}/plan` | `PlanTratamientoResponse` |
| 9 | Evoluciones | `GET/PUT/POST/DELETE /api/historias/{id}/evoluciones` | `EvolucionClinicaResponse`, `EvolucionClinicaListResponse` |
| 10 | Consentimiento | `GET/PUT /api/historias/{id}/consentimiento` | `ConsentimientoResponse` |
| — | Historia Clínica | `GET/POST /api/historias...` | `HistoriaClinicaResponse` |
| — | Módulos afines | — | `InterconsultaResponse`, `PronosticoResponse`, `OdontogramaProtesisResponse` |

Cada DTO expone **cuatro campos**:

```json
{
  "createdAt":  "2026-09-26T20:02:25.462067",
  "createdBy":  "dr_andrea",
  "updatedAt":  "2026-09-26T20:15:10.118042",
  "updatedBy":  "dr_carlos"
}
```

---

## 2. Cómo funciona

La auditoría la escribe **Spring Data JPA**, no el código de la aplicación:

1. **`co.edu.unbosque.config.JpaAuditingConfig`** declara
   `@EnableJpaAuditing(auditorAwareRef = "auditorAware")` y el bean `auditorAware`:
   * devuelve el `username` del principal autenticado en la petición actual
     (`SecurityContextHolder.getContext().getAuthentication().getName()`), y
   * devuelve `"sistema"` cuando no hay principal (jobs programados, carga inicial, scripts SQL).
2. **`entity/clinica/AuditFields`** es la **única fuente** de auditoría. Los campos llevan las
   anotaciones `@CreatedDate`, `@CreatedBy`, `@LastModifiedDate` y `@LastModifiedBy`.
   `createdAt`/`createdBy` conservan `updatable = false`. **Ya no existen** los callbacks
   `@PrePersist`/`@PreUpdate` manuales (coexistían con los de Spring y producían doble escritura).
3. **Cada entidad clínica** registra el listener `@EntityListeners(AuditingEntityListener.class)`,
   que es quien dispara el evento de auditoría en el ciclo de vida de JPA.
4. La escritura ocurre en el **flush/commit de la transacción**: `@PrePersist` al crear y
   `@PreUpdate` al modificar.

> **Nota:** la historia mencionaba 13 entidades con callbacks manuales; en el repositorio se
> encontraron **14** (las 14 tablas clínicas con columna `created_by`). Se limpiaron las 14.

5. **La historia clínica se "toca" cuando se guarda cualquier sección.** La línea de la UI (§3)
   muestra el audit de la tabla `historia_clinica`, y las secciones no modifican esa fila por sí
   mismas; sin más, el autor del encabezado no cambiaría nunca después de crear la historia. Por eso
   las 14 operaciones de escritura de los servicios (`upsert`/`create`/`delete`) llaman también a
   `guard.registrarActividad(historia)`, que invoca `AuditingHandler.markModified(historia)`: el
   **mismo** método que ejecuta `@PreUpdate`. Así `updatedBy`/`updatedAt` de la historia reflejan
   siempre al **último profesional que guardó cualquier sección** y los campos de auditoría siguen
   escribiéndolos Spring (nunca a mano).

### Comportamiento en *upsert*

Como la sección se guarda con `PUT` (crear o actualizar), el resultado es:

| Paso | `createdBy` | `updatedBy` |
|------|-------------|-------------|
| 1.er `PUT` (alta, dr_andrea) | `dr_andrea` | `dr_andrea` |
| 2.º `PUT` (dr_carlos) | **`dr_andrea`** (sin cambios) | `dr_carlos` |

`createdBy`/`createdAt` están marcados `updatable = false`, por lo que **nunca** se sobreescriben.

---

## 3. UI

En `frontend/src/views/ClinicalHistory.jsx`, justo debajo del título **"Historia Clínica"** y del
ID, aparece una línea discreta:

```
Última modificación: 26/9/2026, 8:15:10 p. m. · dr_carlos
```

* Muestra la fecha de **última** modificación (`updatedAt`, con `createdAt` como respaldo).
* Muestra el autor de la última modificación (`updatedBy`, con `createdBy` como respaldo).
* Cuando no hay autor registrado (registros antiguos, ver §4.1) solo se muestra la fecha.
* Refleja el audit de la **historia clínica**, que se actualiza en cada guardado de sección (§2.5):
  al editar una pestaña, guardar y recargar, la fecha y el autor cambian al profesional que guardó.

---

## 4. Limitaciones y decisiones

### 4.1 Los registros anteriores al despliegue quedan con `created_by = NULL`

**Hecho verificado en la base de datos:** las 20 filas existentes en las 14 tablas clínicas tienen
`created_by IS NULL` **y** `updated_by IS NULL`. El código anterior (`AuditFields.prePersist()`)
solo escribía `created_at`/`updated_at` y nunca el autor.

Por lo tanto:

* La trazabilidad de autoría **comienza desde la fecha de despliegue** de esta historia.
* Para las filas antiguas la UI solo puede mostrar la fecha (`createdAt`/`updatedAt` sí existen).

**Alternativa (limitación conocida, no implementada):** un *backfill* opcional con una migración
Flyway que asigne un autor histórico conocido, por ejemplo:

```sql
UPDATE historia_clinica SET created_by = 'migracion' WHERE created_by IS NULL;
-- ...ídem para las 14 tablas
```

Esto es una **estimación** (no hay registro real de quién las creó), por eso quedó fuera del
alcance; se deja documentado para decidirlo en el PR.

### 4.2 Solo se conserva el *último* autor, no el historial completo

El log disponible es el de **última modificación** (`updated_by`/`updated_at`), que se pisa en
cada escritura. **No existe** un historial de cambios (quién cambió qué valor y cuándo, ni con qué
valor anterior). Para eso se requeriría una tabla de auditoría tipo *changelog* (evento `CREATE/
UPDATE/DELETE`, campos viejos vs. nuevos) con su propia historia de usuario.

### 4.3 Escrituras fuera de una petición HTTP

Si la base se modifica desde un job programado, un script o la carga inicial, no hay principal
autenticado y el registro queda como `sistema`. Así se acordó: es mejor un valor explícito que
dejar el campo vacío.

### 4.4 La auditoría se escribe en el commit

Si una transacción se cierra **fuera** del hilo de la petición (por ejemplo, en un test con
`@Transactional` a nivel de clase), el contexto de seguridad ya no está y quedaría `sistema`. En
producción cada petición abre y cierra su propia transacción, por lo que esto no aplica. El test de
aceptación está escrito así a propósito (ver §5).

---

## 5. Prueba de aceptación

`backend/oraltech/src/test/java/co/edu/unbosque/controller/clinica/AuditoriaTrazabilidadTest.java`

| Test | Escenario | Verifica |
|------|-----------|----------|
| `alCrearHistoriaSeRegistraElCreador` | `@WithMockUser(username = "dr_andrea")` → `POST /api/historias` | `createdBy == "dr_andrea"`, `createdAt` definido y los 4 campos expuestos por el DTO |
| `segundoPutReflejaAlUltimoProfesional` | `dr_andrea` hace el 1.er `PUT` → `dr_carlos` hace el 2.º `PUT` | `updatedBy == "dr_carlos"`, `createdBy` sigue siendo `"dr_andrea"`, `updatedAt` actualizado |
| `guardarSeccionActualizaLaHistoria` | `dr_andrea` guarda una sección → `dr_carlos` guarda otra sección de la misma historia | La **historia** pasa a tener `updatedBy == "dr_carlos"` (línea de la UI) y conserva `createdBy == "dr_andrea"` |

Es una prueba de integración real (seguridad + MVC + JPA + PostgreSQL) que no usa `@Transactional`
a nivel de clase (§4.4) y limpia sus datos en `@AfterEach`.

```bash
cd backend/oraltech
./mvnw.cmd -o test -Dtest=AuditoriaTrazabilidadTest
```

### Verificación manual en base de datos

```sql
SELECT id, created_at, created_by, updated_at, updated_by
FROM diagnostico ORDER BY updated_at DESC LIMIT 5;
```

---

## 6. Archivos tocados

* **Backend**
  * `config/JpaAuditingConfig.java` *(nuevo)* — `@EnableJpaAuditing` + `auditorAware`
  * `entity/clinica/AuditFields.java` — anotaciones de Spring, sin callbacks
  * `entity/clinica/*.java` (14) — `@EntityListeners(AuditingEntityListener.class)`, sin
    `audit.prePersist()/preUpdate()`
  * `dto/clinica/*Response.java` (15) — campos `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
  * `dto/clinica/PlanTratamientoResponse.java` — `PlanItemResponse.createdAt` hereda la fecha del
    plan (los ítems no tienen auditoría propia y la UI ya leía ese campo, lo que mostraba
    "Invalid date")
  * `service/clinica/*Service.java` — mapeo de los 4 campos al construir la respuesta y, en las 14
    operaciones de escritura (9 `upsert`, 4 `create`, 1 `delete`), `guard.registrarActividad(historia)`
    junto a `guard.requireActiva(historia)` (§2.5)
  * `service/clinica/HistoriaClinicaGuard.java` — método nuevo `registrarActividad()`
* **Frontend**
  * `views/ClinicalHistory.jsx` — línea de última modificación bajo el título
* **Tests / Docs**
  * `AuditoriaTrazabilidadTest.java` *(nuevo)* — 3 pruebas de aceptación
  * `HistoriaClinicaGuardTest.java` — UT-GUARD-07 verifica que `registrarActividad` delega en el
    `AuditingHandler` de Spring
  * Este documento
