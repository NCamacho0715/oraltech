# Master Traceability Log - OralTech

This document provides a chronological overview of the development milestones and technical advancements of the OralTech system, from project inception to the current state.

## 🟢 Phase 1: Project Initiation & Core Infrastructure
*Date: 2026-03-15*

*   **Project Inception**: Initialized the repository and basic documentation (`readme.md`).
*   **Backend Foundation**: Setup of the Spring Boot 3 environment with Java 17.
*   **Frontend Foundation**: Created the React + Vite frontend project with a modern design architecture.
*   **Authentication Engine**: 
    *   Implemented JWT-based security.
    *   Developed `AuthService` and `AuthenticationResponse` to handle secure user sessions (Login/Register).
*   **Patient Core Module**: 
    *   Defined the `Patient` entity, repository, and service layer.
    *   Established the first CRUD operations for clinical data.

## 🔵 Phase 2: UI Modernization & Stability
*Date: 2026-03-16*

*   **UI/UX Refactoring**: Significant updates to frontend components for better responsiveness and consistency with the design system.
*   **Patient Module Expansion**: Synchronized frontend/backend for patient management, achieving the first stable "Back-to-Front" version of the platform.
*   **Merge & Integration**: Successfully merged `feature/patient-module` into the main development flow.

## 🟠 Phase 3: Clinical Records & Advanced Odontology
*Date: 2026-04-04*

*   **Clinical History Initialized**: 
    *   Comprehensive fix of backend compilation issues.
    *   Resolution of authentication middleware (guards) for history access.
    *   Implementation of the premium Clinical UI (Vertical navigation tabs).
*   **Anamnesis & Antecedentes**: Full implementation of medical-dental history forms with 70+ clinical variables.
*   **Examen Clínico**: Development of the Soft/Hard Tissue examination interface.

## 🔴 Phase 4: Odontogram Modernization & Specialized Analysis
*Date: 2026-04-05*

*   **Interactive Odontogram**:
    *   Support for Adult (Permanent) and Child (Temporary) dentition.
    *   Dynamic SVG tooth coloring (Indicated/Performed logic).
    *   Refined convention system with clinical symbols and color branding.
    *   Implemented dental prosthesis module (Total, Partial, Metallic, Fixed).
*   **New Specialized Modules**:
    *   **Analisis Pulpar - Endodóntico**: Tracking of pulpal status, sensitivity, and endodontic treatments.
    *   **Analisis Periodontal**: Detailed monitoring of periodontal health, bone loss, and gum status.
*   **Infrastructure Excellence**:
    *   **Database Migrations**: Integrated Flyway for professional database schema management.
    *   **UI Polish**: Added custom modals for record deletion and elegant success indicators for data saving.
*   **Repository Maintenance**: Successfully pushed the complete modernization to the `feature/test` branch.

## 🟣 Phase 5: Clinical Records Traceability (Auditing)
*Date: 2026-09-26*

*   **JPA Auditing Engine**:
    *   Added `JpaAuditingConfig` with `@EnableJpaAuditing(auditorAwareRef = "auditorAware")` and an `AuditorAware<String>` that resolves the authenticated username (`"sistema"` when there is no principal).
    *   `AuditFields` is now the single audit source (Spring `@CreatedDate`/`@CreatedBy`/`@LastModifiedDate`/`@LastModifiedBy`); the manual `@PrePersist`/`@PreUpdate` callbacks were removed from all 14 clinical entities, which now register `AuditingEntityListener`.
*   **Audit API**: the 10 clinical section response DTOs (plus historia/interconsulta/pronóstico/prótesis) expose `createdAt`, `createdBy`, `updatedAt` and `updatedBy`; `createdBy` is immutable on upsert.
*   **UI**: discreet "Última modificación: fecha · profesional" line under the "Historia Clínica" title.
*   **Testing**: new `AuditoriaTrazabilidadTest` (full-stack MockMvc: first save as `dr_andrea`, second `PUT` as `dr_carlos`).
*   **Documentation**: `docs/trazabilidad_registros_clinicos.md` — last-author log only (full changelog is a future story) and `created_by = NULL` for rows created before the deploy.

---
*Last updated: 2026-09-26*
