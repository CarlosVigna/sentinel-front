import { useEffect, useMemo, useState } from "react";
import { listCategories } from "../services/categoryService";
import { listProtocols } from "../services/protocolService";
import { createOccurrence } from "../services/occurrenceService";

export default function NewOccurrence() {
  const [categories, setCategories] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingProtocols, setLoadingProtocols] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    categoryId: "",
    protocolId: "",
    plate: "",
    description: "",
    dynamicFields: {},
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");
      const data = await listCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCategoryChange(event) {
    const categoryId = event.target.value;

    setForm((prev) => ({
      ...prev,
      categoryId,
      protocolId: "",
      dynamicFields: {},
    }));

    setSelectedProtocol(null);
    setProtocols([]);

    if (!categoryId) return;

    try {
      setLoadingProtocols(true);
      setError("");
      const data = await listProtocols(categoryId);
      setProtocols(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar protocolos.");
    } finally {
      setLoadingProtocols(false);
    }
  }

  function handleProtocolChange(event) {
    const protocolId = event.target.value;
    const protocol = protocols.find((item) => String(item.id) === String(protocolId));

    setSelectedProtocol(protocol || null);

    const initialDynamicFields = {};
    if (protocol?.fields) {
      protocol.fields.forEach((field) => {
        initialDynamicFields[field.fieldKey] = "";
      });
    }

    setForm((prev) => ({
      ...prev,
      protocolId,
      dynamicFields: initialDynamicFields,
    }));
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleDynamicFieldChange(fieldKey, value) {
    setForm((prev) => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [fieldKey]: value,
      },
    }));
  }

  function applyTemplate(template, values) {
    if (!template) return "";

    return template.replace(/\{([^}]+)\}/g, (_, key) => {
      const normalizedKey = key.trim();
      return values[normalizedKey] ?? "";
    });
  }

  const generatedTexts = useMemo(() => {
    if (!selectedProtocol) {
      return {
        textoResponsaveis: "",
        textoMotorista: "",
        textoInterno: "",
      };
    }

    const values = {
      placa: form.plate || "",
      ...form.dynamicFields,
    };

    return {
      textoResponsaveis: applyTemplate(selectedProtocol.textoResponsaveis, values),
      textoMotorista: applyTemplate(selectedProtocol.textoMotorista, values),
      textoInterno: applyTemplate(selectedProtocol.textoInterno, values),
    };
  }, [selectedProtocol, form.plate, form.dynamicFields]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.categoryId || !form.protocolId || !form.plate.trim()) {
        throw new Error("Preencha categoria, protocolo e placa.");
      }

      if (
        selectedProtocol?.fields?.some(
          (field) =>
            field.required &&
            !String(form.dynamicFields[field.fieldKey] || "").trim()
        )
      ) {
        throw new Error("Preencha todos os campos obrigatórios do protocolo.");
      }

      const payload = {
        categoryId: Number(form.categoryId),
        protocolId: Number(form.protocolId),
        plate: form.plate.trim(),
        description: form.description.trim(),
        textoResponsaveis: generatedTexts.textoResponsaveis,
        textoMotorista: generatedTexts.textoMotorista,
        textoInterno: generatedTexts.textoInterno,
      };

      await createOccurrence(payload);

      setSuccess("Ocorrência criada com sucesso.");
      setForm({
        categoryId: "",
        protocolId: "",
        plate: "",
        description: "",
        dynamicFields: {},
      });
      setProtocols([]);
      setSelectedProtocol(null);
    } catch (err) {
      setError(err.message || "Erro ao criar ocorrência.");
    } finally {
      setSaving(false);
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch {}
  }

  if (loading) {
    return <div style={{ padding: "24px" }}>Carregando...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>Nova Ocorrência</h1>
          <p style={pageSubtitleStyle}>
            Crie uma ocorrência a partir de uma categoria e de um protocolo configurado.
          </p>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      <div style={pageGridStyle}>
        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Dados da ocorrência</h2>
            <p style={cardSubtitleStyle}>
              Escolha o protocolo e preencha as informações necessárias.
            </p>
          </div>

          <div style={formGridStyle}>
            <div>
              <label style={labelStyle}>Categoria</label>
              <select
                value={form.categoryId}
                onChange={handleCategoryChange}
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
              <label style={labelStyle}>Protocolo</label>
              <select
                value={form.protocolId}
                onChange={handleProtocolChange}
                style={inputStyle}
                disabled={!form.categoryId || loadingProtocols}
              >
                <option value="">
                  {loadingProtocols ? "Carregando protocolos..." : "Selecione o protocolo"}
                </option>
                {protocols.map((protocol) => (
                  <option key={protocol.id} value={protocol.id}>
                    {protocol.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Placa</label>
              <input
                type="text"
                name="plate"
                value={form.plate}
                onChange={handleInputChange}
                placeholder="Ex: ABC1234"
                style={inputStyle}
              />
            </div>
          </div>

          {selectedProtocol?.fields?.length > 0 && (
            <div>
              <div style={sectionTitleRowStyle}>
                <h3 style={sectionTitleStyle}>Campos do protocolo</h3>
                <span style={sectionHintStyle}>Preencha os campos dinâmicos abaixo.</span>
              </div>

              <div style={dynamicFieldsGridStyle}>
                {selectedProtocol.fields.map((field) => (
                  <div key={field.id ?? field.fieldKey} style={fieldCardStyle}>
                    <label style={labelStyle}>
                      {field.fieldLabel}
                      {field.required ? " *" : ""}
                    </label>

                    {field.fieldType === "TEXTAREA" ? (
                      <textarea
                        value={form.dynamicFields[field.fieldKey] || ""}
                        onChange={(e) =>
                          handleDynamicFieldChange(field.fieldKey, e.target.value)
                        }
                        rows={4}
                        style={textareaStyle}
                      />
                    ) : (
                      <input
                        type={field.fieldType === "NUMBER" ? "number" : "text"}
                        value={form.dynamicFields[field.fieldKey] || ""}
                        onChange={(e) =>
                          handleDynamicFieldChange(field.fieldKey, e.target.value)
                        }
                        style={inputStyle}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Observação / descrição adicional</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={4}
              style={textareaStyle}
            />
          </div>

          <button type="submit" disabled={saving} style={primaryButtonStyle}>
            {saving ? "Salvando..." : "Criar ocorrência"}
          </button>
        </form>

        <div style={previewCardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Prévia dos textos</h2>
            <p style={cardSubtitleStyle}>
              Os textos serão gerados com base no protocolo e nos dados informados.
            </p>
          </div>

          <PreviewBox
            title="Texto para responsáveis"
            text={generatedTexts.textoResponsaveis}
            onCopy={() => copyText(generatedTexts.textoResponsaveis)}
          />

          <PreviewBox
            title="Texto para motorista"
            text={generatedTexts.textoMotorista}
            onCopy={() => copyText(generatedTexts.textoMotorista)}
          />

          <PreviewBox
            title="Texto interno"
            text={generatedTexts.textoInterno}
            onCopy={() => copyText(generatedTexts.textoInterno)}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewBox({ title, text, onCopy }) {
  return (
    <div style={previewSectionStyle}>
      <div style={previewHeaderStyle}>
        <h3 style={previewTitleStyle}>{title}</h3>
        <button type="button" onClick={onCopy} style={copyButtonStyle}>
          Copiar
        </button>
      </div>
      <pre style={preStyle}>{text}</pre>
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
  gridTemplateColumns: "1.05fr 0.95fr",
  gap: "20px",
  alignItems: "start",
};

const cardStyle = {
  display: "grid",
  gap: "18px",
  background: "white",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const previewCardStyle = {
  display: "grid",
  gap: "18px",
  background: "white",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  position: "sticky",
  top: "24px",
};

const cardHeaderStyle = {
  marginBottom: "2px",
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

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

const sectionTitleRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: "20px",
  fontWeight: "800",
};

const sectionHintStyle = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: "600",
};

const dynamicFieldsGridStyle = {
  display: "grid",
  gap: "14px",
};

const fieldCardStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "16px",
};

const previewSectionStyle = {
  display: "grid",
  gap: "10px",
};

const previewHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const previewTitleStyle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: "800",
  color: "#0f172a",
};

const preStyle = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  background: "#f8fafc",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  color: "#0f172a",
  lineHeight: 1.6,
  margin: 0,
  fontFamily: "inherit",
  minHeight: "92px",
};

const primaryButtonStyle = {
  background: "#2563eb",
  color: "white",
  padding: "12px 14px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "800",
};

const copyButtonStyle = {
  background: "#0f172a",
  color: "white",
  padding: "8px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "12px",
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