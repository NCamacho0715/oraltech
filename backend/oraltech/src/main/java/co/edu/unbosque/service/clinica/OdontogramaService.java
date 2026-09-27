package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.OdontogramaRegistroRequest;
import co.edu.unbosque.dto.clinica.OdontogramaRegistroResponse;
import co.edu.unbosque.entity.clinica.EvolucionClinica;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.OdontogramaRegistro;
import co.edu.unbosque.entity.enums.EstadoEvento;
import co.edu.unbosque.entity.enums.TipoEvento;
import co.edu.unbosque.repository.clinica.EvolucionClinicaRepository;
import co.edu.unbosque.repository.clinica.OdontogramaRegistroRepository;
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
public class OdontogramaService {

    private final OdontogramaRegistroRepository repo;
    private final EvolucionClinicaRepository evolucionRepo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    @Transactional
    public OdontogramaRegistroResponse create(UUID historiaId, OdontogramaRegistroRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        EvolucionClinica evolucion = null;
        if (req.getEvolucionId() != null) {
            evolucion = evolucionRepo.findById(req.getEvolucionId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evolución no encontrada"));
        }

        TipoEvento tipoEvento;
        try {
            tipoEvento = TipoEvento.valueOf(req.getTipoEvento().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de evento inválido: " + req.getTipoEvento());
        }

        EstadoEvento estado = EstadoEvento.ACTIVO;
        if (req.getEstado() != null) {
            try {
                estado = EstadoEvento.valueOf(req.getEstado().toUpperCase());
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido: " + req.getEstado());
            }
        }

        OdontogramaRegistro registro = OdontogramaRegistro.builder()
                .historiaClinica(historia)
                .evolucion(evolucion)
                .numeroDiente(req.getNumeroDiente())
                .cara(req.getCara())
                .tipoEvento(tipoEvento)
                .estado(estado)
                .observacion(req.getObservacion())
                .build();

        return toResponse(repo.save(registro));
    }

    @Transactional(readOnly = true)
    public List<OdontogramaRegistroResponse> list(UUID historiaId) {
        historiaService.findOrThrow(historiaId);
        return repo.findAllByHistoriaClinicaId(historiaId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(UUID historiaId, Long registroId) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        OdontogramaRegistro registro = repo.findById(registroId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro no encontrado"));

        if (!registro.getHistoriaClinica().getId().equals(historiaId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El registro no pertenece a esta historia");
        }

        repo.delete(registro);
    }

    private OdontogramaRegistroResponse toResponse(OdontogramaRegistro r) {
        return OdontogramaRegistroResponse.builder()
                .id(r.getId())
                .evolucionId(r.getEvolucion() != null ? r.getEvolucion().getId() : null)
                .numeroDiente(r.getNumeroDiente())
                .cara(r.getCara())
                .tipoEvento(r.getTipoEvento().name())
                .estado(r.getEstado().name())
                .fecha(r.getFecha())
                .observacion(r.getObservacion())
                .createdAt(r.getAudit().getCreatedAt())
                .createdBy(r.getAudit().getCreatedBy())
                .updatedAt(r.getAudit().getUpdatedAt())
                .updatedBy(r.getAudit().getUpdatedBy())
                .build();
    }
}
