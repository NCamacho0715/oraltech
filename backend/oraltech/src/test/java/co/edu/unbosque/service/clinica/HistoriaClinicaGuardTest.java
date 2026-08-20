package co.edu.unbosque.service.clinica;

import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class HistoriaClinicaGuardTest {

    private HistoriaClinicaGuard guard;

    @BeforeEach
    void setUp() {
        guard = new HistoriaClinicaGuard();
    }

    @Test
    @DisplayName("UT-GUARD-01: requireActiva debería permitir la ejecución si la historia está ACTIVA")
    void shouldAllowWhenHistoriaIsActiva() {
        HistoriaClinica historia = HistoriaClinica.builder()
                .estado(EstadoHistoria.ACTIVA)
                .build();

        assertDoesNotThrow(() -> guard.requireActiva(historia));
    }

    @Test
    @DisplayName("UT-GUARD-02: requireActiva debería lanzar 409 Conflict si la historia está CERRADA")
    void shouldThrowConflictWhenHistoriaIsCerrada() {
        HistoriaClinica historia = HistoriaClinica.builder()
                .estado(EstadoHistoria.CERRADA)
                .build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            guard.requireActiva(historia);
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("cerrada"));
    }

    @Test
    @DisplayName("UT-GUARD-03: validateSignatureSize debería permitir firmas nulas o en blanco")
    void shouldAllowNullOrBlankSignatures() {
        assertDoesNotThrow(() -> guard.validateSignatureSize(null, "firmaPaciente"));
        assertDoesNotThrow(() -> guard.validateSignatureSize("", "firmaPaciente"));
        assertDoesNotThrow(() -> guard.validateSignatureSize("   ", "firmaPaciente"));
    }

    @Test
    @DisplayName("UT-GUARD-04: validateSignatureSize debería permitir firma Base64 válida menor a 200KB")
    void shouldAllowValidBase64SignatureWithinSizeLimit() {
        byte[] rawBytes = "datos-de-firma-digital-del-paciente".getBytes();
        String validBase64 = Base64.getEncoder().encodeToString(rawBytes);

        assertDoesNotThrow(() -> guard.validateSignatureSize(validBase64, "firmaPaciente"));
    }

    @Test
    @DisplayName("UT-GUARD-05: validateSignatureSize debería lanzar 400 Bad Request si la firma excede 200KB")
    void shouldThrowBadRequestWhenSignatureExceeds200KB() {
        byte[] oversizedBytes = new byte[204801]; // 200KB + 1 byte
        String oversizedBase64 = Base64.getEncoder().encodeToString(oversizedBytes);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            guard.validateSignatureSize(oversizedBase64, "firmaPaciente");
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("excede el tamaño"));
    }

    @Test
    @DisplayName("UT-GUARD-06: validateSignatureSize debería lanzar 400 Bad Request si la cadena no es Base64 válido")
    void shouldThrowBadRequestWhenSignatureIsNotValidBase64() {
        String invalidBase64 = "esto-no-es-base64!!!";

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            guard.validateSignatureSize(invalidBase64, "firmaPaciente");
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("no es una cadena Base64 válida"));
    }
}
