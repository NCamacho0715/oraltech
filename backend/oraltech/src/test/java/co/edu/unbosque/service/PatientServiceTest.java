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
import java.util.Collections;
import java.util.List;
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
                .sex("M")
                .birthDate(LocalDate.of(1995, 8, 15))
                .civilStatus("Soltero")
                .occupation("Ingeniero")
                .eps("Sanitas")
                .residenceAddress("Calle 123 #45-67")
                .residencePhone("6012345678")
                .residencePlace("Bogotá")
                .officePlace("Bogotá")
                .officePhone("6019876543")
                .emergencyPhone("3101112233")
                .cellphone("3109998877")
                .guardianName("Ana Pérez")
                .guardianRelationship("Madre")
                .guardianPhone("3105554433")
                .referredBy("Dr. Gómez")
                .referrerPhone("3106667788")
                .build();
    }

    @Test
    @DisplayName("UT-PAT-01: Debería consultar todos los pacientes con registros existentes")
    void shouldGetAllPatientsSuccessfully() {
        // GIVEN
        Patient patient2 = Patient.builder().id(2L).names("María").firstSurname("López").build();
        when(patientRepository.findAll()).thenReturn(List.of(testPatient, patient2));

        // WHEN
        List<Patient> result = patientService.getAllPatients();

        // THEN
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(patientRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("UT-PAT-02: Debería retornar lista vacía cuando no hay pacientes")
    void shouldGetAllPatientsEmptyList() {
        // GIVEN
        when(patientRepository.findAll()).thenReturn(Collections.emptyList());

        // WHEN
        List<Patient> result = patientService.getAllPatients();

        // THEN
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(patientRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("UT-PAT-03: Debería buscar un paciente por ID exitosamente")
    void shouldGetPatientByIdSuccessfully() {
        // GIVEN
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));

        // WHEN
        Optional<Patient> result = patientService.getPatientById(1L);

        // THEN
        assertTrue(result.isPresent());
        assertEquals("Carlos", result.get().getNames());
        verify(patientRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("UT-PAT-04: Debería retornar Optional vacío si el paciente no existe por ID")
    void shouldReturnEmptyWhenPatientByIdNotFound() {
        // GIVEN
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN
        Optional<Patient> result = patientService.getPatientById(99L);

        // THEN
        assertTrue(result.isEmpty());
        verify(patientRepository, times(1)).findById(99L);
    }

    @Test
    @DisplayName("UT-PAT-05: Debería buscar un paciente por número de documento")
    void shouldGetPatientByIdNumberSuccessfully() {
        // GIVEN
        when(patientRepository.findByIdNumber("10203040")).thenReturn(Optional.of(testPatient));

        // WHEN
        Optional<Patient> result = patientService.getPatientByIdNumber("10203040");

        // THEN
        assertTrue(result.isPresent());
        assertEquals("10203040", result.get().getIdNumber());
        verify(patientRepository, times(1)).findByIdNumber("10203040");
    }

    @Test
    @DisplayName("UT-PAT-06: Debería retornar Optional vacío si no se encuentra documento")
    void shouldReturnEmptyWhenPatientByIdNumberNotFound() {
        // GIVEN
        when(patientRepository.findByIdNumber("00000000")).thenReturn(Optional.empty());

        // WHEN
        Optional<Patient> result = patientService.getPatientByIdNumber("00000000");

        // THEN
        assertTrue(result.isEmpty());
        verify(patientRepository, times(1)).findByIdNumber("00000000");
    }

    @Test
    @DisplayName("UT-PAT-07: Debería registrar un paciente exitosamente si el documento es nuevo")
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
    @DisplayName("UT-PAT-08: Debería lanzar excepción si el documento ya se encuentra registrado")
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

    @Test
    @DisplayName("UT-PAT-09: Debería actualizar todos los datos de un paciente existente")
    void shouldUpdatePatientSuccessfully() {
        // GIVEN
        Patient updatedDetails = Patient.builder()
                .names("Carlos Andrés")
                .firstSurname("Rodríguez")
                .secondSurname("Pérez")
                .idType("CC")
                .idNumber("10203040")
                .email("carlos.nuevo@gmail.com")
                .sex("M")
                .birthDate(LocalDate.of(1995, 8, 15))
                .civilStatus("Casado")
                .occupation("Líder Técnico")
                .eps("Compensar")
                .residenceAddress("Carrera 7 #100-20")
                .residencePhone("6015555555")
                .residencePlace("Bogotá")
                .officePlace("Chía")
                .officePhone("6014444444")
                .emergencyPhone("3112223344")
                .cellphone("3201112233")
                .guardianName("Laura Gómez")
                .guardianRelationship("Esposa")
                .guardianPhone("3205556677")
                .referredBy("Convenio")
                .referrerPhone("3207778899")
                .build();

        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        Patient result = patientService.updatePatient(1L, updatedDetails);

        // THEN
        assertNotNull(result);
        assertEquals("Carlos Andrés", result.getNames());
        assertEquals("carlos.nuevo@gmail.com", result.getEmail());
        assertEquals("Casado", result.getCivilStatus());
        assertEquals("Compensar", result.getEps());
        assertEquals("Carrera 7 #100-20", result.getResidenceAddress());
        verify(patientRepository, times(1)).findById(1L);
        verify(patientRepository, times(1)).save(testPatient);
    }

    @Test
    @DisplayName("UT-PAT-10: Debería lanzar excepción al actualizar un paciente no encontrado")
    void shouldThrowExceptionWhenUpdatingNonExistentPatient() {
        // GIVEN
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            patientService.updatePatient(99L, testPatient);
        });

        assertEquals("Patient not found", exception.getMessage());
        verify(patientRepository, times(1)).findById(99L);
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    @DisplayName("UT-PAT-11: Debería eliminar un paciente existente exitosamente")
    void shouldDeletePatientSuccessfully() {
        // GIVEN
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));

        // WHEN
        patientService.deletePatient(1L);

        // THEN
        verify(patientRepository, times(1)).findById(1L);
        verify(patientRepository, times(1)).delete(testPatient);
    }

    @Test
    @DisplayName("UT-PAT-12: Debería lanzar excepción al eliminar un paciente inexistente")
    void shouldThrowExceptionWhenDeletingNonExistentPatient() {
        // GIVEN
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            patientService.deletePatient(99L);
        });

        assertEquals("Patient not found", exception.getMessage());
        verify(patientRepository, times(1)).findById(99L);
        verify(patientRepository, never()).delete(any(Patient.class));
    }
}
