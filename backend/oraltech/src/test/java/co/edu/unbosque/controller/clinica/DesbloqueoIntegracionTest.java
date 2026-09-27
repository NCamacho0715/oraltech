package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.repository.clinica.DesbloqueoRepository;
import co.edu.unbosque.repository.clinica.DiagnosticoRepository;
import co.edu.unbosque.repository.clinica.EvolucionClinicaRepository;
import co.edu.unbosque.repository.clinica.HistoriaClinicaRepository;
import co.edu.unbosque.repository.clinica.OdontogramaRegistroRepository;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HU-2 Desbloqueo ADMIN: integración completa (seguridad + MVC + JPA + PostgreSQL).
 * Sin {@code @Transactional} a nivel de test; los datos se eliminan en {@code @AfterEach}.
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("HU-2: integración del desbloqueo ADMIN (403/400 + desbloquear → editar → re-bloqueo)")
class DesbloqueoIntegracionTest {

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

    @Autowired
    private DesbloqueoRepository desbloqueoRepository;

    @Autowired
    private OdontogramaRegistroRepository odontogramaRegistroRepository;

    @Autowired
    private EvolucionClinicaRepository evolucionClinicaRepository;

    private Long pacienteId;
    private Long odontologoId;
    private UUID historiaId;

    @BeforeEach
    void prepararDatos() {
        String sufijo = UUID.randomUUID().toString().replace("-", "").substring(0, 10);

        pacienteId = patientRepository.save(Patient.builder()
                .firstSurname("Prueba")
                .names("Desbloqueo")
                .idType("CC")
                .idNumber("92" + sufijo)
                .birthDate(LocalDate.of(1990, 1, 1))
                .sex("M")
                .build()).getId();

        odontologoId = userRepository.save(User.builder()
                .username("des_" + sufijo)
                .password("solo-para-pruebas")
                .name("Odontólogo DES")
                .email("des_" + sufijo + "@oraltech.test")
                .role(User.Role.DENTIST)
                .build()).getId();

        historiaId = historiaClinicaRepository.save(HistoriaClinica.builder()
                .paciente(patientRepository.findById(pacienteId).orElseThrow())
                .odontologo(userRepository.findById(odontologoId).orElseThrow())
                .estado(EstadoHistoria.ACTIVA)
                .build()).getId();
    }

    @AfterEach
    void limpiarDatos() {
        if (historiaId != null) {
            desbloqueoRepository.findAll().stream()
                    .filter(d -> d.getHistoriaClinica().getId().equals(historiaId))
                    .forEach(desbloqueoRepository::delete);
            diagnosticoRepository.findByHistoriaClinicaId(historiaId)
                    .ifPresent(diagnosticoRepository::delete);
            odontogramaRegistroRepository.findAllByHistoriaClinicaId(historiaId)
                    .forEach(odontogramaRegistroRepository::delete);
            evolucionClinicaRepository.findAllByHistoriaClinicaIdOrderByFechaAsc(historiaId)
                    .forEach(evolucionClinicaRepository::delete);
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
    @DisplayName("Flujo completo: PUT → 200, PUT → 409, desbloqueo → 201, PUT → 200, PUT → 409")
    void flujoDesbloquearEditarRebloquear() throws Exception {
        // Primer PUT: crea el diagnóstico.
        mockMvc.perform(put("/api/historias/" + historiaId + "/diagnostico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dental\": \"Caries 46\"}"))
                .andExpect(status().isOk());

        // Segundo PUT sin desbloqueo: sección inmutable → 409.
        mockMvc.perform(put("/api/historias/" + historiaId + "/diagnostico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dental\": \"Caries 46 tratada\"}"))
                .andExpect(status().isConflict());

        // Desbloqueo ADMIN con motivo válido → 201.
        mockMvc.perform(post("/api/historias/" + historiaId + "/diagnostico/desbloqueo")
                        .with(user("jefe").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\": \"Corrección de error de digitación en dental\"}"))
                .andExpect(status().isCreated());

        // PUT con desbloqueo vigente: edita una vez (dr_carlos corrige la errata).
        mockMvc.perform(put("/api/historias/" + historiaId + "/diagnostico")
                        .with(user("dr_carlos").authorities(new SimpleGrantedAuthority("DENTIST")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dental\": \"Caries 46 tratada\"}"))
                .andExpect(status().isOk());

        JsonNode trasEdicion = getJson("/api/historias/" + historiaId + "/diagnostico");
        assertEquals("Caries 46 tratada", trasEdicion.get("dental").asText());
        assertEquals("dr_andrea", trasEdicion.get("createdBy").asText(),
                "createdBy conserva al profesional del primer guardado");
        assertEquals("dr_carlos", trasEdicion.get("updatedBy").asText(),
                "updatedBy queda a nombre de quien corrigió tras el desbloqueo");

        // Re-bloqueo automático: otro PUT sin nuevo desbloqueo → 409.
        mockMvc.perform(put("/api/historias/" + historiaId + "/diagnostico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dental\": \"Otro cambio\"}"))
                .andExpect(status().isConflict());

        // El desbloqueo quedó consumido (usado=true) en auditoría.
        assertEquals(1, desbloqueoRepository.findAll().stream()
                .filter(d -> d.getHistoriaClinica().getId().equals(historiaId)
                        && d.getUsado()).count());
    }

    @Test
    @DisplayName("Segundo desbloqueo sin usar el primero → 409 (un solo uso estricto)")
    void noSeAcumulanDesbloqueos() throws Exception {
        String motivo = "{\"motivo\": \"Corrección de error de digitación en dental\"}";

        mockMvc.perform(post("/api/historias/" + historiaId + "/diagnostico/desbloqueo")
                        .with(user("jefe").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(motivo))
                .andExpect(status().isCreated());

        // Sin consumir el vigente, otro desbloqueo → 409.
        mockMvc.perform(post("/api/historias/" + historiaId + "/diagnostico/desbloqueo")
                        .with(user("jefe").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(motivo))
                .andExpect(status().isConflict());

        // Tras consumirlo con un PUT, sí se puede solicitar otro.
        mockMvc.perform(put("/api/historias/" + historiaId + "/diagnostico")
                        .with(user("dr_carlos").authorities(new SimpleGrantedAuthority("DENTIST")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dental\": \"Caries 46\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/historias/" + historiaId + "/diagnostico/desbloqueo")
                        .with(user("jefe").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(motivo))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "dr_andrea")
    @DisplayName("Odontograma: llenado inicial libre; con evoluciones, un desbloqueo = un hallazgo")
    void odontogramaBloqueoYDesbloqueo() throws Exception {
        String hallazgo = "{\"numeroDiente\": 16, \"cara\": \"O\", \"tipoEvento\": \"CARIES\","
                + " \"estado\": \"ACTIVO\", \"observacion\": \"Caries oclusal\"}";

        // Llenado inicial (sin evoluciones): varios hallazgos libres → 201.
        mockMvc.perform(post("/api/historias/" + historiaId + "/odontograma")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(hallazgo))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/historias/" + historiaId + "/odontograma")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(hallazgo))
                .andExpect(status().isCreated());

        // Inicia la atención en curso: primera evolución.
        mockMvc.perform(post("/api/historias/" + historiaId + "/evoluciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"procedimiento\": \"Valoración inicial\"}"))
                .andExpect(status().isCreated());

        // Con evoluciones, sin desbloqueo → 409.
        mockMvc.perform(post("/api/historias/" + historiaId + "/odontograma")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(hallazgo))
                .andExpect(status().isConflict());

        // Desbloqueo ADMIN → un hallazgo.
        mockMvc.perform(post("/api/historias/" + historiaId + "/odontograma/desbloqueo")
                        .with(user("jefe").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\": \"Hallazgo adicional en cita de control\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/historias/" + historiaId + "/odontograma")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(hallazgo))
                .andExpect(status().isCreated());

        // Re-bloqueo automático → 409.
        mockMvc.perform(post("/api/historias/" + historiaId + "/odontograma")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(hallazgo))
                .andExpect(status().isConflict());

        assertEquals(3, odontogramaRegistroRepository
                .findAllByHistoriaClinicaId(historiaId).size());
    }

    @Test
    @DisplayName("POST desbloqueo con rol DENTIST → 403 con mensaje real")
    void desbloqueoSoloAdmin() throws Exception {
        String json = mockMvc.perform(post("/api/historias/" + historiaId + "/diagnostico/desbloqueo")
                        .with(user("dent").authorities(new SimpleGrantedAuthority("DENTIST")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\": \"Corrección de error de digitación\"}"))
                .andExpect(status().isForbidden())
                .andReturn().getResponse().getContentAsString();

        JsonNode respuesta = objectMapper.readTree(json);
        assertTrue(respuesta.get("message").asText().toLowerCase().contains("administrador"));
    }

    @Test
    @DisplayName("POST desbloqueo con motivo corto o sección desconocida → 400")
    void desbloqueoValidaMotivoYSeccion() throws Exception {
        // Motivo corto.
        mockMvc.perform(post("/api/historias/" + historiaId + "/diagnostico/desbloqueo")
                        .with(user("jefe").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\": \"corto\"}"))
                .andExpect(status().isBadRequest());

        // Sección desconocida.
        mockMvc.perform(post("/api/historias/" + historiaId + "/inventada/desbloqueo")
                        .with(user("jefe").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\": \"Corrección de error de digitación\"}"))
                .andExpect(status().isBadRequest());

        // Historia inexistente.
        mockMvc.perform(post("/api/historias/" + UUID.randomUUID() + "/diagnostico/desbloqueo")
                        .with(user("jefe").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\": \"Corrección de error de digitación\"}"))
                .andExpect(status().isNotFound());
    }

    private JsonNode getJson(String url) throws Exception {
        String json = mockMvc.perform(get(url))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json);
    }
}
