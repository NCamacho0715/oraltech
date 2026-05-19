package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(
            LocalDate startDate, LocalDate endDate);

    List<Appointment> findByPatientIdOrderByAppointmentDateDescStartTimeDesc(Long patientId);

    long countByAppointmentDate(LocalDate date);

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.appointmentDate = :date
          AND a.id <> :excludeId
          AND a.status <> 'CANCELADA'
          AND a.startTime < :endTime
          AND a.endTime > :startTime
    """)
    List<Appointment> findConflicting(
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId);
}
