package co.edu.unbosque.dto.clinica;

import lombok.Data;

@Data
public class OdontogramaRegistroRequest {
    private Long evolucionId;
    private Short numeroDiente;
    private String cara;
    private String tipoEvento; // TipoEvento enum value
    private String estado;     // EstadoEvento enum value
    private String observacion;
}
