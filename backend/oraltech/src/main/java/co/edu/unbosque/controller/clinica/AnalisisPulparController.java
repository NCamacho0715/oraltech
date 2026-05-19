package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.AnalisisPulparRequest;
import co.edu.unbosque.dto.clinica.AnalisisPulparResponse;
import co.edu.unbosque.service.clinica.AnalisisPulparService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/analisis-pulpar")
@RequiredArgsConstructor
public class AnalisisPulparController {

    private final AnalisisPulparService service;

    @GetMapping
    public ResponseEntity<AnalisisPulparResponse> get(@PathVariable UUID historiaId) {
        return ResponseEntity.ok(service.get(historiaId));
    }

    @PutMapping
    public ResponseEntity<AnalisisPulparResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody AnalisisPulparRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }
}
