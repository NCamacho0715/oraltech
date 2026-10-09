# Avances del Proyecto OralTech

## Sprint 1 – Fundamentos y Arquitectura Base (Completado)

### Análisis y Definición de Requerimientos
- Levantamiento, análisis y validación de requerimientos funcionales (RF) y no funcionales (RNF) con stakeholders del Consultorio Odontológico JG.
- Construcción y priorización del Product Backlog en coherencia con las necesidades operativas identificadas.
- Definición y validación de historias de usuario para los módulos priorizados del sistema.

### Modelado de Procesos y Diseño de Solución
- Elaboración de diagramas BPMN TO-BE de los procesos a intervenir:
  - Gestión de historias clínicas.
  - Agendamiento de citas.
- Diseño de arquitectura del sistema mediante modelo C4:
  - Nivel 1: Diagrama de contexto.
  - Nivel 2: Diagrama de contenedores.
- Definición del modelo de datos inicial para soporte de entidades principales del dominio.

### Preparación Técnica del Proyecto
- Configuración del entorno de desarrollo para backend, frontend y base de datos.
- Inicialización estructurada de repositorios y flujo de trabajo Git.
- Validación técnica de conectividad entre componentes base de la solución.
- Aprobación de arquitectura y diseño preliminar por parte de stakeholders.

---

## Sprint 2 y Sprint 3 – Gestión de Historias Clínicas (En Progreso)

### Infraestructura Base del Backend
- Implementación de la estructura base del backend sobre Spring Boot 3.
- Configuración de persistencia con PostgreSQL mediante JPA/Hibernate.
- Organización de capas del proyecto bajo arquitectura por responsabilidades.

### Seguridad y Control de Acceso
- Implementación completa del módulo de autenticación y autorización:
  - Gestión de usuarios y roles.
  - Cifrado seguro de contraseñas con BCrypt.
  - Autenticación basada en JWT.
  - Configuración de Spring Security.
- Exposición de endpoints de autenticación mediante API REST.

### Gestión de Pacientes
- Implementación de funcionalidades CRUD para registro y consulta de pacientes.
- Desarrollo de validaciones de negocio y restricciones de integridad sobre datos de paciente.
- Avance en funcionalidades de actualización de información de pacientes.

### Módulo de Historias Clínicas
- Diseño e implementación en curso del módulo de historias clínicas odontológicas.
- Definición progresiva del modelo de dominio clínico y relaciones con pacientes.
- Desarrollo iterativo de lógica de negocio asociada al registro clínico.

### Seguimiento de Avance
- Cumplimiento parcial de historias de usuario correspondientes a los incrementos 2 y 3.
- Progreso estimado:
  - Sprint 2: 40% completado.
  - Sprint 3: 60% completado.

---

## Observaciones Técnicas Relevantes
- Se consolidó una base arquitectónica funcional que permite continuar el desarrollo incremental del sistema.
- La implementación actual garantiza separación de responsabilidades entre frontend, backend y persistencia.
- El sistema cuenta ya con una base de seguridad adecuada para el manejo posterior de información clínica sensible.