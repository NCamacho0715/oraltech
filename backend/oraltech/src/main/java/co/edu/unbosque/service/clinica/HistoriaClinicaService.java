package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.HistoriaClinicaRequest;
import co.edu.unbosque.dto.clinica.HistoriaClinicaResponse;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.repository.clinica.HistoriaClinicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HistoriaClinicaService {

    private final HistoriaClinicaRepository historiaRepo;
    private final PatientRepository patientRepo;
    private final UserRepository userRepo;

    @Transactional
    public HistoriaClinicaResponse create(HistoriaClinicaRequest request) {
        if (historiaRepo.existsByPacienteId(request.getPacienteId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe una historia clínica para este paciente");
        }

        Patient patient = patientRepo.findById(request.getPacienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado"));

        // El odontólogo de apertura es siempre el usuario autenticado, nunca lo
        // que venga en el body (el frontend antes enviaba odontologoId: 1 fijo).
        User odontologo = resolveAuthenticatedOdontologo();

        HistoriaClinica historia = HistoriaClinica.builder()
                .paciente(patient)
                .odontologo(odontologo)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        historia = historiaRepo.save(historia);
        return toResponse(historia);
    }

    @Transactional(readOnly = true)
    public HistoriaClinicaResponse getById(UUID id) {
        HistoriaClinica historia = findOrThrow(id);
        return toResponse(historia);
    }

    @Transactional(readOnly = true)
    public HistoriaClinicaResponse getByPacienteId(Long pacienteId) {
        HistoriaClinica historia = historiaRepo.findByPacienteId(pacienteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Historia clínica no encontrada para este paciente"));
        return toResponse(historia);
    }

    @Transactional(readOnly = true)
    public HistoriaClinica findOrThrow(UUID id) {
        return historiaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Historia clínica no encontrada"));
    }

    /**
     * Sonda ligera (siempre 200) para saber si el paciente ya tiene historia,
     * sin provocar un 404 en consola cuando aún no existe.
     */
    @Transactional(readOnly = true)
    public boolean existsByPacienteId(Long pacienteId) {
        return historiaRepo.existsByPacienteId(pacienteId);
    }

    private User resolveAuthenticatedOdontologo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated()
                && !(auth instanceof AnonymousAuthenticationToken)) ? auth.getName() : null;
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "No hay usuario autenticado para aperturar la historia");
        }
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Odontólogo no encontrado: " + username));
    }

    private HistoriaClinicaResponse toResponse(HistoriaClinica h) {
        return HistoriaClinicaResponse.builder()
                .id(h.getId())
                .pacienteId(h.getPaciente().getId())
                .pacienteNombre(h.getPaciente().getNames() + " " + h.getPaciente().getFirstSurname())
                .odontologoId(h.getOdontologo().getId())
                .odontologoNombre(h.getOdontologo().getName())
                .fechaApertura(h.getFechaApertura())
                .estado(h.getEstado().name())
                .createdAt(h.getAudit().getCreatedAt())
                .createdBy(h.getAudit().getCreatedBy())
                .updatedAt(h.getAudit().getUpdatedAt())
                .updatedBy(h.getAudit().getUpdatedBy())
                .build();
    }
}
