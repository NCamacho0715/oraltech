package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Auditoría de desbloqueos excepcionales de secciones inmutables (HU-2).
 * Solo escritura: cada fila registra quién (createdBy = admin autenticado),
 * cuándo (createdAt), sobre qué historia y sección, y con qué motivo.
 * {@code usado} indica si el desbloqueo ya se consumió en el siguiente PUT.
 */
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "desbloqueo_seccion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesbloqueoSeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false)
    private HistoriaClinica historiaClinica;

    @Column(nullable = false, length = 64)
    private String seccion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivo;

    @Column(nullable = false)
    @Builder.Default
    private Boolean usado = false;

    @Embedded
    @Builder.Default
    private AuditFields audit = new AuditFields();

}
