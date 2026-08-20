package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.HistoriaClinicaRequest;
import co.edu.unbosque.dto.clinica.HistoriaClinicaResponse;
import co.edu.unbosque.security.JwtAuthenticationFilter;
import co.edu.unbosque.security.JwtService;
import co.edu.unbosque.service.clinica.HistoriaClinicaService;
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

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = HistoriaClinicaController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
class HistoriaClinicaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HistoriaClinicaService service;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private co.edu.unbosque.repository.UserRepository userRepository;

    private static final UUID HC_ID = UUID.randomUUID();

    @Test
    @DisplayName("POST /api/historias → 201 Created")
    void shouldCreateHistoria() throws Exception {
        HistoriaClinicaRequest req = new HistoriaClinicaRequest();
        req.setPacienteId(1L);
        req.setOdontologoId(10L);

        when(service.create(any())).thenReturn(mock(HistoriaClinicaResponse.class));

        mockMvc.perform(post("/api/historias")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("GET /api/historias/{id} → 200 OK")
    void shouldGetHistoriaById() throws Exception {
        when(service.getById(HC_ID)).thenReturn(mock(HistoriaClinicaResponse.class));

        mockMvc.perform(get("/api/historias/" + HC_ID))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/historias/paciente/{pacienteId} → 200 OK")
    void shouldGetHistoriaByPacienteId() throws Exception {
        when(service.getByPacienteId(1L)).thenReturn(mock(HistoriaClinicaResponse.class));

        mockMvc.perform(get("/api/historias/paciente/1"))
                .andExpect(status().isOk());
    }
}
