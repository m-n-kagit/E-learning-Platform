import { useState } from "react";
import axios from "axios";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendQuestion = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading) return;
    setMessages((current) => [...current, { role: "user", content: text }]);
    setQuestion("");
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/chatbot/ask", { question: text });
      setMessages((current) => [...current, { role: "assistant", content: response.data.answer }]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.detail || "Unable to reach the course assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 1200, fontFamily: "inherit" }}>
      {open && (
        <section aria-label="Course assistant" style={{ width: "min(360px, calc(100vw - 32px))", height: 440, marginBottom: 12, display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #d8e2d4", borderRadius: 16, boxShadow: "0 12px 40px #14210f33", overflow: "hidden" }}>
          <header style={{ padding: "14px 16px", background: "#1f5c10", color: "white", fontWeight: 700 }}>Course assistant <span style={{ display: "block", fontWeight: 400, fontSize: 12, opacity: .85 }}>Answers from your course documents</span></header>
          <div aria-live="polite" style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {!messages.length && <p style={{ color: "#63715f", fontSize: 14 }}>Ask a question about the available course materials.</p>}
            {messages.map((message, index) => <div key={`${index}-${message.role}`} style={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", padding: "9px 11px", borderRadius: 12, background: message.role === "user" ? "#e8f2e4" : "#f3f5f2", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.45 }}>{message.content}</div>)}
            {loading && <div role="status" style={{ color: "#63715f", fontSize: 13 }}>Searching course materials…</div>}
            {error && <div role="alert" style={{ color: "#a32626", fontSize: 13 }}>{error}</div>}
          </div>
          <form onSubmit={sendQuestion} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e5e9e2" }}>
            <input aria-label="Your question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question…" maxLength={4000} style={{ flex: 1, minWidth: 0, padding: "10px 11px", border: "1px solid #ccd6c7", borderRadius: 9, font: "inherit" }} />
            <button type="submit" disabled={!question.trim() || loading} style={{ padding: "0 14px", border: 0, borderRadius: 9, background: "#1f5c10", color: "white", cursor: "pointer", opacity: !question.trim() || loading ? .55 : 1 }}>Send</button>
          </form>
        </section>
      )}
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} style={{ float: "right", border: 0, borderRadius: 999, padding: "13px 18px", background: "#1f5c10", color: "white", boxShadow: "0 4px 16px #14210f44", cursor: "pointer", font: "inherit", fontWeight: 700 }}>{open ? "Close assistant" : "Ask the course assistant"}</button>
    </div>
  );
}
