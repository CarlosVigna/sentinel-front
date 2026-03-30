import { useEffect, useState } from "react";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../services/categoryService";

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
    <div style={{ padding: "24px" }}>
      <h1>Categorias</h1>

      {error && <div style={{ color: "red", marginBottom: "12px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: "12px" }}>{success}</div>}

      <form onSubmit={handleCreate} style={{ marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Nome da categoria"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <button type="submit">Salvar</button>
      </form>

      <div style={{ display: "grid", gap: "12px" }}>
        {categories.map(category => (
          <div
            key={category.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px"
            }}
          >
            {editingId === category.id ? (
              <>
                <input
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  style={{ padding: "8px", marginRight: "8px" }}
                />
                <button onClick={() => handleUpdate(category.id)}>Salvar</button>
                <button onClick={() => setEditingId(null)} style={{ marginLeft: "8px" }}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <strong>{category.name}</strong>
                <div style={{ marginTop: "8px" }}>
                  <button onClick={() => startEdit(category)}>Editar</button>
                  <button onClick={() => handleDelete(category.id)} style={{ marginLeft: "8px" }}>
                    Inativar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}