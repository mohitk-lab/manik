export default function BrainTab({ stats, skills }) {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 16, letterSpacing: 2 }}>
        BRAIN MAP
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Messages", value: stats.totalMsgs, color: "#ef4444" },
          { label: "Skills Active", value: stats.skillsUsed.size, color: "#f59e0b" },
          { label: "Streak", value: stats.streak, color: "#10b981" },
        ].map((st, i) => (
          <div key={i} style={{
            padding: 16, background: "#111", border: "1px solid #1a1a1a",
            borderRadius: 10, textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: st.color }}>{st.value}</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginTop: 4 }}>{st.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 10, letterSpacing: 1 }}>
        KNOWLEDGE TREE
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { cat: "CONTENT CREATION", skills: ["Promo Scriptwriter", "Creative Director", "Regional Language", "Script Converter"], color: "#ef4444" },
          { cat: "PRODUCTION TECH", skills: ["Remotion Engine", "ElevenLabs Voice", "Asset Pipeline", "Motion & Promo", "Video Analyst"], color: "#3b82f6" },
          { cat: "AI INFRASTRUCTURE", skills: ["AI Tool Architect", "DAKSH Orchestrator", "Dual Brain AI"], color: "#f59e0b" },
          { cat: "STRATEGY & INTEL", skills: ["McKinsey Research", "Competitor Intel", "Content Calendar", "OKR & Strategy"], color: "#10b981" },
        ].map((cat, i) => (
          <div key={i} style={{
            padding: "12px 16px", background: "#111",
            borderLeft: `3px solid ${cat.color}`,
            borderRadius: "0 8px 8px 0",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: cat.color, letterSpacing: 2, marginBottom: 6 }}>
              {cat.cat}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cat.skills.map((s, j) => {
                const skill = skills.find(sk => sk.name === s);
                const used = skill && stats.skillsUsed.has(skill.id);
                return (
                  <span key={j} style={{
                    fontSize: 10, padding: "3px 10px", borderRadius: 4,
                    background: used ? `${cat.color}20` : "#0a0a0a",
                    color: used ? cat.color : "#444",
                    border: `1px solid ${used ? cat.color + "40" : "#1a1a1a"}`,
                    fontFamily: "inherit",
                  }}>{skill?.icon} {s}</span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 24, padding: 16, background: "#111",
        border: "1px solid #1f1f1f", borderRadius: 10,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", letterSpacing: 2, marginBottom: 10 }}>
          IDENTITY
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 10, color: "#888" }}>
          <div><span style={{ color: "#555" }}>Name:</span> Manik (Mohit Kumar)</div>
          <div><span style={{ color: "#555" }}>Role:</span> Senior Promo Editor</div>
          <div><span style={{ color: "#555" }}>Company:</span> Stage OTT</div>
          <div><span style={{ color: "#555" }}>Market:</span> 200M+ households</div>
          <div><span style={{ color: "#555" }}>Stack:</span> React + FastAPI + Claude/Gemini</div>
          <div><span style={{ color: "#555" }}>Dialects:</span> BHO/HRY/RAJ/GUJ/MAR</div>
          <div><span style={{ color: "#555" }}>Moat:</span> Cultural Auth + AI Infra</div>
          <div><span style={{ color: "#555" }}>Mission:</span> Script→Promo in 20min</div>
        </div>
      </div>
    </div>
  );
}
