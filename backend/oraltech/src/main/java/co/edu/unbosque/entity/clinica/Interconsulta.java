package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
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

}
