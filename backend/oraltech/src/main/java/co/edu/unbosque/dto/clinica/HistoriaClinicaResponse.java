package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class HistoriaClinicaResponse {
    private UUID id;
    private Long pacienteId;
    private String pacienteNombre;
    private Long odontologoId;
    private String odontologoNombre;
    private LocalDate fechaApertura;
    private String estado;
}
