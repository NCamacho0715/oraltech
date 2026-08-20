package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.OdontogramaRegistroRequest;
import co.edu.unbosque.dto.clinica.OdontogramaRegistroResponse;
import co.edu.unbosque.entity.clinica.EvolucionClinica;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.OdontogramaRegistro;
import co.edu.unbosque.entity.enums.EstadoEvento;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.entity.enums.TipoEvento;
import co.edu.unbosque.repository.clinica.EvolucionClinicaRepository;
import co.edu.unbosque.repository.clinica.OdontogramaRegistroRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OdontogramaServiceTest {

    @Mock
    private OdontogramaRegistroRepository repo;

    @Mock
    private EvolucionClinicaRepository evolucionRepo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private OdontogramaService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private OdontogramaRegistroRequest request;
    private OdontogramaRegistro entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new OdontogramaRegistroRequest();
        request.setNumeroDiente((short) 16);
        request.setCara("O");
        request.setTipoEvento("CARIES");
        request.setEstado("ACTIVO");
        request.setObservacion("Caries oclusal profunda");

        entity = OdontogramaRegistro.builder()
                .id(100L)
                .historiaClinica(historiaActiva)
                .numeroDiente((short) 16)
                .cara("O")
                .tipoEvento(TipoEvento.CARIES)
                .estado(EstadoEvento.ACTIVO)
                .observacion("Caries oclusal profunda")
                .fecha(LocalDate.now())
                .build();
    }

    @Test
    @DisplayName("UT-ODON-01: Debería registrar un hallazgo en el odontograma exitosamente")
    void shouldCreateOdontogramaRegistroSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.save(any(OdontogramaRegistro.class))).thenReturn(entity);

        OdontogramaRegistroResponse response = service.create(historiaId, request);

        assertNotNull(response);
        assertEquals((short) 16, response.getNumeroDiente());
        assertEquals("CARIES", response.getTipoEvento());
        assertEquals("ACTIVO", response.getEstado());
        verify(repo, times(1)).save(any(OdontogramaRegistro.class));
    }

    @Test
    @DisplayName("UT-ODON-02: Debería asociar una evolución existente al crear registro")
    void shouldCreateWithEvolucionAssociation() {
        request.setEvolucionId(5L);
        EvolucionClinica evolucion = EvolucionClinica.builder().id(5L).build();

        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(evolucionRepo.findById(5L)).thenReturn(Optional.of(evolucion));
        when(repo.save(any(OdontogramaRegistro.class))).thenReturn(entity);

        OdontogramaRegistroResponse response = service.create(historiaId, request);

        assertNotNull(response);
        verify(evolucionRepo, times(1)).findById(5L);
        verify(repo, times(1)).save(any(OdontogramaRegistro.class));
    }

    @Test
    @DisplayName("UT-ODON-03: Debería lanzar 404 si la evolución especificada no existe")
    void shouldThrowNotFoundWhenEvolucionDoesNotExist() {
        request.setEvolucionId(999L);

        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(evolucionRepo.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Evolución no encontrada"));
    }

    @Test
    @DisplayName("UT-ODON-04: Debería lanzar 400 Bad Request si el tipo de evento es inválido")
    void shouldThrowBadRequestWhenInvalidTipoEvento() {
        request.setTipoEvento("TIPO_INVALIDO");

        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Tipo de evento inválido"));
    }

    @Test
    @DisplayName("UT-ODON-05: Debería lanzar 400 Bad Request si el estado es inválido")
    void shouldThrowBadRequestWhenInvalidEstado() {
        request.setEstado("ESTADO_INEXISTENTE");

        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Estado inválido"));
    }

    @Test
    @DisplayName("UT-ODON-06: Debería rechazar creación si la historia está CERRADA")
    void shouldRejectWhenHistoriaCerrada() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Cerrada"))
                .when(guard).requireActiva(historiaActiva);

        assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-ODON-07: Debería listar registros del odontograma para la historia")
    void shouldListRegistrosSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findAllByHistoriaClinicaId(historiaId)).thenReturn(List.of(entity));

        List<OdontogramaRegistroResponse> list = service.list(historiaId);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("CARIES", list.get(0).getTipoEvento());
    }

    @Test
    @DisplayName("UT-ODON-08: Debería eliminar registro del odontograma exitosamente")
    void shouldDeleteRegistroSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findById(100L)).thenReturn(Optional.of(entity));

        service.delete(historiaId, 100L);

        verify(repo, times(1)).delete(entity);
    }

    @Test
    @DisplayName("UT-ODON-09: Debería lanzar 400 si el registro no pertenece a la historia especificada")
    void shouldThrowBadRequestWhenRegistroBelongsToOtherHistoria() {
        HistoriaClinica otherHistoria = HistoriaClinica.builder().id(UUID.randomUUID()).build();
        OdontogramaRegistro otherEntity = OdontogramaRegistro.builder()
                .id(100L)
                .historiaClinica(otherHistoria)
                .build();

        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findById(100L)).thenReturn(Optional.of(otherEntity));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.delete(historiaId, 100L);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("no pertenece a esta historia"));
    }

    @Test
    @DisplayName("UT-ODON-10: Debería lanzar 404 si el registro a eliminar no existe")
    void shouldThrowNotFoundWhenRegistroDoesNotExist() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.delete(historiaId, 999L);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}
