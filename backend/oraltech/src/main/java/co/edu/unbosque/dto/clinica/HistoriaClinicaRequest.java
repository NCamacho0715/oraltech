package co.edu.unbosque.dto.clinica;

import lombok.Data;

@Data
public class HistoriaClinicaRequest {
    private Long pacienteId;
    private Long odontologoId;
}
