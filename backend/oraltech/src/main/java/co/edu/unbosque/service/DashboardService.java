package co.edu.unbosque.service;

import co.edu.unbosque.dto.DashboardStats;
import co.edu.unbosque.repository.AppointmentRepository;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.clinica.HistoriaClinicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PatientRepository patientRepository;
    private final HistoriaClinicaRepository historiaClinicaRepository;
    private final AppointmentRepository appointmentRepository;
    private final BackupService backupService;

    public DashboardStats getStats() {
        long availableBackups = 0;
        try {
            availableBackups = backupService.listBackups().size();
        } catch (Exception ignored) {}

        return DashboardStats.builder()
                .totalPatients(patientRepository.count())
                .totalClinicalHistories(historiaClinicaRepository.count())
                .appointmentsToday(appointmentRepository.countByAppointmentDate(LocalDate.now()))
                .availableBackups(availableBackups)
                .build();
    }
}
