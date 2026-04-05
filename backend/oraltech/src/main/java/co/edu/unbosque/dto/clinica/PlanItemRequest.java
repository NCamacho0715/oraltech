package co.edu.unbosque.dto.clinica;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PlanItemRequest {
    private String descripcion;
    private BigDecimal tarifa;
    private BigDecimal total;
}
