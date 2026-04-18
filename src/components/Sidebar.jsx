import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <aside style={sidebarStyle}>
      <div>
        {/* 🔥 LOGO */}
        <div style={logoAreaStyle}>
          <img src={logo} alt="Sentinel" style={logoImageStyle} />

          <div>
            <h1 style={logoTitleStyle}>Sentinel</h1>
            <p style={logoSubtitleStyle}>Painel operacional</p>
          </div>
        </div>

        {/* 🔥 PERFIL */}
        <div style={profileCardStyle}>
          <div style={avatarStyle}>
            {(user?.nome || "U").charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={profileNameStyle}>{user?.nome || "Usuário"}</div>
            <div style={profileRoleStyle}>{user?.role || "Operador"}</div>
          </div>
        </div>

        {/* 🔥 MENU */}
        <nav style={menuStyle}>
          <MenuItem to="/" active={isActive("/")}>Dashboard</MenuItem>
          <MenuItem to="/occurrences" active={isActive("/occurrences")}>Ocorrências</MenuItem>
          <MenuItem to="/occurrences/new" active={isActive("/occurrences/new")}>Nova Ocorrência</MenuItem>
          <MenuItem to="/categories" active={isActive("/categories")}>Categorias</MenuItem>
          <MenuItem to="/protocols" active={isActive("/protocols")}>Protocolos</MenuItem>
          <MenuItem to="/reports" active={isActive("/reports")}>Relatórios</MenuItem>

          {user?.role === "ADMIN" && (
            <MenuItem to="/users" active={isActive("/users")}>Usuários</MenuItem>
          )}

          <MenuItem to="/change-password" active={isActive("/change-password")}>
            Alterar Senha
          </MenuItem>
        </nav>
      </div>

      {/* 🔥 LOGOUT */}
      <button type="button" onClick={logout} style={logoutButtonStyle}>
        Sair
      </button>
    </aside>
  );
}

function MenuItem({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        ...menuItemStyle,
        ...(active ? menuItemActiveStyle : {}),
      }}
    >
      {children}
    </Link>
  );
}

// ===== ESTILOS =====

const sidebarStyle = {
  width: "270px",
  minHeight: "100vh",
  padding: "24px 18px",
  background: "#0f172a", // 🔥 DARK PREMIUM
  color: "#ffffff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const logoAreaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "32px",
};

const logoImageStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  objectFit: "cover",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
};

const logoTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "800",
};

const logoSubtitleStyle = {
  margin: "2px 0 0",
  fontSize: "12px",
  color: "#94a3b8",
};

const profileCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "30px",
};

const avatarStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  background: "#facc15",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  color: "#0f172a",
};

const profileNameStyle = {
  fontSize: "14px",
  fontWeight: "700",
};

const profileRoleStyle = {
  fontSize: "12px",
  color: "#94a3b8",
};

const menuStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const menuItemStyle = {
  textDecoration: "none",
  color: "#cbd5f5",
  padding: "12px 14px",
  borderRadius: "12px",
  transition: "all 0.2s",
};

const menuItemActiveStyle = {
  background: "#1e293b",
  color: "#fff",
  fontWeight: "600",
};

const logoutButtonStyle = {
  background: "#dc2626",
  color: "#fff",
  padding: "12px",
  borderRadius: "12px",
  cursor: "pointer",
  border: "none",
  fontWeight: "700",
};