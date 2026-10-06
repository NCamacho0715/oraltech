package co.edu.unbosque.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class BackupServiceTest {

    @TempDir
    Path tempDir;

    @Test
    @DisplayName("UT-BACKUP-01: validateBackup debería rechazar archivos inexistentes")
    void shouldRejectNonExistentBackup() {
        BackupService service = new BackupService();
        ReflectionTestUtils.setField(service, "backupDir", tempDir.toString());

        Map<String, Object> result = service.validateBackup("no_existe.backup");

        assertFalse((Boolean) result.get("valid"));
        assertTrue(result.get("reason").toString().contains("no existe"));
    }

    @Test
    @DisplayName("UT-BACKUP-02: cleanupOldBackups debería depurar archivos que superen la retención")
    void shouldCleanOldBackupsPastRetention() throws IOException {
        BackupService service = new BackupService();
        ReflectionTestUtils.setField(service, "backupDir", tempDir.toString());
        ReflectionTestUtils.setField(service, "retentionDays", 30);

        // Archivo antiguo (35 días atrás)
        Path oldBackup = tempDir.resolve("old_backup.backup");
        Files.writeString(oldBackup, "contenido de prueba antiguo");
        File oldFile = oldBackup.toFile();
        long oldTime = System.currentTimeMillis() - (35L * 24 * 60 * 60 * 1000L);
        oldFile.setLastModified(oldTime);

        // Archivo reciente (1 día atrás)
        Path recentBackup = tempDir.resolve("recent_backup.backup");
        Files.writeString(recentBackup, "contenido de prueba reciente");
        File recentFile = recentBackup.toFile();
        recentFile.setLastModified(System.currentTimeMillis() - (1L * 24 * 60 * 60 * 1000L));

        int deletedCount = service.cleanupOldBackups();

        assertEquals(1, deletedCount);
        assertFalse(oldFile.exists(), "El archivo antiguo debió ser eliminado");
        assertTrue(recentFile.exists(), "El archivo reciente debe conservarse");
    }

    @Test
    @DisplayName("UT-BACKUP-03: listBackups debería listar y ordenar respaldos por fecha descendente")
    void shouldListBackupsOrderedDesc() throws IOException {
        BackupService service = new BackupService();
        ReflectionTestUtils.setField(service, "backupDir", tempDir.toString());

        Path b1 = tempDir.resolve("oraltech_2026-01-01.backup");
        Files.writeString(b1, "backup 1");
        b1.toFile().setLastModified(1000000000L);

        Path b2 = tempDir.resolve("oraltech_2026-02-01.backup");
        Files.writeString(b2, "backup 2");
        b2.toFile().setLastModified(2000000000L);

        List<Map<String, Object>> list = service.listBackups();

        assertEquals(2, list.size());
        assertEquals("oraltech_2026-02-01.backup", list.get(0).get("filename"));
        assertEquals("oraltech_2026-01-01.backup", list.get(1).get("filename"));
    }
}
