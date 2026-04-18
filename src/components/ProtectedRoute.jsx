import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loadingAuth } = useContext(AuthContext);
  const location = useLocation();

  // ⏳ enquanto valida token / sessão
  if (loadingAuth) {
    return (
      <div className="sentinel-loading">
        <div className="sentinel-spinner" />
        <span>Verificando acesso...</span>
      </div>
    );
  }

  // 🔐 não logado → manda pro login
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }} // 🔥 salva de onde veio
      />
    );
  }

  // 🚫 sem permissão
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}