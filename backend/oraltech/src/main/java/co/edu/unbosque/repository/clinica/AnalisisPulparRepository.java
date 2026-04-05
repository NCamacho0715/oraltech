package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.AnalisisPulpar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnalisisPulparRepository extends JpaRepository<AnalisisPulpar, Long> {
    Optional<AnalisisPulpar> findByHistoriaClinicaId(UUID historiaId);
}
