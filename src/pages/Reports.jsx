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

  // 🔥 PDF HORIZONTAL
  async function exportPDF() {
    const element = document.getElementById("report-area");

    const canvas = await html2canvas(element);
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape"); // 👈 AQUI
    pdf.addImage(img, "PNG", 10, 10, 270, 0);
    pdf.save("relatorio.pdf");
  }

  function copyReport() {
    const text = sorted
      .map(
        (o) =>
          `${o.plate} | ${o.category} | ${o.status} | ${o.description || ""} | ${formatDate(o.updatedAt)}`
      )
      .join("\n");

    navigator.clipboard.writeText(text);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: 10 }}>Relatórios</h1>

      {/* 🔥 CABEÇALHO */}
      <div style={headerStyle}>
        <div><strong>Sistema:</strong> Sentinel</div>
        <div><strong>Data:</strong> {new Date().toLocaleString("pt-BR")}</div>
        <div><strong>Total:</strong> {sorted.length} ocorrências</div>
      </div>

      {/* 🔍 FILTROS */}
      <div style={filterBar}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CANCELED">CANCELED</option>
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

      {/* 📊 TABELA */}
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
                <td style={td}>{o.status}</td>
                <td style={td}>{o.description || "-"}</td>
                <td style={td}>{formatDate(o.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 🔥 ESTILO MELHORADO
const filterBar = {
  marginBottom: 20,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const headerStyle = {
  marginBottom: 15,
  padding: 10,
  background: "#f1f5f9",
  borderRadius: 6,
  display: "flex",
  gap: 20,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
};

const th = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#e2e8f0",
};

const td = {
  border: "1px solid #ddd",
  padding: "8px",
};

const inputSmall = {
  width: "90%",
  padding: "4px",
  fontSize: "12px",
  marginTop: "4px",
};