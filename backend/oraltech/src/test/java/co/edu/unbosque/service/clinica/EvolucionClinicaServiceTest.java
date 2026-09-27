package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.EvolucionClinicaListResponse;
import co.edu.unbosque.dto.clinica.EvolucionClinicaRequest;
import co.edu.unbosque.dto.clinica.EvolucionClinicaResponse;
import co.edu.unbosque.entity.clinica.EvolucionClinica;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.AppointmentRepository;
import co.edu.unbosque.repository.clinica.EvolucionClinicaRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvolucionClinicaServiceTest {

    @Mock
    private EvolucionClinicaRepository repo;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private EvolucionClinicaService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private EvolucionClinicaRequest request;
    private EvolucionClinica entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new EvolucionClinicaRequest();
        request.setProcedimiento("Obturación con resina");
        request.setObservaciones("Paciente sin complicaciones");
        request.setNumeroDiente((short) 16);
        request.setAbono(new BigDecimal("150000"));
        request.setSaldo(new BigDecimal("0"));
        request.setFirmaPaciente("firma_paciente_base64");
        request.setFirmaOdontologo("firma_dr_base64");

        entity = EvolucionClinica.builder()
                .id(1L)
                .historiaClinica(historiaActiva)
                .procedimiento("Obturación con resina")
                .observaciones("Paciente sin complicaciones")
                .numeroDiente((short) 16)
                .abono(new BigDecimal("150000"))
                .saldo(new BigDecimal("0"))
                .fecha(LocalDate.now())
                .firmaPaciente("firma_paciente_base64")
                .firmaOdontologo("firma_dr_base64")
                .build();
    }

    @Test
    @DisplayName("UT-EVO-01: Debería crear una evolución clínica exitosamente")
    void shouldCreateEvolucionSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        doNothing().when(guard).validateSignatureSize(any(), any());
        when(repo.save(any(EvolucionClinica.class))).thenReturn(entity);

        EvolucionClinicaResponse response = service.create(historiaId, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Obturación con resina", response.getProcedimiento());
        verify(guard, times(1)).validateSignatureSize("firma_paciente_base64", "firmaPaciente");
        verify(guard, times(1)).validateSignatureSize("firma_dr_base64", "firmaOdontologo");
        verify(repo, times(1)).save(any(EvolucionClinica.class));
    }

    @Test
    @DisplayName("UT-EVO-02: Debería rechazar creación de evolución si la historia está CERRADA")
    void shouldRejectWhenHistoriaIsCerrada() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Cerrada"))
                .when(guard).requireActiva(historiaActiva);

        assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, request);
        });
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-EVO-03: Debería listar las evoluciones clínicas de la historia")
    void shouldListEvolucionesSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findAllByHistoriaClinicaIdOrderByFechaAsc(historiaId)).thenReturn(List.of(entity));

        List<EvolucionClinicaListResponse> result = service.list(historiaId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Obturación con resina", result.get(0).getProcedimiento());
    }

    @Test
    @DisplayName("UT-EVO-04: Debería obtener detalle de evolución por ID exitosamente")
    void shouldGetByIdSuccessfully() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findById(1L)).thenReturn(Optional.of(entity));

        EvolucionClinicaResponse response = service.getById(historiaId, 1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("firma_paciente_base64", response.getFirmaPaciente());
    }

    @Test
    @DisplayName("UT-EVO-05: Debería lanzar 404 si la evolución pertenece a otra historia clínica")
    void shouldThrowNotFoundWhenEvolucionBelongsToOtherHistoria() {
        HistoriaClinica otherHistoria = HistoriaClinica.builder().id(UUID.randomUUID()).build();
        EvolucionClinica otherEntity = EvolucionClinica.builder()
                .id(1L)
                .historiaClinica(otherHistoria)
                .build();

        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findById(1L)).thenReturn(Optional.of(otherEntity));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.getById(historiaId, 1L);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("UT-EVO-06: Debería lanzar 404 si la evolución no existe")
    void shouldThrowNotFoundWhenEvolucionNotFound() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(repo.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.getById(historiaId, 999L);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("UT-EVO-07: Debería devolver 400 si el procedimiento es nulo o vacío")
    void shouldRejectWhenProcedimientoBlank() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);

        EvolucionClinicaRequest sinProcedimiento = new EvolucionClinicaRequest();
        sinProcedimiento.setProcedimiento(null);

        ResponseStatusException exNull = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, sinProcedimiento);
        });
        assertEquals(HttpStatus.BAD_REQUEST, exNull.getStatusCode());

        EvolucionClinicaRequest vacio = new EvolucionClinicaRequest();
        vacio.setProcedimiento("   ");

        ResponseStatusException exBlank = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, vacio);
        });
        assertEquals(HttpStatus.BAD_REQUEST, exBlank.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-EVO-08: Debería devolver 400 si numeroDiente está fuera de rango")
    void shouldRejectWhenNumeroDienteOutOfRange() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);

        EvolucionClinicaRequest fueraRango = new EvolucionClinicaRequest();
        fueraRango.setProcedimiento("Obturación con resina");
        fueraRango.setNumeroDiente((short) 40);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, fueraRango);
        });
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-EVO-09: Debería devolver 400 si el abono es negativo")
    void shouldRejectWhenAbonoNegative() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);

        EvolucionClinicaRequest abonoNegativo = new EvolucionClinicaRequest();
        abonoNegativo.setProcedimiento("Obturación con resina");
        abonoNegativo.setAbono(new BigDecimal("-5000"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, abonoNegativo);
        });
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-EVO-10: Debería devolver 400 si el saldo es negativo")
    void shouldRejectWhenSaldoNegative() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);

        EvolucionClinicaRequest saldoNegativo = new EvolucionClinicaRequest();
        saldoNegativo.setProcedimiento("Obturación con resina");
        saldoNegativo.setSaldo(new BigDecimal("-1"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, saldoNegativo);
        });
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-EVO-11: Debería devolver 404 si citaId no existe")
    void shouldRejectWhenCitaIdNotFound() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        when(appointmentRepository.existsById(999L)).thenReturn(false);

        EvolucionClinicaRequest conCita = new EvolucionClinicaRequest();
        conCita.setProcedimiento("Obturación con resina");
        conCita.setCitaId(999L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            service.create(historiaId, conCita);
        });
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(repo, never()).save(any());
    }
}
