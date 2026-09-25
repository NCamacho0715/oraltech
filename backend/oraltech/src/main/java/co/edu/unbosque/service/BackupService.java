package co.edu.unbosque.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
 
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
 
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
        return res;
    }
 
    public Map<String, Object> runBackup() {
        Map<String, Object> result = new LinkedHashMap<>();
        File dir = new File(backupDir);
        if (!dir.exists()) dir.mkdirs();
 
        String timestamp = LocalDateTime.now().format(FMT);
        String outFile = backupDir + "/" + database + "_" + timestamp + ".backup";
 
        ProcessBuilder pb = new ProcessBuilder(
                pgDump, "-h", host, "-p", port, "-U", dbUser, "-F", "c", "-f", outFile, database
        );
        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);
 
        try {
            Process proc = pb.start();
            String output = new String(proc.getInputStream().readAllBytes());
            int code = proc.waitFor();
 
            result.put("success", code == 0);
            result.put("exitCode", code);
            result.put("filename", code == 0 ? database + "_" + timestamp + ".backup" : null);
            result.put("timestamp", timestamp);
            result.put("output", output.isBlank() ? null : output.trim());
            result.put("message", code == 0 ? "Respaldo generado exitosamente." : "Error al generar el respaldo.");
 
            if (code != 0 && new File(outFile).exists()) new File(outFile).delete();
        } catch (Exception e) {
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
            ProcessBuilder pb = new ProcessBuilder(pgRestore, "-l", f.getAbsolutePath());
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
 
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    pgRestore, "-h", host, "-p", port, "-U", dbUser,
                    "-d", database, "--clean", "--if-exists", f.getAbsolutePath()
            );
            pb.environment().put("PGPASSWORD", dbPassword);
            pb.redirectErrorStream(true);
 
            Process proc = pb.start();
            String output = new String(proc.getInputStream().readAllBytes());
            int code = proc.waitFor();
 
            // pg_restore returns non-zero even on warnings; treat as success if file was valid
            result.put("success", code == 0 || !output.toLowerCase().contains("error:"));
            result.put("exitCode", code);
            result.put("output", output.isBlank() ? null : output.trim());
            result.put("message", code == 0
                    ? "Restauración completada exitosamente."
                    : "Restauración finalizada con advertencias (código " + code + ").");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error durante la restauración: " + e.getMessage());
        }
        return result;
    }
 
    private String sanitize(String filename) {
        // Prevent path traversal
        return new File(filename).getName();
    }
}