package co.edu.unbosque.service;

import co.edu.unbosque.entity.Appointment;
import co.edu.unbosque.entity.Patient;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    private Patient mockPatient;
    private Appointment mockAppointment;
    private MimeMessage mockMimeMessage;

    @BeforeEach
    void setUp() {
        mockMimeMessage = mock(MimeMessage.class);

        mockPatient = Patient.builder()
                .id(1L)
                .names("Carlos")
                .firstSurname("Cifuentes")
                .email("carlos@oraltech.com")
                .build();

        mockAppointment = Appointment.builder()
                .id(10L)
                .patient(mockPatient)
                .title("Limpieza Dental Profunda")
                .appointmentDate(LocalDate.of(2026, 6, 12))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(9, 45))
                .notes("Paciente hipertenso controlado")
                .build();
    }

    @Test
    @DisplayName("Debería enviar correo de confirmación de cita exitosamente")
    void shouldSendConfirmationEmailSuccessfully() {
        // GIVEN
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);

        // WHEN
        emailService.sendConfirmationEmail(mockAppointment);

        // THEN
        verify(mailSender, times(1)).send(mockMimeMessage);
    }

    @Test
    @DisplayName("Debería omitir el envío de confirmación si el paciente no tiene email")
    void shouldSkipConfirmationEmailWhenPatientHasNoEmail() {
        // GIVEN
        mockPatient.setEmail(null);

        // WHEN
        emailService.sendConfirmationEmail(mockAppointment);

        // THEN
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Debería enviar correo de recordatorio de cita exitosamente")
    void shouldSendReminderEmailSuccessfully() {
        // GIVEN
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);

        // WHEN
        emailService.sendReminderEmail(mockAppointment);

        // THEN
        verify(mailSender, times(1)).send(mockMimeMessage);
    }

    @Test
    @DisplayName("Debería omitir el envío de recordatorio si el paciente no tiene email")
    void shouldSkipReminderEmailWhenPatientHasNoEmail() {
        // GIVEN
        mockPatient.setEmail(" ");

        // WHEN
        emailService.sendReminderEmail(mockAppointment);

        // THEN
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
