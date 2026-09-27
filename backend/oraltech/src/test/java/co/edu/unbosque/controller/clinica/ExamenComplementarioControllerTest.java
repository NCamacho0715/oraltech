package co.edu.unbosque.controller.clinica;

import co.edu.unbosque.dto.clinica.ExamenComplementarioResponse;
import co.edu.unbosque.security.JwtAuthenticationFilter;
import co.edu.unbosque.security.JwtService;
import co.edu.unbosque.service.clinica.ExamenComplementarioService;
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
    controllers = ExamenComplementarioController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
class ExamenComplementarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExamenComplementarioService service;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private co.edu.unbosque.repository.UserRepository userRepository;

    private static final UUID HC_ID = UUID.randomUUID();

    @Test
    @DisplayName("PUT /api/historias/{id}/examen-complementario → 201 Created (primer registro)")
    void shouldCreateExamenComplementario() throws Exception {
        ExamenComplementarioResponse resp = ExamenComplementarioResponse.builder()
                .id(1L)
                .rxPanoramica(true)
                .build();
        when(service.create(eq(HC_ID), any())).thenReturn(resp);

        mockMvc.perform(put("/api/historias/" + HC_ID + "/examen-complementario")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"rxPanoramica\": true}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rxPanoramica").value(true));
    }

    @Test
    @DisplayName("GET /api/historias/{id}/examen-complementario → 200 OK")
    void shouldGetExamenComplementario() throws Exception {
        ExamenComplementarioResponse resp = ExamenComplementarioResponse.builder()
                .id(1L)
                .rxPanoramica(true)
                .rxPeriapical(true)
                .rxPeriapicalComentario("Pieza 46")
                .build();
        when(service.get(HC_ID)).thenReturn(resp);

        mockMvc.perform(get("/api/historias/" + HC_ID + "/examen-complementario"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rxPeriapicalComentario").value("Pieza 46"));
    }

    @Test
    @DisplayName("PUT /api/historias/{id}/examen-complementario → 409 (sección inmutable)")
    void shouldReturn409OnSecondPut() throws Exception {
        when(service.create(eq(HC_ID), any())).thenThrow(
                new ResponseStatusException(HttpStatus.CONFLICT,
                        "Exámenes complementarios ya registrados y bloqueados"));

        mockMvc.perform(put("/api/historias/" + HC_ID + "/examen-complementario")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"rxPanoramica\": true}"))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("GET /api/historias/{id}/examen-complementario → 204 (aún no registrado)")
    void shouldReturn204WhenNotRegistered() throws Exception {
        when(service.get(HC_ID)).thenThrow(
                new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Exámenes complementarios no registrados"));

        mockMvc.perform(get("/api/historias/" + HC_ID + "/examen-complementario"))
                .andExpect(status().isNoContent());
    }
}
