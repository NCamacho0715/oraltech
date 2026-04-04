package co.edu.unbosque.dto.clinica;

import lombok.Data;

@Data
public class ConsentimientoRequest {
    private String contenido;
    private String pacienteNombre;
    private String pacienteCc;
    private String odontologoNombre;
    private String odontologoCc;
    private String firmaPaciente;
    private String firmaOdontologo;
    private String firmaTestigo;
}
