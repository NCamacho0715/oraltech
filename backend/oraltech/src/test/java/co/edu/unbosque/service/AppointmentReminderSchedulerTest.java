package co.edu.unbosque.service;

import co.edu.unbosque.entity.Appointment;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.repository.AppointmentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentReminderSchedulerTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AppointmentReminderScheduler scheduler;

    @Test
    @DisplayName("UT-SCHED-01: Debería enviar recordatorios a citas activas para el día siguiente")
    void shouldSendRemindersForActiveAppointmentsTomorrow() {
        // GIVEN
        Patient p1 = Patient.builder().id(1L).email("p1@test.com").build();
        Patient p2 = Patient.builder().id(2L).email("p2@test.com").build();

        Appointment appt1 = Appointment.builder().id(101L).patient(p1).status("PENDIENTE").build();
        Appointment appt2 = Appointment.builder().id(102L).patient(p2).status("CONFIRMADA").build();

        when(appointmentRepository.findByAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(
                any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(List.of(appt1, appt2));

        // WHEN
        scheduler.sendDailyReminders();

        // THEN
        verify(emailService, times(1)).sendReminderEmail(appt1);
        verify(emailService, times(1)).sendReminderEmail(appt2);
        verify(emailService, times(2)).sendReminderEmail(any(Appointment.class));
    }

    @Test
    @DisplayName("UT-SCHED-02: Debería excluir citas canceladas de los recordatorios")
    void shouldExcludeCancelledAppointments() {
        // GIVEN
        Patient p1 = Patient.builder().id(1L).email("p1@test.com").build();
        Patient p2 = Patient.builder().id(2L).email("p2@test.com").build();

        Appointment appt1 = Appointment.builder().id(101L).patient(p1).status("PENDIENTE").build();
        Appointment appt2 = Appointment.builder().id(102L).patient(p2).status("CANCELADA").build();

        when(appointmentRepository.findByAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(
                any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(List.of(appt1, appt2));

        // WHEN
        scheduler.sendDailyReminders();

        // THEN
        verify(emailService, times(1)).sendReminderEmail(appt1);
        verify(emailService, never()).sendReminderEmail(appt2);
    }

    @Test
    @DisplayName("UT-SCHED-03: Debería manejar días sin citas sin realizar llamadas de correo")
    void shouldHandleEmptyDayGracefully() {
        // GIVEN
        when(appointmentRepository.findByAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(
                any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(Collections.emptyList());

        // WHEN
        scheduler.sendDailyReminders();

        // THEN
        verify(emailService, never()).sendReminderEmail(any(Appointment.class));
    }
}
