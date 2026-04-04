package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.OdontogramaRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OdontogramaRegistroRepository extends JpaRepository<OdontogramaRegistro, Long> {
    List<OdontogramaRegistro> findAllByHistoriaClinicaId(UUID historiaClinicaId);
}
