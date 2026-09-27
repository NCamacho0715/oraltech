package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "analisis_pulpar")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalisisPulpar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
    private HistoriaClinica historiaClinica;

    private Boolean cuellosSensibles;
    private Boolean endoRealizada;
    private Boolean endoDefectuosa;
    private Boolean abcesoFistula;
    private Boolean lesionesPeriapicales;
    private Boolean qxEndodontica;
    private Boolean exposicionPulpar;
    private Boolean cambioColor;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

}
