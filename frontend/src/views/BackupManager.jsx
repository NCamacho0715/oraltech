import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import {
  getLatest,
  listBackups,
  runBackup,
  validateBackup,
  restoreBackup,
} from "../services/backupService";
import {
  BackupNav,
  LatestBackupCard,
  BackupsListCard,
  RestoreConfirmCard,
} from "../components/backup/BackupComponents";

export default function BackupManager() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isAuthenticated = Boolean(user);

  const [latest, setLatest] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  // Restore flow
  const [selected, setSelected] = useState(null);
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [confirmWord, setConfirmWord] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);

  const reloadBackups = async () => {
    setLoading(true);
    try {
      const [l, b] = await Promise.all([getLatest(), listBackups()]);
      setLatest(l);
      setBackups(Array.isArray(b) ? b : []);
    } catch (e) {
      console.error("Error cargando respaldos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    let ignore = false;
    const fetchInitial = async () => {
      try {
        const [l, b] = await Promise.all([getLatest(), listBackups()]);
        if (!ignore) {
          setLatest(l);
          setBackups(Array.isArray(b) ? b : []);
        }
      } catch (e) {
        if (!ignore) console.error("Error cargando respaldos:", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchInitial();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, navigate]);

  const handleRunBackup = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const r = await runBackup();
      setRunResult(r);
      if (r.success) reloadBackups();
    } catch {
      setRunResult({
        success: false,
        message: "Error de red al ejecutar respaldo",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSelectRestore = async (filename) => {
    setSelected(filename);
    setValidation(null);
    setConfirmWord("");
    setRestoreResult(null);
    setValidating(true);

    try {
      const v = await validateBackup(filename);
      setValidation(v);
    } catch {
      setValidation({
        valid: false,
        reason: "Error de red al validar respaldo",
      });
    } finally {
      setValidating(false);
    }
  };

  const handleRestore = async () => {
    if (confirmWord !== "RESTAURAR" || !selected) return;
    setRestoring(true);
    setRestoreResult(null);

    try {
      const r = await restoreBackup(selected);
      setRestoreResult(r);
      if (r.success) {
        setConfirmWord("");
        reloadBackups();
      }
    } catch {
      setRestoreResult({
        success: false,
        message: "Error de red al ejecutar restauración",
      });
    } finally {
      setRestoring(false);
    }
  };

  const cancelRestore = () => {
    setSelected(null);
    setValidation(null);
    setConfirmWord("");
    setRestoreResult(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "var(--primary)",
          fontWeight: 600,
        }}
      >
        Cargando...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        padding: "0",
      }}
    >
      <BackupNav onRefresh={reloadBackups} />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 1.5rem 2rem",
        }}
      >
        <LatestBackupCard
          latest={latest}
          running={running}
          handleRunBackup={handleRunBackup}
          runResult={runResult}
        />

        <BackupsListCard
          backups={backups}
          selected={selected}
          handleSelectRestore={handleSelectRestore}
          restoring={restoring}
        />

        {selected && (
          <RestoreConfirmCard
            validating={validating}
            validation={validation}
            confirmWord={confirmWord}
            setConfirmWord={setConfirmWord}
            restoreResult={restoreResult}
            cancelRestore={cancelRestore}
            handleRestore={handleRestore}
            restoring={restoring}
          />
        )}
      </div>
    </div>
  );
}
