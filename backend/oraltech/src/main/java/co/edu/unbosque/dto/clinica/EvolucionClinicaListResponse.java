package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * List view of EvolucionClinica — excludes signature fields for security.
 */
@Data
@Builder
public class EvolucionClinicaListResponse {
    private Long id;
    private Long citaId;
    private LocalDate fecha;
    private Short numeroDiente;
    private String procedimiento;
    private String observaciones;
    private BigDecimal abono;
    private BigDecimal saldo;
}
