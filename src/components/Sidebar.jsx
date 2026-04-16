import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <aside style={sidebarStyle}>
      <div>
        <div style={logoAreaStyle}>
          <div style={logoIconStyle}>S</div>

          <div>
            <h1 style={logoTitleStyle}>Sentinel</h1>
            <p style={logoSubtitleStyle}>Painel operacional</p>
          </div>
        </div>

        <div style={profileCardStyle}>
          <div style={avatarStyle}>
            {(user?.nome || "U").charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={profileNameStyle}>{user?.nome || "Usuário"}</div>
            <div style={profileRoleStyle}>{user?.role || "Operador"}</div>
          </div>
        </div>

        <nav style={menuStyle}>
          <MenuItem to="/" active={isActive("/")}>
            Dashboard
          </MenuItem>

          <MenuItem to="/occurrences" active={isActive("/occurrences")}>
            Ocorrências
          </MenuItem>

          <MenuItem to="/occurrences/new" active={isActive("/occurrences/new")}>
            Nova Ocorrência
          </MenuItem>

          <MenuItem to="/categories" active={isActive("/categories")}>
            Categorias
          </MenuItem>

          <MenuItem to="/protocols" active={isActive("/protocols")}>
            Protocolos
          </MenuItem>

          <MenuItem to="/reports" active={isActive("/reports")}>
            Relatórios
          </MenuItem>

          {user?.role === "ADMIN" && (
            <MenuItem to="/users" active={isActive("/users")}>
              Usuários
            </MenuItem>
          )}

          <MenuItem to="/change-password" active={isActive("/change-password")}>
            Alterar Senha
          </MenuItem>
        </nav>
      </div>

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

// ===== estilos =====

const sidebarStyle = {
  width: "290px",
  minHeight: "100vh",
  padding: "22px 18px",
  background: "#626b80",
  color: "#ffffff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const logoAreaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "30px",
};

const logoIconStyle = {
  width: "50px",
  height: "50px",
  borderRadius: "16px",
  background: "#facc15",
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
};

const logoTitleStyle = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "800",
};

const logoSubtitleStyle = {
  margin: "4px 0 0",
  fontSize: "13px",
  opacity: 0.7,
};

const profileCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "28px",
};

const avatarStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  background: "#facc15",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
};

const profileNameStyle = { fontSize: "14px", fontWeight: "700" };
const profileRoleStyle = { fontSize: "12px", opacity: 0.7 };

const menuStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const menuItemStyle = {
  textDecoration: "none",
  color: "#fff",
  padding: "12px",
  borderRadius: "12px",
};

const menuItemActiveStyle = {
  background: "#8f9399",
};

const logoutButtonStyle = {
  background: "#dc2626",
  color: "#fff",
  padding: "12px",
  borderRadius: "12px",
  cursor: "pointer",
};