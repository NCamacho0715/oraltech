package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.PlanItemRequest;
import co.edu.unbosque.dto.clinica.PlanTratamientoRequest;
import co.edu.unbosque.dto.clinica.PlanTratamientoResponse;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.PlanItem;
import co.edu.unbosque.entity.clinica.PlanTratamiento;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.repository.clinica.PlanTratamientoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlanTratamientoServiceTest {

    @Mock
    private PlanTratamientoRepository repo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private PlanTratamientoService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private User odontologo;
    private PlanTratamientoRequest request;
    private PlanTratamiento entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        odontologo = User.builder()
                .id(10L)
                .name("Dra. Andrea Martínez")
                .build();

        PlanItemRequest itemReq = new PlanItemRequest();
        itemReq.setDescripcion("Endodoncia unirradicular");
        itemReq.setTarifa(new BigDecimal("350000"));
        itemReq.setTotal(new BigDecimal("350000"));

        request = new PlanTratamientoRequest();
        request.setOdontologoId(10L);
        request.setItems(List.of(itemReq));

        PlanItem itemEntity = PlanItem.builder()
                .id(1L)
                .descripcion("Endodoncia unirradicular")
                .tarifa(new BigDecimal("350000"))
                .total(new BigDecimal("350000"))
                .build();

        entity = PlanTratamiento.builder()
                .id(100L)
                .historiaClinica(historiaActiva)
                .odontologo(odontologo)
                .fecha(LocalDate.now())
                .items(new ArrayList<>(List.of(itemEntity)))
                .build();
    }

    @Test
    @DisplayName("UT-PLAN-01: Debería registrar un plan de tratamiento con sus ítems exitosamente")
    void shouldCreatePlanTratamientoSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(userRepo.findById(10L)).thenReturn(Optional.of(odontologo));
        when(repo.save(any(PlanTratamiento.class))).thenReturn(entity);

        PlanTratamientoResponse response = service.create(historiaId, request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Dra. Andrea Martínez", response.getOdontologoNombre());
        assertEquals(1, response.getItems().size());
        assertEquals("Endodoncia unirradicular", response.getItems().get(0).getDescripcion());
        verify(repo, times(1)).save(any(PlanTratamiento.class));
    }

    @Test
    @DisplayName("UT-PLAN-02: Debería lanzar 404 si el odontólogo asignado al plan no existe")
    void shouldThrowNotFoundWhenOdontologoNotFound() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(userRepo.findById(10L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Odontólogo no encontrado"));
    }

    @Test
    @DisplayName("UT-PLAN-03: Debería rechazar creación si la historia está CERRADA")
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
    @DisplayName("UT-PLAN-04: Debería listar los planes de tratamiento de la historia")
    void shouldListPlanesTratamientoSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findAllByHistoriaClinicaId(historiaId)).thenReturn(List.of(entity));

        List<PlanTratamientoResponse> list = service.list(historiaId);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(100L, list.get(0).getId());
    }
}
