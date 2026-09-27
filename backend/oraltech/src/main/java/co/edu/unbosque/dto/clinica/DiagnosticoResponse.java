package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DiagnosticoResponse {
    private Long id;
    private String dental;
    private String periodontal;
    private String pulpar;
    private String articular;
    private String tejidosBlandos;
    private String funcional;
    private String esqueleticoFacial;
    private String otros;

    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
