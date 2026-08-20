package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.OdontogramaProtesisRequest;
import co.edu.unbosque.dto.clinica.OdontogramaProtesisResponse;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.OdontogramaProtesis;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.OdontogramaProtesisRepository;
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
class OdontogramaProtesisServiceTest {

    @Mock
    private OdontogramaProtesisRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private OdontogramaProtesisService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private OdontogramaProtesisRequest request;
    private OdontogramaProtesis entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        // OdontogramaProtesis: totalSuperior/Inferior, parcialAcriSuperior/Inferior,
        // removibleMetSuperior/Inferior (Boolean); fijaSuperior/fijaInferior (String)
        request = new OdontogramaProtesisRequest();
        request.setTotalSuperior(false);
        request.setTotalInferior(false);
        request.setParcialAcriSuperior(true);
        request.setParcialAcriInferior(false);
        request.setRemovibleMetSuperior(false);
        request.setRemovibleMetInferior(true);
        request.setFijaSuperior("Corona metal-porcelana 21");
        request.setFijaInferior(null);

        entity = new OdontogramaProtesis();
        entity.setId(80L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setTotalSuperior(false);
        entity.setTotalInferior(false);
        entity.setParcialAcriSuperior(true);
        entity.setParcialAcriInferior(false);
        entity.setRemovibleMetSuperior(false);
        entity.setRemovibleMetInferior(true);
        entity.setFijaSuperior("Corona metal-porcelana 21");
        entity.setFijaInferior(null);
    }

    @Test
    @DisplayName("UT-PROT-01: Debería crear nuevo registro de prótesis si no existe")
    void shouldCreateNewProtesis() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(OdontogramaProtesis.class))).thenReturn(entity);

        OdontogramaProtesisResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        assertTrue(response.getParcialAcriSuperior());
        assertTrue(response.getRemovibleMetInferior());
        assertEquals("Corona metal-porcelana 21", response.getFijaSuperior());
        verify(repo, times(1)).save(any(OdontogramaProtesis.class));
    }

    @Test
    @DisplayName("UT-PROT-02: Debería actualizar prótesis preexistente")
    void shouldUpdateExistingProtesis() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));
        when(repo.save(any(OdontogramaProtesis.class))).thenReturn(entity);

        OdontogramaProtesisResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        verify(repo, times(1)).save(entity);
    }

    @Test
    @DisplayName("UT-PROT-03: Debería rechazar upsert si la historia está CERRADA")
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
    @DisplayName("UT-PROT-04: Debería consultar prótesis existente")
    void shouldGetProtesis() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        OdontogramaProtesisResponse response = service.get(historiaId);

        assertNotNull(response);
        assertEquals("Corona metal-porcelana 21", response.getFijaSuperior());
        assertTrue(response.getRemovibleMetInferior());
    }

    @Test
    @DisplayName("UT-PROT-05: Debería retornar objeto vacío si no existe registro de prótesis")
    void shouldReturnEmptyWhenNotFound() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        OdontogramaProtesisResponse response = service.get(historiaId);

        // Service returns toResponse(new OdontogramaProtesis()) when not found — all nulls
        assertNotNull(response);
        assertNull(response.getFijaSuperior());
        assertNull(response.getTotalSuperior());
    }
}
