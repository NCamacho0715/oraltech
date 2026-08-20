# PLAN DE PRUEBAS UNITARIAS DEL BACKEND - ORALTECH

## 1. INTRODUCCIÓN Y OBJETIVOS

### 1.1 Propósito
Este documento establece el plan integral de **pruebas unitarias para el backend** del sistema **OralTech** (Spring Boot 3 + Java 17). Su propósito es definir la estrategia, el alcance exhaustivo clase por clase, la matriz de casos de prueba y los criterios de aceptación necesarios para garantizar una **cobertura de código superior al 70%** (medida mediante **JaCoCo**), asegurando la confiabilidad, integridad y mantenibilidad de la lógica del negocio.

### 1.2 Objetivos de Calidad
- **Meta de Cobertura Global JaCoCo**: $\ge$ 70% de cobertura en instrucciones y líneas en el backend.
- **Cobertura en Capa Service (Lógica de Negocio)**: $\ge$ 85% de líneas y ramas de decisión.
- **Cobertura en Capa Controller (Web Unit)**: $\ge$ 75% de líneas.
- **Cobertura en Seguridad y Manejo de Errores**: $\ge$ 80% de líneas.
- **Aislamiento Total**: El 100% de las pruebas unitarias deben ejecutarse de forma determinista y en milisegundos, utilizando dobles de prueba (**Mocks** con Mockito) sin levantar bases de datos externas ni contextos pesados de Spring.

---

## 2. ESTRATEGIA Y ARQUITECTURA DE PRUEBAS UNITARIAS

### 2.1 Principios de Diseño
1. **Patrón AAA (Arrange - Act - Assert / Given - When - Then)**: Cada caso de prueba debe estructurar claramente la preparación del escenario, la invocación del método bajo prueba y las aserciones de salida y efectos secundarios.
2. **Aislamiento de Dependencias**: Repositorios (`*Repository`), servicios externos (`EmailService`), componentes de seguridad (`JwtService`, `AuthenticationManager`, `PasswordEncoder`) deben ser simulados mediante `@Mock`, inyectándose en el componente bajo prueba con `@InjectMocks`.
3. **Pruebas de Controladores**: Enfoque de pruebas unitarias puras o mediante `MockMvcBuilders.standaloneSetup()` para verificar códigos de estado HTTP, mapeo de endpoints y serialización sin requerir el servidor embebido ni la base de datos física.
4. **Verificación Estricta de Interacciones**: Comprobar no solo los valores de retorno, sino también que los métodos clave de persistencia o notificación sean llamados el número exacto de veces (`times(1)`) o nunca (`never()`) en rutas de excepción.

### 2.2 Estrategia para Superar el 70% de Cobertura en JaCoCo
Para superar con certeza el 70% de cobertura global, el plan abarca todas las clases con lógica ejecutable del backend:
- **6 Servicios del Core**: `PatientService`, `AppointmentService`, `AuthService`, `DashboardService`, `EmailService`, `AppointmentReminderScheduler`.
- **15 Servicios del Módulo Clínico**: `HistoriaClinicaGuard`, `HistoriaClinicaService`, `AntecedentesService`, `AnalisisPeriodontalService`, `AnalisisPulparService`, `AnamnesisService`, `ConsentimientoService`, `DiagnosticoService`, `EvolucionClinicaService`, `ExamenClinicoService`, `InterconsultaService`, `OdontogramaProtesisService`, `OdontogramaService`, `PlanTratamientoService`, `PronosticoService`.
- **Componentes de Seguridad y Excepciones**: `JwtService`, `JwtAuthenticationFilter`, `GlobalExceptionHandler`.
- **Controladores REST**: `PatientController`, `AppointmentController`, `AuthController`, `DashboardController`, `HistoriaClinicaController` y los controladores de submódulos clínicos.

---

## 3. CATÁLOGO DETALLADO DE CASOS DE PRUEBA UNITARIOS

### 3.1 Servicios del Core del Negocio

#### 3.1.1 `PatientService`
- **Componente**: `co.edu.unbosque.service.PatientService`
- **Dependencias a simular**: `PatientRepository`

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada Simulados | Resultado Esperado y Verificaciones |
| :--- | :--- | :--- | :--- | :--- |
| **UT-PAT-01** | `getAllPatients` | Consulta general de pacientes con registros existentes | Repositorio retorna lista de 2 pacientes | Retorna lista con 2 elementos; se verifica una invocación a `findAll()`. |
| **UT-PAT-02** | `getAllPatients` | Consulta general cuando la base de datos está vacía | Repositorio retorna lista vacía | Retorna lista vacía sin errores. |
| **UT-PAT-03** | `getPatientById` | Paciente encontrado por ID existente | ID = 1L; repositorio retorna `Optional.of(paciente)` | Retorna `Optional` con el paciente correspondiente. |
| **UT-PAT-04** | `getPatientById` | Paciente no encontrado por ID inexistente | ID = 99L; repositorio retorna `Optional.empty()` | Retorna `Optional.empty()`. |
| **UT-PAT-05** | `getPatientByIdNumber` | Paciente encontrado por número de documento | Documento = "10203040"; repositorio retorna `Optional.of(paciente)` | Retorna `Optional` con los datos del paciente. |
| **UT-PAT-06** | `getPatientByIdNumber` | Paciente no encontrado por número de documento | Documento = "00000000"; repositorio retorna `Optional.empty()` | Retorna `Optional.empty()`. |
| **UT-PAT-07** | `createPatient` | Registro exitoso de paciente con documento nuevo | Documento = "10203040"; `existsByIdNumber` retorna `false` | Retorna el paciente guardado; se verifica invocación a `save()`. |
| **UT-PAT-08** | `createPatient` | Intento de registro con documento duplicado | Documento = "10203040"; `existsByIdNumber` retorna `true` | Lanza `RuntimeException` ("Patient with this ID number already exists"); `save()` nunca es invocado. |
| **UT-PAT-09** | `updatePatient` | Actualización exitosa de todos los campos de un paciente existente | ID = 1L; `findById` retorna paciente existente; nuevos datos suministrados | Se actualizan todos los campos personales y de contacto; `save()` persiste los cambios y retorna la entidad actualizada. |
| **UT-PAT-10** | `updatePatient` | Actualización sobre un paciente que no existe | ID = 99L; `findById` retorna `Optional.empty()` | Lanza `RuntimeException` ("Patient not found"); `save()` nunca es invocado. |
| **UT-PAT-11** | `deletePatient` | Eliminación exitosa de paciente existente | ID = 1L; `findById` retorna paciente existente | Invoca `delete(paciente)` en el repositorio. |
| **UT-PAT-12** | `deletePatient` | Eliminación de paciente inexistente | ID = 99L; `findById` retorna `Optional.empty()` | Lanza `RuntimeException` ("Patient not found"); `delete()` nunca es invocado. |

---

#### 3.1.2 `AppointmentService`
- **Componente**: `co.edu.unbosque.service.AppointmentService`
- **Dependencias a simular**: `AppointmentRepository`, `PatientRepository`, `EmailService`

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada Simulados | Resultado Esperado y Verificaciones |
| :--- | :--- | :--- | :--- | :--- |
| **UT-APP-01** | `getAppointmentsByRange` | Consulta de citas en un rango de fechas con resultados | Fechas inicio y fin válidas; repositorio retorna lista de 2 citas | Retorna lista transformada a DTOs de respuesta; verifica mapeo correcto del nombre completo del paciente. |
| **UT-APP-02** | `getAppointmentsByPatient` | Consulta del histórico de citas de un paciente | ID paciente = 10L; repositorio retorna lista de citas | Retorna lista de DTOs ordenados descendientemente. |
| **UT-APP-03** | `createAppointment` | Creación exitosa de cita sin solapamiento horario | Paciente existe; repositorio de conflictos retorna lista vacía | Cita guardada con estado por defecto "PENDIENTE"; se envía correo vía `emailService.sendConfirmationEmail()`; retorna DTO de respuesta. |
| **UT-APP-04** | `createAppointment` | Creación de cita con estado explícito personalizado | Estado = "CONFIRMADA"; sin conflictos | Cita guardada con estado "CONFIRMADA". |
| **UT-APP-05** | `createAppointment` | Creación de cita para paciente inexistente | ID paciente = 999L; `patientRepository.findById` retorna vacío | Lanza `IllegalArgumentException` ("Paciente no encontrado"); no se valida conflicto ni se guarda ni se envía correo. |
| **UT-APP-06** | `createAppointment` | Creación de cita con horario solapado con otra cita existente | Mismo día y rango de horas solapado; repositorio retorna conflicto | Lanza `IllegalStateException` ("Ya existe una cita en ese horario."); `save()` y `sendConfirmationEmail()` nunca son invocados. |
| **UT-APP-07** | `updateAppointment` | Modificación exitosa de fecha, horario y notas de cita existente | ID cita = 5L; cita existe; paciente existe; sin conflictos con otras citas (excluyendo la misma cita) | Cita actualizada y guardada; retorna DTO con los nuevos datos. |
| **UT-APP-08** | `updateAppointment` | Modificación de cita inexistente | ID cita = 999L; `appointmentRepository.findById` retorna vacío | Lanza `IllegalArgumentException` ("Cita no encontrada"). |
| **UT-APP-09** | `updateAppointment` | Modificación de cita asignándole un paciente inexistente | Cita existe; nuevo ID paciente inexistente | Lanza `IllegalArgumentException` ("Paciente no encontrado"). |
| **UT-APP-10** | `updateAppointment` | Modificación de horario generando conflicto con otra cita | Cita existe; nuevo horario colisiona con otra cita registrada | Lanza `IllegalStateException` ("Ya existe una cita en ese horario."); no se guarda. |
| **UT-APP-11** | `deleteAppointment` | Eliminación exitosa de cita existente | ID cita = 5L; `existsById` retorna `true` | Invoca `deleteById(5L)`. |
| **UT-APP-12** | `deleteAppointment` | Eliminación de cita inexistente | ID cita = 999L; `existsById` retorna `false` | Lanza `IllegalArgumentException` ("Cita no encontrada"); `deleteById()` nunca es invocado. |
| **UT-APP-13** | `countToday` | Conteo de citas programadas para el día actual | Repositorio retorna 7 | Retorna valor numérico 7. |

---

#### 3.1.3 `AuthService`
- **Componente**: `co.edu.unbosque.service.AuthService`
- **Dependencias a simular**: `UserRepository`, `PasswordEncoder`, `JwtService`, `AuthenticationManager`

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada Simulados | Resultado Esperado y Verificaciones |
| :--- | :--- | :--- | :--- | :--- |
| **UT-AUTH-01** | `register` | Registro exitoso de nuevo usuario con rol asignado | `RegisterRequest` válido; username y email no existen; `PasswordEncoder` retorna hash; `JwtService` retorna token | Usuario guardado en base de datos; retorna `AuthenticationResponse` con token, username y rol correspondiente. |
| **UT-AUTH-02** | `register` | Intento de registro con nombre de usuario duplicado | `existsByUsername` retorna `true` | Lanza `RuntimeException` ("Username already exists"); contraseña no se encripta ni se persiste usuario. |
| **UT-AUTH-03** | `register` | Intento de registro con correo electrónico duplicado | `existsByUsername` es `false`; `existsByEmail` retorna `true` | Lanza `RuntimeException` ("Email already exists"); no se persiste usuario. |
| **UT-AUTH-04** | `authenticate` | Autenticación exitosa con credenciales válidas | `AuthenticationRequest` con usuario y clave correctos; `AuthenticationManager` valida con éxito; `findByUsername` retorna entidad | Retorna `AuthenticationResponse` con token JWT válido y rol. |
| **UT-AUTH-05** | `authenticate` | Autenticación fallida por usuario inexistente post-validación | `AuthenticationManager` pasa pero `findByUsername` retorna `Optional.empty()` | Lanza `RuntimeException` ("User not found"). |
| **UT-AUTH-06** | `authenticate` | Autenticación fallida por clave errónea | `AuthenticationManager` lanza `BadCredentialsException` | La excepción se propaga adecuadamente para manejo en la capa web. |

---

#### 3.1.4 `DashboardService`
- **Componente**: `co.edu.unbosque.service.DashboardService`
- **Dependencias a simular**: `PatientRepository`, `HistoriaClinicaRepository`, `AppointmentRepository`

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada Simulados | Resultado Esperado y Verificaciones |
| :--- | :--- | :--- | :--- | :--- |
| **UT-DASH-01** | `getStats` | Cálculo consolidado de métricas del dashboard | `patientRepository.count()` = 120; `historiaRepo.count()` = 95; `appointmentRepository.countByAppointmentDate(hoy)` = 8 | Retorna objeto `DashboardStats` con totalPatients = 120, totalClinicalHistories = 95, appointmentsToday = 8. |

---

#### 3.1.5 `EmailService`
- **Componente**: `co.edu.unbosque.service.EmailService`
- **Dependencias a simular**: `JavaMailSender`

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada Simulados | Resultado Esperado y Verificaciones |
| :--- | :--- | :--- | :--- | :--- |
| **UT-MAIL-01** | `sendConfirmationEmail` | Envío exitoso de correo de confirmación de cita | Cita válida con paciente con correo asignado | Se crea mensaje MIME con asunto y destinatario correctos; se verifica invocación a `mailSender.send()`. |
| **UT-MAIL-02** | `sendConfirmationEmail` | Paciente sin correo configurado | Cita con paciente con `email = null` o vacío | No se intenta enviar correo ni se producen excepciones no controladas. |
| **UT-MAIL-03** | `sendConfirmationEmail` | Error al enviar correo por fallo de servidor SMTP | `mailSender.send()` lanza `MailException` | El servicio captura el error y registra log de advertencia sin romper la transacción de la cita. |
| **UT-MAIL-04** | `sendReminderEmail` | Envío exitoso de recordatorio de cita programada | Cita válida para el día siguiente | Se envía correo de recordatorio con formato HTML adecuado. |

---

#### 3.1.6 `AppointmentReminderScheduler`
- **Componente**: `co.edu.unbosque.service.AppointmentReminderScheduler`
- **Dependencias a simular**: `AppointmentRepository`, `EmailService`

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada Simulados | Resultado Esperado y Verificaciones |
| :--- | :--- | :--- | :--- | :--- |
| **UT-SCHED-01** | `sendDailyReminders` | Ejecución diaria con citas pendientes y confirmadas | Repositorio retorna 3 citas (2 con estado "PENDIENTE", 1 con estado "CONFIRMADA") para el día siguiente | Se invoca `emailService.sendReminderEmail()` exactamente 3 veces. |
| **UT-SCHED-02** | `sendDailyReminders` | Exclusión de citas con estado cancelado | Repositorio retorna 2 citas (1 "PENDIENTE", 1 "CANCELADA") | Se invoca `sendReminderEmail()` únicamente 1 vez (excluyendo la cita cancelada). |
| **UT-SCHED-03** | `sendDailyReminders` | Ejecución en día sin citas programadas | Repositorio retorna lista vacía | No se realizan llamadas a `sendReminderEmail()`. |

---

### 3.2 Componente Guardián de Historias Clínicas (`HistoriaClinicaGuard`)

- **Componente**: `co.edu.unbosque.service.clinica.HistoriaClinicaGuard`
- **Dependencias**: Ninguna (Componente de lógica pura)

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada Simulados | Resultado Esperado y Verificaciones |
| :--- | :--- | :--- | :--- | :--- |
| **UT-GUARD-01** | `requireActiva` | Verificación de historia en estado ACTIVA | `HistoriaClinica` con estado `EstadoHistoria.ACTIVA` | Ejecución exitosa sin lanzar excepciones. |
| **UT-GUARD-02** | `requireActiva` | Intento de modificación sobre historia CERRADA | `HistoriaClinica` con estado `EstadoHistoria.CERRADA` | Lanza `ResponseStatusException` con código `HttpStatus.CONFLICT` (409) y mensaje "La historia clínica está cerrada y no permite modificaciones". |
| **UT-GUARD-03** | `validateSignatureSize` | Firma nula o en blanco | Firma = `null` o `""` | Ejecución exitosa sin lanzar excepciones. |
| **UT-GUARD-04** | `validateSignatureSize` | Firma en Base64 válida con tamaño menor a 200KB | String Base64 válido de 50KB | Ejecución exitosa sin lanzar excepciones. |
| **UT-GUARD-05** | `validateSignatureSize` | Firma en Base64 que supera el límite de 200KB | String Base64 válido decodificable a más de 204.800 bytes | Lanza `ResponseStatusException` con código `HttpStatus.BAD_REQUEST` (400) indicando exceso de tamaño. |
| **UT-GUARD-06** | `validateSignatureSize` | Cadena no válida en formato Base64 | String = "esto-no-es-base64-valido!!!" | Lanza `ResponseStatusException` con código `HttpStatus.BAD_REQUEST` (400) indicando formato inválido. |

---

### 3.3 Servicios del Módulo Clínico

#### 3.3.1 `HistoriaClinicaService`
- **Componente**: `co.edu.unbosque.service.clinica.HistoriaClinicaService`
- **Dependencias a simular**: `HistoriaClinicaRepository`, `PatientRepository`, `UserRepository`

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada Simulados | Resultado Esperado y Verificaciones |
| :--- | :--- | :--- | :--- | :--- |
| **UT-HC-01** | `create` | Creación exitosa de historia clínica para paciente sin historia previa | `existsByPacienteId` retorna `false`; paciente existe; odontólogo existe | Historia creada con estado `ACTIVA`; guardada en repositorio; retorna DTO con datos completos. |
| **UT-HC-02** | `create` | Intento de creación para paciente que ya tiene historia clínica | `existsByPacienteId` retorna `true` | Lanza `ResponseStatusException` (409 Conflict: "Ya existe una historia clínica para este paciente"). |
| **UT-HC-03** | `create` | Creación con ID de paciente inexistente | `existsByPacienteId` es `false`; `patientRepo.findById` retorna vacío | Lanza `ResponseStatusException` (404 Not Found: "Paciente no encontrado"). |
| **UT-HC-04** | `create` | Creación con ID de odontólogo inexistente | Paciente existe; `userRepo.findById` retorna vacío | Lanza `ResponseStatusException` (404 Not Found: "Odontólogo no encontrado"). |
| **UT-HC-05** | `getById` | Consulta por UUID existente | UUID válido; repositorio retorna historia | Retorna DTO de respuesta con mapeo de paciente y odontólogo. |
| **UT-HC-06** | `getById` | Consulta por UUID inexistente | UUID aleatorio; repositorio retorna vacío | Lanza `ResponseStatusException` (404 Not Found: "Historia clínica no encontrada"). |
| **UT-HC-07** | `getByPacienteId` | Consulta por ID de paciente con historia registrada | ID paciente = 5L; repositorio retorna historia | Retorna DTO de respuesta. |
| **UT-HC-08** | `getByPacienteId` | Consulta por ID de paciente sin historia | ID paciente = 99L; repositorio retorna vacío | Lanza `ResponseStatusException` (404 Not Found). |
| **UT-HC-09** | `findOrThrow` | Búsqueda interna de entidad existente | UUID válido | Retorna la entidad `HistoriaClinica`. |
| **UT-HC-10** | `findOrThrow` | Búsqueda interna de entidad inexistente | UUID inexistente | Lanza `ResponseStatusException` (404 Not Found). |

---

#### 3.3.2 Servicios Clínicos con Patrón Upsert / Get (`Antecedentes`, `AnalisisPeriodontal`, `AnalisisPulpar`, `Anamnesis`, `Diagnostico`, `ExamenClinico`, `Interconsulta`, `OdontogramaProtesis`, `Pronostico`)

Para cada uno de estos 9 servicios clínicos dependientes de `HistoriaClinicaService` y `HistoriaClinicaGuard`, se aplican los siguientes casos de prueba estandarizados:

| ID Caso Base | Método Bajo Prueba | Escenario / Condición | Datos Simulados | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **UT-CLN-UP-01** | `upsert` | Creación de nuevo registro clínico cuando no existía previo | Historia existe y está ACTIVA; `repo.findByHistoriaClinicaId` retorna vacío | Se crea nueva entidad asociada a la historia; se pueblan todos los campos; se invoca `save()`; retorna DTO. |
| **UT-CLN-UP-02** | `upsert` | Actualización de registro clínico preexistente | Historia existe y está ACTIVA; `repo.findByHistoriaClinicaId` retorna entidad previa | Se modifican los valores de la entidad existente; se invoca `save()`; retorna DTO actualizado. |
| **UT-CLN-UP-03** | `upsert` | Intento de modificación cuando la historia clínica está CERRADA | `guard.requireActiva()` lanza 409 Conflict | Se propaga la excepción 409 Conflict; `save()` nunca es invocado. |
| **UT-CLN-UP-04** | `upsert` | Historia clínica no encontrada por UUID | `historiaService.findOrThrow()` lanza 404 Not Found | Se propaga la excepción 404 Not Found. |
| **UT-CLN-GET-01** | `get` | Consulta de registro clínico existente para la historia | `repo.findByHistoriaClinicaId` retorna entidad | Retorna DTO con todos los datos clínicos poblados. |
| **UT-CLN-GET-02** | `get` | Consulta de registro clínico cuando aún no se ha diligenciado | `repo.findByHistoriaClinicaId` retorna vacío | Retorna DTO vacío por defecto sin producir errores. |

*Casos específicos aplicables por servicio:*
- **`ConsentimientoService`**:
  - **UT-CONS-01**: `upsert` valida la firma del paciente y firma del profesional mediante `guard.validateSignatureSize()`.
  - **UT-CONS-02**: `upsert` rechaza firmas en Base64 que exceden 200KB o con formato corrupto.
- **`AntecedentesService`**:
  - **UT-ANTE-01**: `upsert` cubre mapeo exhaustivo de todos los antecedentes médicos y odontológicos (alergias, diabetes, hipertensión, hemorragias, medicación actual, etc.).

---

#### 3.3.3 Servicios Clínicos con Patrón Colección / CRUD (`EvolucionClinicaService`, `OdontogramaService`, `PlanTratamientoService`)

#### `EvolucionClinicaService`
- **Dependencias**: `EvolucionClinicaRepository`, `HistoriaClinicaService`, `HistoriaClinicaGuard`
- **Casos de Prueba**:
  - **UT-EVO-01**: `create` exitoso cuando la historia está ACTIVA -> Persiste evolución con fecha/hora y notas; retorna DTO.
  - **UT-EVO-02**: `create` rechazado si la historia está CERRADA -> Lanza 409 Conflict.
  - **UT-EVO-03**: `list` retorna lista de evoluciones ordenadas para una historia clínica válida.
  - **UT-EVO-04**: `delete` exitoso de evolución perteneciente a la historia activa -> Invoca `delete()`.
  - **UT-EVO-05**: `delete` falla si la evolución no pertenece al `historiaId` indicado -> Lanza 400 Bad Request.
  - **UT-EVO-06**: `delete` falla si la evolución no existe -> Lanza 404 Not Found.

#### `OdontogramaService`
- **Dependencias**: `OdontogramaRegistroRepository`, `EvolucionClinicaRepository`, `HistoriaClinicaService`, `HistoriaClinicaGuard`
- **Casos de Prueba**:
  - **UT-ODON-01**: `create` exitoso de hallazgo en odontograma con tipo de evento y estado válidos (ej. "CARIES", "ACTIVO") -> Se guarda y retorna DTO.
  - **UT-ODON-02**: `create` con vinculación opcional a una evolución existente -> Verifica asociación de la evolución.
  - **UT-ODON-03**: `create` con `evolucionId` inexistente -> Lanza 404 Not Found ("Evolución no encontrada").
  - **UT-ODON-04**: `create` con tipo de evento inválido en enum -> Lanza 400 Bad Request ("Tipo de evento inválido").
  - **UT-ODON-05**: `create` con estado de evento inválido -> Lanza 400 Bad Request ("Estado inválido").
  - **UT-ODON-06**: `create` rechazado en historia CERRADA -> Lanza 409 Conflict.
  - **UT-ODON-07**: `list` retorna lista completa de registros del odontograma para la historia.
  - **UT-ODON-08**: `delete` exitoso de registro perteneciente a la historia -> Invoca `delete()`.
  - **UT-ODON-09**: `delete` de registro que pertenece a otra historia -> Lanza 400 Bad Request ("El registro no pertenece a esta historia").
  - **UT-ODON-10**: `delete` de registro inexistente -> Lanza 404 Not Found.

#### `PlanTratamientoService`
- **Dependencias**: `PlanTratamientoRepository`, `HistoriaClinicaService`, `HistoriaClinicaGuard`
- **Casos de Prueba**:
  - **UT-PLAN-01**: `create` exitoso de ítem de tratamiento con procedimiento, costo y fase -> Se persiste y retorna DTO.
  - **UT-PLAN-02**: `create` rechazado en historia CERRADA -> Lanza 409 Conflict.
  - **UT-PLAN-03**: `list` retorna lista de tratamientos planificados para la historia.
  - **UT-PLAN-04**: `updateEstado` exitoso cambiando estado de tratamiento (ej. "REALIZADO") en historia activa -> Guarda y retorna DTO.
  - **UT-PLAN-05**: `delete` exitoso de ítem de tratamiento -> Invoca `delete()`.
  - **UT-PLAN-06**: `delete` de ítem inexistente o no perteneciente a la historia -> Lanza 404/400.

---

### 3.4 Seguridad, Filtros y Manejo Global de Excepciones

#### 3.4.1 `JwtService`
- **Componente**: `co.edu.unbosque.security.JwtService`
- **Dependencias**: Ninguna (Lógica criptográfica JWT)

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **UT-JWT-01** | `generateToken` | Generación de token JWT estándar para un `UserDetails` | Usuario "dr_andrea" | Retorna token firmado no nulo y no vacío. |
| **UT-JWT-02** | `extractUsername` | Extracción correcta del username desde el token generado | Token válido de "dr_andrea" | Retorna "dr_andrea". |
| **UT-JWT-03** | `isTokenValid` | Validación exitosa de token con el usuario emisor | Token válido y `UserDetails` con mismo username | Retorna `true`. |
| **UT-JWT-04** | `isTokenValid` | Validación de token contra un usuario diferente | Token de "dr_andrea" y `UserDetails` de "dr_carlos" | Retorna `false`. |
| **UT-JWT-05** | `isTokenValid` | Validación de token expirado | Token configurado con tiempo de expiración en el pasado | Lanza excepción de expiración o retorna `false`. |

---

#### 3.4.2 `JwtAuthenticationFilter`
- **Componente**: `co.edu.unbosque.security.JwtAuthenticationFilter`
- **Dependencias a simular**: `JwtService`, `UserDetailsService`, `HttpServletRequest`, `HttpServletResponse`, `FilterChain`

| ID Caso | Método Bajo Prueba | Escenario / Condición | Datos de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **UT-FILT-01** | `doFilterInternal` | Petición sin cabecera `Authorization` | Request sin header | Continúa la cadena de filtros sin autenticar en `SecurityContextHolder`. |
| **UT-FILT-02** | `doFilterInternal` | Petición con cabecera `Authorization` que no inicia con "Bearer " | Header = "Basic 12345" | Continúa la cadena de filtros sin autenticar. |
| **UT-FILT-03** | `doFilterInternal` | Petición con Token JWT válido | Header = "Bearer token_valido"; `jwtService.isTokenValid` = `true` | Carga `UserDetails` y establece autenticación `UsernamePasswordAuthenticationToken` en el contexto de seguridad. |
| **UT-FILT-04** | `doFilterInternal` | Petición con Token JWT inválido o expirado | Header = "Bearer token_invalido"; `jwtService.isTokenValid` = `false` | No establece autenticación y continúa la cadena de filtros. |

---

#### 3.4.3 `GlobalExceptionHandler`
- **Componente**: `co.edu.unbosque.exception.GlobalExceptionHandler`
- **Dependencias**: Ninguna

| ID Caso | Método Bajo Prueba | Escenario / Condición | Excepción Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **UT-EX-01** | `handleResponseStatusException` | Manejo de excepción con código HTTP específico y razón | `ResponseStatusException(HttpStatus.NOT_FOUND, "No encontrado")` | Retorna `ResponseEntity` con status 404 y body `{"message": "No encontrado"}`. |
| **UT-EX-02** | `handleResponseStatusException` | Manejo de excepción con razón nula | `ResponseStatusException(HttpStatus.BAD_REQUEST, null)` | Retorna `ResponseEntity` con status 400 y body `{"message": "Error"}`. |
| **UT-EX-03** | `handleRuntimeException` | Manejo de excepción genérica de negocio en tiempo de ejecución | `RuntimeException("Datos inválidos")` | Retorna `ResponseEntity` con status 400 Bad Request y body `{"message": "Datos inválidos"}`. |
| **UT-EX-04** | `handleBadCredentials` | Manejo de error de credenciales incorrectas | `BadCredentialsException("Bad credentials")` | Retorna `ResponseEntity` con status 401 Unauthorized y body `{"message": "Credenciales inválidas"}`. |

---

### 3.5 Controladores REST (Pruebas Unitarias de Capa Web)

Las pruebas unitarias de los controladores validan que cada endpoint invoque al servicio correspondiente y retorne el código HTTP y formato correctos:

| ID Caso | Controlador | Método / Endpoint | Escenario | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **UT-CTRL-01** | `PatientController` | `GET /api/patients` | Servicio retorna lista de pacientes | Retorna HTTP 200 OK con la lista de pacientes. |
| **UT-CTRL-02** | `PatientController` | `GET /api/patients/{id}` | Paciente encontrado | Retorna HTTP 200 OK con el paciente. |
| **UT-CTRL-03** | `PatientController` | `GET /api/patients/{id}` | Paciente no encontrado (retorna empty) | Retorna HTTP 404 Not Found. |
| **UT-CTRL-04** | `PatientController` | `POST /api/patients` | Creación exitosa | Retorna HTTP 200 OK con el paciente creado. |
| **UT-CTRL-05** | `PatientController` | `PUT /api/patients/{id}` | Actualización exitosa | Retorna HTTP 200 OK con el paciente modificado. |
| **UT-CTRL-06** | `PatientController` | `PUT /api/patients/{id}` | Actualización lanza `RuntimeException` | Retorna HTTP 404 Not Found. |
| **UT-CTRL-07** | `PatientController` | `DELETE /api/patients/{id}` | Eliminación exitosa | Retorna HTTP 204 No Content. |
| **UT-CTRL-08** | `PatientController` | `DELETE /api/patients/{id}` | Eliminación lanza `RuntimeException` | Retorna HTTP 404 Not Found. |
| **UT-CTRL-09** | `AppointmentController` | `GET /api/appointments` | Consulta por rango de fechas | Retorna HTTP 200 OK con lista de citas. |
| **UT-CTRL-10** | `AppointmentController` | `POST /api/appointments` | Creación exitosa | Retorna HTTP 200 OK con DTO de cita. |
| **UT-CTRL-11** | `AppointmentController` | `DELETE /api/appointments/{id}` | Eliminación exitosa | Retorna HTTP 204 No Content. |
| **UT-CTRL-12** | `AuthController` | `POST /api/auth/register` | Registro exitoso | Retorna HTTP 200 OK con token de autenticación. |
| **UT-CTRL-13** | `AuthController` | `POST /api/auth/login` | Login exitoso | Retorna HTTP 200 OK con token. |
| **UT-CTRL-14** | `DashboardController` | `GET /api/dashboard/stats` | Consulta de estadísticas | Retorna HTTP 200 OK con estadísticas del dashboard. |
| **UT-CTRL-15** | `HistoriaClinicaController` | `POST /api/clinica/historia` | Creación exitosa | Retorna HTTP 200 OK con datos de la historia. |
| **UT-CTRL-16** | `HistoriaClinicaController` | `GET /api/clinica/historia/{id}` | Consulta por UUID | Retorna HTTP 200 OK con la historia clínica. |
| **UT-CTRL-17** | `HistoriaClinicaController` | `GET /api/clinica/historia/paciente/{pacienteId}` | Consulta por ID de paciente | Retorna HTTP 200 OK. |

---

## 4. ESTIMACIÓN Y PROYECCIÓN DE COBERTURA (JaCoCo)

La siguiente tabla detalla la contribución estimada de cada suite de pruebas a la cobertura global del backend para asegurar el cumplimiento del objetivo $\ge$ 70%:

| Módulo / Paquete | Clases Incluidas | Cantidad de Casos Planificados | Cobertura de Líneas Estimada |
| :--- | :--- | :---: | :---: |
| **Core Services** (`service`) | `PatientService`, `AppointmentService`, `AuthService`, `DashboardService`, `EmailService`, `AppointmentReminderScheduler` | 38 casos | **90% - 95%** |
| **Clinical Services** (`service.clinica`) | `HistoriaClinicaGuard`, `HistoriaClinicaService`, y 13 servicios de especialidad odontológica | 62 casos | **85% - 92%** |
| **Security & Exceptions** (`security`, `exception`) | `JwtService`, `JwtAuthenticationFilter`, `GlobalExceptionHandler` | 13 casos | **85% - 90%** |
| **REST Controllers** (`controller`, `controller.clinica`) | `PatientController`, `AppointmentController`, `AuthController`, `DashboardController`, `HistoriaClinicaController`, y submódulos clínicos | 25 casos | **75% - 85%** |
| **TOTAL PROYECTADO BACKEND** | **Todas las clases con lógica de negocio y presentación** | **138 casos** | **$\ge$ 80% (Supera ampliamente el 70% requerido)** |

---

## 5. MATRIZ DE TRAZABILIDAD (Requerimientos vs. Pruebas Unitarias)

| ID Req. | Requerimiento de Negocio / Sistema | Clase Responsable | IDs de Casos de Prueba Asociados |
| :---: | :--- | :--- | :--- |
| **RF-01** | Registro y encriptación de contraseñas de usuarios | `AuthService` | UT-AUTH-01, UT-AUTH-02, UT-AUTH-03 |
| **RF-02** | Autenticación y generación de tokens JWT | `AuthService`, `JwtService` | UT-AUTH-04, UT-AUTH-05, UT-AUTH-06, UT-JWT-01 a UT-JWT-05 |
| **RF-03** | Validación de unicidad de documento de identidad en pacientes | `PatientService` | UT-PAT-07, UT-PAT-08 |
| **RF-04** | Operaciones CRUD sobre información de pacientes | `PatientService`, `PatientController` | UT-PAT-01 a UT-PAT-06, UT-PAT-09 a UT-PAT-12, UT-CTRL-01 a UT-CTRL-08 |
| **RF-05** | Prevención de solapamiento de horarios en citas médicas | `AppointmentService` | UT-APP-03, UT-APP-06, UT-APP-07, UT-APP-10 |
| **RF-06** | Envío automático de notificaciones de citas y recordatorios | `AppointmentService`, `EmailService`, `AppointmentReminderScheduler` | UT-APP-03, UT-MAIL-01 a UT-MAIL-04, UT-SCHED-01 a UT-SCHED-03 |
| **RF-07** | Creación y unicidad de Historia Clínica por paciente | `HistoriaClinicaService`, `HistoriaClinicaGuard` | UT-HC-01 a UT-HC-10, UT-GUARD-01, UT-GUARD-02 |
| **RF-08** | Inmutabilidad de historias clínicas cerradas | `HistoriaClinicaGuard`, Servicios Clínicos | UT-GUARD-01, UT-GUARD-02, UT-CLN-UP-03, UT-EVO-02, UT-ODON-06 |
| **RF-09** | Validación técnica de firmas digitales en consentimientos (límite 200KB) | `HistoriaClinicaGuard`, `ConsentimientoService` | UT-GUARD-03 a UT-GUARD-06, UT-CONS-01, UT-CONS-02 |
| **RF-10** | Registro y seguimiento de hallazgos en Odontograma | `OdontogramaService` | UT-ODON-01 a UT-ODON-10 |
| **RF-11** | Registro de evoluciones clínicas y planes de tratamiento | `EvolucionClinicaService`, `PlanTratamientoService` | UT-EVO-01 a UT-EVO-06, UT-PLAN-01 a UT-PLAN-06 |
| **RF-12** | Generación de métricas consolidadas del Dashboard | `DashboardService`, `DashboardController` | UT-DASH-01, UT-CTRL-14 |
| **RF-13** | Manejo estructurado de errores y respuestas HTTP uniformes | `GlobalExceptionHandler` | UT-EX-01 a UT-EX-04 |

---

## 6. GUÍA DE EJECUCIÓN Y VERIFICACIÓN DE JA CO CO

### 6.1 Comando de Ejecución
Las pruebas unitarias y la generación del reporte de JaCoCo se ejecutan desde el directorio del backend (`backend/oraltech`):
- Comando: `mvn clean test jacoco:report`

### 6.2 Ubicación del Reporte de Cobertura
- Archivo HTML principal: `target/site/jacoco/index.html`

### 6.3 Lista de Verificación para Aprobación
1. **Compilación y Ejecución**: El 100% de los casos de prueba unitarios planificados deben ejecutarse con estado **PASSED** (sin fallos ni errores).
2. **Umbral Mínimo**: La columna **Total Instructions** y **Total Lines** del reporte general de JaCoCo debe reflejar $\ge$ **70%**.
3. **Capa Service**: Ningún servicio del paquete `service` o `service.clinica` debe tener una cobertura inferior al **80%**.
4. **Tiempo de Ejecución**: La suite completa de pruebas unitarias debe ejecutarse en menos de **15 segundos** gracias al aislamiento total con Mockito.
