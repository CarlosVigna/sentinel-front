import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listOccurrences } from "../services/occurrenceService";
import StatusBadge from "../components/StatusBadge";

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

  function goToStatus(status) {
    navigate(`/occurrences?status=${status}`);
  }

  function openOccurrence(occurrence) {
    navigate(`/occurrences?status=${occurrence.status}&highlight=${occurrence.id}`);
  }

  if (loading) {
    return (
      <div className="sentinel-loading">
        <div className="sentinel-spinner" />
        <span>Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
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
          gradient="linear-gradient(135deg, #334155, #1e293b)"
          onClick={() => navigate("/occurrences")}
        />

        <StatCard
          title="Abertas"
          value={stats.open}
          subtitle="Precisam de atenção"
          color="#facc15"
          gradient="linear-gradient(135deg, #facc15, #eab308)"
          onClick={() => goToStatus("OPEN")}
        />

        <StatCard
          title="Resolvidas"
          value={stats.resolved}
          subtitle="Finalizadas"
          color="#22c55e"
          gradient="linear-gradient(135deg, #22c55e, #16a34a)"
          onClick={() => goToStatus("RESOLVED")}
        />

        <StatCard
          title="Canceladas"
          value={stats.canceled}
          subtitle="Encerradas"
          color="#f97316"
          gradient="linear-gradient(135deg, #f97316, #ea580c)"
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
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#eef2ff")}
                    onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      index % 2 === 0 ? "#ffffff" : "#f8fafc")
                    }
                    style={{
                      ...clickableRowStyle,
                      background: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                    }}
                    title="Abrir ocorrência"
                  >
                    <td style={tdStyle}>
                      <span style={codeStyle}>#{occ.id}</span>
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={occ.status} />
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

function StatCard({ title, value, subtitle, color, gradient, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...statCardStyle,
        ...(hover ? statCardHover : {}),
      }}
    >
      <div style={statCardTopStyle}>
        <span style={statTitleStyle}>{title}</span>
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: gradient,
            boxShadow: `0 2px 8px ${color}40`,
          }}
        />
      </div>

      <div style={statValueStyle}>{value}</div>
      <div style={statSubtitleStyle}>{subtitle}</div>

      {/* Accent bar bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "20px",
          right: "20px",
          height: "3px",
          borderRadius: "3px 3px 0 0",
          background: gradient,
          opacity: hover ? 1 : 0.4,
          transition: "opacity 0.25s ease",
        }}
      />
    </button>
  );
}

// ===== ESTILOS =====

const pageStyle = {
  display: "grid",
  gap: "20px",
  animation: "slideUp 0.4s ease both",
};

const dashboardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const pageTitleStyle = {
  margin: 0,
  fontSize: "34px",
  color: "#0f172a",
  fontWeight: "900",
  letterSpacing: "-0.03em",
};

const pageSubtitleStyle = {
  margin: "8px 0 0",
  color: "#64748b",
  fontSize: "15px",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px",
};

const statCardStyle = {
  position: "relative",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "22px 20px 26px",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
  overflow: "hidden",
};

const statCardHover = {
  transform: "translateY(-4px)",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.1)",
  borderColor: "#cbd5e1",
};

const statCardTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statTitleStyle = {
  color: "#475569",
  fontWeight: "700",
  fontSize: "13px",
  letterSpacing: "0.01em",
};

const statValueStyle = {
  marginTop: "12px",
  fontSize: "34px",
  fontWeight: "900",
  color: "#0f172a",
  letterSpacing: "-0.02em",
};

const statSubtitleStyle = {
  marginTop: "6px",
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "500",
};

const sectionCardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  overflow: "hidden",
};

const sectionHeaderStyle = {
  padding: "22px 24px 14px",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "20px",
  color: "#0f172a",
  fontWeight: "800",
  letterSpacing: "-0.01em",
};

const sectionSubtitleStyle = {
  margin: "6px 0 0",
  color: "#94a3b8",
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
  padding: "12px 18px",
  background: "#f1f5f9",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "14px 18px",
  borderBottom: "1px solid #f1f5f9",
  color: "#0f172a",
  fontSize: "14px",
};

const clickableRowStyle = {
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const codeStyle = {
  fontWeight: "800",
  color: "#3b82f6",
  fontSize: "13px",
};

const platePillStyle = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "999px",
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  fontWeight: "800",
  letterSpacing: "0.06em",
  fontSize: "13px",
};

const errorStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};

const emptyStyle = {
  padding: "32px 24px",
  color: "#94a3b8",
  fontSize: "14px",
};