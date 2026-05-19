package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.Consentimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsentimientoRepository extends JpaRepository<Consentimiento, Long> {
    Optional<Consentimiento> findByHistoriaClinicaId(UUID historiaClinicaId);
}
