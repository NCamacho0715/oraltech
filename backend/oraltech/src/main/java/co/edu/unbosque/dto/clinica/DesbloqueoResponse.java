package co.edu.unbosque.dto.clinica;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DesbloqueoResponse {
    private Long id;
    private UUID historiaId;
    private String seccion;
    private String motivo;
    private String solicitadoPor;
    private LocalDateTime createdAt;
    private Boolean usado;
}
