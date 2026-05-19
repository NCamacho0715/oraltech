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

        User odontologo = userRepo.findById(request.getOdontologoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Odontólogo no encontrado"));

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

    private HistoriaClinicaResponse toResponse(HistoriaClinica h) {
        return HistoriaClinicaResponse.builder()
                .id(h.getId())
                .pacienteId(h.getPaciente().getId())
                .pacienteNombre(h.getPaciente().getNames() + " " + h.getPaciente().getFirstSurname())
                .odontologoId(h.getOdontologo().getId())
                .odontologoNombre(h.getOdontologo().getName())
                .fechaApertura(h.getFechaApertura())
                .estado(h.getEstado().name())
                .build();
    }
}
