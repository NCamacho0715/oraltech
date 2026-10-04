package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "analisis_periodontal")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalisisPeriodontal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
    private HistoriaClinica historiaClinica;

    private Boolean bolsaPeriodontal;
    private Boolean pseudoBolsa;
    private Boolean movilidadDental;
    private Boolean perdidaOsea;
    private Boolean retraccionGingival;
    private Boolean calculosSupra;
    private Boolean calculosSub;
    private Boolean reabsorcionRadicular;
    private Boolean sangrado;
    private Boolean exudadoSupuracion;
    private Boolean inflamacion;
    private Boolean cambioColor;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

}
