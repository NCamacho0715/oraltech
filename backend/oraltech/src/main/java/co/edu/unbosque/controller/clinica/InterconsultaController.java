package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.InterconsultaRequest;
import co.edu.unbosque.dto.clinica.InterconsultaResponse;
import co.edu.unbosque.service.clinica.InterconsultaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/interconsultas")
@RequiredArgsConstructor
public class InterconsultaController {

    private final InterconsultaService service;

    @PostMapping
    public ResponseEntity<InterconsultaResponse> create(
            @PathVariable UUID historiaId,
            @RequestBody InterconsultaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(historiaId, request));
    }

    @GetMapping
    public ResponseEntity<List<InterconsultaResponse>> list(@PathVariable UUID historiaId) {
        return ResponseEntity.ok(service.list(historiaId));
    }
}
