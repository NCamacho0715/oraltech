package co.edu.unbosque.config;

import co.edu.unbosque.entity.User;
import co.edu.unbosque.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminUserInitializer initializer;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(initializer, "adminUsername", "admin");
        ReflectionTestUtils.setField(initializer, "adminPassword", "Admin123*");
        ReflectionTestUtils.setField(initializer, "adminEmail", "admin@oraltech.com");
        ReflectionTestUtils.setField(initializer, "adminName", "Administrador del Sistema");
    }

    @Test
    @DisplayName("UT-INIT-01: Debería crear usuario ADMIN por defecto si no existe ningún administrador")
    void shouldCreateDefaultAdminWhenNoneExists() {
        when(userRepository.existsByRole(User.Role.ADMIN)).thenReturn(false);
        when(userRepository.existsByUsername("admin")).thenReturn(false);
        when(userRepository.existsByEmail("admin@oraltech.com")).thenReturn(false);
        when(passwordEncoder.encode("Admin123*")).thenReturn("hashedPassword");

        initializer.run();

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("UT-INIT-02: No debería crear usuario ADMIN si ya existe uno en la base de datos")
    void shouldSkipCreationWhenAdminAlreadyExists() {
        when(userRepository.existsByRole(User.Role.ADMIN)).thenReturn(true);

        initializer.run();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("UT-INIT-03: Debería mostrar el banner de aplicación lista sin lanzar excepciones")
    void shouldPrintReadyBannerGracefully() {
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> initializer.printReadyBanner());
    }
}
