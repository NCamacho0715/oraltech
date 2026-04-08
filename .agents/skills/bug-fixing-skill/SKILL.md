# Bug Fixing & Troubleshooting Skill - OralTech

This skill documents established procedures for diagnosing, resolving, and preventing common issues encountered during OralTech's development.

## 1. Backend Startup & Port Issues

### Port 8080 Conflict (EADDRINUSE)
- **Problem**: The backend fails to start because a previous instance is still running or another process is using port 8080.
- **Diagnostics**: Run `netstat -ano | findstr :8080` to find the Process ID (PID).
- **Solution**: 
    - In Windows/Powershell: Use `Stop-Process -Id <PID> -Force`.
    - Integrated approach: Always ensure to terminate the batch job in the terminal before starting a new one.

### Maven / Compilation Failures
- **Problem**: "Build Failure" after adding new entities or dependencies.
- **Solution**: Always use `.\mvnw.cmd clean spring-boot:run` when adding new files to ensure the `target` folder is refreshed and Flyway migrations are correctly picked up.

## 2. Database & Schema Integrity (Flyway)

### Schema Drift / Broken Check Constraints
- **Problem**: `SQL Error: 400 - violating check constraint 'tipo_evento_check'`. 
- **Incident History**: This occurred when expanding Enums in Java without updating the existing DB constraints.
- **Prevention**: 
    1. **Never** rely on JPA to update complex constraints automatically.
    2. Use **Flyway migrations** (`src/main/resources/db/migration/V__...sql`) to drop or modify constraints safely.
    3. If Flyway fails on non-empty databases, ensure `spring.flyway.baseline-on-migrate=true` is set.

## 3. Frontend UX & Form Performance

### Focus Loss in TextAreas/Inputs
- **Problem**: The cursor jumps out of an input field every time the user types one character.
- **Standard Fix**: Do **not** define sub-components inside the main render function of a View. Hoist sub-components (like `AnamnesisForm`) to the top level to prevent React from unmounting/remounting them on state change.

### "Error al registrar evento" (400 Bad Request)
- **Problem**: Localhost alert says "Error" without details.
- **Diagnostics**: Check the Browser Console (F12) Network tab. Usually caused by a missing field in the DTO or an Enum mismatch between Frontend and Backend.
- **Prevention**: Use the `GlobalExceptionHandler` and always log the detailed `err.response.data` in the frontend console.

## 4. Authentication & Security

### 401 Unauthorized / Token Expiry
- **Problem**: Requests start failing suddenly with 401 code.
- **Procedure**: 
    1. Verify if the JWT token is being sent in the `Authorization` header.
    2. Check if the backend secret has changed or if the token expired (Current limit: 24h).
    3. Clear LocalStorage and Login again as a first troubleshooting step.

## 5. Deployment / Production Checklist
- **Environment**: Ensure `postgresql` drivers are active.
- **Profiles**: Use Spring profiles to separate `application-dev.properties` from production settings.
- **Constraint Safety**: Always verify that the "unique" constraint on `paciente_id` in `historia_clinica` is respected to avoid duplicate histories.
