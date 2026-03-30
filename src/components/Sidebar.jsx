import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>Sentinel</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <Link style={getLinkStyle(isActive("/"))} to="/">
          Dashboard
        </Link>

        <Link style={getLinkStyle(isActive("/occurrences"))} to="/occurrences">
          Ocorrências
        </Link>

        <Link style={getLinkStyle(isActive("/occurrences/new"))} to="/occurrences/new">
          Nova Ocorrência
        </Link>

        {/* NOVOS LINKS */}
        <Link style={getLinkStyle(isActive("/categories"))} to="/categories">
          Categorias
        </Link>

        <Link style={getLinkStyle(isActive("/protocols"))} to="/protocols">
          Protocolos
        </Link>
      </nav>
    </div>
  );
}

function getLinkStyle(active) {
  return {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    padding: "8px 10px",
    borderRadius: "6px",
    background: active ? "#1e293b" : "transparent",
  };
}