package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AnamnesisRequest;
import co.edu.unbosque.dto.clinica.AnamnesisResponse;
import co.edu.unbosque.entity.clinica.Anamnesis;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.SeccionHistoria;
import co.edu.unbosque.repository.clinica.AnamnesisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnamnesisService {

    private final AnamnesisRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;
    private final DesbloqueoService desbloqueoService;

    @Transactional
    public AnamnesisResponse upsert(UUID historiaId, AnamnesisRequest request) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        boolean desbloqueado = desbloqueoService.consumirSiVigente(historiaId, SeccionHistoria.ANAMNESIS);
        Optional<Anamnesis> existente = repo.findByHistoriaClinicaId(historiaId);
        if (existente.isPresent() && !desbloqueado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    SeccionHistoria.ANAMNESIS.mensajeBloqueo());
        }

        Anamnesis anamnesis = existente
                .orElseGet(() -> {
                    Anamnesis a = new Anamnesis();
                    a.setHistoriaClinica(historia);
                    return a;
                });

        anamnesis.setMotivoConsulta(request.getMotivoConsulta());
        anamnesis.setEstadoActual(request.getEstadoActual());
        if (existente.isPresent()) {
            if (anamnesis.getAudit() == null) {
                anamnesis.setAudit(new co.edu.unbosque.entity.clinica.AuditFields());
            }
            anamnesis.getAudit().setUpdatedAt(java.time.LocalDateTime.now());
        }

        return toResponse(repo.save(anamnesis));
    }

    @Transactional(readOnly = true)
    public AnamnesisResponse get(UUID historiaId) {
        Anamnesis a = repo.findByHistoriaClinicaId(historiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anamnesis no encontrada"));
        return toResponse(a);
    }

    private AnamnesisResponse toResponse(Anamnesis a) {
        return AnamnesisResponse.builder()
                .id(a.getId())
                .motivoConsulta(a.getMotivoConsulta())
                .estadoActual(a.getEstadoActual())
                .createdAt(a.getAudit().getCreatedAt())
                .createdBy(a.getAudit().getCreatedBy())
                .updatedAt(a.getAudit().getUpdatedAt())
                .updatedBy(a.getAudit().getUpdatedBy())
                .build();
    }
}
