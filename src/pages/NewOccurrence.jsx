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

  if (loading) {
    return <div style={{ padding: "24px" }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>Nova Ocorrência</h1>
      <p>Crie uma ocorrência usando categoria e protocolo.</p>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      <form onSubmit={handleSubmit} style={cardStyle}>
        <div>
          <label>Categoria</label>
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
          <label>Protocolo</label>
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
          <label>Placa</label>
          <input
            type="text"
            name="plate"
            value={form.plate}
            onChange={handleInputChange}
            placeholder="Ex: ABC1234"
            style={inputStyle}
          />
        </div>

        {selectedProtocol?.fields?.length > 0 && (
          <div>
            <h3>Campos do protocolo</h3>

            <div style={{ display: "grid", gap: "12px" }}>
              {selectedProtocol.fields.map((field) => (
                <div key={field.id ?? field.fieldKey}>
                  <label>
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
                      style={inputStyle}
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
          <label>Observação / descrição adicional</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            rows={4}
            style={inputStyle}
          />
        </div>

        <div style={previewBoxStyle}>
          <h3>Texto para responsáveis</h3>
          <pre style={preStyle}>{generatedTexts.textoResponsaveis}</pre>

          <h3>Texto para motorista</h3>
          <pre style={preStyle}>{generatedTexts.textoMotorista}</pre>

          <h3>Texto interno</h3>
          <pre style={preStyle}>{generatedTexts.textoInterno}</pre>
        </div>

        <button type="submit" disabled={saving} style={buttonStyle}>
          {saving ? "Salvando..." : "Criar ocorrência"}
        </button>
      </form>
    </div>
  );
}

const cardStyle = {
  display: "grid",
  gap: "16px",
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginTop: "6px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const buttonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const previewBoxStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  padding: "16px",
  borderRadius: "10px",
};

const preStyle = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  background: "white",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const errorStyle = {
  marginBottom: "16px",
  padding: "12px",
  borderRadius: "8px",
  background: "#fee2e2",
  color: "#991b1b",
};

const successStyle = {
  marginBottom: "16px",
  padding: "12px",
  borderRadius: "8px",
  background: "#dcfce7",
  color: "#166534",
};