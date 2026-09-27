package co.edu.unbosque.entity.clinica;

import co.edu.unbosque.entity.enums.HigieneGrado;
import co.edu.unbosque.entity.enums.PatronMasticacion;
import co.edu.unbosque.entity.enums.TejidoEstado;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "examen_clinico")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamenClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
    private HistoriaClinica historiaClinica;

    // --- Tejidos blandos ---
    @Enumerated(EnumType.STRING)
    private TejidoEstado lengua;

    @Enumerated(EnumType.STRING)
    private TejidoEstado carrillos;

    @Enumerated(EnumType.STRING)
    private TejidoEstado frenillos;

    @Enumerated(EnumType.STRING)
    private TejidoEstado paladar;

    @Enumerated(EnumType.STRING)
    @Column(name = "piso_boca")
    private TejidoEstado pisoBoca;

    @Enumerated(EnumType.STRING)
    private TejidoEstado labios;

    @Enumerated(EnumType.STRING)
    private TejidoEstado comisuras;

    @Enumerated(EnumType.STRING)
    private TejidoEstado glandulas;

    @Enumerated(EnumType.STRING)
    private TejidoEstado pigmentaciones;

    // --- Tejidos duros ---
    private Boolean hipoplasias;
    private Boolean amelogenesis;
    private Boolean manchas;
    private Boolean desgastes;
    @Column(name = "td_fracturas")
    private Boolean tdFracturas;
    private Boolean agenesia;
    private Boolean supernumerario;
    @Column(name = "ausente_obs", columnDefinition = "TEXT")
    private String ausenteObs;

    // --- Maxilares ---
    private Boolean micrognasia;
    private Boolean macrognasia;
    private Boolean torus;
    @Column(name = "max_otros", columnDefinition = "TEXT")
    private String maxOtros;

    // --- ATM ---
    @Column(name = "dolor_articular")
    private Boolean dolorArticular;
    @Column(name = "dolor_muscular")
    private Boolean dolorMuscular;
    private Boolean ruidos;
    private Boolean limitacion;
    private Boolean desviacion;
    @Column(name = "atm_observaciones", columnDefinition = "TEXT")
    private String atmObservaciones;

    // --- Oclusión ---
    @Column(name = "sobremordida_h", precision = 5, scale = 2)
    private BigDecimal sobremordidaH;
    @Column(name = "sobremordida_v", precision = 5, scale = 2)
    private BigDecimal sobremordidaV;
    @Column(name = "oclusion_tipo", columnDefinition = "TEXT")
    private String oclusionTipo;
    @Column(name = "linea_media", columnDefinition = "TEXT")
    private String lineaMedia;
    @Enumerated(EnumType.STRING)
    @Column(name = "patron_masticacion")
    private PatronMasticacion patronMasticacion;

    // --- Hábitos ---
    @Enumerated(EnumType.STRING)
    private HigieneGrado higiene;
    @Column(name = "hab_halitosis")
    private Boolean habHalitosis;
    private Boolean bruxismo;
    @Column(name = "hab_otros", columnDefinition = "TEXT")
    private String habOtros;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

}
