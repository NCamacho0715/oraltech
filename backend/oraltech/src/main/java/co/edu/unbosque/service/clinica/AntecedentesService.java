package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AntecedentesRequest;
import co.edu.unbosque.dto.clinica.AntecedentesResponse;
import co.edu.unbosque.entity.clinica.Antecedentes;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.repository.clinica.AntecedentesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AntecedentesService {

    private final AntecedentesRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    @Transactional
    public AntecedentesResponse upsert(UUID historiaId, AntecedentesRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);

        // Pregnancy validation: only if patient is female
        if (Boolean.TRUE.equals(req.getEmbarazo())) {
            String sex = historia.getPaciente().getSex();
            if (sex == null || !sex.equalsIgnoreCase("F")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El campo embarazo solo aplica para pacientes de sexo femenino");
            }
        }

        Antecedentes ant = repo.findByHistoriaClinicaId(historiaId)
                .orElseGet(() -> {
                    Antecedentes a = new Antecedentes();
                    a.setHistoriaClinica(historia);
                    return a;
                });

        // Familiares
        ant.setFamCardiacos(req.getFamCardiacos());
        ant.setFamDiabetes(req.getFamDiabetes());
        ant.setFamHipertension(req.getFamHipertension());
        ant.setFamCancer(req.getFamCancer());
        ant.setFamEpilepsia(req.getFamEpilepsia());
        ant.setFamOtros(req.getFamOtros());

        // Patológicos
        ant.setHepatitis(req.getHepatitis());
        ant.setFiebreReumatica(req.getFiebreReumatica());
        ant.setPatDiabetes(req.getPatDiabetes());
        ant.setUlcera(req.getUlcera());
        ant.setPatEpilepsia(req.getPatEpilepsia());
        ant.setPatHipertension(req.getPatHipertension());
        ant.setConvulsiones(req.getConvulsiones());
        ant.setAlergias(req.getAlergias());
        ant.setMareos(req.getMareos());
        ant.setFracturas(req.getFracturas());
        ant.setHemorragias(req.getHemorragias());
        ant.setCicatrizacion(req.getCicatrizacion());
        ant.setInfartos(req.getInfartos());
        ant.setValvulas(req.getValvulas());
        ant.setRenales(req.getRenales());
        ant.setRespiratorios(req.getRespiratorios());
        ant.setVih(req.getVih());

        // Toxicológicos
        ant.setFuma(req.getFuma());
        ant.setAlcohol(req.getAlcohol());
        ant.setCafe(req.getCafe());
        ant.setMedicamentos(req.getMedicamentos());
        ant.setAlergiaMedicamentos(req.getAlergiaMedicamentos());
        ant.setAlergiaAnestesia(req.getAlergiaAnestesia());

        // Médicos personales
        ant.setTratamiento(req.getTratamiento());
        ant.setEmbarazo(req.getEmbarazo());
        ant.setMesesEmbarazo(req.getMesesEmbarazo());
        ant.setCirugias(req.getCirugias());
        ant.setTransfusiones(req.getTransfusiones());

        // Estomatológicos
        ant.setLuxacion(req.getLuxacion());
        ant.setAmigdalitis(req.getAmigdalitis());
        ant.setInfecciones(req.getInfecciones());
        ant.setHalitosis(req.getHalitosis());
        ant.setFuegos(req.getFuegos());
        ant.setCepilladoFreq(req.getCepilladoFreq());
        ant.setSedaFreq(req.getSedaFreq());
        ant.setOtrosHabitos(req.getOtrosHabitos());
        ant.setUltimaVisita(req.getUltimaVisita());
        ant.setMotivoVisita(req.getMotivoVisita());

        // Observaciones
        ant.setObservaciones(req.getObservaciones());

        return toResponse(repo.save(ant));
    }

    @Transactional(readOnly = true)
    public AntecedentesResponse get(UUID historiaId) {
        Antecedentes a = repo.findByHistoriaClinicaId(historiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Antecedentes no encontrados"));
        return toResponse(a);
    }

    private AntecedentesResponse toResponse(Antecedentes a) {
        return AntecedentesResponse.builder()
                .id(a.getId())
                .famCardiacos(a.getFamCardiacos())
                .famDiabetes(a.getFamDiabetes())
                .famHipertension(a.getFamHipertension())
                .famCancer(a.getFamCancer())
                .famEpilepsia(a.getFamEpilepsia())
                .famOtros(a.getFamOtros())
                .hepatitis(a.getHepatitis())
                .fiebreReumatica(a.getFiebreReumatica())
                .patDiabetes(a.getPatDiabetes())
                .ulcera(a.getUlcera())
                .patEpilepsia(a.getPatEpilepsia())
                .patHipertension(a.getPatHipertension())
                .convulsiones(a.getConvulsiones())
                .alergias(a.getAlergias())
                .mareos(a.getMareos())
                .fracturas(a.getFracturas())
                .hemorragias(a.getHemorragias())
                .cicatrizacion(a.getCicatrizacion())
                .infartos(a.getInfartos())
                .valvulas(a.getValvulas())
                .renales(a.getRenales())
                .respiratorios(a.getRespiratorios())
                .vih(a.getVih())
                .fuma(a.getFuma())
                .alcohol(a.getAlcohol())
                .cafe(a.getCafe())
                .medicamentos(a.getMedicamentos())
                .alergiaMedicamentos(a.getAlergiaMedicamentos())
                .alergiaAnestesia(a.getAlergiaAnestesia())
                .tratamiento(a.getTratamiento())
                .embarazo(a.getEmbarazo())
                .mesesEmbarazo(a.getMesesEmbarazo())
                .cirugias(a.getCirugias())
                .transfusiones(a.getTransfusiones())
                .luxacion(a.getLuxacion())
                .amigdalitis(a.getAmigdalitis())
                .infecciones(a.getInfecciones())
                .halitosis(a.getHalitosis())
                .fuegos(a.getFuegos())
                .cepilladoFreq(a.getCepilladoFreq())
                .sedaFreq(a.getSedaFreq())
                .otrosHabitos(a.getOtrosHabitos())
                .ultimaVisita(a.getUltimaVisita())
                .motivoVisita(a.getMotivoVisita())
                .observaciones(a.getObservaciones())
                .build();
    }
}
