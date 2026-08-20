package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AnalisisPeriodontalRequest;
import co.edu.unbosque.dto.clinica.AnalisisPeriodontalResponse;
import co.edu.unbosque.entity.clinica.AnalisisPeriodontal;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.AnalisisPeriodontalRepository;
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
class AnalisisPeriodontalServiceTest {

    @Mock
    private AnalisisPeriodontalRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private AnalisisPeriodontalService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private AnalisisPeriodontalRequest request;
    private AnalisisPeriodontal entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new AnalisisPeriodontalRequest();
        request.setBolsaPeriodontal(true);
        request.setMovilidadDental(true);
        request.setSangrado(true);
        request.setInflamacion(true);

        entity = new AnalisisPeriodontal();
        entity.setId(10L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setBolsaPeriodontal(true);
        entity.setMovilidadDental(true);
        entity.setSangrado(true);
        entity.setInflamacion(true);
    }

    @Test
    @DisplayName("UT-PERIO-01: Debería crear nuevo análisis periodontal si no existe")
    void shouldCreateNewAnalisisPeriodontal() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(AnalisisPeriodontal.class))).thenReturn(entity);

        AnalisisPeriodontalResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        assertTrue(response.getBolsaPeriodontal());
        verify(repo, times(1)).save(any(AnalisisPeriodontal.class));
    }

    @Test
    @DisplayName("UT-PERIO-02: Debería actualizar análisis periodontal preexistente")
    void shouldUpdateExistingAnalisisPeriodontal() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));
        when(repo.save(any(AnalisisPeriodontal.class))).thenReturn(entity);

        AnalisisPeriodontalResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        verify(repo, times(1)).save(entity);
    }

    @Test
    @DisplayName("UT-PERIO-03: Debería rechazar upsert si la historia está CERRADA")
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
    @DisplayName("UT-PERIO-04: Debería consultar análisis periodontal existente")
    void shouldGetAnalisisPeriodontal() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        AnalisisPeriodontalResponse response = service.get(historiaId);

        assertNotNull(response);
        assertTrue(response.getBolsaPeriodontal());
    }

    @Test
    @DisplayName("UT-PERIO-05: Debería retornar objeto vacío si aún no se ha registrado")
    void shouldReturnEmptyWhenNotFound() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        AnalisisPeriodontalResponse response = service.get(historiaId);

        assertNotNull(response);
        assertNull(response.getBolsaPeriodontal());
    }
}
