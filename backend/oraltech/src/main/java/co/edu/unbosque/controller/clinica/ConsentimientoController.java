package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.ConsentimientoRequest;
import co.edu.unbosque.dto.clinica.ConsentimientoResponse;
import co.edu.unbosque.service.clinica.ConsentimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/consentimiento")
@RequiredArgsConstructor
public class ConsentimientoController {

    private final ConsentimientoService service;

    @PostMapping
    public ResponseEntity<ConsentimientoResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody ConsentimientoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.upsert(historiaId, request));
    }

    @GetMapping
    public ResponseEntity<ConsentimientoResponse> get(@PathVariable UUID historiaId) {
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
