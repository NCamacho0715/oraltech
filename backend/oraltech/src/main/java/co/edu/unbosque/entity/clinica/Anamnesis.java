package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "anamnesis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Anamnesis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
    private HistoriaClinica historiaClinica;

    @Column(name = "motivo_consulta", columnDefinition = "TEXT")
    private String motivoConsulta;

    @Column(name = "estado_actual", columnDefinition = "TEXT")
    private String estadoActual;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

}
