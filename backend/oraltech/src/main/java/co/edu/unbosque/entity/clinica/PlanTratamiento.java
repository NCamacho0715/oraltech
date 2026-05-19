package co.edu.unbosque.entity.clinica;

import co.edu.unbosque.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plan_tratamiento")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanTratamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false)
    private HistoriaClinica historiaClinica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "odontologo_id", nullable = false)
    private User odontologo;

    @Column(nullable = false)
    private LocalDate fecha;

    @OneToMany(mappedBy = "plan", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    @Builder.Default
    private List<PlanItem> items = new ArrayList<>();

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) this.fecha = LocalDate.now();
        this.audit.prePersist();
    }

    @PreUpdate
    public void preUpdate() { this.audit.preUpdate(); }
}
