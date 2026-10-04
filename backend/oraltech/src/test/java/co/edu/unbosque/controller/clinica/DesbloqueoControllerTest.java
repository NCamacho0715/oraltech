package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.DesbloqueoResponse;
import co.edu.unbosque.security.JwtAuthenticationFilter;
import co.edu.unbosque.security.JwtService;
import co.edu.unbosque.service.clinica.DesbloqueoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = DesbloqueoController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
class DesbloqueoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DesbloqueoService service;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private co.edu.unbosque.repository.UserRepository userRepository;

    private static final UUID HC_ID = UUID.randomUUID();

    @Test
    @DisplayName("POST /api/historias/{id}/{seccion}/desbloqueo → 201 Created")
    void shouldSolicitarDesbloqueo() throws Exception {
        DesbloqueoResponse resp = DesbloqueoResponse.builder()
                .id(1L)
                .historiaId(HC_ID)
                .seccion("diagnostico")
                .motivo("Corrección de error de digitación")
                .solicitadoPor("jefe")
                .usado(false)
                .build();
        when(service.solicitar(eq(HC_ID), eq("diagnostico"), any())).thenReturn(resp);

        mockMvc.perform(post("/api/historias/" + HC_ID + "/diagnostico/desbloqueo")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"motivo\": \"Corrección de error de digitación\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.seccion").value("diagnostico"))
                .andExpect(jsonPath("$.usado").value(false));
    }

    @Test
    @DisplayName("POST /api/historias/{id}/{seccion}/desbloqueo → 400 (motivo corto)")
    void shouldReturn400WhenMotivoInvalid() throws Exception {
        when(service.solicitar(eq(HC_ID), eq("diagnostico"), any())).thenThrow(
                new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El motivo del desbloqueo es obligatorio (mínimo 10 caracteres)"));

        mockMvc.perform(post("/api/historias/" + HC_ID + "/diagnostico/desbloqueo")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"motivo\": \"corto\"}"))
                .andExpect(status().isBadRequest());
    }
}
