package co.edu.unbosque.controller.clinica.contract;

import co.edu.unbosque.controller.clinica.*;
import co.edu.unbosque.entity.Patient;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.clinica.HistoriaClinica;
import co.edu.unbosque.entity.enums.EstadoHistoria;
import co.edu.unbosque.repository.PatientRepository;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.repository.clinica.*;
import co.edu.unbosque.security.JwtAuthenticationFilter;
import co.edu.unbosque.security.JwtService;
import co.edu.unbosque.service.clinica.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.repository.CrudRepository;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Clase base reutilizable para pruebas de contrato Frontend <-> Backend.
 * Encapsula MockMvc con los controladores y servicios clínicos REALES,
 * repositorios @MockBean, y el helper capturarGuardado(repo) que devuelve un ArgumentCaptor.
 */
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
@ContextConfiguration(classes = {
    // Controladores
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
    PronosticoController.class,
    // Servicios clínicos reales
    AnamnesisService.class,
    AntecedentesService.class,
    AnalisisPeriodontalService.class,
    AnalisisPulparService.class,
    ConsentimientoService.class,
    DiagnosticoService.class,
    EvolucionClinicaService.class,
    ExamenClinicoService.class,
    InterconsultaService.class,
    OdontogramaService.class,
    OdontogramaProtesisService.class,
    PlanTratamientoService.class,
    PronosticoService.class,
    HistoriaClinicaService.class,
    HistoriaClinicaGuard.class
})
@AutoConfigureMockMvc(addFilters = false)
public abstract class AbstractClinicalContractTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    // Repositorios clínicos mockeados
    @MockBean protected AnamnesisRepository anamnesisRepository;
    @MockBean protected AntecedentesRepository antecedentesRepository;
    @MockBean protected ExamenClinicoRepository examenClinicoRepository;
    @MockBean protected DiagnosticoRepository diagnosticoRepository;
    @MockBean protected PronosticoRepository pronosticoRepository;
    @MockBean protected InterconsultaRepository interconsultaRepository;
    @MockBean protected EvolucionClinicaRepository evolucionClinicaRepository;
    @MockBean protected PlanTratamientoRepository planTratamientoRepository;
    @MockBean protected OdontogramaRegistroRepository odontogramaRegistroRepository;
    @MockBean protected OdontogramaProtesisRepository odontogramaProtesisRepository;
    @MockBean protected AnalisisPulparRepository analisisPulparRepository;
    @MockBean protected AnalisisPeriodontalRepository analisisPeriodontalRepository;
    @MockBean protected ConsentimientoRepository consentimientoRepository;

    // Repositorios y componentes del Core necesarios para HistoriaClinica y Usuarios
    @MockBean protected HistoriaClinicaRepository historiaClinicaRepository;
    @MockBean protected PatientRepository patientRepository;
    @MockBean protected UserRepository userRepository;
    @MockBean protected JwtService jwtService;

    protected static final UUID HC_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    protected static final Long PATIENT_ID = 1L;
    protected static final Long ODONTOLOGO_ID = 1L;

    protected HistoriaClinica historiaActiva;
    protected Patient pacienteMock;
    protected User odontologoMock;

    @BeforeEach
    void setUpBase() {
        pacienteMock = Patient.builder()
                .id(PATIENT_ID)
                .names("Carlos")
                .firstSurname("Gómez")
                .sex("F") // hembra para permitir campos de embarazo sin error si se evalúan
                .birthDate(LocalDate.of(1990, 5, 20))
                .idNumber("1010101010")
                .build();

        odontologoMock = User.builder()
                .id(ODONTOLOGO_ID)
                .name("Dr. Juan Pérez")
                .email("juan.perez@oraltech.com")
                .role(User.Role.DENTIST)
                .build();

        historiaActiva = HistoriaClinica.builder()
                .id(HC_ID)
                .paciente(pacienteMock)
                .odontologo(odontologoMock)
                .estado(EstadoHistoria.ACTIVA)
                .fechaApertura(LocalDate.now())
                .build();

        when(historiaClinicaRepository.findById(HC_ID)).thenReturn(Optional.of(historiaActiva));
        when(userRepository.findById(ODONTOLOGO_ID)).thenReturn(Optional.of(odontologoMock));
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pacienteMock));

        // Por defecto, configurar save en los repositorios para que retorne la entidad recibida
        when(anamnesisRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(antecedentesRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(examenClinicoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(diagnosticoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(pronosticoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(interconsultaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(evolucionClinicaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(planTratamientoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(odontogramaRegistroRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(odontogramaProtesisRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(analisisPulparRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(analisisPeriodontalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(consentimientoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    /**
     * Carga el archivo JSON fixture desde classpath (src/test/resources/fixtures).
     */
    protected String loadFixture(String fixtureName) throws IOException {
        ClassPathResource resource = new ClassPathResource("fixtures/" + fixtureName);
        try (InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /**
     * Helper genérico para capturar la entidad entregada a repo.save(...)
     */
    @SuppressWarnings("unchecked")
    protected <T> ArgumentCaptor<T> capturarGuardado(CrudRepository<T, ?> repo, Class<T> entityClass) {
        ArgumentCaptor<T> captor = ArgumentCaptor.forClass(entityClass);
        verify(repo, atLeastOnce()).save(captor.capture());
        return captor;
    }
}
