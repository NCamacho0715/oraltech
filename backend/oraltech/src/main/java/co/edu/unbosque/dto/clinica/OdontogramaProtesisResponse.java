package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OdontogramaProtesisResponse {
    private Long id;
    private Boolean totalSuperior;
    private Boolean totalInferior;
    private Boolean parcialAcriSuperior;
    private Boolean parcialAcriInferior;
    private Boolean removibleMetSuperior;
    private Boolean removibleMetInferior;
    private String fijaSuperior;
    private String fijaInferior; 
}
