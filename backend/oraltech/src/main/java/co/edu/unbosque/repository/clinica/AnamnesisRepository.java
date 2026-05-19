package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.Anamnesis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnamnesisRepository extends JpaRepository<Anamnesis, Long> {
    Optional<Anamnesis> findByHistoriaClinicaId(UUID historiaClinicaId);
}
