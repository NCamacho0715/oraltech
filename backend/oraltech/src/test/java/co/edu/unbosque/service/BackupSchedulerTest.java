package co.edu.unbosque.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BackupSchedulerTest {

    @Mock
    private BackupService backupService;

    @InjectMocks
    private BackupScheduler scheduler;

    @Test
    @DisplayName("UT-BACKUP-SCHED-01: Debería invocar runBackup en el respaldo diario programado")
    void shouldTriggerBackupOnSchedule() {
        when(backupService.runBackup()).thenReturn(Map.of(
                "success", true,
                "filename", "oraltech_test.backup",
                "depuradosPorRetencion", 1
        ));

        scheduler.runScheduledBackup();

        verify(backupService, times(1)).runBackup();
    }

    @Test
    @DisplayName("UT-BACKUP-SCHED-02: Debería manejar fallos de runBackup sin propagar excepciones no controladas")
    void shouldHandleFailureGracefully() {
        when(backupService.runBackup()).thenReturn(Map.of(
                "success", false,
                "message", "Fallo al ejecutar pg_dump"
        ));

        scheduler.runScheduledBackup();

        verify(backupService, times(1)).runBackup();
    }

    @Test
    @DisplayName("UT-BACKUP-SCHED-03: Debería ejecutar respaldo compensatorio si el último tiene más de 24 horas")
    void shouldRunMissedBackupWhenOlderThan24Hours() {
        when(backupService.isLastBackupOlderThanHours(24)).thenReturn(true);
        when(backupService.runBackup()).thenReturn(Map.of(
                "success", true,
                "filename", "oraltech_missed.backup"
        ));

        scheduler.checkAndRunMissedBackup();

        verify(backupService, times(1)).isLastBackupOlderThanHours(24);
        verify(backupService, times(1)).runBackup();
    }

    @Test
    @DisplayName("UT-BACKUP-SCHED-04: No debería ejecutar respaldo si existe uno reciente menor a 24 horas")
    void shouldSkipBackupWhenRecentBackupExists() {
        when(backupService.isLastBackupOlderThanHours(24)).thenReturn(false);

        scheduler.checkAndRunMissedBackup();

        verify(backupService, times(1)).isLastBackupOlderThanHours(24);
        verify(backupService, never()).runBackup();
    }
}
