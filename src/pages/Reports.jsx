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
    const element = document.getElementById("report-area");

    const canvas = await html2canvas(element, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape");

    pdf.setFontSize(16);
    pdf.text("Relatório de Ocorrências - Sentinel", 10, 10);

    pdf.addImage(img, "PNG", 10, 20, 270, 0);

    pdf.save("relatorio.pdf");
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