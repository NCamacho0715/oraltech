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
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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

        // El odontólogo prescriptor se resuelve del usuario autenticado, no del cuerpo.
        User odontologo = resolveAuthenticatedOdontologo();

        if (req.getDescripcion() == null || req.getDescripcion().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La descripción del plan es obligatoria");
        }
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El plan debe contener al menos un ítem de tratamiento");
        }

        PlanTratamiento plan = PlanTratamiento.builder()
                .historiaClinica(historia)
                .odontologo(odontologo)
                .descripcion(req.getDescripcion().trim())
                .build();

        for (PlanItemRequest itemReq : req.getItems()) {
            validateItem(itemReq);
            PlanItem item = PlanItem.builder()
                    .plan(plan)
                    .descripcion(itemReq.getDescripcion().trim())
                    .tarifa(itemReq.getTarifa())
                    .total(itemReq.getTotal())
                    .build();
            plan.getItems().add(item);
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

    private User resolveAuthenticatedOdontologo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated()
                && !(auth instanceof AnonymousAuthenticationToken)) ? auth.getName() : null;
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "No hay usuario autenticado para prescribir el plan");
        }
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Odontólogo no encontrado: " + username));
    }

    private void validateItem(PlanItemRequest itemReq) {
        if (itemReq == null || itemReq.getDescripcion() == null || itemReq.getDescripcion().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La descripción de cada ítem es obligatoria");
        }
        if (itemReq.getTarifa() != null && itemReq.getTarifa().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La tarifa del ítem no puede ser negativa");
        }
        if (itemReq.getTotal() != null && itemReq.getTotal().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El total del ítem no puede ser negativo");
        }
    }

    private PlanTratamientoResponse toResponse(PlanTratamiento p) {
        List<PlanTratamientoResponse.PlanItemResponse> items = p.getItems().stream()
                .map(i -> PlanTratamientoResponse.PlanItemResponse.builder()
                        .id(i.getId())
                        .descripcion(i.getDescripcion())
                        .tarifa(i.getTarifa())
                        .total(i.getTotal())
                        // PlanItem hereda la auditoría del plan al que pertenece
                        // (evita "Invalid date" en la tarjeta).
                        .createdAt(p.getAudit() != null ? p.getAudit().getCreatedAt() : null)
                        .build())
                .collect(Collectors.toList());

        return PlanTratamientoResponse.builder()
                .id(p.getId())
                .odontologoId(p.getOdontologo().getId())
                .odontologoNombre(p.getOdontologo().getName())
                .fecha(p.getFecha())
                .descripcion(p.getDescripcion())
                .items(items)
                .createdAt(p.getAudit().getCreatedAt())
                .createdBy(p.getAudit().getCreatedBy())
                .updatedAt(p.getAudit().getUpdatedAt())
                .updatedBy(p.getAudit().getUpdatedBy())
                .build();
    }
}
