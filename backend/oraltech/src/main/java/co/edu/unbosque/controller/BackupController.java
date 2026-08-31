package co.edu.unbosque.controller;

import co.edu.unbosque.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/backups")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @GetMapping
    public ResponseEntity<?> list() throws Exception {
        return ResponseEntity.ok(backupService.listBackups());
    }

    @GetMapping("/warnings")
    public ResponseEntity<?> warnings() throws Exception {
        return ResponseEntity.ok(backupService.warningsAndErrors());
    }

    @GetMapping("/latest")
    public ResponseEntity<?> latest() throws Exception {
        return ResponseEntity.ok(backupService.latest());
    }

    @PostMapping("/run")
    public ResponseEntity<?> run() throws Exception {
        return ResponseEntity.ok(backupService.runBackup());
    }

    @PostMapping("/{filename}/restore")
    public ResponseEntity<?> restore(@PathVariable String filename, @RequestBody Map<String, String> body) throws Exception {
        return ResponseEntity.ok(backupService.restore(filename, body.get("confirmation")));
    }
}
