import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listOccurrences } from "../services/occurrenceService";

export default function Occurrences() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const statusFromUrl = searchParams.get("status") || "OPEN";

  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    plate: "",
    category: "",
    protocol: "",
    description: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "updatedAt",
    direction: "desc",
  });

  useEffect(() => {
    load();
  }, [statusFromUrl]);

  async function load() {
    setLoading(true);
    const data = await listOccurrences(0, 100, statusFromUrl);
    setOccurrences(data.content || []);
    setLoading(false);
  }

  // 🔥 FILTRO
  const filtered = occurrences.filter((o) => {
    return (
      (o.plate || "").toLowerCase().includes(filters.plate.toLowerCase()) &&
      (o.categoryName || "").toLowerCase().includes(filters.category.toLowerCase()) &&
      (o.protocolName || "").toLowerCase().includes(filters.protocol.toLowerCase()) &&
      (o.description || "").toLowerCase().includes(filters.description.toLowerCase())
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

  function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("pt-BR");
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Ocorrências</h1>

      {/* 🔥 BOTÕES DE STATUS (VOLTARAM) */}
      <div style={{ marginBottom: 15, display: "flex", gap: 10 }}>
        {["OPEN", "IN_PROGRESS", "RESOLVED", "CANCELED"].map((status) => (
          <button
            key={status}
            onClick={() => navigate(`/occurrences?status=${status}`)}
            style={{
              padding: "6px 12px",
              background: status === statusFromUrl ? "#2563eb" : "#e5e7eb",
              color: status === statusFromUrl ? "white" : "black",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>
              Placa
              <br />
              <input
                style={inputStyle}
                value={filters.plate}
                onChange={(e) =>
                  setFilters({ ...filters, plate: e.target.value })
                }
              />
            </th>

            <th>
              Categoria
              <br />
              <input
                style={inputStyle}
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              />
            </th>

            <th>
              Protocolo
              <br />
              <input
                style={inputStyle}
                value={filters.protocol}
                onChange={(e) =>
                  setFilters({ ...filters, protocol: e.target.value })
                }
              />
            </th>

            <th>
              Observações
              <br />
              <input
                style={inputStyle}
                value={filters.description}
                onChange={(e) =>
                  setFilters({ ...filters, description: e.target.value })
                }
              />
            </th>

            <th
              onClick={() =>
                setSortConfig((prev) => ({
                  key: "updatedAt",
                  direction: prev.direction === "asc" ? "desc" : "asc",
                }))
              }
              style={{ cursor: "pointer" }}
            >
              Atualizado ⬍
            </th>
          </tr>
        </thead>

        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                Nenhuma ocorrência encontrada
              </td>
            </tr>
          ) : (
            sorted.map((o) => (
              <tr key={o.id}>
                <td>{o.plate}</td>
                <td>{o.categoryName}</td>
                <td>{o.protocolName}</td>
                <td>{o.description || "-"}</td>
                <td>{formatDate(o.updatedAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// 🔥 INPUT PEQUENO (RESOLVE O VISUAL)
const inputStyle = {
  width: "90%",
  padding: "4px",
  fontSize: "12px",
  marginTop: "4px",
};