package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PlanTratamientoResponse {
    private Long id;
    private Long odontologoId;
    private String odontologoNombre;
    private LocalDate fecha;
    private List<PlanItemResponse> items;

    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;

    @Data
    @Builder
    public static class PlanItemResponse {
        private Long id;
        private String descripcion;
        private BigDecimal tarifa;
        private BigDecimal total;
        /** Los ítems no tienen auditoría propia: heredan la fecha de creación del plan. */
        private LocalDateTime createdAt;
    }
}
