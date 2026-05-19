package co.edu.unbosque.entity.clinica;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "plan_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private PlanTratamiento plan;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(precision = 12, scale = 2)
    private BigDecimal tarifa;

    @Column(precision = 12, scale = 2)
    private BigDecimal total;
}
