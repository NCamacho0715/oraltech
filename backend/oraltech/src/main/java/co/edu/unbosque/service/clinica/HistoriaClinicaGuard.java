package co.edu.unbosque.service.clinica;

import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;

/**
 * Shared guard utilities for clinical module business rules.
 */
@Component
public class HistoriaClinicaGuard {

    private static final int MAX_SIGNATURE_BYTES = 204800; // 200KB

    /**
     * Throws 409 Conflict if the historia is CERRADA.
     */
    public void requireActiva(HistoriaClinica historia) {
        if (historia.getEstado() == EstadoHistoria.CERRADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La historia clínica está cerrada y no permite modificaciones");
        }
    }

    /**
     * Validates that a Base64-encoded signature does not exceed 200KB.
     */
    public void validateSignatureSize(String base64Signature, String fieldName) {
        if (base64Signature == null || base64Signature.isBlank()) return;
        try {
            byte[] decoded = Base64.getDecoder().decode(base64Signature);
            if (decoded.length > MAX_SIGNATURE_BYTES) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        fieldName + " excede el tamaño máximo permitido de 200KB");
            }
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    fieldName + " no es una cadena Base64 válida");
        }
    }
}
