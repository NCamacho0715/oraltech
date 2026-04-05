package co.edu.unbosque.dto.clinica;

import lombok.Data;

@Data
public class OdontogramaProtesisRequest {
    private Boolean totalSuperior;
    private Boolean totalInferior;
    private Boolean parcialAcriSuperior;
    private Boolean parcialAcriInferior;
    private Boolean removibleMetSuperior;
    private Boolean removibleMetInferior;
    private String fijaSuperior;
    private String fijaInferior;
}
