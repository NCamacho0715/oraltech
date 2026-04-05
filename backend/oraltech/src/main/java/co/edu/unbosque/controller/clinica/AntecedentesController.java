package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.AntecedentesRequest;
import co.edu.unbosque.dto.clinica.AntecedentesResponse;
import co.edu.unbosque.service.clinica.AntecedentesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(service.get(historiaId));
    }
}
