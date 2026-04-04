package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InterconsultaResponse {
    private Long id;
    private String descripcion;
}
