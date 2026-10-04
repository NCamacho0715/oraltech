package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ExamenComplementarioResponse {
    private Long id;
    private Boolean rxPanoramica;
    private Boolean rxPeriapical;
    private String rxPeriapicalComentario;
    private Boolean paqueteOrtodoncia;
    private Boolean otros;
    private String otrosTexto;

    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
