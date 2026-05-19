package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.AnalisisPeriodontalRequest;
import co.edu.unbosque.dto.clinica.AnalisisPeriodontalResponse;
import co.edu.unbosque.service.clinica.AnalisisPeriodontalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/analisis-periodontal")
@RequiredArgsConstructor
public class AnalisisPeriodontalController {

    private final AnalisisPeriodontalService service;

    @GetMapping
    public ResponseEntity<AnalisisPeriodontalResponse> get(@PathVariable UUID historiaId) {
        return ResponseEntity.ok(service.get(historiaId));
    }

    @PutMapping
    public ResponseEntity<AnalisisPeriodontalResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody AnalisisPeriodontalRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }
}
