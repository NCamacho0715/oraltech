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

        List<Appointment> appointments = appointmentRepository
                .findByAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(tomorrow, tomorrow);

        long sent = appointments.stream()
                .filter(a -> !"CANCELADA".equals(a.getStatus()))
                .peek(emailService::sendReminderEmail)
                .count();

        log.info("Recordatorios enviados: {}", sent);
    }
}
