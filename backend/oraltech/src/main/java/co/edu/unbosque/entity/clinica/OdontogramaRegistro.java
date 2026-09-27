package co.edu.unbosque.entity.clinica;

import co.edu.unbosque.entity.enums.EstadoEvento;
import co.edu.unbosque.entity.enums.TipoEvento;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "odontograma_registro")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OdontogramaRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false)
    private HistoriaClinica historiaClinica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evolucion_id")
    private EvolucionClinica evolucion;

    @Column(name = "numero_diente", nullable = false)
    private Short numeroDiente;

    private String cara;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false)
    private TipoEvento tipoEvento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEvento estado;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(columnDefinition = "TEXT")
    private String observacion;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) this.fecha = LocalDate.now();
        if (this.estado == null) this.estado = EstadoEvento.ACTIVO;
    }
}
