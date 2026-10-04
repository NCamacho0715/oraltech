package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.ExamenComplementario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExamenComplementarioRepository extends JpaRepository<ExamenComplementario, Long> {
    Optional<ExamenComplementario> findByHistoriaClinicaId(UUID historiaId);
}
