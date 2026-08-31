package co.edu.unbosque.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class BackupService {

    private static final Path BACKUP_DIR = Paths.get("C:\\Oraltech\\Backups\\PostgreSQL");
    private static final Path BACKUP_SCRIPT = Paths.get("C:\\Oraltech\\backupsPG.bat");
    private static final Path PG_RESTORE = Paths.get("C:\\Program Files\\PostgreSQL\\18\\bin\\pg_restore.exe");

    @Value("${spring.datasource.password}")
    private String dbPassword;

    public List<Map<String, Object>> listBackups() throws IOException {
        if (!Files.exists(BACKUP_DIR)) return List.of();

        try (Stream<Path> stream = Files.list(BACKUP_DIR)) {
            return stream.filter(p -> p.getFileName().toString().toLowerCase().endsWith(".backup"))
                    .map(this::backupInfo)
                    .sorted(Comparator.comparing((Map<String, Object> m) -> (String) m.get("timestamp")).reversed())
                    .collect(Collectors.toList());
        }
    }

    public Map<String, Object> latest() throws IOException {
        List<Map<String, Object>> backups = listBackups();
        return backups.isEmpty() ? Map.of("exists", false) : backups.get(0);
    }

    public Map<String, Object> runBackup() throws Exception {
        Files.createDirectories(BACKUP_DIR);

        Process p = new ProcessBuilder("cmd", "/c", BACKUP_SCRIPT.toString())
                .redirectErrorStream(true)
                .start();

        String output;
        try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8))) {
            output = r.lines().collect(Collectors.joining(System.lineSeparator()));
        }
        int exit = p.waitFor();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", exit == 0);
        result.put("message", exit == 0 ? "Backup realizado correctamente." : "El backup falló.");
        result.put("output", output);
        result.put("latest", latest());
        return result;
    }

    public Map<String, Object> restore(String filename, String confirmation) throws Exception {
        if (!"RESTAURAR".equals(confirmation)) {
            throw new IllegalArgumentException("La palabra de confirmación debe coincidir exactamente con RESTAURAR.");
        }

        Path file = safeBackupPath(filename);

        if (!Files.exists(file)) throw new IllegalArgumentException("El respaldo seleccionado no existe.");
        if (!Files.isRegularFile(file) || !Files.isReadable(file)) {
            throw new IllegalArgumentException("El respaldo no está disponible para lectura.");
        }

        Path checksum = Paths.get(file.toString() + ".sha256");
        if (!Files.exists(checksum) || !Files.isReadable(checksum)) {
            throw new IllegalArgumentException("No existe el checksum asociado; la restauración fue bloqueada.");
        }

        String expected = Files.readString(checksum, StandardCharsets.UTF_8).trim().split("\\s+")[0].toLowerCase();
        String actual = sha256(file);

        if (!expected.equals(actual)) {
            throw new IllegalArgumentException("La validación de integridad falló: el checksum del archivo no coincide.");
        }

        // Validación adicional: pg_restore debe poder leer el archivo.
        Process check = new ProcessBuilder(PG_RESTORE.toString(), "-l", file.toString())
                .redirectErrorStream(true)
                .start();
        String checkOutput;
        try (BufferedReader r = new BufferedReader(new InputStreamReader(check.getInputStream(), StandardCharsets.UTF_8))) {
            checkOutput = r.lines().collect(Collectors.joining(System.lineSeparator()));
        }
        if (check.waitFor() != 0) {
            throw new IllegalArgumentException("El archivo no pudo ser leído por pg_restore. Restauración bloqueada.");
        }

        ProcessBuilder pb = new ProcessBuilder(
                PG_RESTORE.toString(),
                "-h", "localhost",
                "-p", "5432",
                "-U", "postgres",
                "-d", "oraltech",
                "--clean",
                "--if-exists",
                "--no-owner",
                "--exit-on-error",
                "--single-transaction",
                file.toString()
        );
        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);

        Process restore = pb.start();
        String output;
        try (BufferedReader r = new BufferedReader(new InputStreamReader(restore.getInputStream(), StandardCharsets.UTF_8))) {
            output = r.lines().collect(Collectors.joining(System.lineSeparator()));
        }
        int exit = restore.waitFor();

        if (exit != 0) {
            throw new IllegalStateException("La restauración falló. PostgreSQL indicó: " + output);
        }

        return Map.of(
                "success", true,
                "message", "Restauración completada correctamente.",
                "filename", filename,
                "timestamp", backupInfo(file).get("timestamp"),
                "output", output
        );
    }

    public List<String> warningsAndErrors() throws IOException {
        Path log = BACKUP_DIR.resolve("backup.log");
        if (!Files.exists(log)) return List.of();
        try (Stream<String> lines = Files.lines(log, StandardCharsets.UTF_8)) {
            return lines.filter(l -> l.contains("ERROR") || l.contains("ADVERTENCIA"))
                    .collect(Collectors.toList());
        }
    }

    private Path safeBackupPath(String filename) {
        Path candidate = BACKUP_DIR.resolve(filename).normalize();
        if (!candidate.getParent().equals(BACKUP_DIR) || !candidate.getFileName().toString().equals(filename)
                || !filename.toLowerCase().endsWith(".backup")) {
            throw new IllegalArgumentException("Nombre de respaldo no válido.");
        }
        return candidate;
    }

    private Map<String, Object> backupInfo(Path p) {
        try {
            String name = p.getFileName().toString();
            Instant modified = Files.getLastModifiedTime(p).toInstant();
            Path checksum = Paths.get(p.toString() + ".sha256");
            Path externalOk = Paths.get(p.toString() + ".external.ok");
            Path externalError = Paths.get(p.toString() + ".external.error");

            String status = Files.size(p) > 0 && Files.exists(checksum) ? "EXITOSO" : "ADVERTENCIA";
            String external = Files.exists(externalOk) ? "REALIZADA" :
                    Files.exists(externalError) ? "ERROR" : "NO CONFIGURADA";

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("filename", name);
            m.put("timestamp", modified.atZone(ZoneId.systemDefault()).toLocalDateTime().toString());
            m.put("size", Files.size(p));
            m.put("status", status);
            m.put("externalCopy", external);
            m.put("checksum", Files.exists(checksum) ? Files.readString(checksum, StandardCharsets.UTF_8).trim() : null);
            return m;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String sha256(Path file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (var in = Files.newInputStream(file)) {
            byte[] buffer = new byte[8192];
            int n;
            while ((n = in.read(buffer)) > 0) digest.update(buffer, 0, n);
        }
        StringBuilder sb = new StringBuilder();
        for (byte b : digest.digest()) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
