package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.ExamenComplementarioRequest;
import co.edu.unbosque.dto.clinica.ExamenComplementarioResponse;
import co.edu.unbosque.entity.clinica.ExamenComplementario;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.repository.clinica.ExamenComplementarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExamenComplementarioService {

    private final ExamenComplementarioRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    /**
     * Crear-una-vez (HU-4, anticipa la inmutabilidad de HU-2): el segundo PUT
     * sobre la misma historia responde 409 y no modifica el registro.
     */
    @Transactional
    public ExamenComplementarioResponse create(UUID historiaId, ExamenComplementarioRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        validate(req);

        if (repo.findByHistoriaClinicaId(historiaId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Exámenes complementarios ya registrados y bloqueados");
        }

        ExamenComplementario entity = new ExamenComplementario();
        entity.setHistoriaClinica(historia);
        entity.setRxPanoramica(Boolean.TRUE.equals(req.getRxPanoramica()));
        entity.setRxPeriapical(Boolean.TRUE.equals(req.getRxPeriapical()));
        entity.setRxPeriapicalComentario(req.getRxPeriapicalComentario());
        entity.setPaqueteOrtodoncia(Boolean.TRUE.equals(req.getPaqueteOrtodoncia()));
        entity.setOtros(Boolean.TRUE.equals(req.getOtros()));
        entity.setOtrosTexto(req.getOtrosTexto());

        return toResponse(repo.save(entity));
    }

    @Transactional(readOnly = true)
    public ExamenComplementarioResponse get(UUID historiaId) {
        ExamenComplementario entity = repo.findByHistoriaClinicaId(historiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Exámenes complementarios no registrados"));
        return toResponse(entity);
    }

    private void validate(ExamenComplementarioRequest req) {
        if (req == null
                || (!Boolean.TRUE.equals(req.getRxPanoramica())
                && !Boolean.TRUE.equals(req.getRxPeriapical())
                && !Boolean.TRUE.equals(req.getPaqueteOrtodoncia())
                && !Boolean.TRUE.equals(req.getOtros()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debe seleccionar al menos un examen complementario");
        }
        if (Boolean.TRUE.equals(req.getRxPeriapical())
                && (req.getRxPeriapicalComentario() == null || req.getRxPeriapicalComentario().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El comentario de Rx Periapical es obligatorio cuando se selecciona");
        }
        if (Boolean.TRUE.equals(req.getOtros())
                && (req.getOtrosTexto() == null || req.getOtrosTexto().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La descripción de Otros es obligatoria cuando se selecciona");
        }
    }

    private ExamenComplementarioResponse toResponse(ExamenComplementario e) {
        return ExamenComplementarioResponse.builder()
                .id(e.getId())
                .rxPanoramica(e.getRxPanoramica())
                .rxPeriapical(e.getRxPeriapical())
                .rxPeriapicalComentario(e.getRxPeriapicalComentario())
                .paqueteOrtodoncia(e.getPaqueteOrtodoncia())
                .otros(e.getOtros())
                .otrosTexto(e.getOtrosTexto())
                .createdAt(e.getAudit().getCreatedAt())
                .createdBy(e.getAudit().getCreatedBy())
                .updatedAt(e.getAudit().getUpdatedAt())
                .updatedBy(e.getAudit().getUpdatedBy())
                .build();
    }
}
