package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AntecedentesRequest;
import co.edu.unbosque.dto.clinica.AntecedentesResponse;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.clinica.Antecedentes;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.AntecedentesRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AntecedentesServiceTest {

    @Mock
    private AntecedentesRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private AntecedentesService service;

    private UUID historiaId;
    private Patient patientFemale;
    private HistoriaClinica historiaActiva;
    private AntecedentesRequest request;
    private Antecedentes entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();

        patientFemale = Patient.builder()
                .id(1L)
                .sex("F")
                .build();

        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .paciente(patientFemale)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new AntecedentesRequest();
        request.setFamHipertension(true);
        request.setPatHipertension(true);
        request.setAlergias("Penicilina");
        request.setTratamiento(true);
        request.setEmbarazo(false);

        entity = new Antecedentes();
        entity.setId(100L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setFamHipertension(true);
        entity.setPatHipertension(true);
        entity.setAlergias("Penicilina");
        entity.setTratamiento(true);
        entity.setEmbarazo(false);
    }

    @Test
    @DisplayName("UT-CLN-UP-01: Debería crear antecedentes cuando no existían previamente")
    void shouldCreateAntecedentesWhenNotExists() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(Antecedentes.class))).thenReturn(entity);

        AntecedentesResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        assertTrue(response.getFamHipertension());
        assertTrue(response.getPatHipertension());
        assertEquals("Penicilina", response.getAlergias());
        verify(repo, times(1)).save(any(Antecedentes.class));
    }

    @Test
    @DisplayName("UT-CLN-UP-02: Debería actualizar antecedentes existentes")
    void shouldUpdateAntecedentesWhenAlreadyExists() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));
        when(repo.save(any(Antecedentes.class))).thenReturn(entity);

        AntecedentesResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        verify(repo, times(1)).save(entity);
    }

    @Test
    @DisplayName("UT-ANTE-02: Debería rechazar embarazo si el paciente es de sexo masculino")
    void shouldRejectPregnancyWhenPatientIsMale() {
        Patient patientMale = Patient.builder().id(2L).sex("M").build();
        historiaActiva.setPaciente(patientMale);
        request.setEmbarazo(true);

        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.upsert(historiaId, request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("embarazo solo aplica para pacientes de sexo femenino"));
    }

    @Test
    @DisplayName("UT-CLN-UP-03: Debería rechazar upsert si la historia está CERRADA")
    void shouldRejectUpsertWhenHistoriaCerrada() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Cerrada"))
                .when(guard).requireActiva(historiaActiva);

        assertThrows(ResponseStatusException.class, () -> {
            service.upsert(historiaId, request);
        });
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-CLN-GET-01: Debería consultar antecedentes existentes")
    void shouldGetAntecedentesSuccessfully() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        AntecedentesResponse response = service.get(historiaId);

        assertNotNull(response);
        assertTrue(response.getFamHipertension());
    }

    @Test
    @DisplayName("UT-CLN-GET-02: Debería lanzar 404 si los antecedentes no existen al consultar")
    void shouldThrowNotFoundWhenAntecedentesNotFound() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            service.get(historiaId);
        });
    }
}
