package co.edu.unbosque.service;

import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.clinica.HistoriaClinicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final HistoriaClinicaRepository historiaClinicaRepository;

    public List<Patient> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        Set<Long> idsConHistoria = historiaClinicaRepository.findPacienteIdsConHistoria();
        patients.forEach(p -> p.setHasHistoriaClinica(idsConHistoria.contains(p.getId())));
        return patients;
    }

    public Page<Patient> getPatientsPaginated(Pageable pageable, String search) {
        Page<Patient> page;
        if (search != null && !search.trim().isEmpty()) {
            page = patientRepository.searchPatients(search.trim(), pageable);
        } else {
            page = patientRepository.findAll(pageable);
        }
        Set<Long> idsConHistoria = historiaClinicaRepository.findPacienteIdsConHistoria();
        page.getContent().forEach(p -> p.setHasHistoriaClinica(idsConHistoria.contains(p.getId())));
        return page;
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id).map(p -> {
            p.setHasHistoriaClinica(historiaClinicaRepository.existsByPacienteId(id));
            return p;
        });
    }

    public Optional<Patient> getPatientByIdNumber(String idNumber) {
        return patientRepository.findByIdNumber(idNumber);
    }

    public Patient createPatient(Patient patient) {
        if (patientRepository.existsByIdNumber(patient.getIdNumber())) {
            throw new RuntimeException("Patient with this ID number already exists");
        }
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        patient.setFirstSurname(patientDetails.getFirstSurname());
        patient.setSecondSurname(patientDetails.getSecondSurname());
        patient.setNames(patientDetails.getNames());
        patient.setIdType(patientDetails.getIdType());
        patient.setIdNumber(patientDetails.getIdNumber());
        patient.setEmail(patientDetails.getEmail());
        patient.setSex(patientDetails.getSex());
        patient.setBirthDate(patientDetails.getBirthDate());
        patient.setCivilStatus(patientDetails.getCivilStatus());
        patient.setOccupation(patientDetails.getOccupation());
        patient.setEps(patientDetails.getEps());
        patient.setResidenceAddress(patientDetails.getResidenceAddress());
        patient.setResidencePhone(patientDetails.getResidencePhone());
        patient.setResidencePlace(patientDetails.getResidencePlace());
        patient.setOfficePlace(patientDetails.getOfficePlace());
        patient.setOfficePhone(patientDetails.getOfficePhone());
        patient.setEmergencyPhone(patientDetails.getEmergencyPhone());
        patient.setCellphone(patientDetails.getCellphone());
        patient.setGuardianName(patientDetails.getGuardianName());
        patient.setGuardianRelationship(patientDetails.getGuardianRelationship());
        patient.setGuardianPhone(patientDetails.getGuardianPhone());
        patient.setReferredBy(patientDetails.getReferredBy());
        patient.setReferrerPhone(patientDetails.getReferrerPhone());

        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Paciente no encontrado"));
        if (historiaClinicaRepository.existsByPacienteId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede eliminar el paciente porque tiene historia clínica registrada");
        }
        patientRepository.delete(patient);
    }
}
