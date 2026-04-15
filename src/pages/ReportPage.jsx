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
        <button onClick={handleGenerate}>
          {loading ? "Gerando..." : "Gerar Relatório"}
        </button>

        <button onClick={downloadPdfReport} style={{ marginLeft: "10px" }}>
          📄 Baixar PDF
        </button>

        <button onClick={handleCopy} style={{ marginLeft: "10px" }}>
          📋 Copiar
        </button>
      </div>

      <pre style={{ background: "#111", color: "#0f0", padding: "20px" }}>
        {report || "Clique em gerar relatório..."}
      </pre>
    </div>
  );
}