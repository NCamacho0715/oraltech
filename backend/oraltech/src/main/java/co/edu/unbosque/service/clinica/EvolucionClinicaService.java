package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.EvolucionClinicaListResponse;
import co.edu.unbosque.dto.clinica.EvolucionClinicaRequest;
import co.edu.unbosque.dto.clinica.EvolucionClinicaResponse;
import co.edu.unbosque.entity.clinica.EvolucionClinica;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.repository.clinica.EvolucionClinicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvolucionClinicaService {

    private final EvolucionClinicaRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    /**
     * Append-only: creates a new evolution record. No update endpoint.
     */
    @Transactional
    public EvolucionClinicaResponse create(UUID historiaId, EvolucionClinicaRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        // Validate signatures
        guard.validateSignatureSize(req.getFirmaPaciente(), "firmaPaciente");
        guard.validateSignatureSize(req.getFirmaOdontologo(), "firmaOdontologo");

        EvolucionClinica evo = EvolucionClinica.builder()
                .historiaClinica(historia)
                .citaId(req.getCitaId())
                .numeroDiente(req.getNumeroDiente())
                .procedimiento(req.getProcedimiento())
                .observaciones(req.getObservaciones())
                .abono(req.getAbono())
                .saldo(req.getSaldo())
                .firmaPaciente(req.getFirmaPaciente())
                .firmaOdontologo(req.getFirmaOdontologo())
                .build();

        return toDetailResponse(repo.save(evo));
    }

    /**
     * List view — excludes signatures.
     */
    @Transactional(readOnly = true)
    public List<EvolucionClinicaListResponse> list(UUID historiaId) {
        historiaService.findOrThrow(historiaId);
        return repo.findAllByHistoriaClinicaIdOrderByFechaAsc(historiaId).stream()
                .map(this::toListResponse)
                .collect(Collectors.toList());
    }

    /**
     * Detail view — includes signatures.
     */
    @Transactional(readOnly = true)
    public EvolucionClinicaResponse getById(UUID historiaId, Long evolucionId) {
        historiaService.findOrThrow(historiaId);
        EvolucionClinica evo = repo.findById(evolucionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evolución no encontrada"));

        if (!evo.getHistoriaClinica().getId().equals(historiaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evolución no pertenece a esta historia");
        }

        return toDetailResponse(evo);
    }

    private EvolucionClinicaListResponse toListResponse(EvolucionClinica e) {
        return EvolucionClinicaListResponse.builder()
                .id(e.getId())
                .citaId(e.getCitaId())
                .fecha(e.getFecha())
                .numeroDiente(e.getNumeroDiente())
                .procedimiento(e.getProcedimiento())
                .observaciones(e.getObservaciones())
                .abono(e.getAbono())
                .saldo(e.getSaldo())
                .createdAt(e.getAudit().getCreatedAt())
                .createdBy(e.getAudit().getCreatedBy())
                .updatedAt(e.getAudit().getUpdatedAt())
                .updatedBy(e.getAudit().getUpdatedBy())
                .build();
    }

    private EvolucionClinicaResponse toDetailResponse(EvolucionClinica e) {
        return EvolucionClinicaResponse.builder()
                .id(e.getId())
                .citaId(e.getCitaId())
                .fecha(e.getFecha())
                .numeroDiente(e.getNumeroDiente())
                .procedimiento(e.getProcedimiento())
                .observaciones(e.getObservaciones())
                .abono(e.getAbono())
                .saldo(e.getSaldo())
                .firmaPaciente(e.getFirmaPaciente())
                .firmaOdontologo(e.getFirmaOdontologo())
                .createdAt(e.getAudit().getCreatedAt())
                .createdBy(e.getAudit().getCreatedBy())
                .updatedAt(e.getAudit().getUpdatedAt())
                .updatedBy(e.getAudit().getUpdatedBy())
                .build();
    }
}
