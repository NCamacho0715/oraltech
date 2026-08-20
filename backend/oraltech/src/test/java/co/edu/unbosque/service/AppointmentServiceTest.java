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
import java.time.LocalDateTime;
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
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("UT-APP-01: Debería consultar citas por rango de fechas")
    void shouldGetAppointmentsByRangeSuccessfully() {
        // GIVEN
        LocalDate start = LocalDate.of(2026, 6, 1);
        LocalDate end = LocalDate.of(2026, 6, 30);
        when(appointmentRepository.findByAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(start, end))
                .thenReturn(List.of(savedAppointment));

        // WHEN
        List<AppointmentDTO.Response> result = appointmentService.getAppointmentsByRange(start, end);

        // THEN
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
        assertEquals("Sofía Gómez", result.get(0).getPatientName());
        verify(appointmentRepository, times(1))
                .findByAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(start, end);
    }

    @Test
    @DisplayName("UT-APP-02: Debería consultar citas por ID de paciente")
    void shouldGetAppointmentsByPatientSuccessfully() {
        // GIVEN
        when(appointmentRepository.findByPatientIdOrderByAppointmentDateDescStartTimeDesc(10L))
                .thenReturn(List.of(savedAppointment));

        // WHEN
        List<AppointmentDTO.Response> result = appointmentService.getAppointmentsByPatient(10L);

        // THEN
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getPatientId());
        verify(appointmentRepository, times(1))
                .findByPatientIdOrderByAppointmentDateDescStartTimeDesc(10L);
    }

    @Test
    @DisplayName("UT-APP-03: Debería registrar una cita médica exitosamente si no hay solapamientos")
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
        assertEquals("PENDIENTE", response.getStatus());
        verify(emailService, times(1)).sendConfirmationEmail(any(Appointment.class));
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    @DisplayName("UT-APP-04: Debería registrar cita con estado por defecto cuando request.status es null")
    void shouldCreateAppointmentWithDefaultStatusWhenNull() {
        // GIVEN
        testRequest.setStatus(null);
        when(patientRepository.findById(10L)).thenReturn(Optional.of(mockPatient));
        when(appointmentRepository.findConflicting(
                any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), eq(-1L)
        )).thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

        // WHEN
        AppointmentDTO.Response response = appointmentService.createAppointment(testRequest);

        // THEN
        assertNotNull(response);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    @DisplayName("UT-APP-05: Debería lanzar excepción cuando el paciente no existe al crear cita")
    void shouldThrowExceptionWhenPatientDoesNotExist() {
        // GIVEN
        testRequest.setPatientId(9999L);
        when(patientRepository.findById(9999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.createAppointment(testRequest);
        });

        assertEquals("Paciente no encontrado: 9999", ex.getMessage());
        verify(appointmentRepository, never()).save(any(Appointment.class));
        verify(emailService, never()).sendConfirmationEmail(any());
    }

    @Test
    @DisplayName("UT-APP-06: Debería lanzar excepción si se detecta un conflicto de horario")
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
    @DisplayName("UT-APP-07: Debería actualizar cita existente exitosamente")
    void shouldUpdateAppointmentSuccessfully() {
        // GIVEN
        AppointmentDTO.Request updateReq = AppointmentDTO.Request.builder()
                .patientId(10L)
                .title("Control Post-Tratamiento")
                .appointmentDate(LocalDate.of(2026, 6, 15))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(15, 30))
                .notes("Revisión de coronas")
                .status("CONFIRMADA")
                .build();

        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(savedAppointment));
        when(patientRepository.findById(10L)).thenReturn(Optional.of(mockPatient));
        when(appointmentRepository.findConflicting(
                any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), eq(100L)
        )).thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        AppointmentDTO.Response response = appointmentService.updateAppointment(100L, updateReq);

        // THEN
        assertNotNull(response);
        assertEquals("Control Post-Tratamiento", response.getTitle());
        assertEquals("CONFIRMADA", response.getStatus());
        assertEquals(LocalDate.of(2026, 6, 15), response.getAppointmentDate());
        verify(appointmentRepository, times(1)).save(savedAppointment);
    }

    @Test
    @DisplayName("UT-APP-08: Debería lanzar excepción al actualizar una cita que no existe")
    void shouldThrowExceptionWhenUpdatingNonExistentAppointment() {
        // GIVEN
        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.updateAppointment(999L, testRequest);
        });

        assertEquals("Cita no encontrada: 999", ex.getMessage());
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    @DisplayName("UT-APP-09: Debería lanzar excepción al actualizar cita si el paciente no existe")
    void shouldThrowExceptionWhenUpdatingWithNonExistentPatient() {
        // GIVEN
        testRequest.setPatientId(888L);
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(savedAppointment));
        when(patientRepository.findById(888L)).thenReturn(Optional.empty());

        // WHEN & THEN
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.updateAppointment(100L, testRequest);
        });

        assertEquals("Paciente no encontrado: 888", ex.getMessage());
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    @DisplayName("UT-APP-10: Debería lanzar excepción al actualizar si colisiona con otra cita")
    void shouldThrowExceptionWhenUpdatingWithConflictingSchedule() {
        // GIVEN
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(savedAppointment));
        when(patientRepository.findById(10L)).thenReturn(Optional.of(mockPatient));
        when(appointmentRepository.findConflicting(
                any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), eq(100L)
        )).thenReturn(List.of(Appointment.builder().id(200L).build()));

        // WHEN & THEN
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            appointmentService.updateAppointment(100L, testRequest);
        });

        assertEquals("Ya existe una cita en ese horario.", ex.getMessage());
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    @DisplayName("UT-APP-11: Debería eliminar una cita existente")
    void shouldDeleteAppointmentSuccessfully() {
        // GIVEN
        when(appointmentRepository.existsById(100L)).thenReturn(true);

        // WHEN
        appointmentService.deleteAppointment(100L);

        // THEN
        verify(appointmentRepository, times(1)).existsById(100L);
        verify(appointmentRepository, times(1)).deleteById(100L);
    }

    @Test
    @DisplayName("UT-APP-12: Debería lanzar excepción al eliminar una cita inexistente")
    void shouldThrowExceptionWhenDeletingNonExistentAppointment() {
        // GIVEN
        when(appointmentRepository.existsById(999L)).thenReturn(false);

        // WHEN & THEN
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.deleteAppointment(999L);
        });

        assertEquals("Cita no encontrada: 999", ex.getMessage());
        verify(appointmentRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("UT-APP-13: Debería contar las citas del día actual")
    void shouldCountAppointmentsToday() {
        // GIVEN
        when(appointmentRepository.countByAppointmentDate(any(LocalDate.class))).thenReturn(5L);

        // WHEN
        long count = appointmentService.countToday();

        // THEN
        assertEquals(5L, count);
        verify(appointmentRepository, times(1)).countByAppointmentDate(any(LocalDate.class));
    }
}
