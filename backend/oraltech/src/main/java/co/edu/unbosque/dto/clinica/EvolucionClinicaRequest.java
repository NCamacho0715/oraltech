package co.edu.unbosque.dto.clinica;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class EvolucionClinicaRequest {
    private Long citaId;
    private Boolean esUrgencia;
    private Short numeroDiente;
    private String procedimiento;
    private String observaciones;
    private BigDecimal abono;
    private BigDecimal saldo;
    private String firmaPaciente;
    private String firmaOdontologo;
}
