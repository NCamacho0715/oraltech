package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.OdontogramaRegistroRequest;
import co.edu.unbosque.dto.clinica.OdontogramaRegistroResponse;
import co.edu.unbosque.service.clinica.OdontogramaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/historias/{historiaId}/odontograma")
@RequiredArgsConstructor
public class OdontogramaController {

    private final OdontogramaService service;

    @PostMapping
    public ResponseEntity<OdontogramaRegistroResponse> create(
            @PathVariable UUID historiaId,
            @RequestBody OdontogramaRegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(historiaId, request));
    }

    @GetMapping
    public ResponseEntity<List<OdontogramaRegistroResponse>> list(@PathVariable UUID historiaId) {
        return ResponseEntity.ok(service.list(historiaId));
    }
}
