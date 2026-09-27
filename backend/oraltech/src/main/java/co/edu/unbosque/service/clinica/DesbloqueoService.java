package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.DesbloqueoResponse;
import co.edu.unbosque.entity.clinica.DesbloqueoSeccion;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.SeccionHistoria;
import co.edu.unbosque.repository.clinica.DesbloqueoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DesbloqueoService {

    private final DesbloqueoRepository repo;
    private final HistoriaClinicaService historiaService;

    /**
     * Registra un desbloqueo excepcional de un solo uso (solo ADMIN, ver controller).
     * El motivo es obligatorio (mínimo 10 caracteres) y queda en auditoría.
     */
    @Transactional
    public DesbloqueoResponse solicitar(UUID historiaId, String slugSeccion, String motivo) {
        SeccionHistoria seccion = SeccionHistoria.fromSlug(slugSeccion);
        if (motivo == null || motivo.trim().length() < 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El motivo del desbloqueo es obligatorio (mínimo 10 caracteres)");
        }
        HistoriaClinica historia = historiaService.findOrThrow(historiaId);

        // Un solo uso estricto: no se acumulan desbloqueos; hay que consumir
        // el vigente antes de solicitar otro.
        if (repo.findFirstByHistoriaClinicaIdAndSeccionAndUsadoFalseOrderByIdDesc(
                historiaId, seccion.getSlug()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un desbloqueo vigente para esta sección. Úselo antes de solicitar otro");
        }

        DesbloqueoSeccion desbloqueo = DesbloqueoSeccion.builder()
                .historiaClinica(historia)
                .seccion(seccion.getSlug())
                .motivo(motivo.trim())
                .usado(false)
                .build();

        return toResponse(repo.save(desbloqueo));
    }

    /**
     * Consume el desbloqueo vigente (último no usado) de la sección, si existe.
     * Se llama en cada PUT de sección inmutable: devuelve {@code true} y marca
     * {@code usado=true} cuando hay desbloqueo vigente; si no, {@code false} y el
     * servicio responde 409. También consume desbloqueos huérfanos (sección aún
     * sin registro) para que nunca habiliten una edición posterior.
     */
    @Transactional
    public boolean consumirSiVigente(UUID historiaId, SeccionHistoria seccion) {
        Optional<DesbloqueoSeccion> vigente =
                repo.findFirstByHistoriaClinicaIdAndSeccionAndUsadoFalseOrderByIdDesc(
                        historiaId, seccion.getSlug());
        if (vigente.isEmpty()) {
            return false;
        }
        DesbloqueoSeccion d = vigente.get();
        d.setUsado(true);
        repo.save(d);
        return true;
    }

    private DesbloqueoResponse toResponse(DesbloqueoSeccion d) {
        return DesbloqueoResponse.builder()
                .id(d.getId())
                .historiaId(d.getHistoriaClinica().getId())
                .seccion(d.getSeccion())
                .motivo(d.getMotivo())
                .solicitadoPor(d.getAudit().getCreatedBy())
                .createdAt(d.getAudit().getCreatedAt())
                .usado(d.getUsado())
                .build();
    }
}
