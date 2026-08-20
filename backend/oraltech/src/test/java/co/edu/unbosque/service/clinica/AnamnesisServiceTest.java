package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.AnamnesisRequest;
import co.edu.unbosque.dto.clinica.AnamnesisResponse;
import co.edu.unbosque.entity.clinica.Anamnesis;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.AnamnesisRepository;
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
class AnamnesisServiceTest {

    @Mock
    private AnamnesisRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private AnamnesisService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private AnamnesisRequest request;
    private Anamnesis entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new AnamnesisRequest();
        request.setMotivoConsulta("Dolor agudo en molar inferior derecho");
        request.setEstadoActual("El paciente refiere dolor intenso de 3 días de evolución");

        entity = new Anamnesis();
        entity.setId(10L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setMotivoConsulta("Dolor agudo en molar inferior derecho");
        entity.setEstadoActual("El paciente refiere dolor intenso de 3 días de evolución");
    }

    @Test
    @DisplayName("UT-ANAM-01: Debería crear anamnesis si no existe previamente")
    void shouldCreateAnamnesisWhenNotExists() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(Anamnesis.class))).thenReturn(entity);

        AnamnesisResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        assertEquals("Dolor agudo en molar inferior derecho", response.getMotivoConsulta());
        assertEquals("El paciente refiere dolor intenso de 3 días de evolución", response.getEstadoActual());
        verify(repo, times(1)).save(any(Anamnesis.class));
    }

    @Test
    @DisplayName("UT-ANAM-02: Debería actualizar anamnesis preexistente")
    void shouldUpdateExistingAnamnesis() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));
        when(repo.save(any(Anamnesis.class))).thenReturn(entity);

        AnamnesisResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        verify(repo, times(1)).save(entity);
    }

    @Test
    @DisplayName("UT-ANAM-03: Debería rechazar upsert si la historia está CERRADA")
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
    @DisplayName("UT-ANAM-04: Debería consultar anamnesis existente")
    void shouldGetAnamnesisSuccessfully() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        AnamnesisResponse response = service.get(historiaId);

        assertNotNull(response);
        assertEquals("Dolor agudo en molar inferior derecho", response.getMotivoConsulta());
    }

    @Test
    @DisplayName("UT-ANAM-05: Debería lanzar 404 si la anamnesis no existe al consultar")
    void shouldThrowNotFoundWhenAnamnesisNotFound() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            service.get(historiaId);
        });
    }
}
