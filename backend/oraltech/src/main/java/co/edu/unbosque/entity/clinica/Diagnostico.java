package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "diagnostico")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Diagnostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
    private HistoriaClinica historiaClinica;

    @Column(columnDefinition = "TEXT")
    private String dental;

    @Column(columnDefinition = "TEXT")
    private String periodontal;

    @Column(columnDefinition = "TEXT")
    private String pulpar;

    @Column(columnDefinition = "TEXT")
    private String articular;

    @Column(name = "tejidos_blandos", columnDefinition = "TEXT")
    private String tejidosBlandos;

    @Column(columnDefinition = "TEXT")
    private String funcional;

    @Column(name = "esqueletico_facial", columnDefinition = "TEXT")
    private String esqueleticoFacial;

    @Column(columnDefinition = "TEXT")
    private String otros;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

}
