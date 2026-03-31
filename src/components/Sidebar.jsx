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
        <div style={brandBlockStyle}>
          <div style={brandBadgeStyle}>S</div>
          <div>
            <h2 style={brandTitleStyle}>Sentinel</h2>
            <p style={brandSubtitleStyle}>Gestão operacional</p>
          </div>
        </div>

        <div style={userCardStyle}>
          <div style={userAvatarStyle}>
            {(user?.nome || "U").charAt(0).toUpperCase()}
          </div>

          <div>
            <p style={userNameStyle}>{user?.nome || "Usuário"}</p>
            <p style={userRoleStyle}>{user?.role || ""}</p>
          </div>
        </div>

        <nav style={navStyle}>
          <NavItem to="/" active={isActive("/")}>
            Dashboard
          </NavItem>

          <NavItem to="/occurrences" active={isActive("/occurrences")}>
            Ocorrências
          </NavItem>

          <NavItem to="/occurrences/new" active={isActive("/occurrences/new")}>
            Nova Ocorrência
          </NavItem>

          <NavItem to="/categories" active={isActive("/categories")}>
            Categorias
          </NavItem>

          <NavItem to="/protocols" active={isActive("/protocols")}>
            Protocolos
          </NavItem>

          {user?.role === "ADMIN" && (
            <NavItem to="/users" active={isActive("/users")}>
              Usuários
            </NavItem>
          )}

          <NavItem to="/change-password" active={isActive("/change-password")}>
            Alterar Senha
          </NavItem>
        </nav>
      </div>

      <button type="button" onClick={logout} style={logoutButtonStyle}>
        Sair
      </button>
    </aside>
  );
}

function NavItem({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        ...navItemStyle,
        ...(active ? navItemActiveStyle : {}),
      }}
    >
      {children}
    </Link>
  );
}

const sidebarStyle = {
  width: "270px",
  minHeight: "100vh",
  background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
  color: "white",
  padding: "24px 18px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  borderRight: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "8px 0 30px rgba(15, 23, 42, 0.08)",
};

const brandBlockStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "28px",
};

const brandBadgeStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  fontSize: "20px",
  boxShadow: "0 10px 24px rgba(37, 99, 235, 0.35)",
};

const brandTitleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: "800",
};

const brandSubtitleStyle = {
  margin: "4px 0 0",
  fontSize: "13px",
  color: "rgba(255,255,255,0.65)",
};

const userCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.06)",
  marginBottom: "26px",
};

const userAvatarStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  background: "rgba(37, 99, 235, 0.2)",
  color: "#bfdbfe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
};

const userNameStyle = {
  margin: 0,
  fontSize: "14px",
  fontWeight: "700",
};

const userRoleStyle = {
  margin: "4px 0 0",
  fontSize: "12px",
  color: "rgba(255,255,255,0.65)",
  fontWeight: "600",
};

const navStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const navItemStyle = {
  color: "rgba(255,255,255,0.88)",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 14px",
  borderRadius: "12px",
  transition: "all 0.2s ease",
  border: "1px solid transparent",
};

const navItemActiveStyle = {
  background: "rgba(37, 99, 235, 0.18)",
  color: "#ffffff",
  border: "1px solid rgba(96, 165, 250, 0.28)",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
};

const logoutButtonStyle = {
  marginTop: "28px",
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "12px 14px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
  boxShadow: "0 10px 20px rgba(220, 38, 38, 0.2)",
};