package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.ExamenComplementarioRequest;
import co.edu.unbosque.dto.clinica.ExamenComplementarioResponse;
import co.edu.unbosque.service.clinica.ExamenComplementarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/examen-complementario")
@RequiredArgsConstructor
public class ExamenComplementarioController {

    private final ExamenComplementarioService service;

    @GetMapping
    public ResponseEntity<ExamenComplementarioResponse> get(@PathVariable UUID historiaId) {
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
    public ResponseEntity<ExamenComplementarioResponse> create(
            @PathVariable UUID historiaId,
            @RequestBody ExamenComplementarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(historiaId, request));
    }
}
