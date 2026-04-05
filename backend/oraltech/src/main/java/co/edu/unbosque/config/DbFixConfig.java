package co.edu.unbosque.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DbFixConfig {

    @Bean
    public CommandLineRunner dropCheckConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE odontograma_registro DROP CONSTRAINT IF EXISTS odontograma_registro_tipo_evento_check");
                System.out.println("Constraint odontograma_registro_tipo_evento_check dropped successfully to allow all Enum values.");
            } catch (Exception e) {
                System.out.println("Notice: Could not drop constraint (might not exist or different DB dialect).");
            }
        };
    }
}
