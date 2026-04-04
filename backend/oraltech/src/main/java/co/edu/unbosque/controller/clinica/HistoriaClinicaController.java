package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.HistoriaClinicaRequest;
import co.edu.unbosque.dto.clinica.HistoriaClinicaResponse;
import co.edu.unbosque.service.clinica.HistoriaClinicaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/historias")
@RequiredArgsConstructor
public class HistoriaClinicaController {

    private final HistoriaClinicaService service;

    @PostMapping
    public ResponseEntity<HistoriaClinicaResponse> create(@RequestBody HistoriaClinicaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HistoriaClinicaResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<HistoriaClinicaResponse> getByPacienteId(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(service.getByPacienteId(pacienteId));
    }
}
