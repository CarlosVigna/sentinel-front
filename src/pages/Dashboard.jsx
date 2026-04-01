import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listOccurrences } from "../services/occurrenceService";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    canceled: 0,
  });

  const [recentOccurrences, setRecentOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
  try {
    setLoading(true);
    setError("");

    const statuses = ["OPEN", "RESOLVED", "CANCELED"];

    const results = await Promise.all(
      statuses.map(async (status) => {
        try {
          const data = await listOccurrences(0, 100, status);
          return data ?? { content: [], totalElements: 0 };
        } catch {
          return { content: [], totalElements: 0 };
        }
      })
    );

    const openResult = results[0] || { content: [], totalElements: 0 };
    const resolvedResult = results[1] || { content: [], totalElements: 0 };
    const canceledResult = results[2] || { content: [], totalElements: 0 };

    const openOccurrences = openResult.content || [];
    const resolvedOccurrences = resolvedResult.content || [];
    const canceledOccurrences = canceledResult.content || [];

    const allOccurrences = [
      ...openOccurrences,
      ...resolvedOccurrences,
      ...canceledOccurrences,
    ];

    setStats({
      total:
        (openResult.totalElements || 0) +
        (resolvedResult.totalElements || 0) +
        (canceledResult.totalElements || 0),
      open: openResult.totalElements || 0,
      resolved: resolvedResult.totalElements || 0,
      canceled: canceledResult.totalElements || 0,
    });

    const uniqueOccurrences = Array.from(
      new Map(allOccurrences.map((occ) => [occ.id, occ])).values()
    );

    const recent = uniqueOccurrences
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    setRecentOccurrences(recent);
  } catch (err) {
    setError(err.message || "Erro ao carregar dashboard.");
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
      case "RESOLVED":
        return "Resolvida";
      case "CANCELED":
        return "Cancelada";
      default:
        return status;
    }
  }

  function getStatusBadgeStyle(status) {
    switch (status) {
      case "OPEN":
        return {
          ...statusBadgeBaseStyle,
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fde68a",
        };
      case "IN_PROGRESS":
        return {
          ...statusBadgeBaseStyle,
          background: "#e0f2fe",
          color: "#0369a1",
          border: "1px solid #bae6fd",
        };
      case "RESOLVED":
        return {
          ...statusBadgeBaseStyle,
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        };
      case "CANCELED":
        return {
          ...statusBadgeBaseStyle,
          background: "#ffedd5",
          color: "#c2410c",
          border: "1px solid #fdba74",
        };
      default:
        return {
          ...statusBadgeBaseStyle,
          background: "#e2e8f0",
          color: "#0f172a",
          border: "1px solid #cbd5e1",
        };
    }
  }

  function goToStatus(status) {
    navigate(`/occurrences?status=${status}`);
  }

  function openOccurrence(occurrence) {
    navigate(`/occurrences?status=${occurrence.status}&highlight=${occurrence.id}`);
  }

  if (loading) {
    return <div style={{ padding: "8px" }}>Carregando dashboard...</div>;
  }

  return (
    <div>
      <div style={dashboardHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>Dashboard</h1>
          <p style={pageSubtitleStyle}>
            Visão geral das ocorrências e atalhos operacionais do Sentinel.
          </p>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={statsGridStyle}>
        <StatCard
          title="Total"
          value={stats.total}
          subtitle="Todas as ocorrências"
          color="#334155"
          onClick={() => navigate("/occurrences")}
        />

        <StatCard
          title="Abertas"
          value={stats.open}
          subtitle="Precisam de atenção"
          color="#facc15"
          onClick={() => goToStatus("OPEN")}
        />

        <StatCard
          title="Resolvidas"
          value={stats.resolved}
          subtitle="Finalizadas"
          color="#22c55e"
          onClick={() => goToStatus("RESOLVED")}
        />

        <StatCard
          title="Canceladas"
          value={stats.canceled}
          subtitle="Encerradas"
          color="#f97316"
          onClick={() => goToStatus("CANCELED")}
        />
      </div>

      <div style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Últimas Ocorrências</h2>
            <p style={sectionSubtitleStyle}>
              Clique em uma linha para abrir a listagem correspondente.
            </p>
          </div>
        </div>

        {recentOccurrences.length === 0 ? (
          <div style={emptyStyle}>Nenhuma ocorrência encontrada.</div>
        ) : (
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Categoria</th>
                  <th style={thStyle}>Placa</th>
                  <th style={thStyle}>Título</th>
                  <th style={thStyle}>Criado por</th>
                  <th style={thStyle}>Atualizado em</th>
                </tr>
              </thead>

              <tbody>
                {recentOccurrences.map((occ, index) => (
                  <tr
                    key={occ.id}
                    onClick={() => openOccurrence(occ)}
                    style={{
                      ...clickableRowStyle,
                      background: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                    }}
                    title="Abrir ocorrência"
                  >
                    <td style={tdStyle}>#{occ.id}</td>
                    <td style={tdStyle}>
                      <span style={getStatusBadgeStyle(occ.status)}>
                        {getStatusLabel(occ.status)}
                      </span>
                    </td>
                    <td style={tdStyle}>{occ.categoryName || "-"}</td>
                    <td style={tdStyle}>
                      <span style={platePillStyle}>{occ.plate || "-"}</span>
                    </td>
                    <td style={tdStyle}>{occ.title || "-"}</td>
                    <td style={tdStyle}>{occ.createdByName || "-"}</td>
                    <td style={tdStyle}>
                      {formatDateTime(occ.updatedAt || occ.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ ...statCardStyle, borderTop: `5px solid ${color}` }}>
      <div style={statCardTopStyle}>
        <span style={statTitleStyle}>{title}</span>
      </div>

      <div style={statValueStyle}>{value}</div>
      <div style={statSubtitleStyle}>{subtitle}</div>
    </button>
  );
}

const statusBadgeBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
  whiteSpace: "nowrap",
};

const dashboardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "24px",
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
  fontSize: "15px",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const statCardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "20px",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  transition: "all 0.2s ease",
};

const statCardTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statTitleStyle = {
  color: "#475569",
  fontWeight: "700",
  fontSize: "14px",
};

const statValueStyle = {
  marginTop: "14px",
  fontSize: "32px",
  fontWeight: "800",
  color: "#0f172a",
};

const statSubtitleStyle = {
  marginTop: "8px",
  color: "#64748b",
  fontSize: "13px",
};

const sectionCardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  overflow: "hidden",
};

const sectionHeaderStyle = {
  padding: "22px 22px 12px",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "22px",
  color: "#0f172a",
  fontWeight: "800",
};

const sectionSubtitleStyle = {
  margin: "8px 0 0",
  color: "#64748b",
  fontSize: "14px",
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
  padding: "14px 18px",
  background: "#e2e8f0",
  borderBottom: "1px solid #cbd5e1",
  color: "#334155",
  fontSize: "13px",
  fontWeight: "800",
};

const tdStyle = {
  padding: "16px 18px",
  borderBottom: "1px solid #f1f5f9",
  color: "#0f172a",
  fontSize: "14px",
};

const clickableRowStyle = {
  cursor: "pointer",
};

const platePillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  fontWeight: "700",
  letterSpacing: "0.04em",
};

const errorStyle = {
  marginBottom: "16px",
  padding: "12px",
  borderRadius: "12px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};

const emptyStyle = {
  padding: "24px",
  color: "#64748b",
};