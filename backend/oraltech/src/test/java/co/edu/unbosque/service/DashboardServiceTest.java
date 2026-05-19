package co.edu.unbosque.service;

import co.edu.unbosque.dto.DashboardStats;
import co.edu.unbosque.repository.AppointmentRepository;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.clinica.HistoriaClinicaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private HistoriaClinicaRepository historiaClinicaRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("Debería calcular correctamente las estadísticas consolidadas del Dashboard")
    void shouldReturnCorrectDashboardStats() {
        // GIVEN
        when(patientRepository.count()).thenReturn(150L);
        when(historiaClinicaRepository.count()).thenReturn(85L);
        when(appointmentRepository.countByAppointmentDate(any(LocalDate.class))).thenReturn(12L);

        // WHEN
        DashboardStats stats = dashboardService.getStats();

        // THEN
        assertNotNull(stats);
        assertEquals(150L, stats.getTotalPatients());
        assertEquals(85L, stats.getTotalClinicalHistories());
        assertEquals(12L, stats.getAppointmentsToday());

        verify(patientRepository, times(1)).count();
        verify(historiaClinicaRepository, times(1)).count();
        verify(appointmentRepository, times(1)).countByAppointmentDate(any(LocalDate.class));
    }
}
