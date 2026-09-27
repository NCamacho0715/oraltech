package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AnalisisPeriodontalRequest;
import co.edu.unbosque.dto.clinica.AnalisisPeriodontalResponse;
import co.edu.unbosque.entity.clinica.AnalisisPeriodontal;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.SeccionHistoria;
import co.edu.unbosque.repository.clinica.AnalisisPeriodontalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalisisPeriodontalService {

    private final AnalisisPeriodontalRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;
    private final DesbloqueoService desbloqueoService;

    @Transactional
    public AnalisisPeriodontalResponse upsert(UUID historiaId, AnalisisPeriodontalRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        boolean desbloqueado = desbloqueoService.consumirSiVigente(historiaId, SeccionHistoria.PERIODONTAL);
        Optional<AnalisisPeriodontal> existente = repo.findByHistoriaClinicaId(historiaId);
        if (existente.isPresent() && !desbloqueado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    SeccionHistoria.PERIODONTAL.mensajeBloqueo());
        }

        AnalisisPeriodontal entity = existente
                .orElseGet(() -> {
                    AnalisisPeriodontal a = new AnalisisPeriodontal();
                    a.setHistoriaClinica(historia);
                    return a;
                });

        entity.setBolsaPeriodontal(req.getBolsaPeriodontal());
        entity.setPseudoBolsa(req.getPseudoBolsa());
        entity.setMovilidadDental(req.getMovilidadDental());
        entity.setPerdidaOsea(req.getPerdidaOsea());
        entity.setRetraccionGingival(req.getRetraccionGingival());
        entity.setCalculosSupra(req.getCalculosSupra());
        entity.setCalculosSub(req.getCalculosSub());
        entity.setReabsorcionRadicular(req.getReabsorcionRadicular());
        entity.setSangrado(req.getSangrado());
        entity.setExudadoSupuracion(req.getExudadoSupuracion());
        entity.setInflamacion(req.getInflamacion());
        entity.setCambioColor(req.getCambioColor());

        return toResponse(repo.save(entity));
    }

    @Transactional(readOnly = true)
    public AnalisisPeriodontalResponse get(UUID historiaId) {
        AnalisisPeriodontal entity = repo.findByHistoriaClinicaId(historiaId)
                .orElse(new AnalisisPeriodontal());
        return toResponse(entity);
    }

    private AnalisisPeriodontalResponse toResponse(AnalisisPeriodontal a) {
        return AnalisisPeriodontalResponse.builder()
                .id(a.getId())
                .bolsaPeriodontal(a.getBolsaPeriodontal())
                .pseudoBolsa(a.getPseudoBolsa())
                .movilidadDental(a.getMovilidadDental())
                .perdidaOsea(a.getPerdidaOsea())
                .retraccionGingival(a.getRetraccionGingival())
                .calculosSupra(a.getCalculosSupra())
                .calculosSub(a.getCalculosSub())
                .reabsorcionRadicular(a.getReabsorcionRadicular())
                .sangrado(a.getSangrado())
                .exudadoSupuracion(a.getExudadoSupuracion())
                .inflamacion(a.getInflamacion())
                .cambioColor(a.getCambioColor())
                .createdAt(a.getAudit().getCreatedAt())
                .createdBy(a.getAudit().getCreatedBy())
                .updatedAt(a.getAudit().getUpdatedAt())
                .updatedBy(a.getAudit().getUpdatedBy())
                .build();
    }
}
