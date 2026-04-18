import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png";

export default function Reports() {
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

  function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR");
  }

  async function exportPDF() {
    const pdf = new jsPDF("landscape");
    const pageWidth = pdf.internal.pageSize.getWidth();

    let y = 12;

    const logoImg = new Image();
    logoImg.src = logo;

    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });

    pdf.addImage(logoImg, "PNG", 10, 5, 30, 15);
    // 🧠 CABEÇALHO BONITO
    pdf.setFontSize(20);
    pdf.setTextColor(15, 23, 42);
    pdf.text("RELATÓRIO DE OCORRÊNCIAS", 10, y);

    y += 6;

    pdf.setFontSize(12);
    pdf.setTextColor(100);
    pdf.text("Sistema Sentinel", 10, y);

    y += 6;

    pdf.setFontSize(10);
    pdf.text(`Emitido em: ${new Date().toLocaleString("pt-BR")}`, 10, y);

    y += 5;

    pdf.text(`Emitido por: Operador`, 10, y);

    y += 8;

    // 🔥 LINHA DIVISÓRIA
    pdf.setDrawColor(180);
    pdf.line(10, y, pageWidth - 10, y);

    y += 8;

    // 📊 CABEÇALHO DA TABELA
    pdf.setFontSize(11);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(0);

    pdf.text("Placa", 10, y);
    pdf.text("Categoria", 55, y);
    pdf.text("Status", 120, y);
    pdf.text("Observações", 165, y);
    pdf.text("Atualizado", 250, y);

    pdf.setFont(undefined, "normal");

    y += 5;

    pdf.setDrawColor(200);
    pdf.line(10, y, pageWidth - 10, y);

    y += 6;

    // 📊 LINHAS
    sorted.forEach((o) => {
      if (y > 185) {
        pdf.addPage();
        y = 12;
      }

      const status = formatStatus(o.status);
      const desc = (o.description || "-").slice(0, 90);

      pdf.setFontSize(9);
      pdf.setTextColor(20);

      pdf.text(o.plate || "-", 10, y);
      pdf.text(o.category || "-", 55, y);
      pdf.text(status, 120, y);
      pdf.text(desc, 165, y);
      pdf.text(formatDate(o.updatedAt), 250, y);

      y += 6;
    });

    // 🔻 RODAPÉ BONITO
    const totalPages = pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      pdf.setFontSize(9);
      pdf.setTextColor(120);

      pdf.line(10, 195, pageWidth - 10, 195);

      pdf.text(
        `Sentinel • Relatório automático • ${new Date().getFullYear()}`,
        10,
        200
      );

      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - 40,
        200
      );
    }

    pdf.save("relatorio-sentinel.pdf");
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

    navigator.clipboard.writeText(text);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: 10 }}>Relatórios</h1>

      <div style={headerStyle}>
        <div><strong>Sistema:</strong> Sentinel</div>
        <div><strong>Data:</strong> {new Date().toLocaleString("pt-BR")}</div>
        <div><strong>Total:</strong> {sorted.length} ocorrências</div>
      </div>

      <div style={filterBar}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="OPEN">Aberta</option>
          <option value="IN_PROGRESS">Em andamento</option>
          <option value="RESOLVED">Resolvida</option>
          <option value="CANCELED">Cancelada</option>
        </select>

        <input
          placeholder="Placa"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />

        <input
          type="datetime-local"
          value={dateFilter.start}
          onChange={(e) =>
            setDateFilter({ ...dateFilter, start: e.target.value })
          }
        />

        <input
          type="datetime-local"
          value={dateFilter.end}
          onChange={(e) =>
            setDateFilter({ ...dateFilter, end: e.target.value })
          }
        />

        <button onClick={load}>Filtrar</button>
        <button onClick={exportPDF}>PDF</button>
        <button onClick={copyReport}>Copiar</button>
      </div>

      <div id="report-area" style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>
                Placa
                <input style={inputSmall} onChange={(e) =>
                  setColumnFilter({ ...columnFilter, plate: e.target.value })
                } />
              </th>

              <th style={th}>
                Categoria
                <input style={inputSmall} onChange={(e) =>
                  setColumnFilter({ ...columnFilter, category: e.target.value })
                } />
              </th>

              <th style={th}>
                Status
                <input style={inputSmall} onChange={(e) =>
                  setColumnFilter({ ...columnFilter, status: e.target.value })
                } />
              </th>

              <th style={th}>
                Observações
                <input style={inputSmall} onChange={(e) =>
                  setColumnFilter({ ...columnFilter, description: e.target.value })
                } />
              </th>

              <th style={th}>Atualizado</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((o) => (
              <tr key={o.id}>
                <td style={td}>{o.plate}</td>
                <td style={td}>{o.category}</td>
                <td style={td}>{formatStatus(o.status)}</td>
                <td style={td}>{(o.description || "-").slice(0, 100)}</td>
                <td style={td}>{formatDate(o.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const filterBar = {
  marginBottom: 20,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const headerStyle = {
  marginBottom: 20,
  padding: 16,
  background: "#0f172a",
  borderRadius: 10,
  display: "flex",
  justifyContent: "space-between",
  color: "white",
  fontWeight: "600",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
};

const th = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#1e293b",
  color: "white",
  minWidth: "140px",
};

const td = {
  border: "1px solid #ddd",
  padding: "8px",
  minWidth: "140px",
};

const inputSmall = {
  width: "90%",
  padding: "4px",
  fontSize: "12px",
  marginTop: "4px",
};