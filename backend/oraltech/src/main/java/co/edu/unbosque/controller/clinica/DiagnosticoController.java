package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.DiagnosticoRequest;
import co.edu.unbosque.dto.clinica.DiagnosticoResponse;
import co.edu.unbosque.service.clinica.DiagnosticoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/diagnostico")
@RequiredArgsConstructor
public class DiagnosticoController {

    private final DiagnosticoService service;

    @PutMapping
    public ResponseEntity<DiagnosticoResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody DiagnosticoRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }

    @GetMapping
    public ResponseEntity<DiagnosticoResponse> get(@PathVariable UUID historiaId) {
        return ResponseEntity.ok(service.get(historiaId));
    }
}
