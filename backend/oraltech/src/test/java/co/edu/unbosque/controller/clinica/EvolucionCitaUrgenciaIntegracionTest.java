package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.entity.Appointment;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.AppointmentRepository;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.repository.clinica.EvolucionClinicaRepository;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HU-3 Cita obligatoria / urgencia: integración completa (seguridad + MVC + JPA +
 * PostgreSQL con la migración Flyway {@code V20260927_0004}).
 * Sin {@code @Transactional} a nivel de test; los datos se eliminan en {@code @AfterEach}.
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("HU-3: integración de cita obligatoria y urgencia en evoluciones")
class EvolucionCitaUrgenciaIntegracionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HistoriaClinicaRepository historiaClinicaRepository;

    @Autowired
    private EvolucionClinicaRepository evolucionClinicaRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private Long pacienteId;
    private Long otroPacienteId;
    private Long odontologoId;
    private UUID historiaId;
    private Long citaHoyId;
    private Long citaAyerOtroPacienteId;

    @BeforeEach
    void prepararDatos() {
        String sufijo = UUID.randomUUID().toString().replace("-", "").substring(0, 10);

        pacienteId = patientRepository.save(Patient.builder()
                .firstSurname("Prueba")
                .names("Recurrente")
                .idType("CC")
                .idNumber("93" + sufijo)
                .birthDate(LocalDate.of(1990, 1, 1))
                .sex("M")
                .build()).getId();

        otroPacienteId = patientRepository.save(Patient.builder()
                .firstSurname("Prueba")
                .names("Otro")
                .idType("CC")
                .idNumber("94" + sufijo)
                .birthDate(LocalDate.of(1992, 2, 2))
                .sex("F")
                .build()).getId();

        odontologoId = userRepository.save(User.builder()
                .username("evo_" + sufijo)
                .password("solo-para-pruebas")
                .name("Odontólogo EVO")
                .email("evo_" + sufijo + "@oraltech.test")
                .role(User.Role.DENTIST)
                .build()).getId();

        historiaId = historiaClinicaRepository.save(HistoriaClinica.builder()
                .paciente(patientRepository.findById(pacienteId).orElseThrow())
                .odontologo(userRepository.findById(odontologoId).orElseThrow())
                .estado(EstadoHistoria.ACTIVA)
                .build()).getId();

        citaHoyId = appointmentRepository.save(Appointment.builder()
                .patient(patientRepository.findById(pacienteId).orElseThrow())
                .title("Control")
                .appointmentDate(LocalDate.now())
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(9, 30))
                .status("PENDIENTE")
                .build()).getId();

        citaAyerOtroPacienteId = appointmentRepository.save(Appointment.builder()
                .patient(patientRepository.findById(otroPacienteId).orElseThrow())
                .title("Control otro")
                .appointmentDate(LocalDate.now().minusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .status("PENDIENTE")
                .build()).getId();
    }

    @AfterEach
    void limpiarDatos() {
        if (historiaId != null) {
            evolucionClinicaRepository.findAllByHistoriaClinicaIdOrderByFechaAsc(historiaId)
                    .forEach(evolucionClinicaRepository::delete);
            historiaClinicaRepository.findById(historiaId).ifPresent(historiaClinicaRepository::delete);
        }
        if (citaHoyId != null) {
            appointmentRepository.deleteById(citaHoyId);
        }
        if (citaAyerOtroPacienteId != null) {
            appointmentRepository.deleteById(citaAyerOtroPacienteId);
        }
        if (pacienteId != null) {
            patientRepository.deleteById(pacienteId);
        }
        if (otroPacienteId != null) {
            patientRepository.deleteById(otroPacienteId);
        }
        if (odontologoId != null) {
            userRepository.deleteById(odontologoId);
        }
        historiaId = null;
    }

    @Test
    @WithMockUser(username = "dr_andrea")
    @DisplayName("Primera consulta libre; recurrente exige cita de hoy o urgencia")
    void primeraLibreRecurrenteExigeCitaOUrgencia() throws Exception {
        // Primera evolución sin cita ni urgencia → 201, esUrgencia=false.
        mockMvc.perform(post("/api/historias/" + historiaId + "/evoluciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"procedimiento\": \"Primera valoración\"}"))
                .andExpect(status().isCreated());

        // Recurrente sin cita ni urgencia → 400.
        mockMvc.perform(post("/api/historias/" + historiaId + "/evoluciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"procedimiento\": \"Control sin cita\"}"))
                .andExpect(status().isBadRequest());

        // Cita de hoy del paciente → 201 con citaId, y la cita queda COMPLETADA.
        String json = mockMvc.perform(post("/api/historias/" + historiaId + "/evoluciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"procedimiento\": \"Control con cita\", \"citaId\": " + citaHoyId + "}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        assertEquals(citaHoyId, objectMapper.readTree(json).get("citaId").asLong());
        assertEquals("COMPLETADA", appointmentRepository.findById(citaHoyId).orElseThrow().getStatus());

        // Urgencia sin cita → 201 con esUrgencia=true visible en el listado.
        mockMvc.perform(post("/api/historias/" + historiaId + "/evoluciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"procedimiento\": \"Dolor agudo\", \"esUrgencia\": true}"))
                .andExpect(status().isCreated());

        String lista = mockMvc.perform(get("/api/historias/" + historiaId + "/evoluciones"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode evoluciones = objectMapper.readTree(lista);
        assertEquals(3, evoluciones.size());
        assertFalse(evoluciones.get(0).get("esUrgencia").asBoolean());
        assertTrue(evoluciones.get(2).get("esUrgencia").asBoolean());
    }

    @Test
    @WithMockUser(username = "dr_andrea")
    @DisplayName("Cita de otro paciente o de otro día → 400; cita+urgencia → 400")
    void validaCitaPacienteFechaYExclusion() throws Exception {
        // Primera para volver recurrente.
        mockMvc.perform(post("/api/historias/" + historiaId + "/evoluciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"procedimiento\": \"Primera valoración\"}"))
                .andExpect(status().isCreated());

        // Cita de otro paciente (y de ayer) → 400.
        mockMvc.perform(post("/api/historias/" + historiaId + "/evoluciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"procedimiento\": \"Control\", \"citaId\": " + citaAyerOtroPacienteId + "}"))
                .andExpect(status().isBadRequest());

        // Cita + urgencia a la vez → 400.
        mockMvc.perform(post("/api/historias/" + historiaId + "/evoluciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"procedimiento\": \"Control\", \"citaId\": " + citaHoyId + ", \"esUrgencia\": true}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Migración: es_urgencia NOT NULL con DEFAULT FALSE (históricos quedan false)")
    void columnaEsUrgenciaConDefaultFalse() {
        String nullable = jdbcTemplate.queryForObject(
                "SELECT is_nullable FROM information_schema.columns "
                        + "WHERE table_name = 'evolucion_clinica' AND column_name = 'es_urgencia'",
                String.class);
        String columnDefault = jdbcTemplate.queryForObject(
                "SELECT column_default FROM information_schema.columns "
                        + "WHERE table_name = 'evolucion_clinica' AND column_name = 'es_urgencia'",
                String.class);

        assertEquals("NO", nullable);
        assertTrue(columnDefault != null && columnDefault.toLowerCase().contains("false"));
    }
}
