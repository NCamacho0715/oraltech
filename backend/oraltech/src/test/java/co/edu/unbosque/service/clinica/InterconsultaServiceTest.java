package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.InterconsultaRequest;
import co.edu.unbosque.dto.clinica.InterconsultaResponse;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.Interconsulta;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.InterconsultaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterconsultaServiceTest {

    @Mock
    private InterconsultaRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private InterconsultaService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private InterconsultaRequest request;
    private Interconsulta entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new InterconsultaRequest();
        request.setDescripcion("Remisión a Cirugía Maxilofacial");

        entity = Interconsulta.builder()
                .id(70L)
                .historiaClinica(historiaActiva)
                .descripcion("Remisión a Cirugía Maxilofacial")
                .build();
    }

    @Test
    @DisplayName("UT-INTER-01: Debería crear una nueva interconsulta exitosamente")
    void shouldCreateInterconsultaSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(repo.save(any(Interconsulta.class))).thenReturn(entity);

        InterconsultaResponse response = service.create(historiaId, request);

        assertNotNull(response);
        assertEquals(70L, response.getId());
        assertEquals("Remisión a Cirugía Maxilofacial", response.getDescripcion());
        verify(repo, times(1)).save(any(Interconsulta.class));
    }

    @Test
    @DisplayName("UT-INTER-02: Debería rechazar creación de interconsulta si la historia está CERRADA")
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
    @DisplayName("UT-INTER-03: Debería listar las interconsultas de la historia clínica")
    void shouldListInterconsultasSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findAllByHistoriaClinicaId(historiaId)).thenReturn(List.of(entity));

        List<InterconsultaResponse> list = service.list(historiaId);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Remisión a Cirugía Maxilofacial", list.get(0).getDescripcion());
    }
}
