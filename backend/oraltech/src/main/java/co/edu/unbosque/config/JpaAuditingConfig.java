package co.edu.unbosque.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Habilita la auditoría JPA (created_at/created_by/updated_at/updated_by) y define
 * quién queda registrado como autor de cada escritura.
 *
 * <p>{@code auditorAware} devuelve el {@code username} del principal autenticado en la
 * petición actual. Cuando no hay principal (jobs programados, carga inicial, scripts)
 * se registra el valor por defecto {@code "sistema"}.</p>
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaAuditingConfig {

    public static final String SISTEMA = "sistema";

    @Bean("auditorAware")
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null
                    || !authentication.isAuthenticated()
                    || authentication instanceof AnonymousAuthenticationToken) {
                return Optional.of(SISTEMA);
            }
            String username = authentication.getName();
            if (username == null || username.isBlank()) {
                return Optional.of(SISTEMA);
            }
            return Optional.of(username);
        };
    }
}
