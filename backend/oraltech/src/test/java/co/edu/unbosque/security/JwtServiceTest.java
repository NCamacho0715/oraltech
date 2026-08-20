package co.edu.unbosque.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    // 256-bit Base64-encoded key
    private static final String SECRET_KEY = "dGhpc2lzYXZlcnlzZWN1cmVzZWNyZXRrZXlmb3Jqd3R0ZXN0aW5nb3JhbHRlY2g=";
    private static final long EXPIRATION = 86400000L; // 24 hours

    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", EXPIRATION);

        userDetails = User.builder()
                .username("dr_andrea")
                .password("password")
                .authorities(Collections.emptyList())
                .build();
    }

    @Test
    @DisplayName("UT-JWT-01: Debería generar un token JWT válido para un UserDetails")
    void shouldGenerateTokenSuccessfully() {
        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals(3, token.split("\\.").length); // Header.Payload.Signature
    }

    @Test
    @DisplayName("UT-JWT-02: Debería extraer el username del token generado")
    void shouldExtractUsernameSuccessfully() {
        String token = jwtService.generateToken(userDetails);

        String extractedUsername = jwtService.extractUsername(token);

        assertEquals("dr_andrea", extractedUsername);
    }

    @Test
    @DisplayName("UT-JWT-03: Debería validar que el token coincide con el usuario emisor")
    void shouldValidateTokenSuccessfully() {
        String token = jwtService.generateToken(userDetails);

        boolean isValid = jwtService.isTokenValid(token, userDetails);

        assertTrue(isValid);
    }

    @Test
    @DisplayName("UT-JWT-04: Debería invalidar el token si se compara con otro usuario")
    void shouldBeInvalidForDifferentUser() {
        String token = jwtService.generateToken(userDetails);

        UserDetails otherUser = User.builder()
                .username("otro_odontologo")
                .password("password")
                .authorities(Collections.emptyList())
                .build();

        boolean isValid = jwtService.isTokenValid(token, otherUser);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("UT-JWT-05: Debería generar token con extraClaims adicionales")
    void shouldGenerateTokenWithExtraClaims() {
        Map<String, Object> extraClaims = Map.of("role", "DENTIST", "clinicId", 123);

        String token = jwtService.generateToken(extraClaims, userDetails);

        assertNotNull(token);
        assertEquals("dr_andrea", jwtService.extractUsername(token));
        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        assertEquals("DENTIST", role);
    }
}
