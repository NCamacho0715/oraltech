package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.OdontogramaProtesisRequest;
import co.edu.unbosque.dto.clinica.OdontogramaProtesisResponse;
import co.edu.unbosque.service.clinica.OdontogramaProtesisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/odontograma/protesis")
@RequiredArgsConstructor
public class OdontogramaProtesisController {

    private final OdontogramaProtesisService service;

    @GetMapping
    public ResponseEntity<OdontogramaProtesisResponse> get(@PathVariable UUID historiaId) {
        return ResponseEntity.ok(service.get(historiaId));
    }

    @PutMapping
    public ResponseEntity<OdontogramaProtesisResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody OdontogramaProtesisRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }
}
