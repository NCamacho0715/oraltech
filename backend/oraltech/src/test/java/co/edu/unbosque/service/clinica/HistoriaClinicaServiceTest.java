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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
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
    private HistoriaClinicaService historiaService;

    private Patient testPatient;
    private User testOdontologo;
    private HistoriaClinica testHistoria;
    private HistoriaClinicaRequest testRequest;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();

        testPatient = Patient.builder()
                .id(1L)
                .names("Juliana")
                .firstSurname("Suárez")
                .idType("CC")
                .idNumber("1030999888")
                .birthDate(LocalDate.of(1998, 4, 12))
                .build();

        testOdontologo = User.builder()
                .id(10L)
                .username("dr_andrea")
                .name("Dra. Andrea Martínez")
                .email("andrea@oraltech.com")
                .role(Role.DENTIST)
                .build();

        testHistoria = HistoriaClinica.builder()
                .id(testId)
                .paciente(testPatient)
                .odontologo(testOdontologo)
                .estado(EstadoHistoria.ACTIVA)
                .fechaApertura(LocalDate.now())
                .build();

        testRequest = new HistoriaClinicaRequest();
        testRequest.setPacienteId(1L);
        testRequest.setOdontologoId(10L);

        // El servicio resuelve el odontólogo desde el usuario autenticado (JWT).
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("dr_andrea", null, java.util.List.of()));
    }

    @org.junit.jupiter.api.AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("UT-HC-01: Debería crear una Historia Clínica exitosamente")
    void shouldCreateHistoriaClinicaSuccessfully() {
        // GIVEN
        when(historiaRepo.existsByPacienteId(1L)).thenReturn(false);
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
        when(userRepo.findByUsername("dr_andrea")).thenReturn(Optional.of(testOdontologo));
        when(historiaRepo.save(any(HistoriaClinica.class))).thenReturn(testHistoria);

        // WHEN
        HistoriaClinicaResponse response = historiaService.create(testRequest);

        // THEN
        assertNotNull(response);
        assertEquals(testId, response.getId());
        assertEquals("ACTIVA", response.getEstado());
        assertEquals("Juliana Suárez", response.getPacienteNombre());
        assertEquals("Dra. Andrea Martínez", response.getOdontologoNombre());
        // HU-5: la respuesta siempre incluye fecha de apertura.
        assertNotNull(response.getFechaApertura());
        verify(historiaRepo, times(1)).save(any(HistoriaClinica.class));
    }

    @Test
    @DisplayName("UT-HC-02: Debería lanzar 409 Conflict si el paciente ya cuenta con Historia Clínica")
    void shouldThrowConflictWhenPatientAlreadyHasHistoria() {
        // GIVEN
        when(historiaRepo.existsByPacienteId(1L)).thenReturn(true);

        // WHEN & THEN
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            historiaService.create(testRequest);
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Ya existe una historia clínica"));
        verify(historiaRepo, never()).save(any());
    }

    @Test
    @DisplayName("UT-HC-03: Debería lanzar 404 Not Found si el paciente a asignar no existe")
    void shouldThrowNotFoundWhenPatientDoesNotExist() {
        // GIVEN
        when(historiaRepo.existsByPacienteId(1L)).thenReturn(false);
        when(patientRepo.findById(1L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            historiaService.create(testRequest);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Paciente no encontrado"));
    }

    @Test
    @DisplayName("UT-HC-04: Debería lanzar 404 Not Found si el odontólogo autenticado no existe")
    void shouldThrowNotFoundWhenOdontologoDoesNotExist() {
        // GIVEN
        when(historiaRepo.existsByPacienteId(1L)).thenReturn(false);
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
        when(userRepo.findByUsername("dr_andrea")).thenReturn(Optional.empty());

        // WHEN & THEN
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            historiaService.create(testRequest);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Odontólogo no encontrado"));
    }

    @Test
    @DisplayName("UT-HC-05: Debería obtener Historia Clínica por UUID exitosamente")
    void shouldGetHistoriaByIdSuccessfully() {
        // GIVEN
        when(historiaRepo.findById(testId)).thenReturn(Optional.of(testHistoria));

        // WHEN
        HistoriaClinicaResponse response = historiaService.getById(testId);

        // THEN
        assertNotNull(response);
        assertEquals(testId, response.getId());
        assertEquals("Juliana Suárez", response.getPacienteNombre());
    }

    @Test
    @DisplayName("UT-HC-06: Debería lanzar 404 Not Found al buscar Historia por UUID inexistente")
    void shouldThrowNotFoundWhenGetByIdNotFound() {
        // GIVEN
        UUID nonExistentId = UUID.randomUUID();
        when(historiaRepo.findById(nonExistentId)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            historiaService.getById(nonExistentId);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("UT-HC-07: Debería obtener Historia Clínica por ID de paciente exitosamente")
    void shouldGetHistoriaByPacienteIdSuccessfully() {
        // GIVEN
        when(historiaRepo.findByPacienteId(1L)).thenReturn(Optional.of(testHistoria));

        // WHEN
        HistoriaClinicaResponse response = historiaService.getByPacienteId(1L);

        // THEN
        assertNotNull(response);
        assertEquals(1L, response.getPacienteId());
        // HU-5: el GET por paciente incluye fecha de apertura no nula.
        assertNotNull(response.getFechaApertura());
    }

    @Test
    @DisplayName("UT-HC-08: Debería lanzar 404 Not Found si el paciente no tiene historia clínica registrada")
    void shouldThrowNotFoundWhenGetByPacienteIdNotFound() {
        // GIVEN
        when(historiaRepo.findByPacienteId(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            historiaService.getByPacienteId(99L);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("UT-HC-09: findOrThrow debería retornar la entidad si existe")
    void shouldReturnEntityWhenFindOrThrowExists() {
        // GIVEN
        when(historiaRepo.findById(testId)).thenReturn(Optional.of(testHistoria));

        // WHEN
        HistoriaClinica entity = historiaService.findOrThrow(testId);

        // THEN
        assertNotNull(entity);
        assertEquals(testId, entity.getId());
    }

    @Test
    @DisplayName("UT-HC-10: findOrThrow debería lanzar 404 Not Found si no existe")
    void shouldThrowNotFoundWhenFindOrThrowNotFound() {
        // GIVEN
        UUID nonExistentId = UUID.randomUUID();
        when(historiaRepo.findById(nonExistentId)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            historiaService.findOrThrow(nonExistentId);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("UT-HC-11: Debería ignorar el odontologoId del body y usar el usuario autenticado")
    void shouldIgnoreBodyOdontologoIdAndUseAuthenticatedUser() {
        // GIVEN: el body trae otro odontólogo (el frontend antes enviaba 1 fijo)
        testRequest.setOdontologoId(999L);
        when(historiaRepo.existsByPacienteId(1L)).thenReturn(false);
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
        when(userRepo.findByUsername("dr_andrea")).thenReturn(Optional.of(testOdontologo));
        when(historiaRepo.save(any(HistoriaClinica.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        historiaService.create(testRequest);

        // THEN: lo guardado pertenece al autenticado (id 10), no al del body (999)
        org.mockito.ArgumentCaptor<HistoriaClinica> captor =
                org.mockito.ArgumentCaptor.forClass(HistoriaClinica.class);
        verify(historiaRepo).save(captor.capture());
        assertEquals(10L, captor.getValue().getOdontologo().getId());
    }

    @Test
    @DisplayName("UT-HC-12: Debería lanzar 401 si no hay usuario autenticado al crear")
    void shouldThrowUnauthorizedWhenNoAuthentication() {
        // GIVEN
        SecurityContextHolder.clearContext();
        when(historiaRepo.existsByPacienteId(1L)).thenReturn(false);
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

        // WHEN & THEN
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            historiaService.create(testRequest);
        });

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verify(historiaRepo, never()).save(any());
    }

    @Test
    @DisplayName("UT-HC-13 (HU-1): Otro odontólogo puede leer una historia que no aperturó")
    void shouldAllowDifferentOdontologoToReadHistoria() {
        // GIVEN: la historia la aperturó "dr_andrea", pero quien consulta es "dr_otro"
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("dr_otro", null, java.util.List.of()));
        when(historiaRepo.findByPacienteId(1L)).thenReturn(Optional.of(testHistoria));

        // WHEN
        HistoriaClinicaResponse response = historiaService.getByPacienteId(1L);

        // THEN: lectura compartida, sin filtro por odontólogo de apertura
        assertNotNull(response);
        assertEquals("Dra. Andrea Martínez", response.getOdontologoNombre());
        verify(userRepo, never()).findByUsername(any());
    }
}
