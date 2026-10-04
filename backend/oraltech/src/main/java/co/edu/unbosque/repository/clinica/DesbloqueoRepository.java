package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.DesbloqueoSeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DesbloqueoRepository extends JpaRepository<DesbloqueoSeccion, Long> {
    Optional<DesbloqueoSeccion> findFirstByHistoriaClinicaIdAndSeccionAndUsadoFalseOrderByIdDesc(
            UUID historiaId, String seccion);
}
