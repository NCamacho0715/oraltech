package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.PronosticoRequest;
import co.edu.unbosque.dto.clinica.PronosticoResponse;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.Pronostico;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.PronosticoRepository;
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
class PronosticoServiceTest {

    @Mock
    private PronosticoRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private PronosticoService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private PronosticoRequest request;
    private Pronostico entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new PronosticoRequest();
        request.setDescripcion("Favorable a mediano plazo");

        entity = new Pronostico();
        entity.setId(90L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setDescripcion("Favorable a mediano plazo");
    }

    @Test
    @DisplayName("UT-PRON-01: Debería crear nuevo pronóstico si no existe")
    void shouldCreateNewPronostico() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(Pronostico.class))).thenReturn(entity);

        PronosticoResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        assertEquals("Favorable a mediano plazo", response.getDescripcion());
        verify(repo, times(1)).save(any(Pronostico.class));
    }

    @Test
    @DisplayName("UT-PRON-02: Debería actualizar pronóstico preexistente")
    void shouldUpdateExistingPronostico() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));
        when(repo.save(any(Pronostico.class))).thenReturn(entity);

        PronosticoResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        verify(repo, times(1)).save(entity);
    }

    @Test
    @DisplayName("UT-PRON-03: Debería rechazar upsert si la historia está CERRADA")
    void shouldRejectWhenHistoriaCerrada() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Cerrada"))
                .when(guard).requireActiva(historiaActiva);

        assertThrows(ResponseStatusException.class, () -> {
            service.upsert(historiaId, request);
        });
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-PRON-04: Debería consultar pronóstico existente")
    void shouldGetPronostico() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        PronosticoResponse response = service.get(historiaId);

        assertNotNull(response);
        assertEquals("Favorable a mediano plazo", response.getDescripcion());
    }

    @Test
    @DisplayName("UT-PRON-05: Debería lanzar 404 si el pronóstico no existe al consultar")
    void shouldThrowNotFoundWhenPronosticoNotFound() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            service.get(historiaId);
        });
    }
}
