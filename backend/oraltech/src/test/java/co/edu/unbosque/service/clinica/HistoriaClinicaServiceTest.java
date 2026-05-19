package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.HistoriaClinicaRequest;
import co.edu.unbosque.dto.clinica.HistoriaClinicaResponse;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.User.Role;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.repository.clinica.HistoriaClinicaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HistoriaClinicaServiceTest {

    @Mock
    private HistoriaClinicaRepository historiaRepo;

    @Mock
    private PatientRepository patientRepo;

    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private HistoriaClinicaService historiaClinicaService;

    private Patient mockPatient;
    private User mockOdontologo;
    private HistoriaClinica mockHistoria;
    private HistoriaClinicaRequest mockRequest;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();

        mockPatient = Patient.builder()
                .id(100L)
                .names("Mateo")
                .firstSurname("Mendoza")
                .build();

        mockOdontologo = User.builder()
                .id(200L)
                .name("Dra. Andrea")
                .role(Role.DENTIST)
                .build();

        mockHistoria = HistoriaClinica.builder()
                .id(testId)
                .paciente(mockPatient)
                .odontologo(mockOdontologo)
                .fechaApertura(LocalDate.now())
                .estado(EstadoHistoria.ACTIVA)
                .build();

        mockRequest = new HistoriaClinicaRequest();
        mockRequest.setPacienteId(100L);
        mockRequest.setOdontologoId(200L);
    }

    @Test
    @DisplayName("Debería registrar una historia clínica exitosamente si no existe previamente")
    void shouldCreateHistoriaClinicaSuccessfully() {
        // GIVEN
        when(historiaRepo.existsByPacienteId(100L)).thenReturn(false);
        when(patientRepo.findById(100L)).thenReturn(Optional.of(mockPatient));
        when(userRepo.findById(200L)).thenReturn(Optional.of(mockOdontologo));
        when(historiaRepo.save(any(HistoriaClinica.class))).thenReturn(mockHistoria);

        // WHEN
        HistoriaClinicaResponse response = historiaClinicaService.create(mockRequest);

        // THEN
        assertNotNull(response);
        assertEquals(testId, response.getId());
        assertEquals(100L, response.getPacienteId());
        assertEquals("Mateo Mendoza", response.getPacienteNombre());
        assertEquals("Dra. Andrea", response.getOdontologoNombre());
        assertEquals("ACTIVA", response.getEstado());
        verify(historiaRepo, times(1)).save(any(HistoriaClinica.class));
    }

    @Test
    @DisplayName("Debería lanzar conflicto si el paciente ya posee una historia clínica")
    void shouldThrowConflictWhenHistoriaClinicaAlreadyExists() {
        // GIVEN
        when(historiaRepo.existsByPacienteId(100L)).thenReturn(true);

        // WHEN & THEN
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            historiaClinicaService.create(mockRequest);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals("Ya existe una historia clínica para este paciente", exception.getReason());
        verify(historiaRepo, never()).save(any(HistoriaClinica.class));
    }

    @Test
    @DisplayName("Debería lanzar no encontrado si el paciente no existe al crear la historia clínica")
    void shouldThrowNotFoundWhenPatientDoesNotExist() {
        // GIVEN
        when(historiaRepo.existsByPacienteId(100L)).thenReturn(false);
        when(patientRepo.findById(100L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            historiaClinicaService.create(mockRequest);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Paciente no encontrado", exception.getReason());
        verify(userRepo, never()).findById(anyLong());
        verify(historiaRepo, never()).save(any(HistoriaClinica.class));
    }

    @Test
    @DisplayName("Debería retornar historia clínica al buscar por ID existente")
    void shouldReturnHistoriaClinicaWhenSearchingByValidId() {
        // GIVEN
        when(historiaRepo.findById(testId)).thenReturn(Optional.of(mockHistoria));

        // WHEN
        HistoriaClinicaResponse response = historiaClinicaService.getById(testId);

        // THEN
        assertNotNull(response);
        assertEquals(testId, response.getId());
        assertEquals("Mateo Mendoza", response.getPacienteNombre());
        verify(historiaRepo, times(1)).findById(testId);
    }

    @Test
    @DisplayName("Debería lanzar no encontrado si el ID de historia clínica no existe")
    void shouldThrowNotFoundWhenHistoriaClinicaIdDoesNotExist() {
        // GIVEN
        when(historiaRepo.findById(testId)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            historiaClinicaService.getById(testId);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Historia clínica no encontrada", exception.getReason());
    }
}
