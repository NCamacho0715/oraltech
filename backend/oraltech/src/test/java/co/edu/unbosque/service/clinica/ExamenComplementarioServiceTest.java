package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.ExamenComplementarioRequest;
import co.edu.unbosque.dto.clinica.ExamenComplementarioResponse;
import co.edu.unbosque.entity.clinica.ExamenComplementario;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.ExamenComplementarioRepository;
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
class ExamenComplementarioServiceTest {

    @Mock
    private ExamenComplementarioRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @Mock
    private DesbloqueoService desbloqueoService;

    @InjectMocks
    private ExamenComplementarioService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private ExamenComplementarioRequest request;
    private ExamenComplementario entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new ExamenComplementarioRequest();
        request.setRxPanoramica(true);

        entity = ExamenComplementario.builder()
                .id(1L)
                .historiaClinica(historiaActiva)
                .rxPanoramica(true)
                .rxPeriapical(false)
                .paqueteOrtodoncia(false)
                .otros(false)
                .build();
    }

    @Test
    @DisplayName("UT-EXC-01: Debería crear los exámenes complementarios exitosamente")
    void shouldCreateSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(ExamenComplementario.class))).thenReturn(entity);

        ExamenComplementarioResponse response = service.create(historiaId, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertTrue(response.getRxPanoramica());
        verify(repo, times(1)).save(any(ExamenComplementario.class));
    }

    @Test
    @DisplayName("UT-EXC-02: Debería devolver 400 si no se selecciona ningún examen")
    void shouldRejectWhenNoExamenSelected() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, new ExamenComplementarioRequest());
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-EXC-03: Debería devolver 400 si Rx Periapical no trae comentario")
    void shouldRejectWhenPeriapicalWithoutComentario() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);

        ExamenComplementarioRequest sinComentario = new ExamenComplementarioRequest();
        sinComentario.setRxPeriapical(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, sinComentario);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-EXC-04: Debería devolver 400 si Otros no trae descripción")
    void shouldRejectWhenOtrosWithoutTexto() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);

        ExamenComplementarioRequest sinTexto = new ExamenComplementarioRequest();
        sinTexto.setOtros(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, sinTexto);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-EXC-05: Debería devolver 409 en el segundo PUT (sección inmutable)")
    void shouldRejectSecondCreateWithConflict() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-EXC-06: Debería lanzar 404 al consultar una historia sin registro")
    void shouldThrowNotFoundWhenGetMissing() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.get(historiaId);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("UT-EXC-07: Debería obtener los exámenes registrados exitosamente")
    void shouldGetSuccessfully() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        ExamenComplementarioResponse response = service.get(historiaId);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertTrue(response.getRxPanoramica());
    }

    @Test
    @DisplayName("UT-EXC-08: Debería rechazar la creación si la historia está CERRADA")
    void shouldRejectWhenHistoriaIsCerrada() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Cerrada"))
                .when(guard).requireActiva(historiaActiva);

        assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });
        verify(repo, never()).save(any());
    }
}
