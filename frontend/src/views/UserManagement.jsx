import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser,
} from "../services/userService";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  UserHeader,
  UserSearchBar,
  UserListSection,
  CreateUserModal,
  DeleteUserModal,
} from "../components/users/UserManagementComponents";

const UserManagement = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(() => getCurrentUser());

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "DENTIST",
  });
  const [createError, setCreateError] = useState("");

  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    let ignore = false;
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        if (!ignore) {
          setUsers(data);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Error al cargar usuarios"
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      ignore = true;
    };
  }, [currentUser, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Error al cargar usuarios"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      await createUser(createForm);
      setSuccess(`Usuario ${createForm.username} creado exitosamente.`);
      setTimeout(() => setSuccess(""), 4000);
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "DENTIST",
      });
      loadUsers();
    } catch (err) {
      setCreateError(
        err.response?.data?.message ||
          err.message ||
          "Error al crear el usuario"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setSuccess("Rol actualizado exitosamente.");
      setTimeout(() => setSuccess(""), 3000);
      loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al cambiar el rol del usuario"
      );
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      setSuccess(`Usuario ${userToDelete.username} eliminado correctamente.`);
      setTimeout(() => setSuccess(""), 3000);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al eliminar usuario"
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  return (
    <main
      style={{
        flex: 1,
        padding: "2.5rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <UserHeader
        onNewUserClick={() => {
          setCreateError("");
          setShowCreateModal(true);
        }}
      />

      {error && (
        <div
          style={{
            background: "rgba(230, 57, 70, 0.1)",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
            padding: "0.9rem 1.2rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            background: "rgba(42, 157, 143, 0.1)",
            border: "1px solid var(--success)",
            color: "var(--success)",
            padding: "0.9rem 1.2rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      <UserSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <UserListSection
        loading={loading}
        users={filteredUsers}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onDeleteClick={setUserToDelete}
      />

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        form={createForm}
        onChange={handleCreateChange}
        creating={creating}
        error={createError}
      />

      <DeleteUserModal
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        deleting={deleting}
      />
    </main>
  );
};

export default UserManagement;
