package co.edu.unbosque.dto.clinica;

import lombok.Data;

import java.util.List;

@Data
public class PlanTratamientoRequest {
    private Long odontologoId;
    private List<PlanItemRequest> items;
}
