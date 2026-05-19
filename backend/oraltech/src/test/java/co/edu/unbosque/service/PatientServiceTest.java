package co.edu.unbosque.service;

import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientService patientService;

    private Patient testPatient;

    @BeforeEach
    void setUp() {
        testPatient = Patient.builder()
                .id(1L)
                .names("Carlos")
                .firstSurname("Rodríguez")
                .secondSurname("Pérez")
                .idType("CC")
                .idNumber("10203040")
                .email("carlos@gmail.com")
                .birthDate(LocalDate.of(1995, 8, 15))
                .build();
    }

    @Test
    @DisplayName("Debería registrar un paciente exitosamente si el documento es nuevo")
    void shouldCreatePatientSuccessfully() {
        // GIVEN
        when(patientRepository.existsByIdNumber("10203040")).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenReturn(testPatient);

        // WHEN
        Patient created = patientService.createPatient(testPatient);

        // THEN
        assertNotNull(created);
        assertEquals("10203040", created.getIdNumber());
        assertEquals("Carlos", created.getNames());
        verify(patientRepository, times(1)).existsByIdNumber("10203040");
        verify(patientRepository, times(1)).save(testPatient);
    }

    @Test
    @DisplayName("Debería lanzar excepción si el documento ya se encuentra registrado")
    void shouldThrowExceptionWhenPatientIdNumberAlreadyExists() {
        // GIVEN
        when(patientRepository.existsByIdNumber("10203040")).thenReturn(true);

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            patientService.createPatient(testPatient);
        });

        assertEquals("Patient with this ID number already exists", exception.getMessage());
        verify(patientRepository, times(1)).existsByIdNumber("10203040");
        verify(patientRepository, never()).save(any(Patient.class));
    }
}
