package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.repository.clinica.DiagnosticoRepository;
import co.edu.unbosque.repository.clinica.HistoriaClinicaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * US Trazabilidad: saber quién creó y modificó cada registro clínico.
 *
 * <p>Escenario Gherkin:</p>
 * <ul>
 *   <li>Dado un {@code @WithMockUser(username = "dr_andrea")}, cuando se guarda un registro clínico,
 *       entonces {@code createdBy == "dr_andrea"}.</li>
 *   <li>Dado que dr_andrea creó el registro, cuando un segundo profesional ({@code dr_carlos}) envía
 *       un segundo {@code PUT} sobre el mismo registro, entonces {@code updatedBy == "dr_carlos"}
 *       y {@code createdBy} sigue siendo {@code "dr_andrea"}.</li>
 * </ul>
 *
 * <p>Prueba de integración completa (seguridad + MVC + JPA + PostgreSQL). <b>No</b> se usa
 * {@code @Transactional} a nivel de test: cada petición debe abrir y cerrar su propia transacción,
 * igual que en producción, porque la auditoría se escribe en el flush del commit (si el commit
 * ocurriera después de la petición, se escribiría con el contexto de seguridad vacío y quedaría
 * {@code "sistema"}). Los datos creados se eliminan en {@code @AfterEach}.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("US Trazabilidad: auditoría de los registros clínicos")
class AuditoriaTrazabilidadTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HistoriaClinicaRepository historiaClinicaRepository;

    @Autowired
    private DiagnosticoRepository diagnosticoRepository;

    private Long pacienteId;
    private Long odontologoId;
    private UUID historiaId;

    @BeforeEach
    void prepararPacienteYOdontologo() {
        String sufijo = UUID.randomUUID().toString().replace("-", "").substring(0, 10);

        pacienteId = patientRepository.save(Patient.builder()
                .firstSurname("Gómez")
                .names("Carlos")
                .idType("CC")
                .idNumber("90" + sufijo)
                .birthDate(LocalDate.of(1990, 5, 20))
                .sex("M")
                .build()).getId();

        odontologoId = userRepository.save(User.builder()
                .username("audit_" + sufijo)
                .password("solo-para-pruebas")
                .name("Odontólogo de prueba")
                .email("audit_" + sufijo + "@oraltech.test")
                .role(User.Role.DENTIST)
                .build()).getId();
    }

    @AfterEach
    void limpiarDatosDePrueba() {
        if (historiaId != null) {
            diagnosticoRepository.findByHistoriaClinicaId(historiaId).ifPresent(diagnosticoRepository::delete);
            historiaClinicaRepository.findById(historiaId).ifPresent(historiaClinicaRepository::delete);
        }
        if (pacienteId != null) {
            patientRepository.deleteById(pacienteId);
        }
        if (odontologoId != null) {
            userRepository.deleteById(odontologoId);
        }
        historiaId = null;
    }

    @Test
    @WithMockUser(username = "dr_andrea")
    @DisplayName("Al crear una historia, createdBy y createdAt quedan registrados con el usuario autenticado")
    void alCrearHistoriaSeRegistraElCreador() throws Exception {
        mockMvc.perform(post("/api/historias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pacienteId\": " + pacienteId + ", \"odontologoId\": " + odontologoId + "}"))
                .andExpect(status().isCreated());

        HistoriaClinica historia = historiaClinicaRepository.findByPacienteId(pacienteId)
                .orElseThrow(() -> new AssertionError("La historia creada debe existir"));
        historiaId = historia.getId();

        assertEquals("dr_andrea", historia.getAudit().getCreatedBy(),
                "createdBy debe conservar al profesional que creó la historia");
        assertNotNull(historia.getAudit().getCreatedAt(), "createdAt debe estar definido");

        // Los DTO de respuesta exponen los cuatro campos de auditoría.
        JsonNode respuesta = getJson("/api/historias/paciente/" + pacienteId);
        assertNotNull(respuesta.get("createdAt"), "GET /api/historias/paciente/{id} debe exponer createdAt");
        assertNotNull(respuesta.get("createdBy"), "GET /api/historias/paciente/{id} debe exponer createdBy");
        assertNotNull(respuesta.get("updatedAt"), "GET /api/historias/paciente/{id} debe exponer updatedAt");
        assertTrue(respuesta.get("createdBy").isTextual());
        assertEquals("dr_andrea", respuesta.get("createdBy").asText());
    }

    @Test
    @WithMockUser(username = "dr_andrea")
    @DisplayName("Segundo PUT con dr_carlos: updatedBy refleja al segundo profesional y createdBy conserva al primero")
    void segundoPutReflejaAlUltimoProfesional() throws Exception {
        historiaId = crearHistoria();

        // Primer guardado (alta del registro) a cargo de dr_andrea
        mockMvc.perform(put("/api/historias/" + historiaId + "/diagnostico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dental\": \"Caries en pieza 46\"}"))
                .andExpect(status().isOk());

        JsonNode trasAlta = getJson("/api/historias/" + historiaId + "/diagnostico");
        assertEquals("dr_andrea", trasAlta.get("createdBy").asText(),
                "El primer guardado debe registrar a dr_andrea como creador");
        assertNotNull(trasAlta.get("createdAt"), "createdAt debe estar definido tras el alta");
        assertNotNull(trasAlta.get("updatedAt"), "updatedAt debe estar definido tras el alta");

        // Un segundo profesional abre su propia sesión (segundo PUT sobre el mismo registro).
        // El contexto de seguridad se resuelve por petición, igual que con un JWT propio.
        mockMvc.perform(put("/api/historias/" + historiaId + "/diagnostico")
                        .with(user("dr_carlos"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dental\": \"Caries en pieza 46 tratada\"}"))
                .andExpect(status().isOk());

        JsonNode trasModificacion = getJson("/api/historias/" + historiaId + "/diagnostico");
        assertEquals("dr_carlos", trasModificacion.get("updatedBy").asText(),
                "updatedBy debe reflejar al profesional que modificó por última vez");
        assertEquals("dr_andrea", trasModificacion.get("createdBy").asText(),
                "createdBy no debe cambiar cuando otro profesional modifica el registro");
        assertNotNull(trasModificacion.get("updatedAt"), "updatedAt debe actualizarse en la modificación");
    }

    @Test
    @WithMockUser(username = "dr_andrea")
    @DisplayName("Guardar una sección mueve la historia al último profesional: su updatedBy refleja quién editó por última vez")
    void guardarSeccionActualizaLaHistoria() throws Exception {
        historiaId = crearHistoria();

        // dr_andrea guarda una sección de su historia.
        mockMvc.perform(put("/api/historias/" + historiaId + "/diagnostico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dental\": \"Caries en pieza 46\"}"))
                .andExpect(status().isOk());

        JsonNode historiaTrasAlta = getJson("/api/historias/paciente/" + pacienteId);
        assertEquals("dr_andrea", historiaTrasAlta.get("updatedBy").asText(),
                "Al guardar una sección, la historia registra a dr_andrea como último modificador");

        // Un segundo profesional guarda otra sección de la misma historia:
        // la línea "Última modificación" de la UI debe moverse a él.
        mockMvc.perform(put("/api/historias/" + historiaId + "/diagnostico")
                        .with(user("dr_carlos"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dental\": \"Caries en pieza 46 tratada\"}"))
                .andExpect(status().isOk());

        JsonNode historiaTrasModificacion = getJson("/api/historias/paciente/" + pacienteId);
        assertEquals("dr_carlos", historiaTrasModificacion.get("updatedBy").asText(),
                "La historia debe reflejar al último profesional que guardó una sección");
        assertEquals("dr_andrea", historiaTrasModificacion.get("createdBy").asText(),
                "createdBy de la historia no cambia al editar secciones");
        assertNotNull(historiaTrasModificacion.get("updatedAt"),
                "updatedAt de la historia debe moverse al último guardado de sección");
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private UUID crearHistoria() {
        Patient paciente = patientRepository.findById(pacienteId).orElseThrow();
        User odontologo = userRepository.findById(odontologoId).orElseThrow();

        HistoriaClinica historia = HistoriaClinica.builder()
                .paciente(paciente)
                .odontologo(odontologo)
                .estado(EstadoHistoria.ACTIVA)
                .build();

        return historiaClinicaRepository.save(historia).getId();
    }

    private JsonNode getJson(String url) throws Exception {
        String json = mockMvc.perform(get(url))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json);
    }
}
