import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Login() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(email, senha);

      navigate(from, { replace: true });
    } catch {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      {/* 🔥 LADO ESQUERDO */}
      <div style={heroStyle}>
        <div style={heroOverlayStyle} />

        <div style={heroContentStyle}>
          <img src={logo} alt="Sentinel" style={heroLogoStyle} />

          <h1 style={heroTitleStyle}>Sentinel</h1>
          <p style={heroSubtitleStyle}>Painel operacional</p>
        </div>
      </div>

      {/* 🔥 FORM */}
      <div style={formSideStyle}>
        <form onSubmit={handleSubmit} style={formCardStyle}>
          <div style={formHeaderStyle}>
            <h2 style={formTitleStyle}>Entrar</h2>
            <p style={formSubtitleStyle}>
              Acesse sua conta para continuar no Sentinel.
            </p>
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Senha</label>
            <div style={passwordWrapperStyle}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{ ...inputStyle, paddingRight: "94px" }}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={showButtonStyle}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <button type="submit" style={submitButtonStyle} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

// ===== ESTILOS =====

const pageStyle = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr", // 🔥 MAIS ESPAÇO PRO LOGO
  background: "#e2e8f0",
};

const heroStyle = {
  position: "relative",
  background: "linear-gradient(135deg, #0f172a, #1e40af)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
};

const heroOverlayStyle = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(120deg, rgba(255,255,255,0.05) 0%, transparent 60%)",
};

const heroContentStyle = {
  position: "relative",
  zIndex: 1,
  textAlign: "center",
};

const heroLogoStyle = {
  width: "420px",
  maxWidth: "100%",
  marginBottom: "40px",
  objectFit: "contain",
  filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.7))",
};

const heroTitleStyle = {
  fontSize: "42px",
  fontWeight: "800",
  color: "#fff",
  margin: 0,
};

const heroSubtitleStyle = {
  marginTop: "10px",
  fontSize: "16px",
  color: "rgba(255,255,255,0.7)",
};

const formSideStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
};

const formCardStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "32px",
  borderRadius: "20px",
  background: "#ffffff",
  boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
};

const formHeaderStyle = {
  marginBottom: "24px",
};

const formTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: "28px",
  fontWeight: "800",
};

const formSubtitleStyle = {
  marginTop: "8px",
  color: "#64748b",
};

const fieldStyle = {
  marginBottom: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "700",
  color: "#0f172a",
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  outline: "none",
  boxSizing: "border-box",
  fontSize: "15px",
};

const passwordWrapperStyle = {
  position: "relative",
};

const showButtonStyle = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#2563eb",
  fontWeight: "700",
};

const submitButtonStyle = {
  width: "100%",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  border: "none",
  padding: "14px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "800",
  marginTop: "8px",
};

const errorStyle = {
  marginBottom: "16px",
  padding: "12px",
  borderRadius: "12px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};