package co.edu.unbosque.entity.clinica;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import co.edu.unbosque.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners(AuditingEntityListener.class)
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

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @OneToMany(mappedBy = "plan", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<PlanItem> items = new ArrayList<>();

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) this.fecha = LocalDate.now();
    }
}
