package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.DesbloqueoRequest;
import co.edu.unbosque.dto.clinica.DesbloqueoResponse;
import co.edu.unbosque.service.clinica.DesbloqueoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/{seccion}/desbloqueo")
@RequiredArgsConstructor
public class DesbloqueoController {

    private final DesbloqueoService service;

    /**
     * Desbloqueo excepcional de un solo uso para corregir errores de digitación.
     * Solo ADMIN (403 en otro caso, con mensaje vía GlobalExceptionHandler).
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DesbloqueoResponse> solicitar(
            @PathVariable UUID historiaId,
            @PathVariable String seccion,
            @RequestBody DesbloqueoRequest request) {
        String motivo = request != null ? request.getMotivo() : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.solicitar(historiaId, seccion, motivo));
    }
}
