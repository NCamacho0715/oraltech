package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.PronosticoRequest;
import co.edu.unbosque.dto.clinica.PronosticoResponse;
import co.edu.unbosque.service.clinica.PronosticoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/pronostico")
@RequiredArgsConstructor
public class PronosticoController {

    private final PronosticoService service;

    @PutMapping
    public ResponseEntity<PronosticoResponse> upsert(
            @PathVariable UUID historiaId,
            @RequestBody PronosticoRequest request) {
        return ResponseEntity.ok(service.upsert(historiaId, request));
    }

    @GetMapping
    public ResponseEntity<PronosticoResponse> get(@PathVariable UUID historiaId) {
        return ResponseEntity.ok(service.get(historiaId));
    }
}
