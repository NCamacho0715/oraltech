package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AntecedentesRequest;
import co.edu.unbosque.dto.clinica.AntecedentesResponse;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.clinica.Antecedentes;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
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
    private AntecedentesService antecedentesService;

    private Patient mockPatient;
    private HistoriaClinica mockHistoria;
    private Antecedentes mockAntecedentes;
    private AntecedentesRequest mockRequest;
    private UUID historiaId;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();

        mockPatient = Patient.builder()
                .id(1L)
                .names("Sofia")
                .firstSurname("Cardenas")
                .sex("F")
                .build();

        mockHistoria = HistoriaClinica.builder()
                .id(historiaId)
                .paciente(mockPatient)
                .build();

        mockAntecedentes = new Antecedentes();
        mockAntecedentes.setId(100L);
        mockAntecedentes.setHistoriaClinica(mockHistoria);
        mockAntecedentes.setAlergias("Penicilina");
        mockAntecedentes.setEmbarazo(false);

        mockRequest = new AntecedentesRequest();
        mockRequest.setAlergias("Penicilina");
        mockRequest.setEmbarazo(false);
    }

    @Test
    @DisplayName("Debería crear o actualizar antecedentes médicos exitosamente")
    void shouldUpsertAntecedentesSuccessfully() {
        // GIVEN
        when(historiaService.findOrThrow(historiaId)).thenReturn(mockHistoria);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(Antecedentes.class))).thenReturn(mockAntecedentes);

        // WHEN
        AntecedentesResponse response = antecedentesService.upsert(historiaId, mockRequest);

        // THEN
        assertNotNull(response);
        assertEquals("Penicilina", response.getAlergias());
        assertFalse(response.getEmbarazo());
        verify(repo, times(1)).save(any(Antecedentes.class));
    }

    @Test
    @DisplayName("Debería lanzar BAD_REQUEST si el campo embarazo está activado para un paciente de sexo masculino")
    void shouldThrowBadRequestWhenPregnancyTrueAndPatientIsNotFemale() {
        // GIVEN
        mockPatient.setSex("M");
        mockRequest.setEmbarazo(true);

        when(historiaService.findOrThrow(historiaId)).thenReturn(mockHistoria);

        // WHEN & THEN
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            antecedentesService.upsert(historiaId, mockRequest);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("El campo embarazo solo aplica para pacientes de sexo femenino", exception.getReason());
        verify(repo, never()).save(any(Antecedentes.class));
    }

    @Test
    @DisplayName("Debería retornar antecedentes médicos al buscarlos por historia ID existente")
    void shouldReturnAntecedentesWhenSearchingByValidHistoriaId() {
        // GIVEN
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(mockAntecedentes));

        // WHEN
        AntecedentesResponse response = antecedentesService.get(historiaId);

        // THEN
        assertNotNull(response);
        assertEquals("Penicilina", response.getAlergias());
        verify(repo, times(1)).findByHistoriaClinicaId(historiaId);
    }

    @Test
    @DisplayName("Debería lanzar no encontrado si los antecedentes no existen para la historia ID")
    void shouldThrowNotFoundWhenAntecedentesDoNotExist() {
        // GIVEN
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            antecedentesService.get(historiaId);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Antecedentes no encontrados", exception.getReason());
    }
}
