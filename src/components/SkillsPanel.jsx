export default function SkillsPanel({ skills, stats, learnedSkills }) {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 4, letterSpacing: 2 }}>
        SKILL REGISTRY
      </div>
      <div style={{ fontSize: 10, color: "#555", marginBottom: 20 }}>
        18 specialized skills • WhatsApp + Telegram + Calendar + Gmail • Smart Switching
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {skills.map(s => {
          const used = stats.skillsUsed.has(s.id);
          return (
            <div key={s.id} style={{
              padding: "14px 16px", background: "#111",
              border: `1px solid ${used ? s.color + "40" : "#1a1a1a"}`,
              borderRadius: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.name}</span>
                </div>
                <span style={{
                  fontSize: 8, padding: "2px 8px", borderRadius: 4,
                  background: s.level === "Master" ? "#ef444420" : s.level === "Expert" ? "#f59e0b20" : "#3b82f620",
                  color: s.level === "Master" ? "#ef4444" : s.level === "Expert" ? "#f59e0b" : "#3b82f6",
                  fontWeight: 600, letterSpacing: 1, fontFamily: "inherit",
                }}>{s.level.toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {s.tags.slice(0, 6).map((t, idx) => (
                  <span key={idx} style={{
                    fontSize: 8, padding: "1px 6px", borderRadius: 3,
                    background: "#1a1a1a", color: "#666", fontFamily: "inherit",
                  }}>{t}</span>
                ))}
              </div>
              {used && (
                <div style={{ marginTop: 6, fontSize: 8, color: "#10b981" }}>
                  ● Used in this session
                </div>
              )}
            </div>
          );
        })}
      </div>

      {learnedSkills.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981", marginBottom: 8, letterSpacing: 1 }}>
            NEW — LEARNED THIS SESSION
          </div>
          {learnedSkills.map((ls, i) => (
            <div key={i} style={{
              padding: 10, background: "#0a1a0a", border: "1px solid #10b98130",
              borderRadius: 8, fontSize: 11, color: "#10b981", marginBottom: 6,
            }}>{ls}</div>
          ))}
        </div>
      )}
    </div>
  );
}
