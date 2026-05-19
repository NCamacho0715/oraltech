package co.edu.unbosque.dto.clinica;

import lombok.Data;

@Data
public class DiagnosticoRequest {
    private String dental;
    private String periodontal;
    private String pulpar;
    private String articular;
    private String tejidosBlandos;
    private String funcional;
    private String esqueleticoFacial;
    private String otros;
}
