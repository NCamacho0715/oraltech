package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.AnamnesisRequest;
import co.edu.unbosque.dto.clinica.AnamnesisResponse;
import co.edu.unbosque.service.clinica.AnamnesisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/anamnesis")
@RequiredArgsConstructor
public class AnamnesisController {

    private final AnamnesisService service;

    @PutMapping
    public ResponseEntity<AnamnesisResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody AnamnesisRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }

    @GetMapping
    public ResponseEntity<AnamnesisResponse> get(@PathVariable UUID historiaId) {
        try {
            return ResponseEntity.ok(service.get(historiaId));
        } catch (ResponseStatusException e) {
            // Sección aún no registrada: 204 en vez de 404 para no ensuciar la consola.
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return ResponseEntity.noContent().build();
            }
            throw e;
        }
    }
}
