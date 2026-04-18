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
      <div style={heroStyle}>
        <div style={heroOverlayStyle} />
        <div style={heroContentStyle}>
          <img
            src={logo}
            alt="Sentinel"
            style={{ width: 80, marginBottom: 20 }}
          />
          <h1 style={heroTitleStyle}>Sentinel</h1>
          <p style={heroSubtitleStyle}>
            Plataforma de gestão de ocorrências, protocolos e operação monitorada.
          </p>

          <div style={heroHighlightsStyle}>
            <div style={highlightCardStyle}>
              <strong>Operação centralizada</strong>
              <span>Ocorrências, protocolos e usuários em um único ambiente.</span>
            </div>

            <div style={highlightCardStyle}>
              <strong>Fluxo rápido</strong>
              <span>Mais clareza visual para tratar eventos com agilidade.</span>
            </div>
          </div>
        </div>
      </div>

      <div style={formSideStyle}>
        <form onSubmit={handleSubmit} style={formCardStyle}>
          <div style={formHeaderStyle}>
            <h2 style={formTitleStyle}>Entrar</h2>
            <p style={formSubtitleStyle}>Acesse sua conta para continuar no Sentinel.</p>
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

const pageStyle = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "1.15fr 0.85fr",
  background: "#e2e8f0",
};

const heroStyle = {
  position: "relative",
  background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px",
  overflow: "hidden",
};

const heroOverlayStyle = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at top right, rgba(255,255,255,0.16), transparent 32%), radial-gradient(circle at bottom left, rgba(255,255,255,0.10), transparent 28%)",
};

const heroContentStyle = {
  position: "relative",
  zIndex: 1,
  maxWidth: "560px",
};

const brandBadgeStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: "800",
  marginBottom: "22px",
  border: "1px solid rgba(255,255,255,0.18)",
};

const heroTitleStyle = {
  margin: 0,
  fontSize: "48px",
  fontWeight: "800",
};

const heroSubtitleStyle = {
  marginTop: "14px",
  fontSize: "18px",
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.88)",
};

const heroHighlightsStyle = {
  display: "grid",
  gap: "14px",
  marginTop: "30px",
};

const highlightCardStyle = {
  display: "grid",
  gap: "6px",
  padding: "16px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(4px)",
};

const formSideStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
};

const formCardStyle = {
  width: "100%",
  maxWidth: "430px",
  background: "white",
  padding: "34px",
  borderRadius: "24px",
  boxShadow: "0 25px 60px rgba(15, 23, 42, 0.12)",
  border: "1px solid #e2e8f0",
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
  background: "#fff",
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
  boxShadow: "0 16px 30px rgba(37, 99, 235, 0.2)",
};

const errorStyle = {
  marginBottom: "16px",
  padding: "12px",
  borderRadius: "12px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};