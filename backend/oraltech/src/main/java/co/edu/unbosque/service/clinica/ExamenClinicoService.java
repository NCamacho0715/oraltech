package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.ExamenClinicoRequest;
import co.edu.unbosque.dto.clinica.ExamenClinicoResponse;
import co.edu.unbosque.entity.clinica.ExamenClinico;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.SeccionHistoria;
import co.edu.unbosque.entity.enums.HigieneGrado;
import co.edu.unbosque.entity.enums.PatronMasticacion;
import co.edu.unbosque.entity.enums.TejidoEstado;
import co.edu.unbosque.repository.clinica.ExamenClinicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExamenClinicoService {

    private final ExamenClinicoRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;
    private final DesbloqueoService desbloqueoService;

    @Transactional
    public ExamenClinicoResponse upsert(UUID historiaId, ExamenClinicoRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        boolean desbloqueado = desbloqueoService.consumirSiVigente(historiaId, SeccionHistoria.EXAMEN);
        Optional<ExamenClinico> existente = repo.findByHistoriaClinicaId(historiaId);
        if (existente.isPresent() && !desbloqueado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    SeccionHistoria.EXAMEN.mensajeBloqueo());
        }

        ExamenClinico ex = existente
                .orElseGet(() -> {
                    ExamenClinico e = new ExamenClinico();
                    e.setHistoriaClinica(historia);
                    return e;
                });

        // Tejidos blandos
        ex.setLengua(parseEnum(TejidoEstado.class, req.getLengua()));
        ex.setCarrillos(parseEnum(TejidoEstado.class, req.getCarrillos()));
        ex.setFrenillos(parseEnum(TejidoEstado.class, req.getFrenillos()));
        ex.setPaladar(parseEnum(TejidoEstado.class, req.getPaladar()));
        ex.setPisoBoca(parseEnum(TejidoEstado.class, req.getPisoBoca()));
        ex.setLabios(parseEnum(TejidoEstado.class, req.getLabios()));
        ex.setComisuras(parseEnum(TejidoEstado.class, req.getComisuras()));
        ex.setGlandulas(parseEnum(TejidoEstado.class, req.getGlandulas()));
        ex.setPigmentaciones(parseEnum(TejidoEstado.class, req.getPigmentaciones()));

        // Tejidos duros
        ex.setHipoplasias(req.getHipoplasias());
        ex.setAmelogenesis(req.getAmelogenesis());
        ex.setManchas(req.getManchas());
        ex.setDesgastes(req.getDesgastes());
        ex.setTdFracturas(req.getTdFracturas());
        ex.setAgenesia(req.getAgenesia());
        ex.setSupernumerario(req.getSupernumerario());
        ex.setAusenteObs(req.getAusenteObs());

        // Maxilares
        ex.setMicrognasia(req.getMicrognasia());
        ex.setMacrognasia(req.getMacrognasia());
        ex.setTorus(req.getTorus());
        ex.setMaxOtros(req.getMaxOtros());

        // ATM
        ex.setDolorArticular(req.getDolorArticular());
        ex.setDolorMuscular(req.getDolorMuscular());
        ex.setRuidos(req.getRuidos());
        ex.setLimitacion(req.getLimitacion());
        ex.setDesviacion(req.getDesviacion());
        ex.setAtmObservaciones(req.getAtmObservaciones());

        // Oclusión
        ex.setSobremordidaH(req.getSobremordidaH());
        ex.setSobremordidaV(req.getSobremordidaV());
        ex.setOclusionTipo(req.getOclusionTipo());
        ex.setLineaMedia(req.getLineaMedia());
        ex.setPatronMasticacion(parseEnum(PatronMasticacion.class, req.getPatronMasticacion()));

        // Hábitos
        ex.setHigiene(parseEnum(HigieneGrado.class, req.getHigiene()));
        ex.setHabHalitosis(req.getHabHalitosis());
        ex.setBruxismo(req.getBruxismo());
        ex.setHabOtros(req.getHabOtros());

        if (existente.isPresent()) {
            if (ex.getAudit() == null) {
                ex.setAudit(new co.edu.unbosque.entity.clinica.AuditFields());
            }
            ex.getAudit().setUpdatedAt(java.time.LocalDateTime.now());
        }

        return toResponse(repo.save(ex));
    }

    @Transactional(readOnly = true)
    public ExamenClinicoResponse get(UUID historiaId) {
        ExamenClinico e = repo.findByHistoriaClinicaId(historiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Examen clínico no encontrado"));
        return toResponse(e);
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumType, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(enumType, value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Valor inválido '" + value + "' para " + enumType.getSimpleName());
        }
    }

    private ExamenClinicoResponse toResponse(ExamenClinico e) {
        return ExamenClinicoResponse.builder()
                .id(e.getId())
                .lengua(enumName(e.getLengua()))
                .carrillos(enumName(e.getCarrillos()))
                .frenillos(enumName(e.getFrenillos()))
                .paladar(enumName(e.getPaladar()))
                .pisoBoca(enumName(e.getPisoBoca()))
                .labios(enumName(e.getLabios()))
                .comisuras(enumName(e.getComisuras()))
                .glandulas(enumName(e.getGlandulas()))
                .pigmentaciones(enumName(e.getPigmentaciones()))
                .hipoplasias(e.getHipoplasias())
                .amelogenesis(e.getAmelogenesis())
                .manchas(e.getManchas())
                .desgastes(e.getDesgastes())
                .tdFracturas(e.getTdFracturas())
                .agenesia(e.getAgenesia())
                .supernumerario(e.getSupernumerario())
                .ausenteObs(e.getAusenteObs())
                .micrognasia(e.getMicrognasia())
                .macrognasia(e.getMacrognasia())
                .torus(e.getTorus())
                .maxOtros(e.getMaxOtros())
                .dolorArticular(e.getDolorArticular())
                .dolorMuscular(e.getDolorMuscular())
                .ruidos(e.getRuidos())
                .limitacion(e.getLimitacion())
                .desviacion(e.getDesviacion())
                .atmObservaciones(e.getAtmObservaciones())
                .sobremordidaH(e.getSobremordidaH())
                .sobremordidaV(e.getSobremordidaV())
                .oclusionTipo(e.getOclusionTipo())
                .lineaMedia(e.getLineaMedia())
                .patronMasticacion(enumName(e.getPatronMasticacion()))
                .higiene(enumName(e.getHigiene()))
                .habHalitosis(e.getHabHalitosis())
                .bruxismo(e.getBruxismo())
                .habOtros(e.getHabOtros())
                .createdAt(e.getAudit().getCreatedAt())
                .createdBy(e.getAudit().getCreatedBy())
                .updatedAt(e.getAudit().getUpdatedAt())
                .updatedBy(e.getAudit().getUpdatedBy())
                .build();
    }

    private String enumName(Enum<?> value) {
        return value != null ? value.name() : null;
    }
}
