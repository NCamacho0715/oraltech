package co.edu.unbosque.controller.clinica.contract;

import co.edu.unbosque.dto.clinica.PlanTratamientoResponse;
import co.edu.unbosque.entity.clinica.*;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ClinicalContractTest extends AbstractClinicalContractTest {

    // ──────────────────────────────────────────────────────────────────────────
    // Helper de aserción: valida que cada clave del JSON fixture corresponda a una propiedad no nula
    // ──────────────────────────────────────────────────────────────────────────
    private void assertFixtureMatchesEntity(String jsonFixture, Object entity) throws Exception {
        assertNotNull(entity, "La entidad capturada por save() no debe ser nula");
        JsonNode fixtureNode = objectMapper.readTree(jsonFixture);
        JsonNode entityNode = objectMapper.valueToTree(entity);

        Iterator<Map.Entry<String, JsonNode>> fields = fixtureNode.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String key = entry.getKey();
            if ("_comment".equals(key)) continue;

            JsonNode entityField = entityNode.get(key);
            assertNotNull(entityField, "La entidad guardada no posee la propiedad '" + key + "' esperada por el fixture");
            assertFalse(entityField.isNull(), "La propiedad '" + key + "' en la entidad guardada es nula");
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Tests de Contrato por Sección Clínica (13 secciones)
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Contrato: AnamnesisForm.jsx -> PUT /anamnesis -> Anamnesis")
    void contractAnamnesis() throws Exception {
        String fixture = loadFixture("anamnesis.json");

        mockMvc.perform(put("/api/historias/" + HC_ID + "/anamnesis")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isOk());

        ArgumentCaptor<Anamnesis> captor = capturarGuardado(anamnesisRepository, Anamnesis.class);
        Anamnesis saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato: AntecedentesForm.jsx -> PUT /antecedentes -> Antecedentes")
    void contractAntecedentes() throws Exception {
        String fixture = loadFixture("antecedentes.json");

        mockMvc.perform(put("/api/historias/" + HC_ID + "/antecedentes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isOk());

        ArgumentCaptor<Antecedentes> captor = capturarGuardado(antecedentesRepository, Antecedentes.class);
        Antecedentes saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato: ExamenClinicoForm.jsx -> PUT /examen -> ExamenClinico")
    void contractExamenClinico() throws Exception {
        String fixture = loadFixture("examen.json");

        mockMvc.perform(put("/api/historias/" + HC_ID + "/examen")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isOk());

        ArgumentCaptor<ExamenClinico> captor = capturarGuardado(examenClinicoRepository, ExamenClinico.class);
        ExamenClinico saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato: Pronostico (DiagnosticoTab.jsx) -> PUT /pronostico -> Pronostico")
    void contractPronostico() throws Exception {
        String fixture = loadFixture("pronostico.json");

        mockMvc.perform(put("/api/historias/" + HC_ID + "/pronostico")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isOk());

        ArgumentCaptor<Pronostico> captor = capturarGuardado(pronosticoRepository, Pronostico.class);
        Pronostico saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato: AnalisisPeriodontalForm.jsx -> PUT /analisis-periodontal -> AnalisisPeriodontal")
    void contractAnalisisPeriodontal() throws Exception {
        String fixture = loadFixture("analisis-periodontal.json");

        mockMvc.perform(put("/api/historias/" + HC_ID + "/analisis-periodontal")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isOk());

        ArgumentCaptor<AnalisisPeriodontal> captor = capturarGuardado(analisisPeriodontalRepository, AnalisisPeriodontal.class);
        AnalisisPeriodontal saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato: AnalisisPulparForm.jsx -> PUT /analisis-pulpar -> AnalisisPulpar")
    void contractAnalisisPulpar() throws Exception {
        String fixture = loadFixture("analisis-pulpar.json");

        mockMvc.perform(put("/api/historias/" + HC_ID + "/analisis-pulpar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isOk());

        ArgumentCaptor<AnalisisPulpar> captor = capturarGuardado(analisisPulparRepository, AnalisisPulpar.class);
        AnalisisPulpar saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato: Odontograma (Odontogram.jsx) -> POST /odontograma -> OdontogramaRegistro")
    void contractOdontograma() throws Exception {
        String fixture = loadFixture("odontograma.json");

        mockMvc.perform(post("/api/historias/" + HC_ID + "/odontograma")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isCreated());

        ArgumentCaptor<OdontogramaRegistro> captor = capturarGuardado(odontogramaRegistroRepository, OdontogramaRegistro.class);
        OdontogramaRegistro saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato: Protesis (OdontogramaSection.jsx) -> PUT /odontograma/protesis -> OdontogramaProtesis")
    void contractProtesis() throws Exception {
        String fixture = loadFixture("protesis.json");

        mockMvc.perform(put("/api/historias/" + HC_ID + "/odontograma/protesis")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isOk());

        ArgumentCaptor<OdontogramaProtesis> captor = capturarGuardado(odontogramaProtesisRepository, OdontogramaProtesis.class);
        OdontogramaProtesis saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato: ConsentimientoSection.jsx -> POST /consentimiento -> Consentimiento")
    void contractConsentimiento() throws Exception {
        String fixture = loadFixture("consentimiento.json");

        mockMvc.perform(post("/api/historias/" + HC_ID + "/consentimiento")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isCreated());

        ArgumentCaptor<Consentimiento> captor = capturarGuardado(consentimientoRepository, Consentimiento.class);
        Consentimiento saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Contratos de las historias de modelo (diagnóstico, evoluciones, plan e interconsulta):
    // el fixture debe mapear 1:1 a propiedades no nulas de la entidad guardada.
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Contrato: Interconsulta (DiagnosticoTab.jsx) -> POST /interconsultas -> Interconsulta")
    void contractInterconsulta() throws Exception {
        String fixture = loadFixture("interconsulta.json");

        mockMvc.perform(post("/api/historias/" + HC_ID + "/interconsultas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isCreated());

        ArgumentCaptor<Interconsulta> captor = capturarGuardado(interconsultaRepository, Interconsulta.class);
        Interconsulta saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato [US-02 Diagnostico]: DiagnosticoTab.jsx -> PUT /diagnostico -> Diagnostico")
    void contractDiagnostico() throws Exception {
        String fixture = loadFixture("diagnostico.json");

        mockMvc.perform(put("/api/historias/" + HC_ID + "/diagnostico")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isOk());

        ArgumentCaptor<Diagnostico> captor = capturarGuardado(diagnosticoRepository, Diagnostico.class);
        Diagnostico saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato [US-03 Evoluciones]: EvolucionesSection.jsx -> POST /evoluciones -> EvolucionClinica")
    void contractEvolucion() throws Exception {
        String fixture = loadFixture("evolucion.json");

        mockMvc.perform(post("/api/historias/" + HC_ID + "/evoluciones")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture))
                .andExpect(status().isCreated());

        ArgumentCaptor<EvolucionClinica> captor = capturarGuardado(evolucionClinicaRepository, EvolucionClinica.class);
        EvolucionClinica saved = captor.getValue();
        assertFixtureMatchesEntity(fixture, saved);
    }

    @Test
    @DisplayName("Contrato [US Plan]: PlanTratamientoSection.jsx -> POST /plan -> PlanTratamiento + PlanItem")
    void contractPlanTratamiento() throws Exception {
        String fixture = loadFixture("plan.json");

        // El odontólogo prescriptor se resuelve del usuario autenticado (ya no viaja en el cuerpo).
        when(userRepository.findByUsername("dr_plan")).thenReturn(Optional.of(odontologoMock));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("dr_plan", "secret",
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("DENTIST"))));
        try {
            mockMvc.perform(post("/api/historias/" + HC_ID + "/plan")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(fixture))
                    .andExpect(status().isCreated());

            ArgumentCaptor<PlanTratamiento> captor = capturarGuardado(planTratamientoRepository, PlanTratamiento.class);
            PlanTratamiento saved = captor.getValue();

            // Escenario Gherkin:
            // Dado el fixture JSON "plan.json" con los campos descripcion, items[{descripcion,tarifa,total}]
            // Cuando se ejecuta POST /api/historias/{uuid}/plan
            // Entonces la entidad capturada por PlanTratamientoRepository.save() tiene descripción no nula
            // Y cada PlanItem tiene descripcion, tarifa y total no nulos
            // Y el odontólogo del plan es el usuario autenticado
            assertFixtureMatchesEntity(fixture, saved);
            assertNotNull(saved.getOdontologo(), "El plan debe resolver el odontólogo del usuario autenticado");
            assertEquals(ODONTOLOGO_ID, saved.getOdontologo().getId());

            assertNotNull(saved.getItems(), "PlanTratamiento debe tener items");
            assertFalse(saved.getItems().isEmpty(), "PlanTratamiento no debe tener lista de items vacía");
            for (PlanItem item : saved.getItems()) {
                JsonNode itemTree = objectMapper.valueToTree(item);
                assertNotNull(itemTree.get("descripcion"), "Cada PlanItem debe tener descripción no nula");
                assertFalse(itemTree.get("descripcion").isNull(), "Cada PlanItem debe tener descripción no nula");
                assertNotNull(itemTree.get("tarifa"), "Cada PlanItem debe tener tarifa no nula");
                assertFalse(itemTree.get("tarifa").isNull(), "Cada PlanItem debe tener tarifa no nula");
                assertNotNull(itemTree.get("total"), "Cada PlanItem debe tener total no nulo");
                assertFalse(itemTree.get("total").isNull(), "Cada PlanItem debe tener total no nulo");
            }
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test de Dirección Inversa:
    // Serializa la entidad guardada a JSON y verifica que todo campo que la UI lee exista en la respuesta
    // (detecta p.createdAt, evo.descripcion, item.prioridad, i.especialidad)
    // ──────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("Tests de Dirección Inversa (Backend Response -> Frontend Read Contract)")
    class InverseDirectionContractTests {

        @Test
        @DisplayName("Inverso: PlanTratamientoResponse debe exponer descripcion, fecha, odontologoNombre, items y createdAt")
        void inverseContractPlanTratamiento() throws Exception {
            // La UI en PlanTratamientoSection lee p.descripcion, p.odontologoNombre, p.fecha, p.items
            PlanTratamientoResponse dto = PlanTratamientoResponse.builder()
                    .id(1L)
                    .odontologoId(ODONTOLOGO_ID)
                    .odontologoNombre("Dr. Juan Pérez")
                    .fecha(LocalDate.now())
                    .descripcion("Fase I Higiénica")
                    .items(List.of(PlanTratamientoResponse.PlanItemResponse.builder()
                            .id(1L)
                            .descripcion("Profilaxis dental")
                            .tarifa(new BigDecimal("120000"))
                            .total(new BigDecimal("120000"))
                            .createdAt(LocalDateTime.now())
                            .build()))
                    .createdAt(LocalDateTime.now())
                    .createdBy("dr_plan")
                    .updatedAt(LocalDateTime.now())
                    .updatedBy("dr_plan")
                    .build();

            JsonNode planNode = objectMapper.valueToTree(dto);
            assertNotNull(planNode.get("descripcion"), "PlanTratamientoResponse debe exponer 'descripcion' para la UI");
            assertNotNull(planNode.get("fecha"), "PlanTratamientoResponse debe exponer 'fecha' para la UI");
            assertNotNull(planNode.get("odontologoNombre"), "PlanTratamientoResponse debe exponer 'odontologoNombre' para la UI");
            assertNotNull(planNode.get("createdAt"), "PlanTratamientoResponse debe exponer 'createdAt' para la UI");
            assertNotNull(planNode.get("items"), "PlanTratamientoResponse debe exponer 'items' para la UI");
            assertFalse(planNode.get("items").isEmpty(), "PlanTratamientoResponse debe exponer items no vacíos");
        }

        @Test
        @DisplayName("Inverso: EvolucionClinica debe exponer 'procedimiento' y 'fecha' (sin 'descripcion')")
        void inverseContractEvolucion() {
            EvolucionClinica evo = EvolucionClinica.builder()
                    .id(1L)
                    .historiaClinica(historiaActiva)
                    .procedimiento("Obturación con resina")
                    .fecha(java.time.LocalDate.now())
                    .build();

            JsonNode node = objectMapper.valueToTree(evo);
            assertNotNull(node.get("procedimiento"), "EvolucionClinica serializada debe exponer 'procedimiento' que la UI lee");
            assertNotNull(node.get("fecha"), "EvolucionClinica serializada debe exponer 'fecha' que la UI lee");
            // Decisión de modelo (docs/evoluciones-modelo.md): no existe 'descripcion' en el backend ni en la UI.
            assertNull(node.get("descripcion"), "EvolucionClinica no debe exponer 'descripcion' (campo eliminado)");
        }

        @Test
        @DisplayName("Inverso: PlanItemResponse debe exponer descripcion, tarifa, total y createdAt heredado")
        void inverseContractPlanItem() {
            PlanTratamientoResponse.PlanItemResponse item = PlanTratamientoResponse.PlanItemResponse.builder()
                    .id(1L)
                    .descripcion("Profilaxis dental")
                    .tarifa(new BigDecimal("120000"))
                    .total(new BigDecimal("120000"))
                    .createdAt(LocalDateTime.now())
                    .build();

            JsonNode node = objectMapper.valueToTree(item);
            assertNotNull(node.get("descripcion"), "PlanItemResponse debe exponer 'descripcion' que la UI lee");
            assertNotNull(node.get("tarifa"), "PlanItemResponse debe exponer 'tarifa' que la UI lee");
            assertNotNull(node.get("total"), "PlanItemResponse debe exponer 'total' que la UI lee");
            assertNotNull(node.get("createdAt"), "PlanItemResponse debe exponer 'createdAt' heredado del plan");
            // Decisión de modelo (docs/plan-tratamiento-modelo.md): no existe 'prioridad' en el backend ni en la UI.
            assertNull(node.get("prioridad"), "PlanItemResponse no debe exponer 'prioridad' (campo inexistente)");
        }

        @Test
        @DisplayName("Inverso: Interconsulta debe exponer 'descripcion' (sin campo 'especialidad')")
        void inverseContractInterconsulta() {
            Interconsulta inter = Interconsulta.builder()
                    .id(1L)
                    .historiaClinica(historiaActiva)
                    .descripcion("Valoración de bolsas vestibulares")
                    .build();

            JsonNode node = objectMapper.valueToTree(inter);
            assertNotNull(node.get("descripcion"), "Interconsulta serializada debe exponer 'descripcion' que la UI lee");
            assertEquals("Valoración de bolsas vestibulares", node.get("descripcion").asText());
            // Decisión de modelo (docs/diagnostico-modelo.md): no existe 'especialidad' en el backend ni en la UI.
            assertNull(node.get("especialidad"), "Interconsulta no debe exponer 'especialidad' (campo eliminado)");
        }
    }
}
