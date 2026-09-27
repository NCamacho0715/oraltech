package co.edu.unbosque.dto.clinica;

import lombok.Data;

import java.util.List;

@Data
public class PlanTratamientoRequest {
    private String descripcion;
    private List<PlanItemRequest> items;
}
