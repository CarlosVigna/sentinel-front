import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  listOccurrences,
  resolveOccurrence,
  cancelOccurrence,
  reopenOccurrence,
  updateOccurrence,
} from "../services/occurrenceService";
import { listCategories } from "../services/categoryService";
import { listProtocolsByCategory } from "../services/protocolService";

const STATUS_TABS = [
  { key: "OPEN", label: "Abertas", bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  { key: "RESOLVED", label: "Resolvidas", bg: "#dcfce7", color: "#166534", border: "#86efac" },
  { key: "CANCELED", label: "Canceladas", bg: "#ffedd5", color: "#c2410c", border: "#fdba74" },
];

export default function Occurrences() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const statusFromUrl = searchParams.get("status") || "OPEN";
  const highlightId = searchParams.get("highlight");

  const [occurrences, setOccurrences] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeStatus, setActiveStatus] = useState(statusFromUrl);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    categoryId: "",
    protocolId: "",
    plate: "",
    description: "",
    textoResponsaveis: "",
    textoMotorista: "",
    textoInterno: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setActiveStatus(statusFromUrl);
    setPage(0);
  }, [statusFromUrl]);

  useEffect(() => {
    loadOccurrences(0, activeStatus);
  }, [activeStatus]);

  async function loadOccurrences(currentPage = 0, status = activeStatus) {
    try {
      setLoading(true);
      setError("");

      const data = await listOccurrences(currentPage, 10, status);

      setOccurrences(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(data.number || 0);
    } catch (err) {
      setError(err.message || "Erro ao carregar ocorrências.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await listCategories();
      setCategories(Array.isArray(data) ? data : data.content || []);
    } catch {
      setCategories([]);
    }
  }

  async function loadProtocols(categoryId) {
    if (!categoryId) {
      setProtocols([]);
      return;
    }

    try {
      const data = await listProtocolsByCategory(categoryId);
      setProtocols(Array.isArray(data) ? data : data.content || []);
    } catch {
      setProtocols([]);
    }
  }

  async function handleResolve(id) {
    try {
      setActionLoadingId(id);
      setError("");
      setSuccess("");
      await resolveOccurrence(id);
      setSuccess("Ocorrência resolvida com sucesso.");
      await loadOccurrences(page, activeStatus);
      if (selectedDetails?.id === id) setSelectedDetails(null);
    } catch (err) {
      setError(err.message || "Erro ao resolver ocorrência.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCancel(id) {
    const confirmed = window.confirm("Deseja realmente cancelar esta ocorrência?");
    if (!confirmed) return;

    try {
      setActionLoadingId(id);
      setError("");
      setSuccess("");
      await cancelOccurrence(id);
      setSuccess("Ocorrência cancelada com sucesso.");
      await loadOccurrences(page, activeStatus);
      if (selectedDetails?.id === id) setSelectedDetails(null);
    } catch (err) {
      setError(err.message || "Erro ao cancelar ocorrência.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReopen(id) {
    const confirmed = window.confirm("Deseja reabrir esta ocorrência?");
    if (!confirmed) return;

    try {
      setActionLoadingId(id);
      setError("");
      setSuccess("");
      await reopenOccurrence(id);
      setSuccess("Ocorrência reaberta com sucesso.");
      await loadOccurrences(page, activeStatus);
      if (selectedDetails?.id === id) setSelectedDetails(null);
    } catch (err) {
      setError(err.message || "Erro ao reabrir ocorrência.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function openEditModal(occurrence) {
    setSelectedOccurrence(occurrence);

    setEditForm({
      categoryId: occurrence.categoryId || "",
      protocolId: occurrence.protocolId || "",
      plate: occurrence.plate || "",
      description: occurrence.description || "",
      textoResponsaveis: occurrence.textoResponsaveis || "",
      textoMotorista: occurrence.textoMotorista || "",
      textoInterno: occurrence.textoInterno || "",
    });

    await loadProtocols(occurrence.categoryId);
  }

  function closeEditModal() {
    setSelectedOccurrence(null);
    setProtocols([]);
    setEditForm({
      categoryId: "",
      protocolId: "",
      plate: "",
      description: "",
      textoResponsaveis: "",
      textoMotorista: "",
      textoInterno: "",
    });
  }

  async function handleEditCategoryChange(categoryId) {
    setEditForm((prev) => ({
      ...prev,
      categoryId,
      protocolId: "",
    }));

    await loadProtocols(categoryId);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();

    if (!selectedOccurrence) return;

    try {
      setSavingEdit(true);
      setError("");
      setSuccess("");

      await updateOccurrence(selectedOccurrence.id, {
        categoryId: Number(editForm.categoryId),
        protocolId: Number(editForm.protocolId),
        plate: editForm.plate,
        description: editForm.description,
        textoResponsaveis: editForm.textoResponsaveis,
        textoMotorista: editForm.textoMotorista,
        textoInterno: editForm.textoInterno,
      });

      setSuccess("Ocorrência atualizada com sucesso.");
      closeEditModal();
      await loadOccurrences(page, activeStatus);
    } catch (err) {
      setError(err.message || "Erro ao atualizar ocorrência.");
    } finally {
      setSavingEdit(false);
    }
  }

  function openDetailsModal(occurrence) {
    setSelectedDetails(occurrence);
  }

  function closeDetailsModal() {
    setSelectedDetails(null);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch {}
  }

  function getStatusStyle(status) {
    switch (status) {
      case "OPEN":
        return {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fde68a",
        };
      case "IN_PROGRESS":
        return {
          background: "#e0f2fe",
          color: "#0369a1",
          border: "1px solid #bae6fd",
        };
      case "RESOLVED":
        return {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        };
      case "CANCELED":
        return {
          background: "#ffedd5",
          color: "#c2410c",
          border: "1px solid #fdba74",
        };
      default:
        return {
          background: "#e2e8f0",
          color: "#0f172a",
          border: "1px solid #cbd5e1",
        };
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "OPEN":
        return "ABERTA";
      case "IN_PROGRESS":
        return "EM ANDAMENTO";
      case "RESOLVED":
        return "RESOLVIDA";
      case "CANCELED":
        return "CANCELADA";
      default:
        return status;
    }
  }

  function formatDateTime(value) {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleString("pt-BR");
    } catch {
      return value;
    }
  }

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i);
  }, [totalPages]);

  if (loading) {
    return <div style={{ padding: "24px" }}>Carregando ocorrências...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={topHeaderStyle}>
        <div>
          <h1 style={titleStyle}>Ocorrências</h1>
          <p style={subtitleStyle}>
            Visualização operacional compacta com ações rápidas e detalhes sob demanda.
          </p>
        </div>
      </div>

      <div style={tabsContainerStyle}>
        {STATUS_TABS.map((tab) => {
          const active = activeStatus === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSuccess("");
                setError("");
                navigate(`/occurrences?status=${tab.key}`);
              }}
              style={{
                ...tabButtonStyle,
                background: active ? tab.bg : "#ffffff",
                color: active ? tab.color : "#334155",
                border: `1px solid ${active ? tab.border : "#cbd5e1"}`,
                boxShadow: active ? "0 8px 20px rgba(15,23,42,0.06)" : "none",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      {occurrences.length === 0 ? (
        <div style={emptyStyle}>Nenhuma ocorrência encontrada.</div>
      ) : (
        <div style={tableCardStyle}>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Categoria</th>
                  <th style={thStyle}>Protocolo</th>
                  <th style={thStyle}>Placa</th>
                  <th style={thStyle}>Criado por</th>
                  <th style={thStyle}>Atualizado em</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {occurrences.map((occurrence, index) => (
                  <tr
                    key={occurrence.id}
                    style={{
                      ...trStyle,
                      background:
                        String(occurrence.id) === String(highlightId)
                          ? "#dbeafe"
                          : index % 2 === 0
                          ? "#ffffff"
                          : "#f8fafc",
                    }}
                  >
                    <td style={tdStyle}>
                      <div style={codeCellStyle}>
                        <span style={mainCellTextStyle}>#{occurrence.id}</span>
                        <span style={codeDateStyle}>
                          {formatDateTime(occurrence.createdAt)}
                        </span>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...statusBadgeStyle,
                          ...getStatusStyle(occurrence.status),
                        }}
                      >
                        {getStatusLabel(occurrence.status)}
                      </span>
                    </td>

                    <td style={tdStyle}>{occurrence.categoryName || "-"}</td>
                    <td style={tdStyle}>{occurrence.protocolName || "-"}</td>
                    <td style={tdStyle}>
                      <span style={platePillStyle}>{occurrence.plate || "-"}</span>
                    </td>
                    <td style={tdStyle}>{occurrence.createdByName || "-"}</td>
                    <td style={tdStyle}>{formatDateTime(occurrence.updatedAt)}</td>

                    <td style={tdStyle}>
                      <div style={rowActionsStyle}>
                        <button
                          type="button"
                          onClick={() => openDetailsModal(occurrence)}
                          style={ghostButtonStyle}
                        >
                          Ver
                        </button>

                        {(occurrence.status === "OPEN" ||
                          occurrence.status === "IN_PROGRESS") && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleResolve(occurrence.id)}
                              style={primaryButtonStyle}
                              disabled={actionLoadingId === occurrence.id}
                            >
                              {actionLoadingId === occurrence.id ? "..." : "Resolver"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancel(occurrence.id)}
                              style={dangerButtonStyle}
                              disabled={actionLoadingId === occurrence.id}
                            >
                              {actionLoadingId === occurrence.id ? "..." : "Cancelar"}
                            </button>
                          </>
                        )}

                        {(occurrence.status === "RESOLVED" ||
                          occurrence.status === "CANCELED") && (
                          <button
                            type="button"
                            onClick={() => handleReopen(occurrence.id)}
                            style={warningButtonStyle}
                            disabled={actionLoadingId === occurrence.id}
                          >
                            {actionLoadingId === occurrence.id ? "..." : "Reabrir"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={paginationStyle}>
            <button
              type="button"
              onClick={() => {
                const newPage = Math.max(page - 1, 0);
                setPage(newPage);
                loadOccurrences(newPage, activeStatus);
              }}
              disabled={page === 0}
              style={secondaryButtonStyle}
            >
              Anterior
            </button>

            <div style={pageNumbersContainerStyle}>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => {
                    setPage(pageNumber);
                    loadOccurrences(pageNumber, activeStatus);
                  }}
                  style={{
                    ...pageNumberButtonStyle,
                    ...(page === pageNumber ? activePageNumberButtonStyle : {}),
                  }}
                >
                  {pageNumber + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const newPage = page + 1;
                setPage(newPage);
                loadOccurrences(newPage, activeStatus);
              }}
              disabled={totalPages === 0 || page + 1 >= totalPages}
              style={secondaryButtonStyle}
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {selectedDetails && (
        <div style={modalOverlayStyle}>
          <div style={detailsModalContentStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedDetails.title}</h3>
                <p style={detailsSubheaderStyle}>
                  Código #{selectedDetails.id} • {getStatusLabel(selectedDetails.status)}
                </p>
              </div>

              <div style={detailsHeaderActionsStyle}>
                {(selectedDetails.status === "OPEN" ||
                  selectedDetails.status === "IN_PROGRESS") && (
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedDetails)}
                    style={secondaryButtonStyle}
                  >
                    Editar
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeDetailsModal}
                  style={modalCloseButtonStyle}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={detailsTopGridStyle}>
              <div style={detailsInfoCardStyle}>
                <span style={detailsInfoLabelStyle}>Categoria</span>
                <strong>{selectedDetails.categoryName || "-"}</strong>
              </div>

              <div style={detailsInfoCardStyle}>
                <span style={detailsInfoLabelStyle}>Protocolo</span>
                <strong>{selectedDetails.protocolName || "-"}</strong>
              </div>

              <div style={detailsInfoCardStyle}>
                <span style={detailsInfoLabelStyle}>Placa</span>
                <strong>{selectedDetails.plate || "-"}</strong>
              </div>

              <div style={detailsInfoCardStyle}>
                <span style={detailsInfoLabelStyle}>Criado por</span>
                <strong>{selectedDetails.createdByName || "-"}</strong>
              </div>
            </div>

            {selectedDetails.description && (
              <div style={detailsSectionStyle}>
                <div style={sectionHeaderStyle}>
                  <h4 style={sectionTitleStyle}>Descrição</h4>
                </div>
                <div style={detailsTextBoxStyle}>{selectedDetails.description}</div>
              </div>
            )}

            <TextBoxSection
              title="Texto responsáveis"
              text={selectedDetails.textoResponsaveis}
              onCopy={() => copyText(selectedDetails.textoResponsaveis)}
            />

            <TextBoxSection
              title="Texto motorista"
              text={selectedDetails.textoMotorista}
              onCopy={() => copyText(selectedDetails.textoMotorista)}
            />

            <TextBoxSection
              title="Texto interno"
              text={selectedDetails.textoInterno}
              onCopy={() => copyText(selectedDetails.textoInterno)}
            />
          </div>
        </div>
      )}

      {selectedOccurrence && (
        <div style={modalOverlayStyle}>
          <div style={editModalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0 }}>Editar ocorrência #{selectedOccurrence.id}</h3>

              <button
                type="button"
                onClick={closeEditModal}
                style={modalCloseButtonStyle}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={formGridStyle}>
                <div>
                  <label style={labelStyle}>Categoria</label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => handleEditCategoryChange(e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="">Selecione</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Protocolo</label>
                  <select
                    value={editForm.protocolId}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        protocolId: e.target.value,
                      }))
                    }
                    style={inputStyle}
                    required
                    disabled={!editForm.categoryId}
                  >
                    <option value="">Selecione</option>
                    {protocols.map((protocol) => (
                      <option key={protocol.id} value={protocol.id}>
                        {protocol.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Placa</label>
                  <input
                    type="text"
                    value={editForm.plate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        plate: e.target.value,
                      }))
                    }
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    style={textareaStyle}
                    rows={4}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Texto responsáveis</label>
                  <textarea
                    value={editForm.textoResponsaveis}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        textoResponsaveis: e.target.value,
                      }))
                    }
                    style={textareaStyle}
                    rows={5}
                    required
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Texto motorista</label>
                  <textarea
                    value={editForm.textoMotorista}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        textoMotorista: e.target.value,
                      }))
                    }
                    style={textareaStyle}
                    rows={5}
                    required
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Texto interno</label>
                  <textarea
                    value={editForm.textoInterno}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        textoInterno: e.target.value,
                      }))
                    }
                    style={textareaStyle}
                    rows={6}
                    required
                  />
                </div>
              </div>

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={secondaryButtonStyle}
                >
                  Fechar
                </button>

                <button
                  type="submit"
                  style={primaryButtonStyle}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TextBoxSection({ title, text, onCopy }) {
  return (
    <div style={detailsSectionStyle}>
      <div style={sectionHeaderStyle}>
        <h4 style={sectionTitleStyle}>{title}</h4>
        <button type="button" style={copyButtonStyle} onClick={onCopy}>
          Copiar
        </button>
      </div>
      <div style={detailsTextBoxStyle}>{text || "-"}</div>
    </div>
  );
}

const pageStyle = {
  padding: "24px",
};

const topHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "18px",
};

const titleStyle = {
  margin: 0,
  fontSize: "30px",
  color: "#0f172a",
  fontWeight: "800",
};

const subtitleStyle = {
  margin: "8px 0 0",
  color: "#64748b",
};

const tabsContainerStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const tabButtonStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  cursor: "pointer",
  fontWeight: "700",
  transition: "all 0.2s ease",
};

const errorStyle = {
  marginBottom: "16px",
  padding: "12px",
  borderRadius: "12px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};

const successStyle = {
  marginBottom: "16px",
  padding: "12px",
  borderRadius: "12px",
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #86efac",
};

const emptyStyle = {
  background: "white",
  padding: "26px",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  color: "#475569",
};

const tableCardStyle = {
  background: "white",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  overflow: "hidden",
};

const tableWrapperStyle = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1050px",
};

const thStyle = {
  textAlign: "left",
  padding: "16px",
  background: "#cbd5e1",
  borderBottom: "1px solid #94a3b8",
  color: "#1e293b",
  fontSize: "13px",
  fontWeight: "800",
  letterSpacing: "0.02em",
};

const trStyle = {
  transition: "background 0.2s ease",
};

const tdStyle = {
  padding: "16px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
  color: "#0f172a",
  fontSize: "14px",
};

const mainCellTextStyle = {
  fontWeight: "700",
  color: "#0f172a",
};

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
  whiteSpace: "nowrap",
};

const platePillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  fontWeight: "700",
  letterSpacing: "0.04em",
};

const rowActionsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  minWidth: "200px",
};

const primaryButtonStyle = {
  background: "#2563eb",
  color: "white",
  padding: "9px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const dangerButtonStyle = {
  background: "#dc2626",
  color: "white",
  padding: "9px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const warningButtonStyle = {
  background: "#f59e0b",
  color: "white",
  padding: "9px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const secondaryButtonStyle = {
  background: "#e2e8f0",
  color: "#0f172a",
  padding: "9px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const ghostButtonStyle = {
  background: "#ffffff",
  color: "#334155",
  border: "1px solid #cbd5e1",
  padding: "9px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const copyButtonStyle = {
  background: "#0f172a",
  color: "white",
  padding: "8px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "12px",
};

const paginationStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  borderTop: "1px solid #e2e8f0",
  flexWrap: "wrap",
};

const pageNumbersContainerStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const pageNumberButtonStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  cursor: "pointer",
  fontWeight: "700",
};

const activePageNumberButtonStyle = {
  background: "#0f172a",
  color: "white",
  border: "1px solid #0f172a",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 9999,
};

const detailsModalContentStyle = {
  width: "100%",
  maxWidth: "1080px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "white",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
};

const editModalContentStyle = {
  width: "100%",
  maxWidth: "1100px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "white",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "20px",
};

const detailsHeaderActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const detailsSubheaderStyle = {
  margin: "8px 0 0",
  color: "#64748b",
};

const modalCloseButtonStyle = {
  background: "transparent",
  fontSize: "28px",
  cursor: "pointer",
  lineHeight: 1,
  color: "#475569",
};

const detailsTopGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginBottom: "20px",
};

const detailsInfoCardStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "14px",
  display: "grid",
  gap: "6px",
};

const detailsInfoLabelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const detailsSectionStyle = {
  marginTop: "18px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "10px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#0f172a",
};

const detailsTextBoxStyle = {
  padding: "14px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  color: "#0f172a",
  lineHeight: 1.6,
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "700",
  color: "#0f172a",
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  resize: "vertical",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "20px",
  flexWrap: "wrap",
};

const codeCellStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const codeDateStyle = {
  fontSize: "12px",
  color: "#64748b",
  fontWeight: "500",
};