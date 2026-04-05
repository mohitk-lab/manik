export default function Header({ view, setView }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0f0f0f 0%, #1a0a0a 50%, #0f0f0f 100%)",
      borderBottom: "1px solid #1f1f1f",
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 900, color: "#000",
          boxShadow: "0 0 20px rgba(239,68,68,0.3)",
        }}>M</div>
        <div>
          <div style={{
            fontSize: 16, fontWeight: 700, letterSpacing: 2,
            background: "linear-gradient(90deg, #ef4444, #f59e0b, #ef4444)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>MANIK.AI</div>
          <div style={{ fontSize: 9, color: "#666", letterSpacing: 1 }}>
            18 SKILLS • WHATSAPP • TELEGRAM • SMART ROUTING
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        {["chat", "skills", "connect", "brain"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "6px 14px", fontSize: 10, fontWeight: 600,
            background: view === v ? "#ef4444" : "#1a1a1a",
            color: view === v ? "#000" : "#888",
            border: `1px solid ${view === v ? "#ef4444" : "#2a2a2a"}`,
            borderRadius: 6, cursor: "pointer", textTransform: "uppercase",
            letterSpacing: 1, transition: "all 0.2s",
            fontFamily: "inherit",
          }}>{v}</button>
        ))}
      </div>
    </div>
  );
}
