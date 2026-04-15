import { useState } from "react";
import { getTextReport, downloadPdfReport } from "../services/reportService";

export default function ReportPage() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await getTextReport();
      setReport(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    alert("Copiado!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Relatório de Ocorrências</h1>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Gerando..." : "Gerar Relatório"}
        </button>

        <button onClick={downloadPdfReport} style={{ marginLeft: "10px" }}>
          📄 Baixar PDF
        </button>

        <button onClick={handleCopy} style={{ marginLeft: "10px" }}>
          📋 Copiar
        </button>
      </div>

      <pre
        style={{
          background: "#0d1117",
          color: "#00ff9c",
          padding: "20px",
          borderRadius: "10px",
          maxHeight: "500px",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          fontSize: "13px",
        }}
      >
        {report || "Clique em 'Gerar Relatório'..."}
      </pre>
    </div>
  );
}