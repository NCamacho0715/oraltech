package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.OdontogramaProtesisRequest;
import co.edu.unbosque.dto.clinica.OdontogramaProtesisResponse;
import co.edu.unbosque.service.clinica.OdontogramaProtesisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/odontograma/protesis")
@RequiredArgsConstructor
public class OdontogramaProtesisController {

    private final OdontogramaProtesisService service;

    @GetMapping
    public ResponseEntity<OdontogramaProtesisResponse> get(@PathVariable UUID historiaId) {
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
    public ResponseEntity<OdontogramaProtesisResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody OdontogramaProtesisRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }
}
