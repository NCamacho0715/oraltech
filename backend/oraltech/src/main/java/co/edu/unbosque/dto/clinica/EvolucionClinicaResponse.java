package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class EvolucionClinicaResponse {
    private Long id;
    private Long citaId;
    private LocalDate fecha;
    private Short numeroDiente;
    private String procedimiento;
    private String observaciones;
    private BigDecimal abono;
    private BigDecimal saldo;
    // Signatures included — detail view only
    private String firmaPaciente;
    private String firmaOdontologo;
}
