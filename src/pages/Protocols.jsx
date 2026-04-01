import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listProtocols, deleteProtocol } from "../services/protocolService";
import { listCategories } from "../services/categoryService";

export default function Protocols() {

    const navigate = useNavigate();

    const [protocols, setProtocols] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const protocolsData = await listProtocols();
            const categoriesData = await listCategories();

            setProtocols(protocolsData);
            setFiltered(protocolsData);
            setCategories(categoriesData);

        } catch (err) {
            console.error(err);
        }
    }

    async function handleDelete(id) {
        const confirmed = window.confirm("Deseja inativar este protocolo?");
        if (!confirmed) return;

        try {
            await deleteProtocol(id);
            await loadData();
        } catch (err) {
            console.error(err);
            alert(err.message || "Erro ao inativar protocolo.");
        }
    }

    useEffect(() => {
        let data = [...protocols];

        if (search) {
            data = data.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (categoryFilter) {
            data = data.filter(p =>
                String(p.categoryId) === String(categoryFilter)
            );
        }

        setFiltered(data);

    }, [search, categoryFilter, protocols]);

    return (
        <div style={pageStyle}>

            <div style={headerStyle}>
                <div>
                    <h1 style={titleStyle}>Protocolos</h1>
                    <p style={subtitleStyle}>
                        Gerencie os protocolos utilizados na criação de ocorrências.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/protocols/new")}
                    style={primaryButtonStyle}
                >
                    Novo protocolo
                </button>
            </div>

            {/* FILTROS */}

            <div style={filtersStyle}>

                <input
                    placeholder="Buscar protocolo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={inputStyle}
                />

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={inputStyle}
                >
                    <option value="">Todas categorias</option>

                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

            </div>

            {/* TABELA */}

            <table style={tableStyle}>

                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>Campos</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>

                    {filtered.map((protocol, index) => (

                        <tr
                            key={protocol.id}
                            style={{
                                background: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                                cursor: "pointer"
                            }}
                        >

                            <td style={tdStyle}>{protocol.name}</td>

                            <td style={tdStyle}>
                                {protocol.categoryName || "-"}
                            </td>

                            <td style={tdStyle}>
                                {protocol.fields?.length || 0} campos
                            </td>

                            <td style={tdStyle}>

                                <button
                                    style={editButtonStyle}
                                    onClick={() => navigate(`/protocols/${protocol.id}`)}
                                >
                                    Editar
                                </button>

                            </td>

                            <td style={tdStyle}>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    <button
                                        style={editButtonStyle}
                                        onClick={() => navigate(`/protocols/${protocol.id}`)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        style={deleteButtonStyle}
                                        onClick={() => handleDelete(protocol.id)}
                                    >
                                        Inativar
                                    </button>
                                </div>
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

const pageStyle = {
    display: "grid",
    gap: "20px",
};

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const titleStyle = {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
};

const subtitleStyle = {
    marginTop: "6px",
    color: "#64748b",
};

const filtersStyle = {
    display: "flex",
    gap: "12px",
};

const inputStyle = {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
};

const primaryButtonStyle = {
    background: "#2563eb",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
};

const editButtonStyle = {
    background: "#facc15",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
};

const deleteButtonStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "700",
};