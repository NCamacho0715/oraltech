package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.OdontogramaProtesis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OdontogramaProtesisRepository extends JpaRepository<OdontogramaProtesis, Long> {
    Optional<OdontogramaProtesis> findByHistoriaClinicaId(UUID historiaId);
}
