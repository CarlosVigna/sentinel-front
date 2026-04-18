/**
 * StatusBadge — Componente puro de exibição de status.
 *
 * Uso: <StatusBadge status="OPEN" />
 */

const STATUS_MAP = {
  OPEN: {
    label: "Aberta",
    bg: "#fef3c7",
    color: "#92400e",
    border: "#fde68a",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    bg: "#e0f2fe",
    color: "#0369a1",
    border: "#bae6fd",
  },
  RESOLVED: {
    label: "Resolvida",
    bg: "#dcfce7",
    color: "#166534",
    border: "#86efac",
  },
  CANCELED: {
    label: "Cancelada",
    bg: "#ffedd5",
    color: "#c2410c",
    border: "#fdba74",
  },
};

const DEFAULT_CONFIG = {
  label: "Desconhecido",
  bg: "#e2e8f0",
  color: "#0f172a",
  border: "#cbd5e1",
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || DEFAULT_CONFIG;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        transition: "all 0.2s ease",
      }}
    >
      {config.label}
    </span>
  );
}

// Export the mapping so other components can use it
export { STATUS_MAP, DEFAULT_CONFIG };