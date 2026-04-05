import { TIER_STYLE } from "../constants.js";

export default function ChatView({ messages, loading, activeSkills, quickActions, sendMessage, skills, stats, chatEndRef }) {
  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16, minHeight: "100%" }}>

      {messages.length === 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 24, padding: "40px 0" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: "linear-gradient(135deg, #ef4444 0%, #f97316 50%, #f59e0b 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, fontWeight: 900, color: "#000",
            boxShadow: "0 0 60px rgba(239,68,68,0.2)",
          }}>M</div>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 22, fontWeight: 800, letterSpacing: 3, marginBottom: 6,
              background: "linear-gradient(90deg, #ef4444, #f59e0b)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>MANIK.AI</div>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>
              FREE • OPEN-SOURCE • SELF-HOSTED AUTONOMOUS AI
            </div>
            <div style={{ fontSize: 10, color: "#333", marginTop: 4 }}>
              WhatsApp • Telegram • Calendar • Gmail • Smart Switching • Local-First
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 8, width: "100%", maxWidth: 640, marginTop: 8,
          }}>
            {quickActions.map((qa, i) => (
              <button key={i} onClick={() => sendMessage(qa.prompt)} style={{
                padding: "10px 12px", fontSize: 11, textAlign: "left",
                background: "#111", border: "1px solid #1f1f1f",
                borderRadius: 8, color: "#999", cursor: "pointer",
                transition: "all 0.2s", fontFamily: "inherit",
                lineHeight: 1.4,
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "#ef444450"; e.currentTarget.style.color = "#ccc"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "#1f1f1f"; e.currentTarget.style.color = "#999"; }}
              >{qa.label}</button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} style={{
          display: "flex", flexDirection: "column",
          alignItems: msg.role === "user" ? "flex-end" : "flex-start",
          gap: 4,
        }}>
          {/* Skill badges */}
          {msg.role === "assistant" && msg.skills?.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginLeft: 4, flexWrap: "wrap" }}>
              {msg.skills.map(s => (
                <span key={s.id} style={{
                  fontSize: 8, padding: "2px 6px", borderRadius: 3,
                  background: `${s.color}10`, color: `${s.color}aa`,
                  border: `1px solid ${s.color}20`, fontFamily: "inherit",
                }}>{s.icon} {s.name}</span>
              ))}
            </div>
          )}

          {/* Tool event blocks (tool_use + tool_result pairs) */}
          {msg.role === "assistant" && msg.events?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: "85%" }}>
              {msg.events.map((ev, j) => (
                <div key={j} style={{
                  padding: "8px 12px",
                  background: ev.type === "tool_use" ? "#0d1a2a" : "#0a1a0a",
                  border: `1px solid ${ev.type === "tool_use" ? "#3b82f630" : "#10b98130"}`,
                  borderRadius: 8, fontSize: 11, fontFamily: "inherit",
                }}>
                  {ev.type === "tool_use" && (
                    <div style={{ color: "#3b82f6" }}>
                      <span style={{ opacity: 0.6 }}>🔧 </span>
                      <span style={{ fontWeight: 700 }}>{ev.name}</span>
                      {ev.input && Object.keys(ev.input).length > 0 && (
                        <span style={{ color: "#555", marginLeft: 8, fontSize: 10 }}>
                          {Object.entries(ev.input).map(([k, v]) =>
                            `${k}: ${typeof v === "string" ? v.slice(0, 40) + (v.length > 40 ? "…" : "") : JSON.stringify(v)}`
                          ).join(" • ")}
                        </span>
                      )}
                    </div>
                  )}
                  {ev.type === "tool_result" && (
                    <div style={{ color: "#10b981" }}>
                      <span style={{ opacity: 0.7 }}>✓ </span>
                      <span style={{ fontWeight: 600 }}>{ev.name}: </span>
                      <span style={{ color: "#888", fontSize: 10 }}>
                        {typeof ev.result === "string" ? ev.result.split("\n")[0].slice(0, 80) : "done"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Main message bubble */}
          {(msg.role === "user" || msg.content) && (
            <div style={{
              maxWidth: "85%", padding: "12px 16px",
              background: msg.role === "user" ? "#1a1010" : "#111",
              border: `1px solid ${msg.role === "user" ? "#ef444420" : "#1f1f1f"}`,
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
              wordBreak: "break-word", color: "#d0d0d0",
            }}>
              {msg.content}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 4px" }}>
            <span style={{ fontSize: 8, color: "#333" }}>
              {new Date(msg.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {msg.tier && TIER_STYLE[msg.tier] && (
              <span style={{
                fontSize: 7, padding: "1px 5px", borderRadius: 3,
                background: TIER_STYLE[msg.tier].bg,
                color: TIER_STYLE[msg.tier].text,
                border: `1px solid ${TIER_STYLE[msg.tier].border}`,
                fontFamily: "inherit", letterSpacing: 0.5,
              }}>
                {TIER_STYLE[msg.tier].label}
              </span>
            )}
            {msg.tokens > 0 && (
              <span style={{ fontSize: 7, color: "#2a2a2a" }}>{msg.tokens}t</span>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%", background: "#ef4444",
                animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 10, color: "#555" }}>
            Manik.AI thinking... {activeSkills.length > 0 && `(${activeSkills.map(s => s.icon).join("")})`}
          </span>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}
