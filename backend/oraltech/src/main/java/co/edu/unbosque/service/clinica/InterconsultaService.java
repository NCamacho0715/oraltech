package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.InterconsultaRequest;
import co.edu.unbosque.dto.clinica.InterconsultaResponse;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.Interconsulta;
import co.edu.unbosque.repository.clinica.InterconsultaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterconsultaService {

    private final InterconsultaRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    @Transactional
    public InterconsultaResponse create(UUID historiaId, InterconsultaRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        Interconsulta i = Interconsulta.builder()
                .historiaClinica(historia)
                .descripcion(req.getDescripcion())
                .build();

        return toResponse(repo.save(i));
    }

    @Transactional(readOnly = true)
    public List<InterconsultaResponse> list(UUID historiaId) {
        historiaService.findOrThrow(historiaId);
        return repo.findAllByHistoriaClinicaId(historiaId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private InterconsultaResponse toResponse(Interconsulta i) {
        return InterconsultaResponse.builder()
                .id(i.getId())
                .descripcion(i.getDescripcion())
                .createdAt(i.getAudit().getCreatedAt())
                .createdBy(i.getAudit().getCreatedBy())
                .updatedAt(i.getAudit().getUpdatedAt())
                .updatedBy(i.getAudit().getUpdatedBy())
                .build();
    }
}
