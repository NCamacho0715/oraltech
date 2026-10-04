package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "odontograma_protesis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OdontogramaProtesis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
    private HistoriaClinica historiaClinica;

    // Prótesis Total
    private Boolean totalSuperior;
    private Boolean totalInferior;

    // Prótesis Parcial Acrílica
    private Boolean parcialAcriSuperior;
    private Boolean parcialAcriInferior;

    // Prótesis Removible Metálica
    private Boolean removibleMetSuperior;
    private Boolean removibleMetInferior;

    // Prótesis Fija
    private String fijaSuperior; // Texto libre
    private String fijaInferior;  // Texto libre

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

}
