import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findOccurrenceById } from "../services/occurrenceService";

export default function OccurrenceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [occurrence, setOccurrence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOccurrence();
  }, [id]);

  async function loadOccurrence() {
    try {
      setLoading(true);
      setError("");

      const data = await findOccurrenceById(id);
      setOccurrence(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar ocorrência.");
    } finally {
      setLoading(false);
    }
  }

  function formatDateTime(value) {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleString("pt-BR");
    } catch {
      return value;
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "OPEN":
        return "Aberta";
      case "IN_PROGRESS":
        return "Em andamento";
      case "RESOLVED":
        return "Resolvida";
      case "CANCELED":
        return "Cancelada";
      default:
        return status;
    }
  }

  if (loading) {
    return <div style={{ padding: "30px" }}>Carregando ocorrência...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "30px" }}>
        <div style={errorStyle}>{error}</div>

        <button type="button" onClick={() => navigate("/occurrences")} style={buttonStyle}>
          Voltar
        </button>
      </div>
    );
  }

  if (!occurrence) {
    return (
      <div style={{ padding: "30px" }}>
        <div style={errorStyle}>Ocorrência não encontrada.</div>

        <button type="button" onClick={() => navigate("/occurrences")} style={buttonStyle}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>{occurrence.title}</h1>
          <p style={{ marginTop: "8px", color: "#64748b" }}>
            Código #{occurrence.id} • {getStatusLabel(occurrence.status)}
          </p>
        </div>

        <button type="button" onClick={() => navigate("/occurrences")} style={buttonStyle}>
          Voltar
        </button>
      </div>

      <div style={cardStyle}>
        <div style={gridStyle}>
          <div>
            <strong>Categoria:</strong>
            <div>{occurrence.categoryName || "-"}</div>
          </div>

          <div>
            <strong>Protocolo:</strong>
            <div>{occurrence.protocolName || "-"}</div>
          </div>

          <div>
            <strong>Placa:</strong>
            <div>{occurrence.plate || "-"}</div>
          </div>

          <div>
            <strong>Status:</strong>
            <div>{getStatusLabel(occurrence.status)}</div>
          </div>
        </div>

        {occurrence.description && (
          <div style={{ marginTop: "20px" }}>
            <strong>Descrição:</strong>
            <div style={textBoxStyle}>{occurrence.description}</div>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <strong>Texto responsáveis:</strong>
          <div style={textBoxStyle}>{occurrence.textoResponsaveis || "-"}</div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <strong>Texto motorista:</strong>
          <div style={textBoxStyle}>{occurrence.textoMotorista || "-"}</div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <strong>Texto interno:</strong>
          <div style={textBoxStyle}>{occurrence.textoInterno || "-"}</div>
        </div>

        <div style={auditSectionStyle}>
          <div>
            <strong>Criado por:</strong> {occurrence.createdByName || "-"}{" "}
            <span style={dateStyle}>({formatDateTime(occurrence.createdAt)})</span>
          </div>

          <div>
            <strong>Resolvido por:</strong> {occurrence.resolvedByName || "-"}{" "}
            <span style={dateStyle}>({formatDateTime(occurrence.resolvedAt)})</span>
          </div>

          <div>
            <strong>Cancelado por:</strong> {occurrence.canceledByName || "-"}{" "}
            <span style={dateStyle}>({formatDateTime(occurrence.canceledAt)})</span>
          </div>

          <div>
            <strong>Reaberto por:</strong> {occurrence.reopenedByName || "-"}{" "}
            <span style={dateStyle}>({formatDateTime(occurrence.reopenedAt)})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "24px",
};

const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const textBoxStyle = {
  marginTop: "8px",
  padding: "12px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  whiteSpace: "pre-wrap",
};

const auditSectionStyle = {
  marginTop: "24px",
  paddingTop: "16px",
  borderTop: "1px solid #e2e8f0",
  display: "grid",
  gap: "10px",
};

const dateStyle = {
  color: "#64748b",
};

const buttonStyle = {
  background: "#e2e8f0",
  color: "#0f172a",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const errorStyle = {
  padding: "12px",
  borderRadius: "10px",
  background: "#fee2e2",
  color: "#991b1b",
  marginBottom: "16px",
};