package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.AnalisisPeriodontalRequest;
import co.edu.unbosque.dto.clinica.AnalisisPeriodontalResponse;
import co.edu.unbosque.service.clinica.AnalisisPeriodontalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/analisis-periodontal")
@RequiredArgsConstructor
public class AnalisisPeriodontalController {

    private final AnalisisPeriodontalService service;

    @GetMapping
    public ResponseEntity<AnalisisPeriodontalResponse> get(@PathVariable UUID historiaId) {
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

    @PutMapping
    public ResponseEntity<AnalisisPeriodontalResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody AnalisisPeriodontalRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }
}
