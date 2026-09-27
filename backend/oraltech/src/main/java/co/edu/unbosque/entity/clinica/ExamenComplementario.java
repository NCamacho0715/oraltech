package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "examen_complementario")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamenComplementario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
    private HistoriaClinica historiaClinica;

    @Column(nullable = false)
    private Boolean rxPanoramica;

    @Column(nullable = false)
    private Boolean rxPeriapical;

    @Column(columnDefinition = "TEXT")
    private String rxPeriapicalComentario;

    @Column(nullable = false)
    private Boolean paqueteOrtodoncia;

    @Column(nullable = false)
    private Boolean otros;

    @Column(columnDefinition = "TEXT")
    private String otrosTexto;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

}
