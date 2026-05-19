package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interconsulta")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interconsulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false)
    private HistoriaClinica historiaClinica;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

    @PrePersist
    public void prePersist() { this.audit.prePersist(); }

    @PreUpdate
    public void preUpdate() { this.audit.preUpdate(); }
}
