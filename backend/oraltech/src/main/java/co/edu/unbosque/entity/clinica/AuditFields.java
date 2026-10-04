package co.edu.unbosque.entity.clinica;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

/**
 * Fuente única de auditoría de los registros clínicos.
 *
 * Los valores los escribe Spring Data JPA (mediante {@code @EnableJpaAuditing} y el
 * {@code AuditingEntityListener} registrado en cada entidad), por lo que aquí NO se
 * declaran callbacks {@code @PrePersist}/{@code @PreUpdate}: coexistirían con el
 * mecanismo de Spring y producirían doble escritura.
 *
 * @see co.edu.unbosque.config.JpaAuditingConfig
 */
@Embeddable
@Data
public class AuditFields {

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
}
