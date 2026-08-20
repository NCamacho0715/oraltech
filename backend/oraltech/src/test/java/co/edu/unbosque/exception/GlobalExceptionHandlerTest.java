package co.edu.unbosque.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("UT-EX-01: Debería manejar ResponseStatusException con código y mensaje especificado")
    void shouldHandleResponseStatusExceptionWithReason() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado");

        ResponseEntity<?> response = exceptionHandler.handleResponseStatusException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Paciente no encontrado", body.get("message"));
    }

    @Test
    @DisplayName("UT-EX-02: Debería manejar ResponseStatusException cuando el reason es nulo")
    void shouldHandleResponseStatusExceptionWithNullReason() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.CONFLICT);

        ResponseEntity<?> response = exceptionHandler.handleResponseStatusException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Error", body.get("message"));
    }

    @Test
    @DisplayName("UT-EX-03: Debería manejar RuntimeException genérica retornando 400 Bad Request")
    void shouldHandleRuntimeException() {
        RuntimeException ex = new RuntimeException("Error en validación de negocio");

        ResponseEntity<?> response = exceptionHandler.handleRuntimeException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Error en validación de negocio", body.get("message"));
    }

    @Test
    @DisplayName("UT-EX-04: Debería manejar BadCredentialsException retornando 401 Unauthorized")
    void shouldHandleBadCredentials() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        ResponseEntity<?> response = exceptionHandler.handleBadCredentials(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Credenciales inválidas", body.get("message"));
    }
}
