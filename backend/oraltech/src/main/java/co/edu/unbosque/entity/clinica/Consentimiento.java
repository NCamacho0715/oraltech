package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "consentimiento")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Consentimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false, unique = true)
    private HistoriaClinica historiaClinica;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "paciente_nombre")
    private String pacienteNombre;

    @Column(name = "paciente_cc")
    private String pacienteCc;

    @Column(name = "odontologo_nombre")
    private String odontologoNombre;

    @Column(name = "odontologo_cc")
    private String odontologoCc;

    private LocalDate fecha;

    @Column(name = "firma_paciente", columnDefinition = "TEXT")
    private String firmaPaciente;

    @Column(name = "firma_odontologo", columnDefinition = "TEXT")
    private String firmaOdontologo;

    @Column(name = "firma_testigo", columnDefinition = "TEXT")
    private String firmaTestigo;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) this.fecha = LocalDate.now();
    }
}
