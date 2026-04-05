package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.Antecedentes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AntecedentesRepository extends JpaRepository<Antecedentes, Long> {
    Optional<Antecedentes> findByHistoriaClinicaId(UUID historiaClinicaId);
}
