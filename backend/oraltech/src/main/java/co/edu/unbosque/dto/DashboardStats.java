package co.edu.unbosque.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
    private long totalPatients;
    private long totalClinicalHistories;
    private long appointmentsToday; // Future implementation
    private long availableBackups;
}
