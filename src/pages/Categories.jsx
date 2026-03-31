import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../services/categoryService";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar categorias.");
    }
  }

  async function handleCreate(event) {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");
      await createCategory({ name });
      setName("");
      setSuccess("Categoria criada com sucesso.");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Erro ao criar categoria.");
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  async function handleUpdate(id) {
    try {
      setError("");
      setSuccess("");
      await updateCategory(id, { name: editingName });
      setEditingId(null);
      setEditingName("");
      setSuccess("Categoria atualizada com sucesso.");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Erro ao atualizar categoria.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Deseja inativar esta categoria?");
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      await deleteCategory(id);
      setSuccess("Categoria inativada com sucesso.");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Erro ao inativar categoria.");
    }
  }

  return (
    <div style={pageStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>Categorias</h1>
          <p style={pageSubtitleStyle}>
            Gerencie as categorias que estruturam os protocolos e as ocorrências.
          </p>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      <div style={pageGridStyle}>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Nova categoria</h2>
            <p style={cardSubtitleStyle}>Cadastre categorias utilizadas no sistema.</p>
          </div>

          <form onSubmit={handleCreate} style={formStyle}>
            <div>
              <label style={labelStyle}>Nome da categoria</label>
              <input
                type="text"
                placeholder="Ex: Alertas de risco"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button type="submit" style={primaryButtonStyle}>
              Salvar categoria
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Categorias cadastradas</h2>
            <p style={cardSubtitleStyle}>Edite ou inative categorias existentes.</p>
          </div>

          {categories.length === 0 ? (
            <div style={emptyStateStyle}>Nenhuma categoria encontrada.</div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nome</th>
                    <th style={thStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td style={tdStyle}>
                        {editingId === category.id ? (
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            style={inputStyle}
                          />
                        ) : (
                          <span>{category.name}</span>
                        )}
                      </td>

                      <td style={tdStyle}>
                        {editingId === category.id ? (
                          <div style={actionsStyle}>
                            <button
                              type="button"
                              onClick={() => handleUpdate(category.id)}
                              style={primaryButtonInlineStyle}
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              style={secondaryButtonStyle}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={actionsStyle}>
                            <button
                              type="button"
                              onClick={() => startEdit(category)}
                              style={secondaryButtonStyle}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category.id)}
                              style={dangerButtonStyle}
                            >
                              Inativar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  gridTemplateColumns: "340px 1fr",
  gap: "20px",
};

const cardStyle = {
  background: "white",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  padding: "22px",
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

const actionsStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const primaryButtonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 14px",
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

const dangerButtonStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
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
  padding: "18px 0 4px",
  color: "#64748b",
};