import { useEffect, useState } from "react";
import { createUser, listUsers, updateUser } from "../services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "OPERATOR",
  });

  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    role: "OPERATOR",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const data = await listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createUser(form);

      setSuccess("Usuário criado com sucesso.");
      setForm({
        nome: "",
        email: "",
        senha: "",
        role: "OPERATOR",
      });

      await loadUsers();
    } catch (err) {
      setError(err.message || "Erro ao criar usuário.");
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(user) {
    setSelectedUser(user);
    setEditForm({
      nome: user.nome || "",
      email: user.email || "",
      role: user.role || "OPERATOR",
    });
  }

  function closeEditModal() {
    setSelectedUser(null);
    setEditForm({
      nome: "",
      email: "",
      role: "OPERATOR",
    });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      setSavingEdit(true);
      setError("");
      setSuccess("");

      await updateUser(selectedUser.id, editForm);

      setSuccess("Usuário atualizado com sucesso.");
      closeEditModal();
      await loadUsers();
    } catch (err) {
      setError(err.message || "Erro ao atualizar usuário.");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>Usuários</h1>
          <p style={pageSubtitleStyle}>
            Gerencie os acessos internos do Sentinel.
          </p>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      <div style={pageGridStyle}>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Novo usuário</h2>
            <p style={cardSubtitleStyle}>Cadastre operadores e administradores.</p>
          </div>

          <form onSubmit={handleSubmit} style={formStyle}>
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                style={inputStyle}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={inputStyle}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Senha</label>
              <input
                type="password"
                style={inputStyle}
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Perfil</label>
              <select
                style={inputStyle}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="OPERATOR">Operador</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button type="submit" style={primaryButtonStyle} disabled={saving}>
              {saving ? "Salvando..." : "Criar usuário"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Usuários cadastrados</h2>
            <p style={cardSubtitleStyle}>Atualize dados e permissões de acesso.</p>
          </div>

          {loading ? (
            <div style={emptyStateStyle}>Carregando usuários...</div>
          ) : users.length === 0 ? (
            <div style={emptyStateStyle}>Nenhum usuário encontrado.</div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nome</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Perfil</th>
                    <th style={thStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={tdStyle}>{user.nome}</td>
                      <td style={tdStyle}>{user.email}</td>
                      <td style={tdStyle}>
                        <span style={rolePillStyle(user.role)}>{user.role}</span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          style={secondaryButtonStyle}
                          onClick={() => openEditModal(user)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={modalTitleStyle}>Editar usuário</h3>
                <p style={modalSubtitleStyle}>Atualize dados e perfil do usuário.</p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                style={modalCloseButtonStyle}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={formStyle}>
              <div>
                <label style={labelStyle}>Nome</label>
                <input
                  style={inputStyle}
                  value={editForm.nome}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nome: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Perfil</label>
                <select
                  style={inputStyle}
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                >
                  <option value="OPERATOR">Operador</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={primaryButtonInlineStyle}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function rolePillStyle(role) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    background: role === "ADMIN" ? "#eff6ff" : "#f8fafc",
    color: role === "ADMIN" ? "#1d4ed8" : "#334155",
    border: role === "ADMIN" ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
  };
}

const pageStyle = {
  display: "grid",
  gap: "20px",
};

const pageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const pageTitleStyle = {
  margin: 0,
  fontSize: "30px",
  color: "#0f172a",
  fontWeight: "800",
};

const pageSubtitleStyle = {
  margin: "8px 0 0",
  color: "#64748b",
};

const pageGridStyle = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: "20px",
};

const cardStyle = {
  background: "white",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const cardHeaderStyle = {
  marginBottom: "18px",
};

const cardTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: "800",
};

const cardSubtitleStyle = {
  margin: "8px 0 0",
  color: "#64748b",
};

const formStyle = {
  display: "grid",
  gap: "16px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "700",
  color: "#0f172a",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  width: "100%",
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "800",
};

const primaryButtonInlineStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const secondaryButtonStyle = {
  background: "#e2e8f0",
  color: "#0f172a",
  border: "none",
  padding: "10px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const tableWrapperStyle = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  padding: "14px 12px",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "800",
};

const tdStyle = {
  padding: "14px 12px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "middle",
};

const errorStyle = {
  padding: "12px",
  borderRadius: "12px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};

const successStyle = {
  padding: "12px",
  borderRadius: "12px",
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #86efac",
};

const emptyStateStyle = {
  color: "#64748b",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 9999,
};

const modalContentStyle = {
  width: "100%",
  maxWidth: "560px",
  background: "white",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "18px",
};

const modalTitleStyle = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "800",
  color: "#0f172a",
};

const modalSubtitleStyle = {
  margin: "8px 0 0",
  color: "#64748b",
};

const modalCloseButtonStyle = {
  background: "transparent",
  border: "none",
  fontSize: "28px",
  cursor: "pointer",
  lineHeight: 1,
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "8px",
};