package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.ExamenClinicoRequest;
import co.edu.unbosque.dto.clinica.ExamenClinicoResponse;
import co.edu.unbosque.service.clinica.ExamenClinicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/examen")
@RequiredArgsConstructor
public class ExamenClinicoController {

    private final ExamenClinicoService service;

    @PutMapping
    public ResponseEntity<ExamenClinicoResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody ExamenClinicoRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }

    @GetMapping
    public ResponseEntity<ExamenClinicoResponse> get(@PathVariable UUID historiaId) {
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
