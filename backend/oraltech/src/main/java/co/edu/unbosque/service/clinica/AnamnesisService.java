package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AnamnesisRequest;
import co.edu.unbosque.dto.clinica.AnamnesisResponse;
import co.edu.unbosque.entity.clinica.Anamnesis;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.repository.clinica.AnamnesisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnamnesisService {

    private final AnamnesisRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    @Transactional
    public AnamnesisResponse upsert(UUID historiaId, AnamnesisRequest request) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);

        Anamnesis anamnesis = repo.findByHistoriaClinicaId(historiaId)
                .orElseGet(() -> {
                    Anamnesis a = new Anamnesis();
                    a.setHistoriaClinica(historia);
                    return a;
                });

        anamnesis.setMotivoConsulta(request.getMotivoConsulta());
        anamnesis.setEstadoActual(request.getEstadoActual());

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
                .build();
    }
}
