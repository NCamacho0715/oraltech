package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.ExamenClinicoRequest;
import co.edu.unbosque.dto.clinica.ExamenClinicoResponse;
import co.edu.unbosque.entity.clinica.ExamenClinico;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.entity.enums.HigieneGrado;
import co.edu.unbosque.entity.enums.PatronMasticacion;
import co.edu.unbosque.entity.enums.TejidoEstado;
import co.edu.unbosque.repository.clinica.ExamenClinicoRepository;
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
class ExamenClinicoServiceTest {

    @Mock
    private ExamenClinicoRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private ExamenClinicoService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private ExamenClinicoRequest request;
    private ExamenClinico entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new ExamenClinicoRequest();
        request.setLengua("NORMAL");
        request.setCarrillos("NORMAL");
        request.setPaladar("NORMAL");
        request.setHigiene("B");
        request.setPatronMasticacion("BILAT");
        request.setBruxismo(true);
        request.setDolorArticular(false);

        entity = new ExamenClinico();
        entity.setId(60L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setLengua(TejidoEstado.NORMAL);
        entity.setCarrillos(TejidoEstado.NORMAL);
        entity.setPaladar(TejidoEstado.NORMAL);
        entity.setHigiene(HigieneGrado.B);
        entity.setPatronMasticacion(PatronMasticacion.BILAT);
        entity.setBruxismo(true);
        entity.setDolorArticular(false);
    }

    @Test
    @DisplayName("UT-EXAM-01: Debería crear nuevo examen clínico si no existe")
    void shouldCreateNewExamenClinico() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(ExamenClinico.class))).thenReturn(entity);

        ExamenClinicoResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        assertEquals("NORMAL", response.getLengua());
        assertEquals("B", response.getHigiene());
        assertEquals("BILAT", response.getPatronMasticacion());
        assertTrue(response.getBruxismo());
        verify(repo, times(1)).save(any(ExamenClinico.class));
    }

    @Test
    @DisplayName("UT-EXAM-02: Debería actualizar examen clínico preexistente")
    void shouldUpdateExistingExamenClinico() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));
        when(repo.save(any(ExamenClinico.class))).thenReturn(entity);

        ExamenClinicoResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        verify(repo, times(1)).save(entity);
    }

    @Test
    @DisplayName("UT-EXAM-03: Debería lanzar 400 Bad Request si un enum contiene un valor inválido")
    void shouldThrowBadRequestWhenInvalidEnumValue() {
        request.setLengua("VALOR_INVENTADO");
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.upsert(historiaId, request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Valor inválido"));
    }

    @Test
    @DisplayName("UT-EXAM-04: Debería rechazar upsert si la historia está CERRADA")
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
    @DisplayName("UT-EXAM-05: Debería consultar examen clínico existente")
    void shouldGetExamenClinico() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        ExamenClinicoResponse response = service.get(historiaId);

        assertNotNull(response);
        assertEquals("NORMAL", response.getLengua());
    }

    @Test
    @DisplayName("UT-EXAM-06: Debería lanzar 404 si el examen clínico no existe al consultar")
    void shouldThrowNotFoundWhenExamenNotFound() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            service.get(historiaId);
        });
    }
}
