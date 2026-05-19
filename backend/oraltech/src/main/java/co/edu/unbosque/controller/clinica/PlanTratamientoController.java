package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.PlanTratamientoRequest;
import co.edu.unbosque.dto.clinica.PlanTratamientoResponse;
import co.edu.unbosque.service.clinica.PlanTratamientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/plan")
@RequiredArgsConstructor
public class PlanTratamientoController {

    private final PlanTratamientoService service;

    @PostMapping
    public ResponseEntity<PlanTratamientoResponse> create(
            @PathVariable UUID historiaId,
            @RequestBody PlanTratamientoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(historiaId, request));
    }

    @GetMapping
    public ResponseEntity<List<PlanTratamientoResponse>> list(@PathVariable UUID historiaId) {
        return ResponseEntity.ok(service.list(historiaId));
    }
}
