package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "evolucion_clinica")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvolucionClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false)
    private HistoriaClinica historiaClinica;

    @Column(name = "cita_id")
    private Long citaId;

    @Column(name = "es_urgencia", nullable = false)
    @Builder.Default
    private Boolean esUrgencia = false;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "numero_diente")
    private Short numeroDiente;

    @Column(columnDefinition = "TEXT")
    private String procedimiento;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(precision = 12, scale = 2)
    private BigDecimal abono;

    @Column(precision = 12, scale = 2)
    private BigDecimal saldo;

    @Column(name = "firma_paciente", columnDefinition = "TEXT")
    private String firmaPaciente;

    @Column(name = "firma_odontologo", columnDefinition = "TEXT")
    private String firmaOdontologo;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) this.fecha = LocalDate.now();
    }
}
