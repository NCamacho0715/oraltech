import React, { useState, useEffect, useCallback } from "react";
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
  ArrowLeft,
  Database,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";

const Badge = ({ ok, text }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 10px",
      borderRadius: "20px",
      fontSize: "0.78rem",
      fontWeight: 700,
      background: ok ? "#d1fae5" : "#fee2e2",
      color: ok ? "#065f46" : "#991b1b",
    }}
  >
    {ok ? <CheckCircle size={13} /> : <XCircle size={13} />} {text}
  </span>
);

const Card = ({ children, style }) => (
  <div
    style={{
      background: "var(--surface)",
      borderRadius: "16px",
      padding: "1.5rem",
      boxShadow: "var(--shadow)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Btn = ({
  onClick,
  disabled,
  color = "var(--primary)",
  children,
  small,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: small ? "0.4rem 0.9rem" : "0.6rem 1.2rem",
      background: disabled ? "#e5e7eb" : color,
      color: disabled ? "#9ca3af" : "#fff",
      borderRadius: "10px",
      fontWeight: 700,
      fontSize: small ? "0.82rem" : "0.9rem",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "opacity 0.2s",
    }}
  >
    {children}
  </button>
);

const Alert = ({ type, msg }) => {
  const cfg = {
    info: ["#dbeafe", "#1d4ed8", <Clock size={16} />],
    success: ["#d1fae5", "#065f46", <CheckCircle size={16} />],
    error: ["#fee2e2", "#991b1b", <XCircle size={16} />],
    warn: ["#fef3c7", "#92400e", <AlertTriangle size={16} />],
  }[type] || ["#f3f4f6", "#374151", null];
  return (
    <div
      style={{
        background: cfg[0],
        color: cfg[1],
        borderRadius: "10px",
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        fontSize: "0.88rem",
        marginTop: "0.75rem",
      }}
    >
      {cfg[2]}
      <span>{msg}</span>
    </div>
  );
};

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

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    load();
  }, [isAuthenticated, navigate, load]);

  const handleRunBackup = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const r = await runBackup();
      setRunResult(r);
      if (r.success) load();
    } catch {
      setRunResult({
        success: false,
        message: "Error de conexión con el servidor.",
      });
    }
    setRunning(false);
  };

  const handleSelectRestore = async (filename) => {
    setSelected(filename);
    setValidation(null);
    setConfirmWord("");
    setRestoreResult(null);
    setValidating(true);
    try {
      setValidation(await validateBackup(filename));
    } catch {
      setValidation({
        valid: false,
        reason: "No se pudo contactar al servidor.",
      });
    }
    setValidating(false);
  };

  const handleRestore = async () => {
    if (confirmWord !== "RESTAURAR") return;
    setRestoring(true);
    setRestoreResult(null);
    try {
      setRestoreResult(await restoreBackup(selected));
    } catch {
      setRestoreResult({ success: false, message: "Error de conexión." });
    }
    setRestoring(false);
  };

  const cancelRestore = () => {
    setSelected(null);
    setValidation(null);
    setConfirmWord("");
    setRestoreResult(null);
  };

  if (loading)
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

  const lat = latest?.latest;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        padding: "0",
      }}
    >
      {/* Topbar */}
      <nav
        style={{
          background: "var(--surface)",
          padding: "0.9rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "var(--shadow)",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "var(--secondary-soft)",
              color: "var(--primary)",
              padding: "0.5rem",
              borderRadius: "10px",
              display: "flex",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <Database size={22} color="var(--primary)" />
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "var(--text-main)",
            }}
          >
            Gestión de Respaldos
          </span>
        </div>
        <button
          onClick={load}
          style={{
            background: "var(--secondary-soft)",
            color: "var(--primary)",
            padding: "0.5rem",
            borderRadius: "10px",
            display: "flex",
          }}
        >
          <RefreshCw size={18} />
        </button>
      </nav>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 1.5rem 2rem",
        }}
      >
        {/* Último respaldo */}
        <Card style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ fontWeight: 700, color: "var(--text-main)" }}>
              Último Respaldo
            </h3>
            <Btn onClick={handleRunBackup} disabled={running} color="#0077b6">
              <Play size={16} /> {running ? "Generando..." : "Generar Ahora"}
            </Btn>
          </div>

          {!latest?.hasBackup ? (
            <Alert
              type="warn"
              msg="No se encontraron respaldos en el directorio configurado."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {[
                ["Archivo", lat.filename],
                ["Fecha y Hora", lat.lastModified],
                ["Tamaño", `${lat.sizeKb} KB`],
                ["Total respaldos", latest.totalBackups],
              ].map(([k, v]) => (
                <div key={k}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontWeight: 500,
                      color: "var(--text-main)",
                      wordBreak: "break-all",
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "4px",
                  }}
                >
                  Estado
                </div>
                <Badge
                  ok={lat.readable}
                  text={lat.readable ? "Disponible" : "No accesible"}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "4px",
                  }}
                >
                  Copia externa
                </div>
                <Badge
                  ok={lat.exists}
                  text={lat.exists ? "Registrado" : "No encontrado"}
                />
              </div>
            </div>
          )}

          {runResult && (
            <Alert
              type={runResult.success ? "success" : "error"}
              msg={
                runResult.message +
                (runResult.output ? ` — ${runResult.output}` : "")
              }
            />
          )}
        </Card>

        {/* Lista de respaldos */}
        <Card style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "1rem",
            }}
          >
            Respaldos Disponibles ({backups.length})
          </h3>
          {backups.length === 0 ? (
            <Alert type="warn" msg="No hay archivos de respaldo disponibles." />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                    {["Archivo", "Fecha", "Tamaño", "Estado", "Acción"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.5rem 0.75rem",
                            textAlign: "left",
                            color: "var(--text-secondary)",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {backups.map((b) => (
                    <tr
                      key={b.filename}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        background:
                          selected === b.filename
                            ? "var(--secondary-soft)"
                            : "transparent",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.6rem 0.75rem",
                          color: "var(--text-main)",
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                        }}
                      >
                        {b.filename}
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 0.75rem",
                          color: "var(--text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {b.lastModified?.slice(0, 24)}
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {b.sizeKb} KB
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        <Badge
                          ok={b.readable}
                          text={b.readable ? "OK" : "Error"}
                        />
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        <Btn
                          small
                          onClick={() => handleSelectRestore(b.filename)}
                          color="#7c3aed"
                          disabled={restoring}
                        >
                          <RotateCcw size={13} /> Restaurar
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Restore modal inline */}
        {selected && (
          <Card style={{ border: "2px solid #f59e0b" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "1rem",
              }}
            >
              <AlertTriangle size={22} color="#d97706" />
              <h3 style={{ fontWeight: 700, color: "var(--text-main)" }}>
                Confirmar Restauración
              </h3>
            </div>

            <Alert
              type="warn"
              msg={`⚠️ Esta acción sobrescribirá la base de datos actual. Todos los cambios posteriores al respaldo seleccionado se perderán permanentemente.`}
            />

            {validating && (
              <Alert type="info" msg="Validando integridad del archivo..." />
            )}

            {validation && !validation.valid && (
              <Alert
                type="error"
                msg={`❌ Validación fallida: ${validation.reason}`}
              />
            )}

            {validation?.valid && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    margin: "1rem 0",
                    padding: "1rem",
                    background: "var(--background)",
                    borderRadius: "10px",
                  }}
                >
                  {[
                    ["Archivo seleccionado", validation.filename],
                    [
                      "Timestamp del respaldo",
                      validation.lastModified?.slice(0, 24),
                    ],
                    ["Tamaño", `${validation.sizeKb} KB`],
                    ["Checksum MD5", validation.checksum?.slice(0, 16) + "..."],
                    ["Integridad", "✔ Verificada (pg_restore -l)"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                        }}
                      >
                        {k}
                      </div>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "var(--text-main)",
                          fontSize: "0.85rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      color: "var(--text-main)",
                      marginBottom: "6px",
                      fontSize: "0.9rem",
                    }}
                  >
                    Escriba <strong>RESTAURAR</strong> para confirmar:
                  </label>
                  <input
                    value={confirmWord}
                    onChange={(e) => setConfirmWord(e.target.value)}
                    placeholder="RESTAURAR"
                    style={{
                      padding: "0.6rem 0.9rem",
                      border: `2px solid ${confirmWord === "RESTAURAR" ? "#10b981" : "var(--border-color)"}`,
                      borderRadius: "10px",
                      background: "var(--background)",
                      color: "var(--text-main)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      width: "220px",
                      outline: "none",
                    }}
                  />
                </div>

                {restoreResult && (
                  <Alert
                    type={restoreResult.success ? "success" : "error"}
                    msg={
                      restoreResult.message +
                      (restoreResult.output
                        ? ` — ${restoreResult.output?.slice(0, 200)}`
                        : "")
                    }
                  />
                )}
              </>
            )}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <Btn onClick={cancelRestore} color="#6b7280" disabled={restoring}>
                Cancelar
              </Btn>
              {validation?.valid && (
                <Btn
                  onClick={handleRestore}
                  disabled={confirmWord !== "RESTAURAR" || restoring}
                  color="#dc2626"
                >
                  <RotateCcw size={16} />{" "}
                  {restoring ? "Restaurando..." : "Ejecutar Restauración"}
                </Btn>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
