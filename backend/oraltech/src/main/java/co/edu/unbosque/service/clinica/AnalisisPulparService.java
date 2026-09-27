package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AnalisisPulparRequest;
import co.edu.unbosque.dto.clinica.AnalisisPulparResponse;
import co.edu.unbosque.entity.clinica.AnalisisPulpar;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.repository.clinica.AnalisisPulparRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalisisPulparService {

    private final AnalisisPulparRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    @Transactional
    public AnalisisPulparResponse upsert(UUID historiaId, AnalisisPulparRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        AnalisisPulpar entity = repo.findByHistoriaClinicaId(historiaId)
                .orElseGet(() -> {
                    AnalisisPulpar a = new AnalisisPulpar();
                    a.setHistoriaClinica(historia);
                    return a;
                });

        entity.setCuellosSensibles(req.getCuellosSensibles());
        entity.setEndoRealizada(req.getEndoRealizada());
        entity.setEndoDefectuosa(req.getEndoDefectuosa());
        entity.setAbcesoFistula(req.getAbcesoFistula());
        entity.setLesionesPeriapicales(req.getLesionesPeriapicales());
        entity.setQxEndodontica(req.getQxEndodontica());
        entity.setExposicionPulpar(req.getExposicionPulpar());
        entity.setCambioColor(req.getCambioColor());
        entity.setObservaciones(req.getObservaciones());

        return toResponse(repo.save(entity));
    }

    @Transactional(readOnly = true)
    public AnalisisPulparResponse get(UUID historiaId) {
        AnalisisPulpar entity = repo.findByHistoriaClinicaId(historiaId)
                .orElse(new AnalisisPulpar());
        return toResponse(entity);
    }

    private AnalisisPulparResponse toResponse(AnalisisPulpar a) {
        return AnalisisPulparResponse.builder()
                .id(a.getId())
                .cuellosSensibles(a.getCuellosSensibles())
                .endoRealizada(a.getEndoRealizada())
                .endoDefectuosa(a.getEndoDefectuosa())
                .abcesoFistula(a.getAbcesoFistula())
                .lesionesPeriapicales(a.getLesionesPeriapicales())
                .qxEndodontica(a.getQxEndodontica())
                .exposicionPulpar(a.getExposicionPulpar())
                .cambioColor(a.getCambioColor())
                .observaciones(a.getObservaciones())
                .createdAt(a.getAudit().getCreatedAt())
                .createdBy(a.getAudit().getCreatedBy())
                .updatedAt(a.getAudit().getUpdatedAt())
                .updatedBy(a.getAudit().getUpdatedBy())
                .build();
    }
}
