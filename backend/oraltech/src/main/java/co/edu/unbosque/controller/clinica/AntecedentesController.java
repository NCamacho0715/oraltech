package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.AntecedentesRequest;
import co.edu.unbosque.dto.clinica.AntecedentesResponse;
import co.edu.unbosque.service.clinica.AntecedentesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/antecedentes")
@RequiredArgsConstructor
public class AntecedentesController {

    private final AntecedentesService service;

    @PutMapping
    public ResponseEntity<AntecedentesResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody AntecedentesRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }

    @GetMapping
    public ResponseEntity<AntecedentesResponse> get(@PathVariable UUID historiaId) {
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
