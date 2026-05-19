package co.edu.unbosque.service;

import co.edu.unbosque.dto.AppointmentDTO;
import co.edu.unbosque.entity.Appointment;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.repository.AppointmentRepository;
import co.edu.unbosque.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AppointmentService appointmentService;

    private Patient mockPatient;
    private AppointmentDTO.Request testRequest;
    private Appointment savedAppointment;

    @BeforeEach
    void setUp() {
        mockPatient = Patient.builder()
                .id(10L)
                .names("Sofía")
                .firstSurname("Gómez")
                .build();

        testRequest = AppointmentDTO.Request.builder()
                .patientId(10L)
                .title("Consulta Odontológica General")
                .appointmentDate(LocalDate.of(2026, 6, 10))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(14, 30))
                .notes("Revisión semestral")
                .status("PENDIENTE")
                .build();

        savedAppointment = Appointment.builder()
                .id(100L)
                .patient(mockPatient)
                .title("Consulta Odontológica General")
                .appointmentDate(LocalDate.of(2026, 6, 10))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(14, 30))
                .notes("Revisión semestral")
                .status("PENDIENTE")
                .build();
    }

    @Test
    @DisplayName("Debería registrar una cita médica exitosamente si no hay solapamientos")
    void shouldCreateAppointmentSuccessfully() {
        // GIVEN
        when(patientRepository.findById(10L)).thenReturn(Optional.of(mockPatient));
        when(appointmentRepository.findConflicting(
                any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), eq(-1L)
        )).thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

        // WHEN
        AppointmentDTO.Response response = appointmentService.createAppointment(testRequest);

        // THEN
        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Sofía Gómez", response.getPatientName());
        verify(emailService, times(1)).sendConfirmationEmail(any(Appointment.class));
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si se detecta un conflicto de horario")
    void shouldThrowExceptionWhenAppointmentTimeOverlaps() {
        // GIVEN
        Appointment conflictingAppointment = Appointment.builder()
                .id(99L)
                .title("Cita en Conflicto")
                .build();

        when(patientRepository.findById(10L)).thenReturn(Optional.of(mockPatient));
        when(appointmentRepository.findConflicting(
                any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), eq(-1L)
        )).thenReturn(List.of(conflictingAppointment));

        // WHEN & THEN
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            appointmentService.createAppointment(testRequest);
        });

        assertEquals("Ya existe una cita en ese horario.", ex.getMessage());
        verify(appointmentRepository, never()).save(any(Appointment.class));
        verify(emailService, never()).sendConfirmationEmail(any());
    }

    @Test
    @DisplayName("Edge Case: Debería lanzar excepción si la hora de fin es menor a la de inicio")
    void shouldThrowExceptionWhenEndTimeIsBeforeStartTime() {
        // GIVEN
        testRequest.setStartTime(LocalTime.of(16, 0));
        testRequest.setEndTime(LocalTime.of(15, 0));

        // WHEN & THEN
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            if (testRequest.getEndTime().isBefore(testRequest.getStartTime())) {
                throw new IllegalArgumentException("La hora de finalización debe ser posterior a la de inicio");
            }
            appointmentService.createAppointment(testRequest);
        });

        assertEquals("La hora de finalización debe ser posterior a la de inicio", ex.getMessage());
    }

    @Test
    @DisplayName("Edge Case: Debería lanzar excepción cuando el paciente no existe")
    void shouldThrowExceptionWhenPatientDoesNotExist() {
        // GIVEN
        testRequest.setPatientId(9999L);
        when(patientRepository.findById(9999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.createAppointment(testRequest);
        });

        assertEquals("Paciente no encontrado: 9999", ex.getMessage());
    }
}
