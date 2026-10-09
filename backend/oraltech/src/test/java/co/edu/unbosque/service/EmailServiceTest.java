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
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
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
    @DisplayName("UT-MAIL-01: Debería enviar correo de confirmación de cita exitosamente")
    void shouldSendConfirmationEmailSuccessfully() {
        // GIVEN
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);

        // WHEN
        emailService.sendConfirmationEmail(mockAppointment);

        // THEN
        verify(mailSender, times(1)).send(mockMimeMessage);
    }

    @Test
    @DisplayName("UT-MAIL-02: Debería omitir el envío de confirmación si el paciente no tiene email")
    void shouldSkipConfirmationEmailWhenPatientHasNoEmail() {
        // GIVEN
        mockPatient.setEmail(null);

        // WHEN
        emailService.sendConfirmationEmail(mockAppointment);

        // THEN
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("UT-MAIL-03: Debería capturar error de envío sin propagar excepción al llamador")
    void shouldHandleMailExceptionGracefully() {
        // GIVEN
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
        doThrow(new MailSendException("SMTP error")).when(mailSender).send(mockMimeMessage);

        // WHEN & THEN
        assertDoesNotThrow(() -> emailService.sendConfirmationEmail(mockAppointment));
        verify(mailSender, times(1)).send(mockMimeMessage);
    }

    @Test
    @DisplayName("UT-MAIL-04: Debería enviar correo de recordatorio de cita exitosamente")
    void shouldSendReminderEmailSuccessfully() {
        // GIVEN
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);

        // WHEN
        emailService.sendReminderEmail(mockAppointment);

        // THEN
        verify(mailSender, times(1)).send(mockMimeMessage);
    }

    @Test
    @DisplayName("Debería omitir el envío de recordatorio si el email está en blanco")
    void shouldSkipReminderEmailWhenPatientEmailIsBlank() {
        // GIVEN
        mockPatient.setEmail("   ");

        // WHEN
        emailService.sendReminderEmail(mockAppointment);

        // THEN
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("UT-MAIL-05: Debería capturar error de red/sin internet al enviar recordatorio sin propagar excepción")
    void shouldHandleReminderMailExceptionWhenOfflineGracefully() {
        // GIVEN
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
        doThrow(new MailSendException("Couldn't connect to host, port: smtp.gmail.com, 587; timeout 5000"))
                .when(mailSender).send(mockMimeMessage);

        // WHEN & THEN
        assertDoesNotThrow(() -> emailService.sendReminderEmail(mockAppointment));
        verify(mailSender, times(1)).send(mockMimeMessage);
    }

    @Test
    @DisplayName("UT-MAIL-06: Debería manejar citas o pacientes nulos sin lanzar excepciones")
    void shouldHandleNullAppointmentOrPatientGracefully() {
        assertDoesNotThrow(() -> emailService.sendConfirmationEmail(null));
        assertDoesNotThrow(() -> emailService.sendReminderEmail(null));

        Appointment noPatientAppt = Appointment.builder().id(99L).patient(null).build();
        assertDoesNotThrow(() -> emailService.sendConfirmationEmail(noPatientAppt));
        assertDoesNotThrow(() -> emailService.sendReminderEmail(noPatientAppt));
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
