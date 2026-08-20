package co.edu.unbosque.service;

import co.edu.unbosque.dto.AuthenticationRequest;
import co.edu.unbosque.dto.AuthenticationResponse;
import co.edu.unbosque.dto.RegisterRequest;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.entity.User.Role;
import co.edu.unbosque.repository.UserRepository;
import co.edu.unbosque.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private AuthenticationRequest authRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("dr_andrea")
                .password("encoded_password")
                .name("Dra. Andrea")
                .email("andrea@oraltech.com")
                .role(Role.DENTIST)
                .build();

        registerRequest = RegisterRequest.builder()
                .username("dr_andrea")
                .password("ClaveSegura123")
                .name("Dra. Andrea")
                .email("andrea@oraltech.com")
                .role(Role.DENTIST)
                .build();

        authRequest = AuthenticationRequest.builder()
                .username("dr_andrea")
                .password("ClaveSegura123")
                .build();
    }

    @Test
    @DisplayName("UT-AUTH-01: Debería registrar un usuario exitosamente (Camino feliz)")
    void shouldRegisterUserSuccessfully() {
        // GIVEN
        when(userRepository.existsByUsername("dr_andrea")).thenReturn(false);
        when(userRepository.existsByEmail("andrea@oraltech.com")).thenReturn(false);
        when(passwordEncoder.encode("ClaveSegura123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt_mock_token");

        // WHEN
        AuthenticationResponse response = authService.register(registerRequest);

        // THEN
        assertNotNull(response);
        assertEquals("jwt_mock_token", response.getToken());
        assertEquals("dr_andrea", response.getUsername());
        assertEquals("DENTIST", response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("UT-AUTH-02: Debería lanzar excepción si el nombre de usuario ya está en uso")
    void shouldThrowExceptionWhenUsernameAlreadyExists() {
        // GIVEN
        when(userRepository.existsByUsername("dr_andrea")).thenReturn(true);

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("UT-AUTH-03: Debería lanzar excepción si el correo electrónico ya está en uso")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // GIVEN
        when(userRepository.existsByUsername("dr_andrea")).thenReturn(false);
        when(userRepository.existsByEmail("andrea@oraltech.com")).thenReturn(true);

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("UT-AUTH-04: Debería autenticar un usuario exitosamente")
    void shouldAuthenticateUserSuccessfully() {
        // GIVEN
        when(userRepository.findByUsername("dr_andrea")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(testUser)).thenReturn("jwt_mock_token");

        // WHEN
        AuthenticationResponse response = authService.authenticate(authRequest);

        // THEN
        assertNotNull(response);
        assertEquals("jwt_mock_token", response.getToken());
        assertEquals("dr_andrea", response.getUsername());
        assertEquals("DENTIST", response.getRole());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("UT-AUTH-05: Debería lanzar excepción si el usuario no existe en la base de datos al autenticar")
    void shouldThrowExceptionWhenUserNotFoundDuringAuthentication() {
        // GIVEN
        when(userRepository.findByUsername("dr_andrea")).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.authenticate(authRequest);
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("UT-AUTH-06: Debería propagar BadCredentialsException si las credenciales son incorrectas")
    void shouldThrowExceptionWhenBadCredentials() {
        // GIVEN
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        // WHEN & THEN
        assertThrows(BadCredentialsException.class, () -> {
            authService.authenticate(authRequest);
        });
        verify(userRepository, never()).findByUsername(anyString());
    }
}
