package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.repository.clinica.ExamenComplementarioRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HU-4 Exámenes Complementarios: integración completa (seguridad + MVC + JPA +
 * PostgreSQL con la migración Flyway {@code V20260927_0002}).
 *
 * <p>Sin {@code @Transactional} a nivel de test, igual que
 * {@link AuditoriaTrazabilidadTest}: los datos creados se eliminan en {@code @AfterEach}.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("HU-4: integración de Exámenes Complementarios (Flyway + 201/200/409)")
class ExamenComplementarioIntegracionTest {

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
    private ExamenComplementarioRepository examenComplementarioRepository;

    private Long pacienteId;
    private Long odontologoId;
    private UUID historiaId;

    @BeforeEach
    void prepararDatos() {
        String sufijo = UUID.randomUUID().toString().replace("-", "").substring(0, 10);

        pacienteId = patientRepository.save(Patient.builder()
                .firstSurname("Prueba")
                .names("Examen")
                .idType("CC")
                .idNumber("91" + sufijo)
                .birthDate(LocalDate.of(1990, 1, 1))
                .sex("M")
                .build()).getId();

        odontologoId = userRepository.save(User.builder()
                .username("exc_" + sufijo)
                .password("solo-para-pruebas")
                .name("Odontólogo EXC")
                .email("exc_" + sufijo + "@oraltech.test")
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
            examenComplementarioRepository.findByHistoriaClinicaId(historiaId)
                    .ifPresent(examenComplementarioRepository::delete);
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
    @DisplayName("PUT → 201, GET → 200 con lo guardado, segundo PUT → 409")
    void cicloCompletoCrearLeerBloquear() throws Exception {
        // Primer PUT: crea (la tabla existe gracias a la migración Flyway).
        mockMvc.perform(put("/api/historias/" + historiaId + "/examen-complementario")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rxPanoramica\": true, \"paqueteOrtodoncia\": true}"))
                .andExpect(status().isCreated());

        // GET: devuelve lo guardado con auditoría del profesional autenticado.
        String json = mockMvc.perform(get("/api/historias/" + historiaId + "/examen-complementario"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode respuesta = objectMapper.readTree(json);
        assertTrue(respuesta.get("rxPanoramica").asBoolean());
        assertTrue(respuesta.get("paqueteOrtodoncia").asBoolean());
        assertEquals("dr_andrea", respuesta.get("createdBy").asText());
        assertNotNull(respuesta.get("createdAt"));

        // Segundo PUT: sección inmutable → 409 y el registro no cambia.
        mockMvc.perform(put("/api/historias/" + historiaId + "/examen-complementario")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rxPanoramica\": true}"))
                .andExpect(status().isConflict());

        assertEquals(1, examenComplementarioRepository.findAll().stream()
                .filter(e -> e.getHistoriaClinica().getId().equals(historiaId)).count());
    }

    @Test
    @WithMockUser(username = "dr_andrea")
    @DisplayName("PUT sin ningún examen → 400")
    void rechazaSinExamenSeleccionado() throws Exception {
        mockMvc.perform(put("/api/historias/" + historiaId + "/examen-complementario")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
