package co.edu.unbosque.service.clinica;

import co.edu.unbosque.dto.clinica.ConsentimientoRequest;
import co.edu.unbosque.dto.clinica.ConsentimientoResponse;
import co.edu.unbosque.entity.clinica.Consentimiento;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.clinica.ConsentimientoRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsentimientoServiceTest {

    @Mock
    private ConsentimientoRepository repo;

    @Mock
    private HistoriaClinicaService historiaService;

    @Mock
    private HistoriaClinicaGuard guard;

    @InjectMocks
    private ConsentimientoService service;

    private UUID historiaId;
    private HistoriaClinica historiaActiva;
    private ConsentimientoRequest request;
    private Consentimiento entity;

    @BeforeEach
    void setUp() {
        historiaId = UUID.randomUUID();
        historiaActiva = HistoriaClinica.builder()
                .id(historiaId)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        request = new ConsentimientoRequest();
        request.setContenido("Acepto el tratamiento odontológico propuesto");
        request.setPacienteNombre("Juliana Suárez");
        request.setPacienteCc("1030999888");
        request.setOdontologoNombre("Dra. Andrea Martínez");
        request.setOdontologoCc("52999888");
        request.setFirmaPaciente("base64_firma_paciente");
        request.setFirmaOdontologo("base64_firma_odontologo");
        request.setFirmaTestigo("base64_firma_testigo");

        entity = new Consentimiento();
        entity.setId(40L);
        entity.setHistoriaClinica(historiaActiva);
        entity.setContenido("Acepto el tratamiento odontológico propuesto");
        entity.setPacienteNombre("Juliana Suárez");
        entity.setPacienteCc("1030999888");
        entity.setOdontologoNombre("Dra. Andrea Martínez");
        entity.setOdontologoCc("52999888");
        entity.setFirmaPaciente("base64_firma_paciente");
        entity.setFirmaOdontologo("base64_firma_odontologo");
        entity.setFirmaTestigo("base64_firma_testigo");
    }

    @Test
    @DisplayName("UT-CONS-01: Debería crear nuevo consentimiento validando firmas digitales")
    void shouldCreateNewConsentimientoWithSignatures() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        doNothing().when(guard).validateSignatureSize(any(), any());
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());
        when(repo.save(any(Consentimiento.class))).thenReturn(entity);

        ConsentimientoResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        assertEquals("Juliana Suárez", response.getPacienteNombre());
        verify(guard, times(1)).validateSignatureSize(eq("base64_firma_paciente"), eq("firmaPaciente"));
        verify(guard, times(1)).validateSignatureSize(eq("base64_firma_odontologo"), eq("firmaOdontologo"));
        verify(guard, times(1)).validateSignatureSize(eq("base64_firma_testigo"), eq("firmaTestigo"));
        verify(repo, times(1)).save(any(Consentimiento.class));
    }

    @Test
    @DisplayName("UT-CONS-02: Debería rechazar consentimiento si la firma excede el tamaño")
    void shouldRejectWhenSignatureSizeExceeds() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Excede 200KB"))
                .when(guard).validateSignatureSize(eq("base64_firma_paciente"), eq("firmaPaciente"));

        assertThrows(ResponseStatusException.class, () -> {
            service.upsert(historiaId, request);
        });
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("UT-CONS-03: Debería actualizar consentimiento preexistente")
    void shouldUpdateExistingConsentimiento() {
        when(historiaService.findOrThrow(historiaId)).thenReturn(historiaActiva);
        doNothing().when(guard).requireActiva(historiaActiva);
        doNothing().when(guard).validateSignatureSize(any(), any());
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));
        when(repo.save(any(Consentimiento.class))).thenReturn(entity);

        ConsentimientoResponse response = service.upsert(historiaId, request);

        assertNotNull(response);
        verify(repo, times(1)).save(entity);
    }

    @Test
    @DisplayName("UT-CONS-04: Debería consultar consentimiento existente")
    void shouldGetConsentimiento() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.of(entity));

        ConsentimientoResponse response = service.get(historiaId);

        assertNotNull(response);
        assertEquals("Juliana Suárez", response.getPacienteNombre());
    }

    @Test
    @DisplayName("UT-CONS-05: Debería lanzar 404 si el consentimiento no existe al consultar")
    void shouldThrowNotFoundWhenConsentimientoNotFound() {
        when(repo.findByHistoriaClinicaId(historiaId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            service.get(historiaId);
        });
    }
}
