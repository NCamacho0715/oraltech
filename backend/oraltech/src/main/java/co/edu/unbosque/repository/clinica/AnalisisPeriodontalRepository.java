package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.AnalisisPeriodontal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnalisisPeriodontalRepository extends JpaRepository<AnalisisPeriodontal, Long> {
    Optional<AnalisisPeriodontal> findByHistoriaClinicaId(UUID historiaId);
}
