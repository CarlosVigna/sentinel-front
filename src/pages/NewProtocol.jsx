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
    <div style={pageStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>
            {editingId ? "Editar Protocolo" : "Novo Protocolo"}
          </h1>
          <p style={pageSubtitleStyle}>
            Configure templates reutilizáveis para a criação de ocorrências.
          </p>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={cardTitleStyle}>Configuração do protocolo</h2>
          <p style={cardSubtitleStyle}>
            Defina textos padrão e campos dinâmicos do template.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formGridStyle}>
            <div>
              <label style={labelStyle}>Nome do protocolo</label>
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
              <label style={labelStyle}>Categoria</label>
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
          </div>

          <div>
            <label style={labelStyle}>Texto para responsáveis</label>
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
            <label style={labelStyle}>Texto para motorista</label>
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
            <label style={labelStyle}>Texto interno</label>
            <textarea
              name="textoInterno"
              value={form.textoInterno}
              onChange={handleChange}
              rows={5}
              placeholder="Ex: Foi verificado que o veículo {placa}..."
              style={textareaStyle}
            />
          </div>

          <div style={infoBannerStyle}>
            A placa já é padrão do sistema em toda ocorrência. Aqui você configura
            apenas os campos adicionais do protocolo.
          </div>

          <div>
            <div style={sectionTitleRowStyle}>
              <h3 style={sectionTitleStyle}>Campos dinâmicos</h3>
              <button type="button" onClick={addField} style={secondaryButtonStyle}>
                Adicionar campo
              </button>
            </div>

            <div style={fieldsGridStyle}>
              {form.fields.map((field, index) => (
                <div key={index} style={fieldCardStyle}>
                  <div style={fieldCardHeaderStyle}>
                    <strong style={{ color: "#0f172a" }}>Campo {index + 1}</strong>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      style={dangerButtonInlineStyle}
                    >
                      Remover
                    </button>
                  </div>

                  <div style={formStyle}>
                    <div>
                      <label style={labelStyle}>Field key</label>
                      <input
                        type="text"
                        placeholder="Ex: localDesviado"
                        value={field.fieldKey}
                        onChange={(e) =>
                          handleFieldChange(index, "fieldKey", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Field label</label>
                      <input
                        type="text"
                        placeholder="Ex: Local desviado"
                        value={field.fieldLabel}
                        onChange={(e) =>
                          handleFieldChange(index, "fieldLabel", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Tipo</label>
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
                    </div>

                    <div>
                      <label style={labelStyle}>Obrigatoriedade</label>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={formFooterStyle}>
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
      </div>

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={cardTitleStyle}>Protocolos cadastrados</h2>
          <p style={cardSubtitleStyle}>
            Edite ou inative protocolos já criados.
          </p>
        </div>

        {protocols.length === 0 ? (
          <div style={emptyStateStyle}>Nenhum protocolo cadastrado.</div>
        ) : (
          <div style={protocolListStyle}>
            {protocols.map((protocol) => (
              <div key={protocol.id} style={protocolCardStyle}>
                <div style={protocolCardTopStyle}>
                  <div>
                    <h3 style={protocolNameStyle}>{protocol.name}</h3>
                    <p style={protocolMetaStyle}>
                      Categoria: <strong>{protocol.categoryName}</strong>
                    </p>
                  </div>

                  <div style={actionsStyle}>
                    <button
                      type="button"
                      onClick={() => handleEdit(protocol)}
                      style={secondaryButtonStyle}
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

                <div style={protocolFieldListStyle}>
                  <span style={protocolFieldLabelStyle}>Campos:</span>{" "}
                  {protocol.fields?.length
                    ? protocol.fields.map((field) => field.fieldLabel).join(", ")
                    : "Nenhum"}
                </div>
              </div>
            ))}
          </div>
        )}
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

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  whiteSpace: "pre-wrap",
};

const infoBannerStyle = {
  padding: "14px 16px",
  borderRadius: "14px",
  background: "#eff6ff",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
  fontSize: "14px",
  fontWeight: "600",
};

const sectionTitleRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "14px",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "20px",
  color: "#0f172a",
  fontWeight: "800",
};

const fieldsGridStyle = {
  display: "grid",
  gap: "14px",
};

const fieldCardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
  background: "#f8fafc",
};

const fieldCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "14px",
};

const formFooterStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const protocolListStyle = {
  display: "grid",
  gap: "14px",
};

const protocolCardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
  background: "#f8fafc",
};

const protocolCardTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
};

const protocolNameStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: "18px",
  fontWeight: "800",
};

const protocolMetaStyle = {
  margin: "8px 0 0",
  color: "#64748b",
};

const protocolFieldListStyle = {
  marginTop: "12px",
  color: "#334155",
  lineHeight: 1.6,
};

const protocolFieldLabelStyle = {
  fontWeight: "800",
  color: "#0f172a",
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

const secondaryButtonStyle = {
  background: "#e2e8f0",
  color: "#0f172a",
  border: "none",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const dangerButtonStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const dangerButtonInlineStyle = {
  background: "#fee2e2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  padding: "8px 12px",
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
  color: "#64748b",
};