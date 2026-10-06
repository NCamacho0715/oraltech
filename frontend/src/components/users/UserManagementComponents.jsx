import React from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Search,
  X,
  RefreshCw,
} from "lucide-react";

export const UserHeader = ({ onNewUserClick }) => (
  <header
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
      flexWrap: "wrap",
      gap: "1rem",
    }}
  >
    <div>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--text-main)",
        }}
      >
        Configuración de Usuarios
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
        Administración centralizada de cuentas y roles de personal del consultorio.
      </p>
    </div>

    <button
      onClick={onNewUserClick}
      className="btn-primary"
      style={{
        width: "auto",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1.4rem",
      }}
    >
      <UserPlus size={18} />
      Crear Usuario
    </button>
  </header>
);

export const UserSearchBar = ({ searchTerm, onSearchChange }) => (
  <div
    className="auth-card"
    style={{
      padding: "1rem 1.5rem",
      marginBottom: "2rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      maxWidth: "100%",
    }}
  >
    <Search size={20} color="var(--text-secondary)" />
    <input
      type="text"
      placeholder="Buscar usuario por nombre, usuario o correo..."
      aria-label="Buscar usuarios"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      style={{
        flex: 1,
        border: "none",
        outline: "none",
        fontSize: "1rem",
        background: "transparent",
        color: "var(--text-main)",
      }}
    />
  </div>
);

export const UserCard = ({ user, currentUser, onRoleChange, onDeleteClick }) => {
  const isSelf =
    user.username?.toLowerCase() === currentUser?.username?.toLowerCase();
  const isAdminRole = user.role === "ADMIN";

  return (
    <div
      className="auth-card"
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "1rem",
        borderLeft: `5px solid ${isAdminRole ? "#7c3aed" : "var(--primary)"}`,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "0.8rem",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--text-main)",
                margin: 0,
              }}
            >
              {user.name}
            </h3>
            <span
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
              }}
            >
              @{user.username}
            </span>
          </div>

          <span
            style={{
              padding: "0.3rem 0.8rem",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: isAdminRole
                ? "rgba(124, 58, 237, 0.15)"
                : "rgba(0, 119, 182, 0.15)",
              color: isAdminRole ? "#7c3aed" : "var(--primary)",
            }}
          >
            {isAdminRole ? (
              <ShieldCheck size={14} />
            ) : (
              <Stethoscope size={14} />
            )}
            {isAdminRole ? "Administrador" : "Odontólogo"}
          </span>
        </div>

        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            margin: 0,
            wordBreak: "break-all",
          }}
        >
          {user.email}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--border-color)",
          paddingTop: "0.9rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label
            htmlFor={`role-select-${user.id}`}
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}
          >
            Rol:
          </label>
          <select
            id={`role-select-${user.id}`}
            value={user.role}
            disabled={isSelf}
            onChange={(e) => onRoleChange(user.id, e.target.value)}
            style={{
              padding: "0.35rem 0.6rem",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              background: "var(--surface)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
            }}
          >
            <option value="DENTIST">Odontólogo</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        {!isSelf && (
          <button
            type="button"
            aria-label={`Eliminar usuario ${user.username}`}
            onClick={() => onDeleteClick(user)}
            style={{
              color: "var(--accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
            }}
            title="Eliminar usuario"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export const UserGrid = ({ users, currentUser, onRoleChange, onDeleteClick }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {users.map((u) => (
        <UserCard
          key={u.id}
          user={u}
          currentUser={currentUser}
          onRoleChange={onRoleChange}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
};

export const UserListSection = ({
  loading,
  users,
  currentUser,
  onRoleChange,
  onDeleteClick,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        Cargando usuarios...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div
        className="auth-card"
        style={{ textAlign: "center", padding: "4rem" }}
      >
        <Users
          size={48}
          color="var(--secondary)"
          style={{ marginBottom: "1rem" }}
        />
        <p style={{ color: "var(--text-secondary)" }}>
          No se encontraron usuarios.
        </p>
      </div>
    );
  }

  return (
    <UserGrid
      users={users}
      currentUser={currentUser}
      onRoleChange={onRoleChange}
      onDeleteClick={onDeleteClick}
    />
  );
};

export const CreateUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  onChange,
  creating,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
    >
      <div
        className="auth-card"
        style={{
          maxWidth: "500px",
          width: "100%",
          padding: "2rem",
          borderRadius: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--text-main)",
              margin: 0,
            }}
          >
            Crear Nuevo Usuario
          </h2>
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(230, 57, 70, 0.1)",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              padding: "0.75rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="create-name">Nombre Completo</label>
            <input
              id="create-name"
              type="text"
              name="name"
              required
              placeholder="Ej. Dr. Carlos Méndez"
              value={form.name}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="create-email">Correo Electrónico</label>
            <input
              id="create-email"
              type="email"
              name="email"
              required
              placeholder="carlos@oraltech.com"
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="create-username">Nombre de Usuario</label>
            <input
              id="create-username"
              type="text"
              name="username"
              required
              placeholder="cmendez"
              value={form.username}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="create-password">Contraseña</label>
            <input
              id="create-password"
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="create-role">Rol Asignado</label>
            <select
              id="create-role"
              name="role"
              value={form.role}
              onChange={onChange}
            >
              <option value="DENTIST">Odontólogo</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              marginTop: "1.5rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.7rem 1.2rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "transparent",
                color: "var(--text-main)",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary"
              style={{ width: "auto", padding: "0.7rem 1.5rem" }}
            >
              {creating ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                "Guardar Usuario"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const DeleteUserModal = ({ user, onClose, onConfirm, deleting }) => {
  if (!user) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
    >
      <div
        className="auth-card"
        style={{
          maxWidth: "450px",
          width: "100%",
          padding: "2rem",
          borderRadius: "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(230, 57, 70, 0.12)",
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.2rem",
          }}
        >
          <Trash2 size={28} />
        </div>

        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--text-main)",
            marginBottom: "0.5rem",
          }}
        >
          ¿Eliminar usuario?
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            marginBottom: "1.5rem",
          }}
        >
          Esta acción eliminará la cuenta de{" "}
          <strong>{user.name}</strong> (@{user.username}).
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "transparent",
              color: "var(--text-main)",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: "8px",
              border: "none",
              background: "var(--accent)",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {deleting ? "Eliminando..." : "Confirmar Eliminación"}
          </button>
        </div>
      </div>
    </div>
  );
};
