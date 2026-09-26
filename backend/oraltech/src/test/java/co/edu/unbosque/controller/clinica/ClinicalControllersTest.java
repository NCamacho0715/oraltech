package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.*;
import co.edu.unbosque.security.JwtAuthenticationFilter;
import co.edu.unbosque.security.JwtService;
import co.edu.unbosque.service.clinica.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = {
        AnamnesisController.class,
        AntecedentesController.class,
        AnalisisPeriodontalController.class,
        AnalisisPulparController.class,
        ConsentimientoController.class,
        DiagnosticoController.class,
        EvolucionClinicaController.class,
        ExamenClinicoController.class,
        InterconsultaController.class,
        OdontogramaController.class,
        OdontogramaProtesisController.class,
        PlanTratamientoController.class,
        PronosticoController.class
    },
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
class ClinicalControllersTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AnamnesisService anamnesisService;
    @MockBean AntecedentesService antecedentesService;
    @MockBean AnalisisPeriodontalService analisisPeriodontalService;
    @MockBean AnalisisPulparService analisisPulparService;
    @MockBean ConsentimientoService consentimientoService;
    @MockBean DiagnosticoService diagnosticoService;
    @MockBean EvolucionClinicaService evolucionClinicaService;
    @MockBean ExamenClinicoService examenClinicoService;
    @MockBean InterconsultaService interconsultaService;
    @MockBean OdontogramaService odontogramaService;
    @MockBean OdontogramaProtesisService odontogramaProtesisService;
    @MockBean PlanTratamientoService planTratamientoService;
    @MockBean PronosticoService pronosticoService;
    @MockBean JwtService jwtService;
    @MockBean co.edu.unbosque.repository.UserRepository userRepository;

    private static final UUID HC = UUID.randomUUID();

    private String loadFixture(String fixtureName) throws java.io.IOException {
        org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("fixtures/" + fixtureName);
        try (java.io.InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        }
    }

    // ── Anamnesis ─────────────────────────────────────────────────────

    @Test @DisplayName("PUT /anamnesis → 200")
    void upsertAnamnesis() throws Exception {
        when(anamnesisService.upsert(eq(HC), any())).thenReturn(mock(AnamnesisResponse.class));
        mockMvc.perform(put("/api/historias/" + HC + "/anamnesis")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("anamnesis.json")))
                .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /anamnesis → 200")
    void getAnamnesis() throws Exception {
        when(anamnesisService.get(HC)).thenReturn(mock(AnamnesisResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/anamnesis")).andExpect(status().isOk());
    }

    // ── Antecedentes ──────────────────────────────────────────────────

    @Test @DisplayName("PUT /antecedentes → 200")
    void upsertAntecedentes() throws Exception {
        when(antecedentesService.upsert(eq(HC), any())).thenReturn(mock(AntecedentesResponse.class));
        mockMvc.perform(put("/api/historias/" + HC + "/antecedentes")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("antecedentes.json")))
                .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /antecedentes → 200")
    void getAntecedentes() throws Exception {
        when(antecedentesService.get(HC)).thenReturn(mock(AntecedentesResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/antecedentes")).andExpect(status().isOk());
    }

    // ── AnalisisPeriodontal ───────────────────────────────────────────

    @Test @DisplayName("PUT /analisis-periodontal → 200")
    void upsertPeriodontal() throws Exception {
        when(analisisPeriodontalService.upsert(eq(HC), any())).thenReturn(mock(AnalisisPeriodontalResponse.class));
        mockMvc.perform(put("/api/historias/" + HC + "/analisis-periodontal")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("analisis-periodontal.json")))
                .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /analisis-periodontal → 200")
    void getPeriodontal() throws Exception {
        when(analisisPeriodontalService.get(HC)).thenReturn(mock(AnalisisPeriodontalResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/analisis-periodontal")).andExpect(status().isOk());
    }

    // ── AnalisisPulpar ────────────────────────────────────────────────

    @Test @DisplayName("PUT /analisis-pulpar → 200")
    void upsertPulpar() throws Exception {
        when(analisisPulparService.upsert(eq(HC), any())).thenReturn(mock(AnalisisPulparResponse.class));
        mockMvc.perform(put("/api/historias/" + HC + "/analisis-pulpar")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("analisis-pulpar.json")))
                .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /analisis-pulpar → 200")
    void getPulpar() throws Exception {
        when(analisisPulparService.get(HC)).thenReturn(mock(AnalisisPulparResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/analisis-pulpar")).andExpect(status().isOk());
    }

    // ── Consentimiento ────────────────────────────────────────────────

    @Test @DisplayName("POST /consentimiento → 201")
    void upsertConsentimiento() throws Exception {
        when(consentimientoService.upsert(eq(HC), any())).thenReturn(mock(ConsentimientoResponse.class));
        mockMvc.perform(post("/api/historias/" + HC + "/consentimiento")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("consentimiento.json")))
                .andExpect(status().isCreated());
    }

    @Test @DisplayName("GET /consentimiento → 200")
    void getConsentimiento() throws Exception {
        when(consentimientoService.get(HC)).thenReturn(mock(ConsentimientoResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/consentimiento")).andExpect(status().isOk());
    }

    // ── Diagnostico ───────────────────────────────────────────────────

    @Test @DisplayName("PUT /diagnostico → 200")
    void upsertDiagnostico() throws Exception {
        when(diagnosticoService.upsert(eq(HC), any())).thenReturn(mock(DiagnosticoResponse.class));
        mockMvc.perform(put("/api/historias/" + HC + "/diagnostico")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("diagnostico.json")))
                .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /diagnostico → 200")
    void getDiagnostico() throws Exception {
        when(diagnosticoService.get(HC)).thenReturn(mock(DiagnosticoResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/diagnostico")).andExpect(status().isOk());
    }

    // ── EvolucionClinica ──────────────────────────────────────────────

    @Test @DisplayName("POST /evoluciones → 201")
    void createEvolucion() throws Exception {
        when(evolucionClinicaService.create(eq(HC), any())).thenReturn(mock(EvolucionClinicaResponse.class));
        mockMvc.perform(post("/api/historias/" + HC + "/evoluciones")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("evolucion.json")))
                .andExpect(status().isCreated());
    }

    @Test @DisplayName("GET /evoluciones → 200")
    void listEvoluciones() throws Exception {
        when(evolucionClinicaService.list(HC)).thenReturn(List.of());
        mockMvc.perform(get("/api/historias/" + HC + "/evoluciones")).andExpect(status().isOk());
    }

    @Test @DisplayName("GET /evoluciones/{id} → 200")
    void getEvolucionById() throws Exception {
        when(evolucionClinicaService.getById(eq(HC), eq(1L))).thenReturn(mock(EvolucionClinicaResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/evoluciones/1")).andExpect(status().isOk());
    }

    // ── ExamenClinico ─────────────────────────────────────────────────

    @Test @DisplayName("PUT /examen → 200")
    void upsertExamenClinico() throws Exception {
        when(examenClinicoService.upsert(eq(HC), any())).thenReturn(mock(ExamenClinicoResponse.class));
        mockMvc.perform(put("/api/historias/" + HC + "/examen")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("examen.json")))
                .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /examen → 200")
    void getExamenClinico() throws Exception {
        when(examenClinicoService.get(HC)).thenReturn(mock(ExamenClinicoResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/examen")).andExpect(status().isOk());
    }

    // ── Interconsulta ─────────────────────────────────────────────────

    @Test @DisplayName("POST /interconsultas → 201")
    void createInterconsulta() throws Exception {
        when(interconsultaService.create(eq(HC), any())).thenReturn(mock(InterconsultaResponse.class));
        mockMvc.perform(post("/api/historias/" + HC + "/interconsultas")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("interconsulta.json")))
                .andExpect(status().isCreated());
    }

    @Test @DisplayName("GET /interconsultas → 200")
    void listInterconsultas() throws Exception {
        when(interconsultaService.list(HC)).thenReturn(List.of());
        mockMvc.perform(get("/api/historias/" + HC + "/interconsultas")).andExpect(status().isOk());
    }

    // ── Odontograma ───────────────────────────────────────────────────

    @Test @DisplayName("POST /odontograma → 201")
    void createOdontograma() throws Exception {
        when(odontogramaService.create(eq(HC), any())).thenReturn(mock(OdontogramaRegistroResponse.class));
        mockMvc.perform(post("/api/historias/" + HC + "/odontograma")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("odontograma.json")))
                .andExpect(status().isCreated());
    }

    @Test @DisplayName("GET /odontograma → 200")
    void listOdontograma() throws Exception {
        when(odontogramaService.list(HC)).thenReturn(List.of());
        mockMvc.perform(get("/api/historias/" + HC + "/odontograma")).andExpect(status().isOk());
    }

    @Test @DisplayName("DELETE /odontograma/{id} → 204")
    void deleteOdontograma() throws Exception {
        doNothing().when(odontogramaService).delete(HC, 1L);
        mockMvc.perform(delete("/api/historias/" + HC + "/odontograma/1")).andExpect(status().isNoContent());
    }

    // ── OdontogramaProtesis ───────────────────────────────────────────

    @Test @DisplayName("PUT /odontograma/protesis → 200")
    void upsertProtesis() throws Exception {
        when(odontogramaProtesisService.upsert(eq(HC), any())).thenReturn(mock(OdontogramaProtesisResponse.class));
        mockMvc.perform(put("/api/historias/" + HC + "/odontograma/protesis")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("protesis.json")))
                .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /odontograma/protesis → 200")
    void getProtesis() throws Exception {
        when(odontogramaProtesisService.get(HC)).thenReturn(mock(OdontogramaProtesisResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/odontograma/protesis")).andExpect(status().isOk());
    }

    // ── PlanTratamiento ───────────────────────────────────────────────

    @Test @DisplayName("POST /plan → 201")
    void createPlan() throws Exception {
        when(planTratamientoService.create(eq(HC), any())).thenReturn(mock(PlanTratamientoResponse.class));
        mockMvc.perform(post("/api/historias/" + HC + "/plan")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("plan.json")))
                .andExpect(status().isCreated());
    }

    @Test @DisplayName("GET /plan → 200")
    void listPlanes() throws Exception {
        when(planTratamientoService.list(HC)).thenReturn(List.of());
        mockMvc.perform(get("/api/historias/" + HC + "/plan")).andExpect(status().isOk());
    }

    // ── Pronostico ────────────────────────────────────────────────────

    @Test @DisplayName("PUT /pronostico → 200")
    void upsertPronostico() throws Exception {
        when(pronosticoService.upsert(eq(HC), any())).thenReturn(mock(PronosticoResponse.class));
        mockMvc.perform(put("/api/historias/" + HC + "/pronostico")
                .contentType(MediaType.APPLICATION_JSON).content(loadFixture("pronostico.json")))
                .andExpect(status().isOk());
    }

    @Test @DisplayName("GET /pronostico → 200")
    void getPronostico() throws Exception {
        when(pronosticoService.get(HC)).thenReturn(mock(PronosticoResponse.class));
        mockMvc.perform(get("/api/historias/" + HC + "/pronostico")).andExpect(status().isOk());
    }
}
