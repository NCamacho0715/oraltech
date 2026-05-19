package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.EvolucionClinicaListResponse;
import co.edu.unbosque.dto.clinica.EvolucionClinicaRequest;
import co.edu.unbosque.dto.clinica.EvolucionClinicaResponse;
import co.edu.unbosque.service.clinica.EvolucionClinicaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/evoluciones")
@RequiredArgsConstructor
public class EvolucionClinicaController {

    private final EvolucionClinicaService service;

    @PostMapping
    public ResponseEntity<EvolucionClinicaResponse> create(
            @PathVariable UUID historiaId,
            @RequestBody EvolucionClinicaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(historiaId, request));
    }

    /**
     * List view — no signatures exposed.
     */
    @GetMapping
    public ResponseEntity<List<EvolucionClinicaListResponse>> list(@PathVariable UUID historiaId) {
        return ResponseEntity.ok(service.list(historiaId));
    }

    /**
     * Detail view — includes signatures.
     */
    @GetMapping("/{evolucionId}")
    public ResponseEntity<EvolucionClinicaResponse> getById(
            @PathVariable UUID historiaId,
            @PathVariable Long evolucionId) {
        return ResponseEntity.ok(service.getById(historiaId, evolucionId));
    }
}
