import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import jsPDF from "jspdf";
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

  // 🔥 FILTROS
  const filtered = data.filter((o) => {
    const date = new Date(o.updatedAt);

    return (
      (!dateFilter.start || date >= new Date(dateFilter.start)) &&
      (!dateFilter.end || date <= new Date(dateFilter.end)) &&
      (o.plate || "").toLowerCase().includes(columnFilter.plate.toLowerCase()) &&
      (o.category || "").toLowerCase().includes(columnFilter.category.toLowerCase()) &&
      (o.status || "").toLowerCase().includes(columnFilter.status.toLowerCase())
    );
  });

  // 🔥 SORT
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
    return new Date(date).toLocaleString();
  }

  // 🔥 PDF
  async function exportPDF() {
    const element = document.getElementById("report-area");

    const canvas = await html2canvas(element);
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(img, "PNG", 10, 10, 190, 0);
    pdf.save("relatorio.pdf");
  }

  // 🔥 COPIAR
  function copyReport() {
    const text = sorted
      .map(
        (o) =>
          `${o.plate} | ${o.category} | ${o.status} | ${formatDate(
            o.updatedAt
          )}`
      )
      .join("\n");

    navigator.clipboard.writeText(text);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Relatórios</h1>

      {/* 🔍 FILTROS SUPERIORES */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos Status</option>
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
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
          <thead>
            <tr>
              <th style={th}>
                Placa
                <input
                  onChange={(e) =>
                    setColumnFilter({ ...columnFilter, plate: e.target.value })
                  }
                />
              </th>

              <th style={th}>
                Categoria
                <input
                  onChange={(e) =>
                    setColumnFilter({ ...columnFilter, category: e.target.value })
                  }
                />
              </th>

              <th style={th}>
                Status
                <input
                  onChange={(e) =>
                    setColumnFilter({ ...columnFilter, status: e.target.value })
                  }
                />
              </th>

              <th
                style={th}
                onClick={() =>
                  setSortConfig((prev) => ({
                    key: "updatedAt",
                    direction: prev.direction === "asc" ? "desc" : "asc",
                  }))
                }
              >
                Atualizado ⬍
              </th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((o) => (
              <tr key={o.id}>
                <td style={td}>{o.plate}</td>
                <td style={td}>{o.category}</td>
                <td style={td}>{o.status}</td>
                <td style={td}>{formatDate(o.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#f3f4f6",
};

const td = {
  border: "1px solid #ddd",
  padding: "8px",
};