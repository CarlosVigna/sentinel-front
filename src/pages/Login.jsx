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
      {/* Animated gradient background */}
      <div style={bgGradientStyle} />
      <div style={bgOverlayStyle} />

      {/* Floating particles decorative */}
      <div style={particleStyle(80, 15, 6)} />
      <div style={particleStyle(20, 70, 4)} />
      <div style={particleStyle(70, 60, 8)} />
      <div style={particleStyle(40, 30, 3)} />
      <div style={particleStyle(90, 80, 5)} />

      {/* Content */}
      <div style={contentStyle}>
        {/* Logo */}
        <div style={logoContainerStyle}>
          <img src={logo} alt="Sentinel" style={logoStyle} />
        </div>

        {/* Form Card */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h1 style={titleStyle}>Sentinel</h1>
            <p style={subtitleStyle}>Painel Operacional</p>
          </div>

          <div style={dividerStyle} />

          <h2 style={formTitleStyle}>Entrar na sua conta</h2>
          <p style={formSubtitleStyle}>
            Acesse o painel para gerenciar ocorrências e protocolos.
          </p>

          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleSubmit} style={formStyle}>
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
              {loading ? (
                <span style={loadingTextStyle}>
                  <span style={spinnerSmallStyle} />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p style={footerTextStyle}>
            Sentinel © {new Date().getFullYear()} — Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

// ===== ESTILOS =====

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  background: "#070c1a",
};

const bgGradientStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #1e40af 60%, #0f172a 100%)",
  backgroundSize: "400% 400%",
  animation: "gradientShift 12s ease infinite",
};

const bgOverlayStyle = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.15) 0%, transparent 50%), " +
    "radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.1) 0%, transparent 50%)",
};

function particleStyle(left, top, size) {
  return {
    position: "absolute",
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    animation: `pulse ${2 + size * 0.3}s ease-in-out infinite`,
    pointerEvents: "none",
  };
}

const contentStyle = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "32px",
  padding: "40px 20px",
  maxWidth: "480px",
  width: "100%",
  animation: "slideUp 0.7s cubic-bezier(0.4,0,0.2,1) both",
};

const logoContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const logoStyle = {
  width: "420px",
  maxWidth: "100vw",
  objectFit: "contain",
  filter: "drop-shadow(0 20px 60px rgba(59,130,246,0.4))",
  animation: "fadeIn 1s ease both",
};

const cardStyle = {
  width: "100%",
  padding: "36px 32px 28px",
  borderRadius: "24px",
  background: "rgba(255, 255, 255, 0.07)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 32px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
};

const cardHeaderStyle = {
  textAlign: "center",
  marginBottom: "4px",
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: "900",
  color: "#ffffff",
  letterSpacing: "-0.03em",
};

const subtitleStyle = {
  margin: "4px 0 0",
  fontSize: "14px",
  color: "rgba(255, 255, 255, 0.5)",
  fontWeight: "500",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const dividerStyle = {
  height: "1px",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
  margin: "20px 0 24px",
};

const formTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "700",
  color: "#ffffff",
};

const formSubtitleStyle = {
  margin: "6px 0 20px",
  fontSize: "14px",
  color: "rgba(255, 255, 255, 0.5)",
};

const formStyle = {
  display: "grid",
  gap: "18px",
};

const fieldStyle = {
  display: "grid",
  gap: "7px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "rgba(255, 255, 255, 0.7)",
  letterSpacing: "0.01em",
};

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: "12px",
  border: "1.5px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255, 255, 255, 0.06)",
  color: "#ffffff",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const passwordWrapperStyle = {
  position: "relative",
};

const showButtonStyle = {
  position: "absolute",
  right: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#60a5fa",
  fontWeight: "700",
  fontSize: "13px",
  padding: "4px 0",
};

const submitButtonStyle = {
  width: "100%",
  background: "linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)",
  color: "white",
  border: "none",
  padding: "14px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "800",
  marginTop: "4px",
  boxShadow: "0 8px 30px rgba(37, 99, 235, 0.35)",
  transition: "all 0.25s ease",
  letterSpacing: "0.01em",
};

const loadingTextStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
};

const spinnerSmallStyle = {
  display: "inline-block",
  width: "16px",
  height: "16px",
  border: "2.5px solid rgba(255,255,255,0.3)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};

const errorStyle = {
  marginBottom: "4px",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "rgba(239, 68, 68, 0.15)",
  color: "#fca5a5",
  border: "1px solid rgba(239, 68, 68, 0.25)",
  fontSize: "14px",
  fontWeight: "500",
};

const footerTextStyle = {
  textAlign: "center",
  fontSize: "12px",
  color: "rgba(255, 255, 255, 0.25)",
  marginTop: "20px",
  marginBottom: 0,
};