package co.edu.unbosque.controller;

import co.edu.unbosque.dto.AuthenticationRequest;
import co.edu.unbosque.dto.AuthenticationResponse;
import co.edu.unbosque.dto.RegisterRequest;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.service.AppointmentService;
import co.edu.unbosque.service.AuthService;
import co.edu.unbosque.service.DashboardService;
import co.edu.unbosque.service.PatientService;
import co.edu.unbosque.security.JwtAuthenticationFilter;
import co.edu.unbosque.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = {AuthController.class, PatientController.class, AppointmentController.class, DashboardController.class},
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
class CoreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private AuthService authService;
    @MockBean private PatientService patientService;
    @MockBean private AppointmentService appointmentService;
    @MockBean private DashboardService dashboardService;
    @MockBean private JwtService jwtService;
    @MockBean private co.edu.unbosque.repository.UserRepository userRepository;

    // ── AuthController ──────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/register → 200 OK")
    void shouldRegisterUser() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setPassword("pass1234");
        req.setName("New User");
        req.setEmail("newuser@test.com");
        req.setRole(User.Role.DENTIST);

        when(authService.register(any())).thenReturn(AuthenticationResponse.builder().token("token123").build());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/auth/login → 200 OK")
    void shouldAuthenticateUser() throws Exception {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user");
        req.setPassword("pass");

        when(authService.authenticate(any())).thenReturn(AuthenticationResponse.builder().token("token456").build());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    // ── PatientController ────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/patients → 200 OK")
    void shouldGetAllPatients() throws Exception {
        when(patientService.getAllPatients()).thenReturn(List.of());

        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/patients/{id} found → 200 OK")
    void shouldGetPatientById() throws Exception {
        Patient p = Patient.builder().id(1L).names("Ana").firstSurname("Lopez").build();
        when(patientService.getPatientById(1L)).thenReturn(Optional.of(p));

        mockMvc.perform(get("/api/patients/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/patients/{id} not found → 404")
    void shouldReturn404WhenPatientNotFound() throws Exception {
        when(patientService.getPatientById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/patients/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/patients → 200 OK")
    void shouldCreatePatient() throws Exception {
        Patient p = Patient.builder().id(1L).names("Ana").firstSurname("Lopez")
                .idType("CC").idNumber("123456").birthDate(LocalDate.of(1990,1,1)).build();
        when(patientService.createPatient(any())).thenReturn(p);

        mockMvc.perform(post("/api/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(p)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/patients/{id} → 200 OK")
    void shouldUpdatePatient() throws Exception {
        Patient p = Patient.builder().id(1L).names("Ana").firstSurname("Lopez")
                .idType("CC").idNumber("123456").birthDate(LocalDate.of(1990,1,1)).build();
        when(patientService.updatePatient(any(), any())).thenReturn(p);

        mockMvc.perform(put("/api/patients/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(p)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/patients/{id} → 204 No Content")
    void shouldDeletePatient() throws Exception {
        mockMvc.perform(delete("/api/patients/1"))
                .andExpect(status().isNoContent());
    }

    // ── AppointmentController ─────────────────────────────────────────

    @Test
    @DisplayName("GET /api/appointments?start=...&end=... → 200 OK")
    void shouldGetAppointmentsByRange() throws Exception {
        when(appointmentService.getAppointmentsByRange(any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/appointments")
                .param("start", "2026-01-01")
                .param("end", "2026-01-31"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/appointments/patient/{id} → 200 OK")
    void shouldGetAppointmentsByPatient() throws Exception {
        when(appointmentService.getAppointmentsByPatient(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/appointments/patient/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/appointments/{id} → 204 No Content")
    void shouldDeleteAppointment() throws Exception {
        mockMvc.perform(delete("/api/appointments/1"))
                .andExpect(status().isNoContent());
    }

    // ── DashboardController ───────────────────────────────────────────

    @Test
    @DisplayName("GET /api/dashboard → 200 OK")
    void shouldGetDashboard() throws Exception {
        when(dashboardService.getStats()).thenReturn(null);

        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk());
    }
}
