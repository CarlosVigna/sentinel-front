import { useEffect, useState } from "react";
import { mockOccurrences } from "../mocks/occurrences";

export default function Dashboard() {

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });

  const [recentOccurrences, setRecentOccurrences] = useState([]);

  useEffect(() => {

    const total = mockOccurrences.length;

    const open = mockOccurrences.filter(o => o.status === "OPEN").length;

    const inProgress = mockOccurrences.filter(o => o.status === "IN_PROGRESS").length;

    const resolved = mockOccurrences.filter(o => o.status === "RESOLVED").length;

    setStats({
      total,
      open,
      inProgress,
      resolved
    });

    // últimas 5 ocorrências
    const recent = [...mockOccurrences]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    setRecentOccurrences(recent);

  }, []);

  return (
    <div style={{ padding: "30px" }}>

      <h1>Sentinel</h1>
      <p>Sistema de Gestão de Ocorrências</p>

      {/* CARDS */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginTop: "30px"
      }}>

        <Card title="Total" value={stats.total} />

        <Card title="Abertas" value={stats.open} />

        <Card title="Em andamento" value={stats.inProgress} />

        <Card title="Resolvidas" value={stats.resolved} />

      </div>

      {/* TABELA */}

      <div style={{ marginTop: "40px" }}>

        <h2>Últimas Ocorrências</h2>

        <table
          border="1"
          cellPadding="8"
          style={{ width: "100%", marginTop: "10px" }}
        >

          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Categoria</th>
              <th>Placa</th>
              <th>Título</th>
            </tr>
          </thead>

          <tbody>

            {recentOccurrences.map((occ) => (
              <tr key={occ.id}>
                <td>{occ.id}</td>
                <td>{occ.status}</td>
                <td>{occ.categoryName}</td>
                <td>{occ.plate}</td>
                <td>{occ.title}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function Card({ title, value }) {

  return (
    <div style={{
      background: "#f1f5f9",
      padding: "20px",
      borderRadius: "8px",
      textAlign: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>

      <h3>{title}</h3>

      <p style={{
        fontSize: "28px",
        fontWeight: "bold"
      }}>
        {value}
      </p>

    </div>
  );

}