package co.edu.unbosque.service;

import co.edu.unbosque.entity.Appointment;
import co.edu.unbosque.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    /**
     * Runs every day at 9:00 AM.
     * Finds all appointments scheduled for tomorrow and sends reminder emails.
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendDailyReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        log.info("Ejecutando recordatorios para citas del {}", tomorrow);

        try {
            List<Appointment> appointments = appointmentRepository
                    .findByAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(tomorrow, tomorrow);

            long sent = 0;
            for (Appointment appointment : appointments) {
                if (!"CANCELADA".equals(appointment.getStatus())) {
                    try {
                        emailService.sendReminderEmail(appointment);
                        sent++;
                    } catch (Exception ex) {
                        log.warn("No se pudo procesar recordatorio para la cita {}: {}",
                                appointment.getId(), ex.getMessage());
                    }
                }
            }

            log.info("Recordatorios enviados: {}", sent);
        } catch (Exception e) {
            log.warn("Ejecución de recordatorios finalizada con advertencia: {}", e.getMessage());
        }
    }
}
