import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function Reports() {
  const [data, setData] = useState([]);

  const [status, setStatus] = useState("");
  const [plate, setPlate] = useState("");

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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Relatórios</h1>

      {/* 🔍 FILTROS */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
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

        <button onClick={load}>Filtrar</button>
      </div>

      {/* 📊 TABELA */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
          }}
        >
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Categoria</th>
              <th style={th}>Placa</th>
              <th style={th}>Status</th>
              <th style={th}>Criado por</th>
              <th style={th}>Data</th>
              <th style={th}>Atualizado</th>
              <th style={th}>Resolvido por</th>
              <th style={th}>Cancelado por</th>
            </tr>
          </thead>

          <tbody>
            {data.map((o) => (
              <tr key={o.id}>
                <td style={td}>{o.id}</td>
                <td style={td}>{o.category}</td>
                <td style={td}>{o.plate}</td>
                <td style={td}>{o.status}</td>
                <td style={td}>{o.createdBy}</td>
                <td style={td}>{formatDate(o.createdAt)}</td>
                <td style={td}>{formatDate(o.updatedAt)}</td>
                <td style={td}>{o.resolvedBy || "-"}</td>
                <td style={td}>{o.canceledBy || "-"}</td>
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
  textAlign: "left",
};

const td = {
  border: "1px solid #ddd",
  padding: "8px",
};

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString();
}