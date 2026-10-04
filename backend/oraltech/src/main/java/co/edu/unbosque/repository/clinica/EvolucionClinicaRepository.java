package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.EvolucionClinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvolucionClinicaRepository extends JpaRepository<EvolucionClinica, Long> {
    List<EvolucionClinica> findAllByHistoriaClinicaIdOrderByFechaAsc(UUID historiaClinicaId);
    boolean existsByHistoriaClinicaId(UUID historiaClinicaId);
}
