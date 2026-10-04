package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ConsentimientoResponse {
    private Long id;
    private String contenido;
    private String pacienteNombre;
    private String pacienteCc;
    private String odontologoNombre;
    private String odontologoCc;
    private LocalDate fecha;
    private String firmaPaciente;
    private String firmaOdontologo;
    private String firmaTestigo;

    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
