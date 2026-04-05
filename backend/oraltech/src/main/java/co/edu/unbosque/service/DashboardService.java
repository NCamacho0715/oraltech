package co.edu.unbosque.service;

import co.edu.unbosque.dto.DashboardStats;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.clinica.HistoriaClinicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PatientRepository patientRepository;
    private final HistoriaClinicaRepository historiaClinicaRepository;

    public DashboardStats getStats() {
        return DashboardStats.builder()
                .totalPatients(patientRepository.count())
                .totalClinicalHistories(historiaClinicaRepository.count())
                .appointmentsToday(0) // Placeholder for now
                .build();
    }
}
