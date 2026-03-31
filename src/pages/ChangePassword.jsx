import { useState } from "react";
import { changeMyPassword } from "../services/userService";

export default function ChangePassword() {
  const [form, setForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarNovaSenha: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.novaSenha !== form.confirmarNovaSenha) {
      setError("A confirmação da nova senha não confere.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await changeMyPassword({
        senhaAtual: form.senhaAtual,
        novaSenha: form.novaSenha,
      });

      setSuccess("Senha alterada com sucesso.");
      setForm({
        senhaAtual: "",
        novaSenha: "",
        confirmarNovaSenha: "",
      });
    } catch (err) {
      setError(err.message || "Erro ao alterar senha.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>Alterar Senha</h1>
          <p style={pageSubtitleStyle}>
            Atualize sua credencial de acesso com segurança.
          </p>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      <div style={cardStyle}>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Senha atual</label>
            <input
              type="password"
              style={inputStyle}
              value={form.senhaAtual}
              onChange={(e) => setForm({ ...form, senhaAtual: e.target.value })}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Nova senha</label>
            <input
              type="password"
              style={inputStyle}
              value={form.novaSenha}
              onChange={(e) => setForm({ ...form, novaSenha: e.target.value })}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Confirmar nova senha</label>
            <input
              type="password"
              style={inputStyle}
              value={form.confirmarNovaSenha}
              onChange={(e) =>
                setForm({ ...form, confirmarNovaSenha: e.target.value })
              }
              required
            />
          </div>

          <button type="submit" style={primaryButtonStyle} disabled={saving}>
            {saving ? "Salvando..." : "Alterar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

const pageStyle = {
  maxWidth: "680px",
  display: "grid",
  gap: "20px",
};

const pageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const pageTitleStyle = {
  margin: 0,
  fontSize: "30px",
  color: "#0f172a",
  fontWeight: "800",
};

const pageSubtitleStyle = {
  margin: "8px 0 0",
  color: "#64748b",
};

const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const formStyle = {
  display: "grid",
  gap: "16px",
};

const fieldStyle = {
  marginBottom: "2px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "700",
  color: "#0f172a",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  width: "100%",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  border: "none",
  padding: "13px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "800",
};

const errorStyle = {
  padding: "12px",
  borderRadius: "12px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};

const successStyle = {
  padding: "12px",
  borderRadius: "12px",
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #86efac",
};