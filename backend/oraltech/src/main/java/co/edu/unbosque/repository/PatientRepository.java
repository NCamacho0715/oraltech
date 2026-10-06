package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByIdNumber(String idNumber);

    boolean existsByIdNumber(String idNumber);

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.names) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.firstSurname) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "p.idNumber LIKE CONCAT('%', :q, '%')")
    Page<Patient> searchPatients(@Param("q") String q, Pageable pageable);
}
