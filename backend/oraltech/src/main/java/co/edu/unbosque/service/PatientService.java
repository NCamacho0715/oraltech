package co.edu.unbosque.service;

import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
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
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        patientRepository.delete(patient);
    }
}
