import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
    setData(res);
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

  let y = 10;

  // 🧠 CABEÇALHO
  pdf.setFontSize(18);
  pdf.text("Relatório de Ocorrências", 10, y);

  pdf.setFontSize(12);
  pdf.text("Sistema Sentinel", 10, y + 6);

  pdf.setFontSize(10);
  pdf.text(`Data de emissão: ${new Date().toLocaleString("pt-BR")}`, 10, y + 12);

  pdf.text(`Emitido por: Operador`, 10, y + 18); // depois podemos puxar do user logado

  y += 28;

  // 🔥 LINHA SEPARADORA
  pdf.setDrawColor(200);
  pdf.line(10, y, pageWidth - 10, y);

  y += 8;

  // 📊 CABEÇALHO TABELA
  pdf.setFontSize(11);
  pdf.setFont(undefined, "bold");

  pdf.text("Placa", 10, y);
  pdf.text("Categoria", 50, y);
  pdf.text("Status", 110, y);
  pdf.text("Observações", 150, y);
  pdf.text("Atualizado", 240, y);

  pdf.setFont(undefined, "normal");

  y += 6;

  pdf.line(10, y, pageWidth - 10, y);

  y += 6;

  // 📊 DADOS
  sorted.forEach((o, index) => {
    if (y > 190) {
      pdf.addPage();
      y = 10;
    }

    const status = formatStatus(o.status);
    const desc = (o.description || "-").slice(0, 80);

    pdf.setFontSize(9);

    pdf.text(o.plate || "-", 10, y);
    pdf.text(o.category || "-", 50, y);
    pdf.text(status, 110, y);
    pdf.text(desc, 150, y);
    pdf.text(formatDate(o.updatedAt), 240, y);

    y += 6;
  });

  // 🔻 RODAPÉ
  const pageCount = pdf.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    pdf.setFontSize(9);
    pdf.setTextColor(120);

    pdf.text(
      `Sentinel © ${new Date().getFullYear()} - Relatório gerado automaticamente`,
      10,
      200
    );

    pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 40, 200);
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
                }/>
              </th>

              <th style={th}>
                Categoria
                <input style={inputSmall} onChange={(e) =>
                  setColumnFilter({ ...columnFilter, category: e.target.value })
                }/>
              </th>

              <th style={th}>
                Status
                <input style={inputSmall} onChange={(e) =>
                  setColumnFilter({ ...columnFilter, status: e.target.value })
                }/>
              </th>

              <th style={th}>
                Observações
                <input style={inputSmall} onChange={(e) =>
                  setColumnFilter({ ...columnFilter, description: e.target.value })
                }/>
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