package co.edu.unbosque.service;

import co.edu.unbosque.dto.AppointmentDTO;
import co.edu.unbosque.entity.Appointment;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.repository.AppointmentRepository;
import co.edu.unbosque.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final EmailService emailService;

    public List<AppointmentDTO.Response> getAppointmentsByRange(LocalDate start, LocalDate end) {
        return appointmentRepository
                .findByAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(start, end)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO.Response> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository
                .findByPatientIdOrderByAppointmentDateDescStartTimeDesc(patientId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AppointmentDTO.Response createAppointment(AppointmentDTO.Request req) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado: " + req.getPatientId()));

        validateNoConflict(req.getAppointmentDate(), req.getStartTime(), req.getEndTime(), -1L);

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .title(req.getTitle())
                .appointmentDate(req.getAppointmentDate())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .notes(req.getNotes())
                .status(req.getStatus() != null ? req.getStatus() : "PENDIENTE")
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Send confirmation email asynchronously
        emailService.sendConfirmationEmail(saved);

        return toResponse(saved);
    }

    public AppointmentDTO.Response updateAppointment(Long id, AppointmentDTO.Request req) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada: " + id));

        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado: " + req.getPatientId()));

        validateNoConflict(req.getAppointmentDate(), req.getStartTime(), req.getEndTime(), id);

        existing.setPatient(patient);
        existing.setTitle(req.getTitle());
        existing.setAppointmentDate(req.getAppointmentDate());
        existing.setStartTime(req.getStartTime());
        existing.setEndTime(req.getEndTime());
        existing.setNotes(req.getNotes());
        if (req.getStatus() != null) existing.setStatus(req.getStatus());

        return toResponse(appointmentRepository.save(existing));
    }

    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Cita no encontrada: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    public long countToday() {
        return appointmentRepository.countByAppointmentDate(LocalDate.now());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateNoConflict(java.time.LocalDate date, java.time.LocalTime start,
                                    java.time.LocalTime end, Long excludeId) {
        List<Appointment> conflicts = appointmentRepository.findConflicting(date, start, end, excludeId);
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Ya existe una cita en ese horario.");
        }
    }

    private AppointmentDTO.Response toResponse(Appointment a) {
        String patientName = a.getPatient().getNames() + " " + a.getPatient().getFirstSurname();
        return AppointmentDTO.Response.builder()
                .id(a.getId())
                .patientId(a.getPatient().getId())
                .patientName(patientName)
                .title(a.getTitle())
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .notes(a.getNotes())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
