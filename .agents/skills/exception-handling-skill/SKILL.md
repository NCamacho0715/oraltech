# Global Exception Handling Skill - OralTech Backend

This skill defines the standardized protocol for intercepting and reporting errors across the OralTech ecosystem. It ensures that the Frontend always receives a predictable response format for any failure.

## Standard Error Response Format

All error responses must return the following JSON structure:

```json
{
  "timestamp": "2024-04-08T15:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Descriptive error message for the user",
  "path": "/api/your-endpoint"
}
```

## Exception Handling Strategy

### 1. `ResponseStatusException` (Preferred)
Use this for business logic errors where you want to provide a specific HTTP code and reason.
- **Usage**: `throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado");`

### 2. Validation Errors (`MethodArgumentNotValidException`)
Handled automatically to return a list of specific field errors when `@Valid` is used in controllers.

### 3. Security Exceptions
- **`BadCredentialsException`**: Must always return `401 Unauthorized` with the message "Credenciales inválidas".
- **`AccessDeniedException`**: Return `403 Forbidden` for role-based authorization failures.

### 4. Global Fallback (`RuntimeException`)
Any unhandled exceptions are caught by the `GlobalExceptionHandler` to prevent leaking system stack traces to the client. Returns `400 Bad Request` by default.

## Implementation Details

The core of this system is the `@RestControllerAdvice` class located in:
`backend/oraltech/src/main/java/co/edu/unbosque/exception/GlobalExceptionHandler.java`

### Checkpoint for Backend Edits:
1. **Never** return raw error strings; always wrap them in a `ResponseEntity` using the standard Map or DTO.
2. **Avoid** catching exceptions in Controllers. Let them bubble up to the `GlobalExceptionHandler`.
3. Use **custom exceptions** if a specific business rule is violated frequently (e.g., `PatientNotFoundException`).
4. Keep messages **user-friendly** and in Spanish, as they are often displayed directly in the UI.

## Frontend Integration Tips
- Use the `axios` interceptor logic (if implemented) to detect `401` and redirect to Login.
- Always read the `.message` property from the error response to show alerts to the user.
