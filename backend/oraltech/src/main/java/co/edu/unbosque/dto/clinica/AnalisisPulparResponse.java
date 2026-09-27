package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AnalisisPulparResponse {
    private Long id;
    private Boolean cuellosSensibles;
    private Boolean endoRealizada;
    private Boolean endoDefectuosa;
    private Boolean abcesoFistula;
    private Boolean lesionesPeriapicales;
    private Boolean qxEndodontica;
    private Boolean exposicionPulpar;
    private Boolean cambioColor;
    private String observaciones;

    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
