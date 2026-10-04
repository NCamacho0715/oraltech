package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.OdontogramaProtesisRequest;
import co.edu.unbosque.dto.clinica.OdontogramaProtesisResponse;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.SeccionHistoria;
import co.edu.unbosque.entity.clinica.OdontogramaProtesis;
import co.edu.unbosque.repository.clinica.OdontogramaProtesisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OdontogramaProtesisService {

    private final OdontogramaProtesisRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;
    private final DesbloqueoService desbloqueoService;

    @Transactional
    public OdontogramaProtesisResponse upsert(UUID historiaId, OdontogramaProtesisRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        boolean desbloqueado = desbloqueoService.consumirSiVigente(historiaId, SeccionHistoria.PROTESIS);
        Optional<OdontogramaProtesis> existente = repo.findByHistoriaClinicaId(historiaId);
        if (existente.isPresent() && !desbloqueado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    SeccionHistoria.PROTESIS.mensajeBloqueo());
        }

        OdontogramaProtesis op = existente
                .orElseGet(() -> {
                    OdontogramaProtesis o = new OdontogramaProtesis();
                    o.setHistoriaClinica(historia);
                    return o;
                });

        op.setTotalSuperior(req.getTotalSuperior());
        op.setTotalInferior(req.getTotalInferior());
        op.setParcialAcriSuperior(req.getParcialAcriSuperior());
        op.setParcialAcriInferior(req.getParcialAcriInferior());
        op.setRemovibleMetSuperior(req.getRemovibleMetSuperior());
        op.setRemovibleMetInferior(req.getRemovibleMetInferior());
        op.setFijaSuperior(req.getFijaSuperior());
        op.setFijaInferior(req.getFijaInferior());

        return toResponse(repo.save(op));
    }

    @Transactional(readOnly = true)
    public OdontogramaProtesisResponse get(UUID historiaId) {
        OdontogramaProtesis op = repo.findByHistoriaClinicaId(historiaId)
                .orElse(new OdontogramaProtesis()); // Return empty if not found
        return toResponse(op);
    }

    private OdontogramaProtesisResponse toResponse(OdontogramaProtesis op) {
        return OdontogramaProtesisResponse.builder()
                .id(op.getId())
                .totalSuperior(op.getTotalSuperior())
                .totalInferior(op.getTotalInferior())
                .parcialAcriSuperior(op.getParcialAcriSuperior())
                .parcialAcriInferior(op.getParcialAcriInferior())
                .removibleMetSuperior(op.getRemovibleMetSuperior())
                .removibleMetInferior(op.getRemovibleMetInferior())
                .fijaSuperior(op.getFijaSuperior())
                .fijaInferior(op.getFijaInferior())
                .createdAt(op.getAudit().getCreatedAt())
                .createdBy(op.getAudit().getCreatedBy())
                .updatedAt(op.getAudit().getUpdatedAt())
                .updatedBy(op.getAudit().getUpdatedBy())
                .build();
    }
}
