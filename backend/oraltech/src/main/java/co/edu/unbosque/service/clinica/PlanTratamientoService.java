package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.PlanItemRequest;
import co.edu.unbosque.dto.clinica.PlanTratamientoRequest;
import co.edu.unbosque.dto.clinica.PlanTratamientoResponse;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.PlanItem;
import co.edu.unbosque.entity.clinica.PlanTratamiento;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.repository.clinica.PlanTratamientoRepository;
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
public class PlanTratamientoService {

    private final PlanTratamientoRepository repo;
    private final UserRepository userRepo;
    private final HistoriaClinicaService historiaService;
    private final HistoriaClinicaGuard guard;

    @Transactional
    public PlanTratamientoResponse create(UUID historiaId, PlanTratamientoRequest req) {
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);
        guard.requireActiva(historia);
        guard.registrarActividad(historia);

        User odontologo = userRepo.findById(req.getOdontologoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Odontólogo no encontrado"));

        PlanTratamiento plan = PlanTratamiento.builder()
                .historiaClinica(historia)
                .odontologo(odontologo)
                .build();

        if (req.getItems() != null) {
            for (PlanItemRequest itemReq : req.getItems()) {
                PlanItem item = PlanItem.builder()
                        .plan(plan)
                        .descripcion(itemReq.getDescripcion())
                        .tarifa(itemReq.getTarifa())
                        .total(itemReq.getTotal())
                        .build();
                plan.getItems().add(item);
            }
        }

        return toResponse(repo.save(plan));
    }

    @Transactional(readOnly = true)
    public List<PlanTratamientoResponse> list(UUID historiaId) {
        historiaService.findOrThrow(historiaId);
        return repo.findAllByHistoriaClinicaId(historiaId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PlanTratamientoResponse toResponse(PlanTratamiento p) {
        List<PlanTratamientoResponse.PlanItemResponse> items = p.getItems().stream()
                .map(i -> PlanTratamientoResponse.PlanItemResponse.builder()
                        .id(i.getId())
                        .descripcion(i.getDescripcion())
                        .tarifa(i.getTarifa())
                        .total(i.getTotal())
                        // PlanItem no tiene auditoría propia: la UI muestra la fecha de creación
                        // del plan al que pertenece (evita "Invalid date" en la tarjeta).
                        .createdAt(p.getAudit() != null ? p.getAudit().getCreatedAt() : null)
                        .build())
                .collect(Collectors.toList());

        return PlanTratamientoResponse.builder()
                .id(p.getId())
                .odontologoId(p.getOdontologo().getId())
                .odontologoNombre(p.getOdontologo().getName())
                .fecha(p.getFecha())
                .items(items)
                .createdAt(p.getAudit().getCreatedAt())
                .createdBy(p.getAudit().getCreatedBy())
                .updatedAt(p.getAudit().getUpdatedAt())
                .updatedBy(p.getAudit().getUpdatedBy())
                .build();
    }
}
