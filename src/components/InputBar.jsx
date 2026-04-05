export default function InputBar({ input, setInput, loading, sendMessage, skills, inputRef }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div style={{
      padding: "12px 16px", background: "#0d0d0d",
      borderTop: "1px solid #1a1a1a", flexShrink: 0,
    }}>
      <div style={{
        display: "flex", gap: 8, alignItems: "flex-end",
        background: "#111", border: "1px solid #1f1f1f",
        borderRadius: 12, padding: "8px 12px",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Bol bhai, kya banana hai..."
          rows={1}
          style={{
            flex: 1, background: "transparent", border: "none",
            color: "#d0d0d0", fontSize: 13, resize: "none",
            outline: "none", fontFamily: "inherit",
            lineHeight: 1.6, maxHeight: 120, overflowY: "auto",
          }}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 8, border: "none",
            background: input.trim() ? "linear-gradient(135deg, #ef4444, #f97316)" : "#1a1a1a",
            color: input.trim() ? "#000" : "#333",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            fontSize: 16, fontWeight: 900, flexShrink: 0,
            transition: "all 0.2s", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >→</button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 4px" }}>
        <div style={{ fontSize: 8, color: "#333" }}>
          Enter to send • Shift+Enter for newline
        </div>
        <div style={{ fontSize: 8, color: "#333" }}>
          {skills.length} skills loaded • Powered by Claude Sonnet
        </div>
      </div>
    </div>
  );
}
