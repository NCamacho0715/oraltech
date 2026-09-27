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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
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
                .username("dr_andrea")
                .name("Dra. Andrea Martínez")
                .email("andrea@oraltech.com")
                .role(User.Role.DENTIST)
                .build();

        // El odontólogo prescriptor es el usuario autenticado, no un campo del cuerpo.
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("dr_andrea", "secret",
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("DENTIST"))));

        PlanItemRequest itemReq = new PlanItemRequest();
        itemReq.setDescripcion("Endodoncia unirradicular");
        itemReq.setTarifa(new BigDecimal("350000"));
        itemReq.setTotal(new BigDecimal("350000"));

        request = new PlanTratamientoRequest();
        request.setDescripcion("Fase I Higiénica");
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
                .descripcion("Fase I Higiénica")
                .items(new ArrayList<>(List.of(itemEntity)))
                .build();
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("UT-PLAN-01: Debería registrar un plan de tratamiento con sus ítems (201)")
    void shouldCreatePlanTratamientoSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(userRepo.findByUsername("dr_andrea")).thenReturn(Optional.of(odontologo));
        when(repo.save(any(PlanTratamiento.class))).thenAnswer(inv -> inv.getArgument(0));

        PlanTratamientoResponse response = service.create(historiaId, request);

        assertNotNull(response);
        assertEquals("Dra. Andrea Martínez", response.getOdontologoNombre());
        assertEquals("Fase I Higiénica", response.getDescripcion());
        assertEquals(1, response.getItems().size());
        assertEquals("Endodoncia unirradicular", response.getItems().get(0).getDescripcion());
        assertEquals(new BigDecimal("350000"), response.getItems().get(0).getTarifa());
        assertEquals(new BigDecimal("350000"), response.getItems().get(0).getTotal());

        var captor = org.mockito.ArgumentCaptor.forClass(PlanTratamiento.class);
        verify(repo, times(1)).save(captor.capture());
        assertEquals(odontologo, captor.getValue().getOdontologo());
        assertEquals("Fase I Higiénica", captor.getValue().getDescripcion());
        verify(repo, times(1)).save(any(PlanTratamiento.class));
    }

    @Test
    @DisplayName("UT-PLAN-02: Debería lanzar 404 si el odontólogo autenticado no existe")
    void shouldThrowNotFoundWhenOdontologoNotFound() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(userRepo.findByUsername("dr_andrea")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Odontólogo no encontrado"));
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-PLAN-03: Debería rechazar creación si la historia está CERRADA (409)")
    void shouldRejectWhenHistoriaCerrada() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT,
                "La historia clínica está cerrada y no permite modificaciones"))
                .when(guard).requireActiva(historiaActiva);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("La historia clínica está cerrada y no permite modificaciones", ex.getReason());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-PLAN-04: Debería listar los planes de tratamiento de la historia con todos los campos")
    void shouldListPlanesTratamientoSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findAllByHistoriaClinicaId(historiaId)).thenReturn(List.of(entity));

        List<PlanTratamientoResponse> list = service.list(historiaId);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(100L, list.get(0).getId());
        assertEquals("Fase I Higiénica", list.get(0).getDescripcion());
        assertEquals("Dra. Andrea Martínez", list.get(0).getOdontologoNombre());
        assertNotNull(list.get(0).getFecha());
        assertEquals(1, list.get(0).getItems().size());
        assertEquals("Endodoncia unirradicular", list.get(0).getItems().get(0).getDescripcion());
        assertEquals(new BigDecimal("350000"), list.get(0).getItems().get(0).getTarifa());
        assertEquals(new BigDecimal("350000"), list.get(0).getItems().get(0).getTotal());
    }

    @Test
    @DisplayName("UT-PLAN-05: Debería rechazar con 400 si items llega vacío o null")
    void shouldRejectWhenItemsEmpty() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        when(userRepo.findByUsername("dr_andrea")).thenReturn(Optional.of(odontologo));

        PlanTratamientoRequest sinItems = new PlanTratamientoRequest();
        sinItems.setDescripcion("Plan sin ítems");
        sinItems.setItems(List.of());

        ResponseStatusException exVacio = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, sinItems);
        });
        assertEquals(HttpStatus.BAD_REQUEST, exVacio.getStatusCode());

        PlanTratamientoRequest nulos = new PlanTratamientoRequest();
        nulos.setDescripcion("Plan sin ítems");
        nulos.setItems(null);

        ResponseStatusException exNull = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, nulos);
        });
        assertEquals(HttpStatus.BAD_REQUEST, exNull.getStatusCode());
        verify(repo, never()).save(any());
    }
}
