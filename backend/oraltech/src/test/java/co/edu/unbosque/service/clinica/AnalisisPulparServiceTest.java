package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AnalisisPulparRequest;
import co.edu.unbosque.dto.clinica.AnalisisPulparResponse;
import co.edu.unbosque.entity.clinica.AnalisisPulpar;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.AnalisisPulparRepository;
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
class AnalisisPulparServiceTest {

    @Mock
    private AnalisisPulparRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private AnalisisPulparService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private AnalisisPulparRequest request;
    private AnalisisPulpar entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new AnalisisPulparRequest();
        request.setCuellosSensibles(true);
        request.setEndoRealizada(false);
        request.setEndoDefectuosa(false);
        request.setAbcesoFistula(false);
        request.setLesionesPeriapicales(true);
        request.setQxEndodontica(false);
        request.setExposicionPulpar(false);
        request.setCambioColor(true);
        request.setObservaciones("Requiere seguimiento en 3 meses");

        entity = new AnalisisPulpar();
        entity.setId(30L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setCuellosSensibles(true);
        entity.setEndoRealizada(false);
        entity.setEndoDefectuosa(false);
        entity.setAbcesoFistula(false);
        entity.setLesionesPeriapicales(true);
        entity.setQxEndodontica(false);
        entity.setExposicionPulpar(false);
        entity.setCambioColor(true);
        entity.setObservaciones("Requiere seguimiento en 3 meses");
    }

    @Test
    @DisplayName("UT-PULP-01: Debería crear análisis pulpar si no existe previamente")
    void shouldCreateAnalisisPulparWhenNotExists() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(AnalisisPulpar.class))).thenReturn(entity);

        AnalisisPulparResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        assertTrue(response.getCuellosSensibles());
        assertTrue(response.getLesionesPeriapicales());
        assertTrue(response.getCambioColor());
        assertEquals("Requiere seguimiento en 3 meses", response.getObservaciones());
        verify(repo, times(1)).save(any(AnalisisPulpar.class));
    }

    @Test
    @DisplayName("UT-PULP-02: Debería actualizar análisis pulpar preexistente")
    void shouldUpdateExistingAnalisisPulpar() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));
        when(repo.save(any(AnalisisPulpar.class))).thenReturn(entity);

        AnalisisPulparResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        verify(repo, times(1)).save(entity);
    }

    @Test
    @DisplayName("UT-PULP-03: Debería rechazar upsert si la historia está CERRADA")
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
    @DisplayName("UT-PULP-04: Debería consultar análisis pulpar existente")
    void shouldGetAnalisisPulpar() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        AnalisisPulparResponse response = service.get(historiaId);

        assertNotNull(response);
        assertTrue(response.getCuellosSensibles());
    }

    @Test
    @DisplayName("UT-PULP-05: Debería retornar objeto vacío si análisis pulpar no existe")
    void shouldReturnEmptyWhenNotFound() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        AnalisisPulparResponse response = service.get(historiaId);

        assertNotNull(response);
        assertNull(response.getCuellosSensibles());
    }
}
