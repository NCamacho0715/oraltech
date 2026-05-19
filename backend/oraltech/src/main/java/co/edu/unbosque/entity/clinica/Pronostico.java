package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pronostico")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pronostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
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
