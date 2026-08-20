package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.DiagnosticoRequest;
import co.edu.unbosque.dto.clinica.DiagnosticoResponse;
import co.edu.unbosque.entity.clinica.Diagnostico;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.DiagnosticoRepository;
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
class DiagnosticoServiceTest {

    @Mock
    private DiagnosticoRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private DiagnosticoService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private DiagnosticoRequest request;
    private Diagnostico entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new DiagnosticoRequest();
        request.setDental("K021 Caries de la dentina");
        request.setPeriodontal("K051 Gingivitis crónica");
        request.setPulpar("Pulpitis reversible");

        entity = new Diagnostico();
        entity.setId(50L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setDental("K021 Caries de la dentina");
        entity.setPeriodontal("K051 Gingivitis crónica");
        entity.setPulpar("Pulpitis reversible");
    }

    @Test
    @DisplayName("UT-DIAG-01: Debería crear nuevo diagnóstico si no existe")
    void shouldCreateNewDiagnostico() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(Diagnostico.class))).thenReturn(entity);

        DiagnosticoResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        assertEquals("K021 Caries de la dentina", response.getDental());
        assertEquals("K051 Gingivitis crónica", response.getPeriodontal());
        verify(repo, times(1)).save(any(Diagnostico.class));
    }

    @Test
    @DisplayName("UT-DIAG-02: Debería actualizar diagnóstico preexistente")
    void shouldUpdateExistingDiagnostico() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));
        when(repo.save(any(Diagnostico.class))).thenReturn(entity);

        DiagnosticoResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        verify(repo, times(1)).save(entity);
    }

    @Test
    @DisplayName("UT-DIAG-03: Debería rechazar upsert si la historia está CERRADA")
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
    @DisplayName("UT-DIAG-04: Debería consultar diagnóstico existente")
    void shouldGetDiagnostico() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        DiagnosticoResponse response = service.get(historiaId);

        assertNotNull(response);
        assertEquals("K021 Caries de la dentina", response.getDental());
    }

    @Test
    @DisplayName("UT-DIAG-05: Debería lanzar 404 si el diagnóstico no existe al consultar")
    void shouldThrowNotFoundWhenDiagnosticoNotFound() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            service.get(historiaId);
        });
    }
}
