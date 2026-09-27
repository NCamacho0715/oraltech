package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "antecedentes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Antecedentes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
    private HistoriaClinica historiaClinica;

    // --- Familiares ---
    @Column(name = "fam_cardiacos")
    private Boolean famCardiacos;

    @Column(name = "fam_diabetes")
    private Boolean famDiabetes;

    @Column(name = "fam_hipertension")
    private Boolean famHipertension;

    @Column(name = "fam_cancer")
    private Boolean famCancer;

    @Column(name = "fam_epilepsia")
    private Boolean famEpilepsia;

    @Column(name = "fam_otros", columnDefinition = "TEXT")
    private String famOtros;

    // --- Patológicos ---
    private Boolean hepatitis;
    @Column(name = "fiebre_reumatica")
    private Boolean fiebreReumatica;
    @Column(name = "pat_diabetes")
    private Boolean patDiabetes;
    private Boolean ulcera;
    @Column(name = "pat_epilepsia")
    private Boolean patEpilepsia;
    @Column(name = "pat_hipertension")
    private Boolean patHipertension;
    private Boolean convulsiones;
    @Column(columnDefinition = "TEXT")
    private String alergias;
    private Boolean mareos;
    private Boolean fracturas;
    private Boolean hemorragias;
    private Boolean cicatrizacion;
    private Boolean infartos;
    private Boolean valvulas;
    private Boolean renales;
    private Boolean respiratorios;
    private Boolean vih;

    // --- Toxicológicos ---
    private Boolean fuma;
    private Boolean alcohol;
    @Column(columnDefinition = "TEXT")
    private String cafe;
    @Column(columnDefinition = "TEXT")
    private String medicamentos;
    @Column(name = "alergia_medicamentos", columnDefinition = "TEXT")
    private String alergiaMedicamentos;
    @Column(name = "alergia_anestesia")
    private Boolean alergiaAnestesia;

    // --- Médicos personales ---
    private Boolean tratamiento;
    private Boolean embarazo;
    @Column(name = "meses_embarazo")
    private Integer mesesEmbarazo;
    private Boolean cirugias;
    private Boolean transfusiones;

    // --- Estomatológicos ---
    private Boolean luxacion;
    private Boolean amigdalitis;
    private Boolean infecciones;
    private Boolean halitosis;
    private Boolean fuegos;
    @Column(name = "cepillado_freq")
    private Short cepilladoFreq;
    @Column(name = "seda_freq")
    private String sedaFreq;
    @Column(name = "otros_habitos", columnDefinition = "TEXT")
    private String otrosHabitos;
    @Column(name = "ultima_visita", columnDefinition = "TEXT")
    private String ultimaVisita;
    @Column(name = "motivo_visita", columnDefinition = "TEXT")
    private String motivoVisita;

    // --- Observaciones ---
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

}
