package co.edu.unbosque.dto.clinica;

import lombok.Data;

@Data
public class ExamenComplementarioRequest {
    private Boolean rxPanoramica;
    private Boolean rxPeriapical;
    private String rxPeriapicalComentario;
    private Boolean paqueteOrtodoncia;
    private Boolean otros;
    private String otrosTexto;
}
