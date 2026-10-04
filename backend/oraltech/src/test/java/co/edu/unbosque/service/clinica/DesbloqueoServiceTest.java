package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.DesbloqueoResponse;
import co.edu.unbosque.entity.clinica.DesbloqueoSeccion;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.clinica.SeccionHistoria;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.DesbloqueoRepository;
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
class DesbloqueoServiceTest {

    @Mock
    private DesbloqueoRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @InjectMocks
    private DesbloqueoService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();
    }

    @Test
    @DisplayName("UT-DES-01: Debería registrar un desbloqueo con motivo válido")
    void shouldRegisterDesbloqueoSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.save(any(DesbloqueoSeccion.class))).thenAnswer(inv -> inv.getArgument(0));

        DesbloqueoResponse response = service.solicitar(historiaId, "diagnostico",
                "Corrección de error de digitación en dental");

        assertNotNull(response);
        assertEquals("diagnostico", response.getSeccion());
        assertEquals("Corrección de error de digitación en dental", response.getMotivo());
        assertFalse(response.getUsado());
        verify(repo, times(1)).save(any(DesbloqueoSeccion.class));
    }

    @Test
    @DisplayName("UT-DES-02: Debería devolver 400 si el motivo falta o es muy corto")
    void shouldRejectWhenMotivoMissingOrShort() {
        ResponseStatusException sinMotivo = assertThrows(ResponseStatusException.class, () -> {
            service.solicitar(historiaId, "diagnostico", null);
        });
        assertEquals(HttpStatus.BAD_REQUEST, sinMotivo.getStatusCode());

        ResponseStatusException corto = assertThrows(ResponseStatusException.class, () -> {
            service.solicitar(historiaId, "diagnostico", "corto");
        });
        assertEquals(HttpStatus.BAD_REQUEST, corto.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-DES-03: Debería devolver 400 si la sección es desconocida")
    void shouldRejectWhenSeccionUnknown() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.solicitar(historiaId, "inventada", "Motivo suficientemente largo");
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-DES-04: Debería lanzar 404 si la historia no existe")
    void shouldThrowNotFoundWhenHistoriaMissing() {
        when(historiaService.findOrThrow(historiaId))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Historia clínica no encontrada"));

        assertThrows(ResponseStatusException.class, () -> {
            service.solicitar(historiaId, "diagnostico", "Motivo suficientemente largo");
        });
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-DES-05: consumirSiVigente debería marcar usado y devolver true")
    void shouldConsumeVigenteDesbloqueo() {
        DesbloqueoSeccion vigente = DesbloqueoSeccion.builder()
                .id(1L)
                .historiaClinica(historiaActiva)
                .seccion("diagnostico")
                .motivo("Errata")
                .usado(false)
                .build();
        when(repo.findFirstByHistoriaClinicaIdAndSeccionAndUsadoFalseOrderByIdDesc(
                historiaId, "diagnostico")).thenReturn(Optional.of(vigente));

        assertTrue(service.consumirSiVigente(historiaId, SeccionHistoria.DIAGNOSTICO));
        assertTrue(vigente.getUsado());
        verify(repo, times(1)).save(vigente);
    }

    @Test
    @DisplayName("UT-DES-06: consumirSiVigente debería devolver false si no hay desbloqueo vigente")
    void shouldReturnFalseWhenNoVigenteDesbloqueo() {
        when(repo.findFirstByHistoriaClinicaIdAndSeccionAndUsadoFalseOrderByIdDesc(
                historiaId, "diagnostico")).thenReturn(Optional.empty());

        assertFalse(service.consumirSiVigente(historiaId, SeccionHistoria.DIAGNOSTICO));
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-DES-07: Debería devolver 409 si ya existe un desbloqueo vigente (no se acumulan)")
    void shouldRejectWhenVigenteDesbloqueoExists() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        DesbloqueoSeccion vigente = DesbloqueoSeccion.builder()
                .id(1L)
                .historiaClinica(historiaActiva)
                .seccion("diagnostico")
                .motivo("Errata previa")
                .usado(false)
                .build();
        when(repo.findFirstByHistoriaClinicaIdAndSeccionAndUsadoFalseOrderByIdDesc(
                historiaId, "diagnostico")).thenReturn(Optional.of(vigente));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.solicitar(historiaId, "diagnostico", "Otra corrección de digitación");
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(repo, never()).save(any());
    }
}
