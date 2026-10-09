package co.edu.unbosque.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
public class BackupService {

    @Value("${backup.dir:C:/Oraltech/Backups/PostgreSQL}")
    private String backupDir;

    @Value("${backup.pgdump:C:/Program Files/PostgreSQL/18/bin/pg_dump.exe}")
    private String pgDump;

    @Value("${backup.pgrestore:C:/Program Files/PostgreSQL/18/bin/pg_restore.exe}")
    private String pgRestore;

    @Value("${backup.db:oraltech}")
    private String database;

    @Value("${backup.host:localhost}")
    private String host;

    @Value("${backup.port:5432}")
    private String port;

    @Value("${backup.user:postgres}")
    private String dbUser;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${backup.retention-days:30}")
    private int retentionDays;

    @Value("${backup.external-dir:}")
    private String externalDir;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

    public List<Map<String, Object>> listBackups() {
        File dir = new File(backupDir);
        List<Map<String, Object>> result = new ArrayList<>();
        if (!dir.exists() || !dir.isDirectory()) return result;

        File[] files = dir.listFiles((d, name) -> name.endsWith(".backup"));
        if (files == null) return result;

        Arrays.sort(files, Comparator.comparingLong(File::lastModified).reversed());

        for (File f : files) {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("filename", f.getName());
            info.put("path", f.getAbsolutePath());
            info.put("sizeBytes", f.length());
            info.put("sizeKb", Math.round(f.length() / 1024.0));
            info.put("lastModified", new Date(f.lastModified()).toString());
            info.put("exists", f.exists());
            info.put("readable", f.canRead());
            result.add(info);
        }
        return result;
    }

    public Map<String, Object> getLatestInfo() {
        List<Map<String, Object>> all = listBackups();
        Map<String, Object> res = new LinkedHashMap<>();
        if (all.isEmpty()) {
            res.put("hasBackup", false);
            res.put("message", "No se encontraron respaldos en el directorio configurado.");
            return res;
        }
        Map<String, Object> latest = all.get(0);
        res.put("hasBackup", true);
        res.put("latest", latest);
        res.put("totalBackups", all.size());
        res.put("backupDir", backupDir);
        res.put("retentionDays", retentionDays);
        return res;
    }

    /**
     * Verifica si no existe ningún respaldo o si el respaldo más reciente tiene más de {@code hours} horas.
     */
    public boolean isLastBackupOlderThanHours(int hours) {
        File dir = new File(backupDir);
        if (!dir.exists() || !dir.isDirectory()) {
            return true;
        }
        File[] files = dir.listFiles((d, name) -> name.endsWith(".backup"));
        if (files == null || files.length == 0) {
            return true;
        }
        long latestModified = Arrays.stream(files)
                .mapToLong(File::lastModified)
                .max()
                .orElse(0L);
        long thresholdMs = hours * 3_600_000L;
        return (System.currentTimeMillis() - latestModified) > thresholdMs;
    }

    public Map<String, Object> runBackup() {
        Map<String, Object> result = new LinkedHashMap<>();
        File dir = new File(backupDir);
        if (!dir.exists()) dir.mkdirs();

        String timestamp = LocalDateTime.now().format(FMT);
        String outFile = backupDir + "/" + database + "_" + timestamp + ".backup";

        String resolvedPgDump = resolvePostgresBinary(pgDump, "pg_dump.exe");
        ProcessBuilder pb = new ProcessBuilder(
                resolvedPgDump, "-h", host, "-p", port, "-U", dbUser, "-F", "c", "-f", outFile, database
        );
        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);

        try {
            Process proc = pb.start();
            String output = new String(proc.getInputStream().readAllBytes());
            int code = proc.waitFor();

            boolean success = code == 0;
            String backupFilename = success ? database + "_" + timestamp + ".backup" : null;

            result.put("success", success);
            result.put("exitCode", code);
            result.put("filename", backupFilename);
            result.put("timestamp", timestamp);
            result.put("output", output.isBlank() ? null : output.trim());
            result.put("message", success ? "Respaldo generado exitosamente." : "Error al generar el respaldo.");

            if (success) {
                File backupFile = new File(outFile);
                File shaFile = generateSha256(backupFile);
                if (shaFile != null && shaFile.exists()) {
                    result.put("checksumSha256", Files.readString(shaFile.toPath()).trim());
                }
                copyToExternalIfConfigured(backupFile, shaFile);
                int deleted = cleanupOldBackups();
                if (deleted > 0) {
                    result.put("depuradosPorRetencion", deleted);
                }
            } else if (new File(outFile).exists()) {
                new File(outFile).delete();
            }
        } catch (Exception e) {
            log.error("Error al ejecutar respaldo: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error interno: " + e.getMessage());
        }
        return result;
    }

    public Map<String, Object> validateBackup(String filename) {
        Map<String, Object> result = new LinkedHashMap<>();
        File f = new File(backupDir + "/" + sanitize(filename));

        if (!f.exists()) {
            result.put("valid", false);
            result.put("reason", "El archivo no existe en el directorio de respaldos.");
            return result;
        }
        if (!f.canRead()) {
            result.put("valid", false);
            result.put("reason", "El archivo no es accesible (sin permisos de lectura).");
            return result;
        }
        if (f.length() < 100) {
            result.put("valid", false);
            result.put("reason", "El archivo parece estar vacío o incompleto.");
            return result;
        }

        // Checksum MD5
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            try (FileInputStream fis = new FileInputStream(f)) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = fis.read(buf)) != -1) md.update(buf, 0, n);
            }
            StringBuilder sb = new StringBuilder();
            for (byte b : md.digest()) sb.append(String.format("%02x", b));
            result.put("checksum", sb.toString());
        } catch (Exception e) {
            result.put("valid", false);
            result.put("reason", "Error al calcular checksum: " + e.getMessage());
            return result;
        }

        // Verify via pg_restore --list (no-op, just reads catalog)
        try {
            String resolvedPgRestore = resolvePostgresBinary(pgRestore, "pg_restore.exe");
            ProcessBuilder pb = new ProcessBuilder(resolvedPgRestore, "-l", f.getAbsolutePath());
            pb.redirectErrorStream(true);
            Process proc = pb.start();
            String out = new String(proc.getInputStream().readAllBytes());
            int code = proc.waitFor();
            if (code != 0) {
                result.put("valid", false);
                result.put("reason", "La integridad del archivo falló: " + out.trim());
                return result;
            }
        } catch (Exception e) {
            result.put("valid", false);
            result.put("reason", "No se pudo verificar la integridad: " + e.getMessage());
            return result;
        }

        result.put("valid", true);
        result.put("filename", f.getName());
        result.put("sizeKb", Math.round(f.length() / 1024.0));
        result.put("lastModified", new Date(f.lastModified()).toString());
        result.put("message", "Archivo válido y disponible para restauración.");
        return result;
    }

    public Map<String, Object> restore(String filename) {
        Map<String, Object> result = new LinkedHashMap<>();
        File f = new File(backupDir + "/" + sanitize(filename));

        // Re-validate before restoring
        Map<String, Object> validation = validateBackup(filename);
        if (!(Boolean) validation.getOrDefault("valid", false)) {
            result.put("success", false);
            result.put("message", "Validación fallida: " + validation.get("reason"));
            return result;
        }

        // Medida de seguridad: Creación de respaldo preventivo antes de restaurar
        log.info("Generando respaldo preventivo de seguridad antes de ejecutar restauración...");
        Map<String, Object> preventive = runBackup();
        if (!Boolean.TRUE.equals(preventive.get("success"))) {
            String prevMsg = (String) preventive.getOrDefault("message", "Error desconocido");
            log.error("Falló la creación del respaldo preventivo: {}. Abortando restauración.", prevMsg);
            result.put("success", false);
            result.put("preventiveBackupSuccess", false);
            result.put("message", "Operación abortada por seguridad: No se pudo generar el respaldo preventivo previo a la restauración (" + prevMsg + ").");
            return result;
        }
        String preventiveFilename = (String) preventive.get("filename");
        result.put("preventiveBackup", preventiveFilename);
        log.info("Respaldo preventivo de seguridad creado exitosamente: {}", preventiveFilename);

        try {
            String resolvedPgRestore = resolvePostgresBinary(pgRestore, "pg_restore.exe");
            ProcessBuilder pb = new ProcessBuilder(
                    resolvedPgRestore, "-h", host, "-p", port, "-U", dbUser,
                    "-d", database, "--clean", "--if-exists", f.getAbsolutePath()
            );
            pb.environment().put("PGPASSWORD", dbPassword);
            pb.redirectErrorStream(true);

            Process proc = pb.start();
            String output = new String(proc.getInputStream().readAllBytes());
            int code = proc.waitFor();

            // pg_restore returns non-zero even on warnings; treat as success if file was valid
            boolean success = code == 0 || !output.toLowerCase().contains("error:");
            result.put("success", success);
            result.put("exitCode", code);
            result.put("output", output.isBlank() ? null : output.trim());
            result.put("message", code == 0
                    ? "Restauración completada exitosamente. Se generó previamente el respaldo preventivo: " + preventiveFilename
                    : "Restauración finalizada con advertencias (código " + code + "). Respaldo preventivo disponible: " + preventiveFilename);
        } catch (Exception e) {
            log.error("Error durante la restauración: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error durante la restauración: " + e.getMessage());
        }
        return result;
    }

    public int cleanupOldBackups() {
        File dir = new File(backupDir);
        if (!dir.exists() || !dir.isDirectory()) return 0;

        long cutoffMillis = System.currentTimeMillis() - ((long) retentionDays * 24L * 60L * 60L * 1000L);
        File[] files = dir.listFiles((d, name) -> name.endsWith(".backup") || name.endsWith(".sha256"));
        if (files == null) return 0;

        int deletedCount = 0;
        for (File f : files) {
            if (f.lastModified() < cutoffMillis) {
                log.info("Depurando archivo antiguo por política de retención ({} días): {}", retentionDays, f.getName());
                if (f.delete()) {
                    deletedCount++;
                } else {
                    log.warn("No se pudo eliminar el archivo antiguo: {}", f.getAbsolutePath());
                }
            }
        }
        return deletedCount;
    }

    private File generateSha256(File file) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            try (FileInputStream fis = new FileInputStream(file)) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = fis.read(buf)) != -1) md.update(buf, 0, n);
            }
            StringBuilder sb = new StringBuilder();
            for (byte b : md.digest()) sb.append(String.format("%02x", b));
            File shaFile = new File(file.getAbsolutePath() + ".sha256");
            Files.writeString(shaFile.toPath(), sb.toString());
            return shaFile;
        } catch (Exception e) {
            log.warn("No se pudo generar el archivo de checksum SHA-256 para {}: {}", file.getName(), e.getMessage());
            return null;
        }
    }

    private void copyToExternalIfConfigured(File backupFile, File checksumFile) {
        if (externalDir == null || externalDir.isBlank()) return;
        try {
            File extDir = new File(externalDir);
            if (!extDir.exists()) extDir.mkdirs();
            Files.copy(backupFile.toPath(), new File(extDir, backupFile.getName()).toPath(), StandardCopyOption.REPLACE_EXISTING);
            if (checksumFile != null && checksumFile.exists()) {
                Files.copy(checksumFile.toPath(), new File(extDir, checksumFile.getName()).toPath(), StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("Copia secundaria externa realizada con éxito en {}", externalDir);
        } catch (Exception e) {
            log.warn("No se pudo realizar la copia secundaria en {}: {}", externalDir, e.getMessage());
        }
    }

    private String resolvePostgresBinary(String configuredPath, String binaryName) {
        if (configuredPath != null && new File(configuredPath).exists()) {
            return configuredPath;
        }
        int[] versions = {18, 17, 16, 15, 14};
        for (int v : versions) {
            File candidate = new File("C:/Program Files/PostgreSQL/" + v + "/bin/" + binaryName);
            if (candidate.exists()) {
                return candidate.getAbsolutePath();
            }
        }
        return configuredPath != null ? configuredPath : binaryName;
    }

    private String sanitize(String filename) {
        // Prevent path traversal
        return new File(filename).getName();
    }
}