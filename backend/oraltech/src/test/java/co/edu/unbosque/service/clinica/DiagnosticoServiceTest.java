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

    @Mock
    private DesbloqueoService desbloqueoService;

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
        request.setArticular("Sin alteraciones articulares");
        request.setTejidosBlandos("Mucosa sana, sin lesiones");
        request.setFuncional("Oclusión estable");
        request.setEsqueleticoFacial("Perfil simétrico");
        request.setOtros("Sensibilidad cervical");

        entity = new Diagnostico();
        entity.setId(50L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setDental("K021 Caries de la dentina");
        entity.setPeriodontal("K051 Gingivitis crónica");
        entity.setPulpar("Pulpitis reversible");
        entity.setArticular("Sin alteraciones articulares");
        entity.setTejidosBlandos("Mucosa sana, sin lesiones");
        entity.setFuncional("Oclusión estable");
        entity.setEsqueleticoFacial("Perfil simétrico");
        entity.setOtros("Sensibilidad cervical");
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
        assertEquals("Pulpitis reversible", response.getPulpar());
        assertEquals("Sin alteraciones articulares", response.getArticular());
        assertEquals("Mucosa sana, sin lesiones", response.getTejidosBlandos());
        assertEquals("Oclusión estable", response.getFuncional());
        assertEquals("Perfil simétrico", response.getEsqueleticoFacial());
        assertEquals("Sensibilidad cervical", response.getOtros());
        verify(repo, times(1)).save(any(Diagnostico.class));
    }

    @Test
    @DisplayName("UT-DIAG-01b: Debería persistir los 8 campos (round-trip) al guardar")
    void shouldPersistAllEightFieldsRoundTrip() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(Diagnostico.class))).thenAnswer(inv -> inv.getArgument(0));

        // La entidad guardada debe recibir los 8 campos del request (round-trip).
        org.mockito.ArgumentCaptor<Diagnostico> captor = org.mockito.ArgumentCaptor.forClass(Diagnostico.class);
        service.upsert(historiaId, request);
        verify(repo, times(1)).save(captor.capture());
        Diagnostico saved = captor.getValue();
        assertEquals(request.getDental(), saved.getDental());
        assertEquals(request.getPeriodontal(), saved.getPeriodontal());
        assertEquals(request.getPulpar(), saved.getPulpar());
        assertEquals(request.getArticular(), saved.getArticular());
        assertEquals(request.getTejidosBlandos(), saved.getTejidosBlandos());
        assertEquals(request.getFuncional(), saved.getFuncional());
        assertEquals(request.getEsqueleticoFacial(), saved.getEsqueleticoFacial());
        assertEquals(request.getOtros(), saved.getOtros());
    }

    @Test
    @DisplayName("UT-DIAG-02 (HU-2): Debería devolver 409 en el segundo guardado (sección inmutable)")
    void shouldReturn409OnSecondSave() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.upsert(historiaId, request);
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(repo, never()).save(any());
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
        assertEquals("K051 Gingivitis crónica", response.getPeriodontal());
        assertEquals("Pulpitis reversible", response.getPulpar());
        assertEquals("Sin alteraciones articulares", response.getArticular());
        assertEquals("Mucosa sana, sin lesiones", response.getTejidosBlandos());
        assertEquals("Oclusión estable", response.getFuncional());
        assertEquals("Perfil simétrico", response.getEsqueleticoFacial());
        assertEquals("Sensibilidad cervical", response.getOtros());
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
