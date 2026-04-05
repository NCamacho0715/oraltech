package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.PlanTratamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlanTratamientoRepository extends JpaRepository<PlanTratamiento, Long> {
    List<PlanTratamiento> findAllByHistoriaClinicaId(UUID historiaClinicaId);
}
