import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div
      style={{
        background: "#1e293b",
        color: "white",
        padding: "15px",
        display: "flex",
        gap: "20px",
        alignItems: "center"
      }}
    >
      <strong>Sentinel</strong>

      <Link to="/" style={{ color: "white" }}>
        Dashboard
      </Link>

      <Link to="/occurrences" style={{ color: "white" }}>
        Ocorrências
      </Link>

      <Link to="/occurrences/new" style={{ color: "white" }}>
        Nova Ocorrência
      </Link>

      {/* NOVOS ITENS */}
      <Link to="/categories" style={{ color: "white" }}>
        Categorias
      </Link>

      <Link to="/protocols" style={{ color: "white" }}>
        Protocolos
      </Link>
    </div>
  );
}