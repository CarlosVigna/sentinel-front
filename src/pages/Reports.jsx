import { useContext, useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";
import { AuthContext } from "../context/AuthContext";

export default function Reports() {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);

  const [status, setStatus] = useState("");
  const [plate, setPlate] = useState("");

  const [dateFilter, setDateFilter] = useState({
    start: "",
    end: "",
  });

  const [columnFilter, setColumnFilter] = useState({
    plate: "",
    category: "",
    status: "",
    description: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "updatedAt",
    direction: "desc",
  });

  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    let query = [];

    if (status) query.push(`status=${status}`);
    if (plate) query.push(`plate=${plate}`);

    const url =
      "/occurrences/report" + (query.length ? `?${query.join("&")}` : "");

    const res = await apiFetch(url);
    setData(res.content || res);
  }

  function formatStatus(status) {
    switch (status) {
      case "OPEN": return "Aberta";
      case "IN_PROGRESS": return "Em andamento";
      case "RESOLVED": return "Resolvida";
      case "CANCELED": return "Cancelada";
      default: return status;
    }
  }

  function getStatusStyle(status) {
    switch (status) {
      case "OPEN": return { bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
      case "IN_PROGRESS": return { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" };
      case "RESOLVED": return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
      case "CANCELED": return { bg: "#ffedd5", color: "#c2410c", border: "#fdba74" };
      default: return { bg: "#e2e8f0", color: "#0f172a", border: "#cbd5e1" };
    }
  }

  const filtered = data.filter((o) => {
    const date = new Date(o.updatedAt);

    return (
      (!dateFilter.start || date >= new Date(dateFilter.start)) &&
      (!dateFilter.end || date <= new Date(dateFilter.end)) &&
      (o.plate || "").toLowerCase().includes(columnFilter.plate.toLowerCase()) &&
      (o.category || "").toLowerCase().includes(columnFilter.category.toLowerCase()) &&
      (o.status || "").toLowerCase().includes(columnFilter.status.toLowerCase()) &&
      (o.description || "").toLowerCase().includes(columnFilter.description.toLowerCase())
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (!aVal) return 1;
    if (!bVal) return -1;

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  function handleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function getSortIndicator(key) {
    if (sortConfig.key !== key) return " ↕";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  }

  function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR");
  }

  async function exportPDF() {
    const pdf = new jsPDF("landscape");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;

    // ── Carrega logo ──
    const logoImg = new Image();
    logoImg.src = logo;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });

    // ── Cabeçalho ──
    function drawHeader(pdf) {
      pdf.addImage(logoImg, "PNG", margin, 8, 28, 14);

      pdf.setFontSize(18);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont(undefined, "bold");
      pdf.text("SENTINEL", margin + 32, 15);

      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.setFont(undefined, "normal");
      pdf.text("Relatório de Ocorrências", margin + 32, 21);

      // Info direita
      pdf.setFontSize(9);
      pdf.setTextColor(80);
      const now = new Date();
      const dateStr = now.toLocaleString("pt-BR");
      const userName = user?.nome || "Operador";

      pdf.text(`Emitido em: ${dateStr}`, pageWidth - margin, 12, { align: "right" });
      pdf.text(`Responsável: ${userName}`, pageWidth - margin, 18, { align: "right" });
      pdf.text(`Total: ${sorted.length} ocorrências`, pageWidth - margin, 24, { align: "right" });

      // Linha
      pdf.setDrawColor(200);
      pdf.line(margin, 28, pageWidth - margin, 28);
    }

    drawHeader(pdf);

    // ── Tabela ──
    const colWidths = [35, 55, 30, 100, 48]; // Placa, Categoria, Status, Obs, Data
    const colLabels = ["Placa", "Categoria", "Status", "Observações", "Atualizado"];
    let y = 34;

    // Cabeçalho tabela
    pdf.setFontSize(9);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(255);
    pdf.setFillColor(30, 41, 59);
    pdf.rect(margin, y - 4, pageWidth - margin * 2, 8, "F");

    let x = margin + 2;
    colLabels.forEach((label, i) => {
      pdf.text(label, x, y);
      x += colWidths[i];
    });

    pdf.setFont(undefined, "normal");
    y += 8;

    // Linhas de dados
    sorted.forEach((o, idx) => {
      if (y > pageHeight - 20) {
        // Rodapé antes da nova página
        drawFooter(pdf, pageWidth, pageHeight, margin);
        pdf.addPage();
        drawHeader(pdf);
        y = 34;

        // Re-draw header da tabela
        pdf.setFontSize(9);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(255);
        pdf.setFillColor(30, 41, 59);
        pdf.rect(margin, y - 4, pageWidth - margin * 2, 8, "F");

        let xx = margin + 2;
        colLabels.forEach((label, i) => {
          pdf.text(label, xx, y);
          xx += colWidths[i];
        });

        pdf.setFont(undefined, "normal");
        y += 8;
      }

      // Zebra striping
      if (idx % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y - 4, pageWidth - margin * 2, 7, "F");
      }

      const statusText = formatStatus(o.status);
      const desc = (o.description || "-").slice(0, 70);
      const dateText = formatDate(o.updatedAt);

      pdf.setFontSize(8.5);
      pdf.setTextColor(30);

      x = margin + 2;
      pdf.text(o.plate || "-", x, y);
      x += colWidths[0];
      pdf.text(o.category || "-", x, y);
      x += colWidths[1];
      pdf.text(statusText, x, y);
      x += colWidths[2];
      pdf.text(desc, x, y);
      x += colWidths[3];
      pdf.text(dateText, x, y);

      y += 7;
    });

    // ── Rodapé em todas as páginas ──
    function drawFooter(pdf, pw, ph, m) {
      pdf.setDrawColor(200);
      pdf.line(m, ph - 12, pw - m, ph - 12);
      pdf.setFontSize(8);
      pdf.setTextColor(140);
      pdf.text(
        `Sentinel • Relatório automático • ${new Date().getFullYear()}`,
        m,
        ph - 7
      );
      pdf.text(
        `Página ${pdf.getCurrentPageInfo().pageNumber}`,
        pw - m,
        ph - 7,
        { align: "right" }
      );
    }

    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();

      pdf.setDrawColor(200);
      pdf.line(margin, ph - 12, pw - margin, ph - 12);
      pdf.setFontSize(8);
      pdf.setTextColor(140);
      pdf.text(
        `Sentinel • Relatório automático • ${new Date().getFullYear()}`,
        margin,
        ph - 7
      );
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pw - margin,
        ph - 7,
        { align: "right" }
      );
    }

    // ── Nome do arquivo: DDMMYYNome.pdf ──
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const firstName = (user?.nome || "Operador").split(" ")[0];
    const filename = `${dd}${mm}${yy}${firstName}.pdf`;

    pdf.save(filename);
  }

  function copyReport() {
    const text = sorted
      .map(
        (o) =>
          `Placa: ${o.plate}
Categoria: ${o.category}
Status: ${formatStatus(o.status)}
Observação: ${(o.description || "-").slice(0, 100)}
Atualizado: ${formatDate(o.updatedAt)}
-----------------------------`
      )
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>Relatórios</h1>
          <p style={pageSubtitleStyle}>
            Visualize, filtre e exporte ocorrências em formato profissional.
          </p>
        </div>
      </div>

      {/* Info Bar */}
      <div style={infoBarStyle}>
        <div style={infoItemStyle}>
          <span style={infoLabelStyle}>Sistema</span>
          <span style={infoValueStyle}>Sentinel</span>
        </div>
        <div style={infoItemStyle}>
          <span style={infoLabelStyle}>Data</span>
          <span style={infoValueStyle}>{new Date().toLocaleDateString("pt-BR")}</span>
        </div>
        <div style={infoItemStyle}>
          <span style={infoLabelStyle}>Responsável</span>
          <span style={infoValueStyle}>{user?.nome || "Operador"}</span>
        </div>
        <div style={infoItemStyle}>
          <span style={infoLabelStyle}>Total</span>
          <span style={{ ...infoValueStyle, color: "#3b82f6", fontWeight: "800" }}>
            {sorted.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={filterCardStyle}>
        <div style={filterTitleRowStyle}>
          <h3 style={filterTitleStyle}>Filtros</h3>

          <div style={actionButtonsStyle}>
            <button onClick={load} style={filterButtonStyle}>
              🔍 Filtrar
            </button>
            <button onClick={exportPDF} style={pdfButtonStyle}>
              📄 Exportar PDF
            </button>
            <button onClick={copyReport} style={copyButtonStyle}>
              {copyFeedback ? "✅ Copiado!" : "📋 Copiar"}
            </button>
          </div>
        </div>

        <div style={filterGridStyle}>
          <div style={filterFieldStyle}>
            <label style={filterLabelStyle}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="OPEN">Aberta</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="RESOLVED">Resolvida</option>
              <option value="CANCELED">Cancelada</option>
            </select>
          </div>

          <div style={filterFieldStyle}>
            <label style={filterLabelStyle}>Placa</label>
            <input
              placeholder="Ex: ABC1234"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            />
          </div>

          <div style={filterFieldStyle}>
            <label style={filterLabelStyle}>Data início</label>
            <input
              type="datetime-local"
              value={dateFilter.start}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, start: e.target.value })
              }
            />
          </div>

          <div style={filterFieldStyle}>
            <label style={filterLabelStyle}>Data fim</label>
            <input
              type="datetime-local"
              value={dateFilter.end}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, end: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={tableCardStyle}>
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => handleSort("plate")}>
                  Placa{getSortIndicator("plate")}
                  <input
                    style={thInputStyle}
                    placeholder="Filtrar..."
                    onChange={(e) =>
                      setColumnFilter({ ...columnFilter, plate: e.target.value })
                    }
                  />
                </th>

                <th style={thStyle} onClick={() => handleSort("category")}>
                  Categoria{getSortIndicator("category")}
                  <input
                    style={thInputStyle}
                    placeholder="Filtrar..."
                    onChange={(e) =>
                      setColumnFilter({ ...columnFilter, category: e.target.value })
                    }
                  />
                </th>

                <th style={thStyle} onClick={() => handleSort("status")}>
                  Status{getSortIndicator("status")}
                  <input
                    style={thInputStyle}
                    placeholder="Filtrar..."
                    onChange={(e) =>
                      setColumnFilter({ ...columnFilter, status: e.target.value })
                    }
                  />
                </th>

                <th style={thStyle}>
                  Observações
                  <input
                    style={thInputStyle}
                    placeholder="Filtrar..."
                    onChange={(e) =>
                      setColumnFilter({ ...columnFilter, description: e.target.value })
                    }
                  />
                </th>

                <th style={thStyle} onClick={() => handleSort("updatedAt")}>
                  Atualizado{getSortIndicator("updatedAt")}
                </th>
              </tr>
            </thead>

            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} style={emptyTdStyle}>
                    Nenhuma ocorrência encontrada.
                  </td>
                </tr>
              ) : (
                sorted.map((o, idx) => {
                  const st = getStatusStyle(o.status);
                  return (
                    <tr
                      key={o.id}
                      style={{
                        background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#eef2ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          idx % 2 === 0 ? "#ffffff" : "#f8fafc")
                      }
                    >
                      <td style={tdStyle}>
                        <span style={platePillStyle}>{o.plate || "-"}</span>
                      </td>
                      <td style={tdStyle}>{o.category || "-"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "700",
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.border}`,
                          }}
                        >
                          {formatStatus(o.status)}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: "300px" }}>
                        {(o.description || "-").slice(0, 100)}
                      </td>
                      <td style={tdStyle}>{formatDate(o.updatedAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===== ESTILOS =====

const pageStyle = {
  display: "grid",
  gap: "20px",
  animation: "slideUp 0.4s ease both",
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
  fontWeight: "900",
  letterSpacing: "-0.02em",
};

const pageSubtitleStyle = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: "15px",
};

const infoBarStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
};

const infoItemStyle = {
  background: "white",
  borderRadius: "14px",
  padding: "16px 18px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const infoLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const infoValueStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0f172a",
};

const filterCardStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
};

const filterTitleRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  marginBottom: "16px",
  flexWrap: "wrap",
};

const filterTitleStyle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: "800",
  color: "#0f172a",
};

const actionButtonsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const filterGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
};

const filterFieldStyle = {
  display: "grid",
  gap: "5px",
};

const filterLabelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#475569",
};

const filterButtonStyle = {
  background: "#e2e8f0",
  color: "#1e293b",
  padding: "9px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "13px",
  border: "none",
  cursor: "pointer",
};

const pdfButtonStyle = {
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  padding: "9px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "13px",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
};

const copyButtonStyle = {
  background: "white",
  color: "#334155",
  padding: "9px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "13px",
  border: "1.5px solid #cbd5e1",
  cursor: "pointer",
  minWidth: "120px",
  transition: "all 0.2s ease",
};

const tableCardStyle = {
  background: "white",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  overflow: "hidden",
};

const tableWrapperStyle = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "800px",
};

const thStyle = {
  textAlign: "left",
  padding: "14px 16px",
  background: "#0f172a",
  color: "white",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.03em",
  cursor: "pointer",
  userSelect: "none",
  minWidth: "120px",
  verticalAlign: "top",
};

const thInputStyle = {
  display: "block",
  width: "100%",
  padding: "5px 8px",
  marginTop: "6px",
  fontSize: "11px",
  borderRadius: "6px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
};

const tdStyle = {
  padding: "12px 16px",
  borderBottom: "1px solid #f1f5f9",
  color: "#0f172a",
  fontSize: "14px",
  verticalAlign: "middle",
};

const emptyTdStyle = {
  padding: "40px 16px",
  textAlign: "center",
  color: "#94a3b8",
  fontSize: "14px",
};

const platePillStyle = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "999px",
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  fontWeight: "800",
  letterSpacing: "0.04em",
  fontSize: "13px",
};