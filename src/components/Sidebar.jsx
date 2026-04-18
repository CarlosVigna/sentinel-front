import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";

const MENU_ITEMS = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/occurrences", label: "Ocorrências", icon: "📋" },
  { to: "/occurrences/new", label: "Nova Ocorrência", icon: "➕" },
  { to: "/categories", label: "Categorias", icon: "🏷️" },
  { to: "/protocols", label: "Protocolos", icon: "📑" },
  { to: "/reports", label: "Relatórios", icon: "📈" },
];

const ADMIN_ITEMS = [
  { to: "/users", label: "Usuários", icon: "👥" },
];

const BOTTOM_ITEMS = [
  { to: "/change-password", label: "Alterar Senha", icon: "🔒" },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <aside style={sidebarStyle}>
      <div>
        {/* Logo */}
        <div style={logoAreaStyle}>
          <div style={logoWrapperStyle}>
            <img src={logo} alt="Sentinel" style={logoImageStyle} />
          </div>

          <div>
            <h1 style={logoTitleStyle}>Sentinel</h1>
            <p style={logoSubtitleStyle}>Painel operacional</p>
          </div>
        </div>

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Profile */}
        <div style={profileCardStyle}>
          <div style={avatarStyle}>
            {(user?.nome || "U").charAt(0).toUpperCase()}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={profileNameStyle}>{user?.nome || "Usuário"}</div>
            <div style={profileRoleStyle}>{user?.role || "Operador"}</div>
          </div>
        </div>

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Menu */}
        <nav style={menuStyle}>
          <div style={menuLabelStyle}>MENU</div>

          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.to}
              to={item.to}
              active={isActive(item.to)}
              icon={item.icon}
            >
              {item.label}
            </MenuItem>
          ))}

          {user?.role === "ADMIN" && (
            <>
              <div style={{ ...dividerStyle, margin: "10px 0" }} />
              <div style={menuLabelStyle}>ADMIN</div>
              {ADMIN_ITEMS.map((item) => (
                <MenuItem
                  key={item.to}
                  to={item.to}
                  active={isActive(item.to)}
                  icon={item.icon}
                >
                  {item.label}
                </MenuItem>
              ))}
            </>
          )}

          <div style={{ ...dividerStyle, margin: "10px 0" }} />
          <div style={menuLabelStyle}>CONTA</div>
          {BOTTOM_ITEMS.map((item) => (
            <MenuItem
              key={item.to}
              to={item.to}
              active={isActive(item.to)}
              icon={item.icon}
            >
              {item.label}
            </MenuItem>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <button type="button" onClick={logout} style={logoutButtonStyle}>
        <span>🚪</span>
        Sair
      </button>
    </aside>
  );
}

function MenuItem({ to, active, icon, children }) {
  return (
    <Link
      to={to}
      style={{
        ...menuItemStyle,
        ...(active ? menuItemActiveStyle : {}),
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.transform = "translateX(4px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.transform = "translateX(0)";
        }
      }}
    >
      <span style={menuIconStyle}>{icon}</span>
      {children}
    </Link>
  );
}

// ===== ESTILOS =====

const sidebarStyle = {
  width: "270px",
  minHeight: "100vh",
  padding: "20px 16px",
  background: "linear-gradient(180deg, #0c1425 0%, #111c36 50%, #0f172a 100%)",
  color: "#ffffff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  borderRight: "1px solid rgba(255,255,255,0.06)",
  overflowY: "auto",
};

const logoAreaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "4px 6px",
  marginBottom: "8px",
};

const logoWrapperStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
};

const logoImageStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "8px",
  objectFit: "cover",
  filter: "brightness(1.3) contrast(1.1)",
};

const logoTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "800",
  letterSpacing: "-0.02em",
};

const logoSubtitleStyle = {
  margin: "1px 0 0",
  fontSize: "11px",
  color: "rgba(255,255,255,0.4)",
  fontWeight: "500",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const dividerStyle = {
  height: "1px",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
  margin: "14px 0",
};

const profileCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 10px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const avatarStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  fontSize: "16px",
  color: "#fff",
  flexShrink: 0,
  boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
};

const profileNameStyle = {
  fontSize: "14px",
  fontWeight: "700",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const profileRoleStyle = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.4)",
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const menuStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
};

const menuLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "rgba(255,255,255,0.25)",
  letterSpacing: "0.1em",
  padding: "4px 10px 6px",
  textTransform: "uppercase",
};

const menuItemStyle = {
  textDecoration: "none",
  color: "rgba(255,255,255,0.6)",
  padding: "10px 12px",
  borderRadius: "10px",
  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
  fontWeight: "500",
  position: "relative",
};

const menuItemActiveStyle = {
  background: "rgba(59, 130, 246, 0.15)",
  color: "#ffffff",
  fontWeight: "700",
  borderLeft: "3px solid #3b82f6",
  paddingLeft: "9px",
  boxShadow: "inset 0 0 20px rgba(59,130,246,0.05)",
};

const menuIconStyle = {
  fontSize: "16px",
  width: "22px",
  textAlign: "center",
  flexShrink: 0,
};

const logoutButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#fca5a5",
  padding: "12px",
  borderRadius: "12px",
  cursor: "pointer",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  fontWeight: "700",
  fontSize: "14px",
  transition: "all 0.2s ease",
  marginTop: "12px",
};