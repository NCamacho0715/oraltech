package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.Interconsulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterconsultaRepository extends JpaRepository<Interconsulta, Long> {
    List<Interconsulta> findAllByHistoriaClinicaId(UUID historiaClinicaId);
}
