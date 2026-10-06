package co.edu.unbosque.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BackupScheduler {

    private final BackupService backupService;

    /**
     * Programación diaria automática fuera del horario de atención del consultorio (por defecto 11:00 PM).
     * Ejecuta el respaldo completo con pg_dump, genera checksum SHA-256, replica a destino externo si aplica
     * y ejecuta la depuración cíclica según la política de retención de 30 días.
     */
    @Scheduled(cron = "${backup.cron:0 0 23 * * *}")
    public void runScheduledBackup() {
        log.info("Iniciando respaldo diario programado de la base de datos PostgreSQL...");
        try {
            Map<String, Object> result = backupService.runBackup();
            if (Boolean.TRUE.equals(result.get("success"))) {
                log.info("Respaldo diario programado completado con éxito: {}. Depurados por retención: {}",
                        result.get("filename"), result.getOrDefault("depuradosPorRetencion", 0));
            } else {
                log.error("El respaldo diario programado reportó fallo: {}", result.get("message"));
            }
        } catch (Exception e) {
            log.error("Excepción inesperada durante el respaldo diario programado: {}", e.getMessage(), e);
        }
    }
}
