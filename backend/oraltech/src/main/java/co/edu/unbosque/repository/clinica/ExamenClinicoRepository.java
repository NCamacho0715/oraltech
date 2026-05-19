package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.ExamenClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExamenClinicoRepository extends JpaRepository<ExamenClinico, Long> {
    Optional<ExamenClinico> findByHistoriaClinicaId(UUID historiaClinicaId);
}
