package co.edu.unbosque.controller;

import co.edu.unbosque.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> latest() {
        return ResponseEntity.ok(backupService.getLatestInfo());
    }

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(backupService.listBackups());
    }

    @PostMapping("/run")
    public ResponseEntity<Map<String, Object>> run() {
        return ResponseEntity.ok(backupService.runBackup());
    }

    @GetMapping("/validate/{filename}")
    public ResponseEntity<Map<String, Object>> validate(@PathVariable String filename) {
        return ResponseEntity.ok(backupService.validateBackup(filename));
    }

    @PostMapping("/restore/{filename}")
    public ResponseEntity<Map<String, Object>> restore(@PathVariable String filename) {
        return ResponseEntity.ok(backupService.restore(filename));
    }
}