package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class OdontogramaRegistroResponse {
    private Long id;
    private Long evolucionId;
    private Short numeroDiente;
    private String cara;
    private String tipoEvento;
    private String estado;
    private LocalDate fecha;
    private String observacion;

    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
