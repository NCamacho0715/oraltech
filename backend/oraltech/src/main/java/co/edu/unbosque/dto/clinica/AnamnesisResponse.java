package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnamnesisResponse {
    private Long id;
    private String motivoConsulta;
    private String estadoActual;
}
