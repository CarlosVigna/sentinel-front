import { useEffect, useState } from "react";
import { listCategories } from "../services/categoryService";
import {
  createProtocol,
  deleteProtocol,
  listProtocols,
  updateProtocol,
} from "../services/protocolService";

const EMPTY_FIELD = {
  fieldKey: "",
  fieldLabel: "",
  required: true,
  fieldType: "TEXT",
};

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  textoResponsaveis: "",
  textoMotorista: "",
  textoInterno: "",
  fields: [{ ...EMPTY_FIELD }],
};

export default function NewProtocol() {
  const [categories, setCategories] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [categoriesData, protocolsData] = await Promise.all([
        listCategories(),
        listProtocols(),
      ]);

      setCategories(categoriesData);
      setProtocols(protocolsData);
    } catch (err) {
      setError(err.message || "Erro ao carregar protocolos.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      ...EMPTY_FORM,
      fields: [{ ...EMPTY_FIELD }],
    });
    setEditingId(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFieldChange(index, key, value) {
    setForm((prev) => {
      const updatedFields = [...prev.fields];
      updatedFields[index] = {
        ...updatedFields[index],
        [key]: key === "required" ? value === "true" : value,
      };

      return {
        ...prev,
        fields: updatedFields,
      };
    });
  }

  function addField() {
    setForm((prev) => ({
      ...prev,
      fields: [...prev.fields, { ...EMPTY_FIELD }],
    }));
  }

  function removeField(index) {
    setForm((prev) => {
      if (prev.fields.length === 1) {
        return {
          ...prev,
          fields: [{ ...EMPTY_FIELD }],
        };
      }

      return {
        ...prev,
        fields: prev.fields.filter((_, i) => i !== index),
      };
    });
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      categoryId: Number(form.categoryId),
      textoResponsaveis: form.textoResponsaveis.trim(),
      textoMotorista: form.textoMotorista.trim(),
      textoInterno: form.textoInterno.trim(),
      fields: form.fields
        .filter(
          (field) => field.fieldKey.trim() !== "" && field.fieldLabel.trim() !== ""
        )
        .map((field) => ({
          fieldKey: field.fieldKey.trim(),
          fieldLabel: field.fieldLabel.trim(),
          required: field.required,
          fieldType: field.fieldType,
        })),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();

      if (!payload.name || !payload.categoryId) {
        throw new Error("Preencha nome e categoria.");
      }

      if (!payload.textoResponsaveis || !payload.textoMotorista || !payload.textoInterno) {
        throw new Error("Preencha os três textos do protocolo.");
      }

      if (editingId) {
        await updateProtocol(editingId, payload);
        setSuccess("Protocolo atualizado com sucesso.");
      } else {
        await createProtocol(payload);
        setSuccess("Protocolo criado com sucesso.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao salvar protocolo.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(protocol) {
    setEditingId(protocol.id);
    setError("");
    setSuccess("");

    setForm({
      name: protocol.name || "",
      categoryId: protocol.categoryId ? String(protocol.categoryId) : "",
      textoResponsaveis: protocol.textoResponsaveis || "",
      textoMotorista: protocol.textoMotorista || "",
      textoInterno: protocol.textoInterno || "",
      fields:
        protocol.fields && protocol.fields.length > 0
          ? protocol.fields.map((field) => ({
              fieldKey: field.fieldKey || "",
              fieldLabel: field.fieldLabel || "",
              required: Boolean(field.required),
              fieldType: field.fieldType || "TEXT",
            }))
          : [{ ...EMPTY_FIELD }],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Deseja inativar este protocolo?");
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteProtocol(id);
      setSuccess("Protocolo inativado com sucesso.");

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao inativar protocolo.");
    }
  }

  if (loading) {
    return <div style={{ padding: "24px" }}>Carregando protocolos...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>{editingId ? "Editar Protocolo" : "Novo Protocolo"}</h1>
      <p>
        Aqui você cria os botões/templates usados depois na criação da ocorrência.
      </p>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            background: "#dcfce7",
            color: "#166534",
          }}
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "16px",
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div>
          <label>Nome do protocolo</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: Desvio de rota"
            style={inputStyle}
          />
        </div>

        <div>
          <label>Categoria</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Selecione a categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Texto para responsáveis</label>
          <textarea
            name="textoResponsaveis"
            value={form.textoResponsaveis}
            onChange={handleChange}
            rows={5}
            placeholder="Ex: Foi verificado que o veículo {placa}..."
            style={textareaStyle}
          />
        </div>

        <div>
          <label>Texto para motorista</label>
          <textarea
            name="textoMotorista"
            value={form.textoMotorista}
            onChange={handleChange}
            rows={5}
            placeholder="Ex: Boa noite senhor! Por favor, entre em contato conosco."
            style={textareaStyle}
          />
        </div>

        <div>
          <label>Texto interno</label>
          <textarea
            name="textoInterno"
            value={form.textoInterno}
            onChange={handleChange}
            rows={5}
            placeholder="Ex: Foi verificado que o veículo {placa}..."
            style={textareaStyle}
          />
        </div>

        <div>
          <h3 style={{ marginBottom: "12px" }}>Campos dinâmicos</h3>

          <div
            style={{
              marginBottom: "12px",
              padding: "12px",
              borderRadius: "8px",
              background: "#eff6ff",
              color: "#1e3a8a",
              fontSize: "14px",
            }}
          >
            A placa é padrão do sistema e estará em toda ocorrência. Aqui você cria
            só os campos adicionais do template.
          </div>

          {form.fields.map((field, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "12px",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "grid", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="fieldKey (ex: localDesviado)"
                  value={field.fieldKey}
                  onChange={(e) =>
                    handleFieldChange(index, "fieldKey", e.target.value)
                  }
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="fieldLabel (ex: Local desviado)"
                  value={field.fieldLabel}
                  onChange={(e) =>
                    handleFieldChange(index, "fieldLabel", e.target.value)
                  }
                  style={inputStyle}
                />

                <select
                  value={field.fieldType}
                  onChange={(e) =>
                    handleFieldChange(index, "fieldType", e.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="TEXT">TEXT</option>
                  <option value="TEXTAREA">TEXTAREA</option>
                  <option value="NUMBER">NUMBER</option>
                </select>

                <select
                  value={String(field.required)}
                  onChange={(e) =>
                    handleFieldChange(index, "required", e.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="true">Obrigatório</option>
                  <option value="false">Opcional</option>
                </select>

                <button
                  type="button"
                  onClick={() => removeField(index)}
                  style={dangerButtonStyle}
                >
                  Remover campo
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addField} style={secondaryButtonStyle}>
            Adicionar campo
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button type="submit" disabled={saving} style={primaryButtonStyle}>
            {saving
              ? "Salvando..."
              : editingId
              ? "Atualizar protocolo"
              : "Salvar protocolo"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} style={secondaryButtonStyle}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ marginBottom: "16px" }}>Protocolos cadastrados</h2>

        {protocols.length === 0 ? (
          <p>Nenhum protocolo cadastrado.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {protocols.map((protocol) => (
              <div
                key={protocol.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "16px",
                  background: "#f8fafc",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <strong>{protocol.name}</strong>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <strong>Categoria:</strong> {protocol.categoryName}
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <strong>Campos:</strong>{" "}
                  {protocol.fields?.length
                    ? protocol.fields.map((field) => field.fieldLabel).join(", ")
                    : "Nenhum"}
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(protocol)}
                    style={primaryButtonStyle}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(protocol.id)}
                    style={dangerButtonStyle}
                  >
                    Inativar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginTop: "6px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
};

const primaryButtonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  background: "#e2e8f0",
  color: "#0f172a",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const dangerButtonStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};