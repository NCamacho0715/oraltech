package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.AnamnesisRequest;
import co.edu.unbosque.dto.clinica.AnamnesisResponse;
import co.edu.unbosque.service.clinica.AnamnesisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(service.get(historiaId));
    }
}
