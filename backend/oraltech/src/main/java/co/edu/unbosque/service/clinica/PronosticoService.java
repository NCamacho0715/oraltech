package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.PronosticoRequest;
import co.edu.unbosque.dto.clinica.PronosticoResponse;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.Pronostico;
import co.edu.unbosque.repository.clinica.PronosticoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PronosticoService {

    private final PronosticoRepository repo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    @Transactional
    public PronosticoResponse upsert(UUID historiaId, PronosticoRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);

        Pronostico p = repo.findByHistoriaClinicaId(historiaId)
                .orElseGet(() -> {
                    Pronostico newP = new Pronostico();
                    newP.setHistoriaClinica(historia);
                    return newP;
                });

        p.setDescripcion(req.getDescripcion());
        return toResponse(repo.save(p));
    }

    @Transactional(readOnly = true)
    public PronosticoResponse get(UUID historiaId) {
        Pronostico p = repo.findByHistoriaClinicaId(historiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pronóstico no encontrado"));
        return toResponse(p);
    }

    private PronosticoResponse toResponse(Pronostico p) {
        return PronosticoResponse.builder()
                .id(p.getId())
                .descripcion(p.getDescripcion())
                .build();
    }
}
