import { useParams } from "react-router-dom";
import { useState } from "react";
import { mockOccurrences } from "../mocks/occurrences";

export default function OccurrenceDetails() {

  const { id } = useParams();

  const occurrence = mockOccurrences.find(o => o.id === Number(id));

  const [comments, setComments] = useState([
    { id: 1, author: "Operador", text: "Evento identificado." }
  ]);

  const [newComment, setNewComment] = useState("");

  function addComment() {

    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: "Operador",
      text: newComment
    };

    setComments([...comments, comment]);
    setNewComment("");
  }

  if (!occurrence) {
    return <div style={{ padding: "30px" }}>Ocorrência não encontrada</div>;
  }

  return (
    <div style={{ padding: "30px" }}>

      <h1>Ocorrência #{occurrence.id}</h1>

      <p><strong>Status:</strong> {occurrence.status}</p>
      <p><strong>Categoria:</strong> {occurrence.categoryName}</p>
      <p><strong>Placa:</strong> {occurrence.plate}</p>
      <p><strong>Título:</strong> {occurrence.title}</p>

      <h2 style={{ marginTop: "30px" }}>Comentários</h2>

      <div style={{ marginBottom: "20px" }}>

        {comments.map(c => (
          <div
            key={c.id}
            style={{
              padding: "10px",
              background: "#f1f5f9",
              marginBottom: "10px",
              borderRadius: "6px"
            }}
          >
            <strong>{c.author}:</strong> {c.text}
          </div>
        ))}

      </div>

      <div style={{ display: "flex", gap: "10px" }}>

        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicionar comentário..."
          style={{ flex: 1 }}
        />

        <button onClick={addComment}>
          Enviar
        </button>

      </div>

    </div>
  );
}