import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockOccurrences } from "../mocks/occurrences";

export default function Occurrences() {

  const navigate = useNavigate();

  const [occurrences, setOccurrences] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [plateFilter, setPlateFilter] = useState("");

  useEffect(() => {
    setOccurrences(mockOccurrences);
    setFiltered(mockOccurrences);
  }, []);

  useEffect(() => {

    let data = [...occurrences];

    if (statusFilter) {
      data = data.filter(o => o.status === statusFilter);
    }

    if (categoryFilter) {
      data = data.filter(o => o.categoryName === categoryFilter);
    }

    if (plateFilter) {
      data = data.filter(o =>
        o.plate.toLowerCase().includes(plateFilter.toLowerCase())
      );
    }

    setFiltered(data);

  }, [statusFilter, categoryFilter, plateFilter, occurrences]);

  function resolveOccurrence(e, id) {

    e.stopPropagation();

    const updated = occurrences.map((occ) =>
      occ.id === id ? { ...occ, status: "RESOLVED" } : occ
    );

    setOccurrences(updated);
  }

  function cancelOccurrence(e, id) {

    e.stopPropagation();

    const updated = occurrences.map((occ) =>
      occ.id === id ? { ...occ, status: "CANCELED" } : occ
    );

    setOccurrences(updated);
  }

  return (
    <div style={{ padding: "30px" }}>

      <h1>Ocorrências</h1>

      <Link to="/occurrences/new">
        <button>Criar Ocorrência</button>
      </Link>

      {/* FILTROS */}

      <div style={{
        marginTop: "20px",
        marginBottom: "20px",
        display: "flex",
        gap: "10px"
      }}>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos Status</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CANCELED">CANCELED</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Todas Categorias</option>
          <option value="DESENGATE">DESENGATE</option>
          <option value="PARADA">PARADA</option>
          <option value="DESVIO">DESVIO</option>
        </select>

        <input
          placeholder="Buscar placa"
          value={plateFilter}
          onChange={(e) => setPlateFilter(e.target.value)}
        />

      </div>

      {/* TABELA */}

      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%" }}
      >

        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Categoria</th>
            <th>Placa</th>
            <th>Título</th>
            <th>Criado em</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>

          {filtered.map((occ) => (

            <tr
              key={occ.id}
              onClick={() => navigate(`/occurrences/${occ.id}`)}
              style={{ cursor: "pointer" }}
            >

              <td>{occ.id}</td>
              <td>{occ.status}</td>
              <td>{occ.categoryName}</td>
              <td>{occ.plate}</td>
              <td>{occ.title}</td>
              <td>{occ.createdAt}</td>

              <td>

                {occ.status !== "RESOLVED" && occ.status !== "CANCELED" ? (
                  <>
                    <button
                      onClick={(e) => resolveOccurrence(e, occ.id)}
                      style={{ marginRight: "5px" }}
                    >
                      Resolver
                    </button>

                    <button
                      onClick={(e) => cancelOccurrence(e, occ.id)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <span>-</span>
                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}