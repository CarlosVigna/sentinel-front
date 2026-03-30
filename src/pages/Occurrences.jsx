import { useEffect, useState } from "react";
import {
  listOccurrences,
  resolveOccurrence,
  cancelOccurrence,
} from "../services/occurrenceService";

export default function Occurrences() {
  const [occurrences, setOccurrences] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadOccurrences(page);
  }, [page]);

  async function loadOccurrences(currentPage = 0) {
    try {
      setLoading(true);
      setError("");

      const data = await listOccurrences(currentPage, 10);

      setOccurrences(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.message || "Erro ao carregar ocorrências.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id) {
    try {
      setError("");
      setSuccess("");
      await resolveOccurrence(id);
      setSuccess("Ocorrência resolvida com sucesso.");
      await loadOccurrences(page);
    } catch (err) {
      setError(err.message || "Erro ao resolver ocorrência.");
    }
  }

  async function handleCancel(id) {
    try {
      setError("");
      setSuccess("");
      await cancelOccurrence(id);
      setSuccess("Ocorrência cancelada com sucesso.");
      await loadOccurrences(page);
    } catch (err) {
      setError(err.message || "Erro ao cancelar ocorrência.");
    }
  }

  function getStatusStyle(status) {
    switch (status) {
      case "OPEN":
        return {
          background: "#fee2e2",
          color: "#991b1b",
        };
      case "IN_PROGRESS":
        return {
          background: "#fef3c7",
          color: "#92400e",
        };
      case "RESOLVED":
        return {
          background: "#dcfce7",
          color: "#166534",
        };
      case "CANCELED":
        return {
          background: "#e5e7eb",
          color: "#374151",
        };
      default:
        return {
          background: "#e2e8f0",
          color: "#0f172a",
        };
    }
  }

  if (loading) {
    return <div style={{ padding: "24px" }}>Carregando ocorrências...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>Ocorrências</h1>
      <p>Lista das ocorrências já criadas no sistema.</p>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      {occurrences.length === 0 ? (
        <div style={emptyStyle}>Nenhuma ocorrência encontrada.</div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {occurrences.map((occurrence) => (
            <div key={occurrence.id} style={cardStyle}>
              <div style={headerStyle}>
                <div>
                  <h3 style={{ margin: 0 }}>{occurrence.title}</h3>
                  <small>Código #{occurrence.id}</small>
                </div>

                <span
                  style={{
                    ...badgeStyle,
                    ...getStatusStyle(occurrence.status),
                  }}
                >
                  {occurrence.status}
                </span>
              </div>

              <div style={gridStyle}>
                <div>
                  <strong>Categoria:</strong> {occurrence.categoryName || "-"}
                </div>
                <div>
                  <strong>Protocolo:</strong> {occurrence.protocolName || "-"}
                </div>
                <div>
                  <strong>Placa:</strong> {occurrence.plate || "-"}
                </div>
                <div>
                  <strong>Criado por:</strong> {occurrence.createdByName || "-"}
                </div>
              </div>

              {occurrence.description && (
                <div style={{ marginTop: "12px" }}>
                  <strong>Descrição:</strong>
                  <div style={textBoxStyle}>{occurrence.description}</div>
                </div>
              )}

              <div style={{ marginTop: "12px" }}>
                <strong>Texto responsáveis:</strong>
                <div style={textBoxStyle}>{occurrence.textoResponsaveis || "-"}</div>
              </div>

              <div style={{ marginTop: "12px" }}>
                <strong>Texto motorista:</strong>
                <div style={textBoxStyle}>{occurrence.textoMotorista || "-"}</div>
              </div>

              <div style={{ marginTop: "12px" }}>
                <strong>Texto interno:</strong>
                <div style={textBoxStyle}>{occurrence.textoInterno || "-"}</div>
              </div>

              <div style={actionsStyle}>
                {occurrence.status !== "RESOLVED" && occurrence.status !== "CANCELED" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleResolve(occurrence.id)}
                      style={primaryButtonStyle}
                    >
                      Resolver
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCancel(occurrence.id)}
                      style={dangerButtonStyle}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={paginationStyle}>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
          style={secondaryButtonStyle}
        >
          Anterior
        </button>

        <span>
          Página {page + 1} {totalPages > 0 ? `de ${totalPages}` : ""}
        </span>

        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={totalPages === 0 || page + 1 >= totalPages}
          style={secondaryButtonStyle}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  border: "1px solid #e5e7eb",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
  gap: "12px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "10px",
};

const badgeStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
};

const textBoxStyle = {
  marginTop: "6px",
  padding: "10px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  whiteSpace: "pre-wrap",
};

const actionsStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "16px",
  flexWrap: "wrap",
};

const primaryButtonStyle = {
  background: "#2563eb",
  color: "white",
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

const secondaryButtonStyle = {
  background: "#e2e8f0",
  color: "#0f172a",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
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

const emptyStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
};

const paginationStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "12px",
  marginTop: "20px",
};