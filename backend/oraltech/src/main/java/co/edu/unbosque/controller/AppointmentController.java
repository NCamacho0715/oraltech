package co.edu.unbosque.controller;

import co.edu.unbosque.dto.AppointmentDTO;
import co.edu.unbosque.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * GET /api/appointments?start=2026-04-14&end=2026-04-20
     * Returns all appointments in the given date range.
     */
    @GetMapping
    public ResponseEntity<List<AppointmentDTO.Response>> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByRange(start, end));
    }

    /**
     * GET /api/appointments/patient/{patientId}
     * Returns all appointments for a specific patient.
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentDTO.Response>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
    }

    /**
     * POST /api/appointments
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody AppointmentDTO.Request request) {
        try {
            return ResponseEntity.ok(appointmentService.createAppointment(request));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT /api/appointments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody AppointmentDTO.Request request) {
        try {
            return ResponseEntity.ok(appointmentService.updateAppointment(id, request));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/appointments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
