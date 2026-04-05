package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.Pronostico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PronosticoRepository extends JpaRepository<Pronostico, Long> {
    Optional<Pronostico> findByHistoriaClinicaId(UUID historiaClinicaId);
}
