package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.DiagnosticoRequest;
import co.edu.unbosque.dto.clinica.DiagnosticoResponse;
import co.edu.unbosque.entity.clinica.Diagnostico;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.SeccionHistoria;
import co.edu.unbosque.repository.clinica.DiagnosticoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiagnosticoService {

    private final DiagnosticoRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;
    private final DesbloqueoService desbloqueoService;

    @Transactional
    public DiagnosticoResponse upsert(UUID historiaId, DiagnosticoRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        boolean desbloqueado = desbloqueoService.consumirSiVigente(historiaId, SeccionHistoria.DIAGNOSTICO);
        Optional<Diagnostico> existente = repo.findByHistoriaClinicaId(historiaId);
        if (existente.isPresent() && !desbloqueado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    SeccionHistoria.DIAGNOSTICO.mensajeBloqueo());
        }

        Diagnostico d = existente
                .orElseGet(() -> {
                    Diagnostico newD = new Diagnostico();
                    newD.setHistoriaClinica(historia);
                    return newD;
                });

        d.setDental(req.getDental());
        d.setPeriodontal(req.getPeriodontal());
        d.setPulpar(req.getPulpar());
        d.setArticular(req.getArticular());
        d.setTejidosBlandos(req.getTejidosBlandos());
        d.setFuncional(req.getFuncional());
        d.setEsqueleticoFacial(req.getEsqueleticoFacial());
        d.setOtros(req.getOtros());

        if (existente.isPresent()) {
            if (d.getAudit() == null) {
                d.setAudit(new co.edu.unbosque.entity.clinica.AuditFields());
            }
            d.getAudit().setUpdatedAt(java.time.LocalDateTime.now());
        }

        return toResponse(repo.save(d));
    }

    @Transactional(readOnly = true)
    public DiagnosticoResponse get(UUID historiaId) {
        Diagnostico d = repo.findByHistoriaClinicaId(historiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diagnóstico no encontrado"));
        return toResponse(d);
    }

    private DiagnosticoResponse toResponse(Diagnostico d) {
        return DiagnosticoResponse.builder()
                .id(d.getId())
                .dental(d.getDental())
                .periodontal(d.getPeriodontal())
                .pulpar(d.getPulpar())
                .articular(d.getArticular())
                .tejidosBlandos(d.getTejidosBlandos())
                .funcional(d.getFuncional())
                .esqueleticoFacial(d.getEsqueleticoFacial())
                .otros(d.getOtros())
                .createdAt(d.getAudit().getCreatedAt())
                .createdBy(d.getAudit().getCreatedBy())
                .updatedAt(d.getAudit().getUpdatedAt())
                .updatedBy(d.getAudit().getUpdatedBy())
                .build();
    }
}
