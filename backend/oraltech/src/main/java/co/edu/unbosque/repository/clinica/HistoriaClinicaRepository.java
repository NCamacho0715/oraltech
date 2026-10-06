package co.edu.unbosque.repository.clinica;

import co.edu.unbosque.entity.clinica.HistoriaClinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, UUID> {
    Optional<HistoriaClinica> findByPacienteId(Long pacienteId);
    boolean existsByPacienteId(Long pacienteId);

    @Query("SELECT h.paciente.id FROM HistoriaClinica h")
    Set<Long> findPacienteIdsConHistoria();
}
