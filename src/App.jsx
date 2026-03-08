import { useState, useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// MANIK.AI v2 — Free, Open-Source, Self-Hosted Autonomous AI Agent
// Connects AI to WhatsApp/Telegram • Smart model switching • Local-first
// ═══════════════════════════════════════════════════════════════

const TIER_STYLE = {
  mini:     { bg: "#0a1a0a", border: "#10b98140", text: "#10b981", label: "⚡ MINI" },
  standard: { bg: "#0a0a1a", border: "#3b82f640", text: "#3b82f6", label: "◈ STD"  },
  power:    { bg: "#1a0a0a", border: "#ef444440", text: "#ef4444", label: "◉ POWER"},
};

// ═══════════════════════════════════════════════════════════════
// SKILL REGISTRY — 18 Skills
// ═══════════════════════════════════════════════════════════════
const SKILLS = [
  { id: "promo",     name: "Promo Scriptwriter",   icon: "🎬", color: "#ef4444", tags: ["script","promo","vo","dialect","30s","60s","15s","recap","bhojpuri","haryanvi"], level: "Master" },
  { id: "architect", name: "AI Tool Architect",     icon: "🏗️", color: "#3b82f6", tags: ["fastapi","react","api","backend","pipeline","ffmpeg","system","architecture","docker"], level: "Master" },
  { id: "daksh",     name: "DAKSH Orchestrator",    icon: "⚡", color: "#f59e0b", tags: ["daksh","pipeline","orchestrate","full","launch","season","batch","sprint"], level: "Master" },
  { id: "regional",  name: "Regional Language",     icon: "🗣️", color: "#10b981", tags: ["bhojpuri","haryanvi","rajasthani","gujarati","marathi","dialect","translate","convert","regional"], level: "Expert" },
  { id: "elevenlabs",name: "ElevenLabs Voice",      icon: "🎙️", color: "#8b5cf6", tags: ["elevenlabs","voice","vo","tts","audio","synthesis","ssml","clone"], level: "Master" },
  { id: "remotion",  name: "Remotion Engine",       icon: "🎥", color: "#ec4899", tags: ["remotion","video","render","animation","template","react","programmatic"], level: "Expert" },
  { id: "creative",  name: "Creative Director",     icon: "🎭", color: "#f97316", tags: ["film","cinema","shot","storyboard","mood","treatment","runway","midjourney","sora","director"], level: "Expert" },
  { id: "competitor",name: "Competitor Intel",      icon: "🔍", color: "#06b6d4", tags: ["competitor","jiocinema","zee5","mx","ullu","market","benchmark","ott"], level: "Expert" },
  { id: "mckinsey",  name: "McKinsey Research",     icon: "📊", color: "#14b8a6", tags: ["mckinsey","research","tam","sam","som","market","sizing","strategy","mece","pyramid"], level: "Expert" },
  { id: "calendar",  name: "Calendar & Gmail",      icon: "📅", color: "#a855f7", tags: ["calendar","schedule","festival","release","sprint","plan","quarter","timing","gmail","email","inbox"], level: "Proficient" },
  { id: "asset",     name: "Asset Pipeline",        icon: "🗄️", color: "#64748b", tags: ["asset","footage","clip","whisper","chromadb","tag","ingest","search"], level: "Expert" },
  { id: "motion",    name: "Motion & Promo",        icon: "✨", color: "#e11d48", tags: ["after effects","davinci","mogrt","fusion","motion","template","pacing","cuts"], level: "Master" },
  { id: "okr",       name: "OKR & Strategy",        icon: "📈", color: "#059669", tags: ["okr","deck","pitch","investor","qbr","leadership","strategy","presentation"], level: "Proficient" },
  { id: "video",     name: "Video Analyst",         icon: "🔬", color: "#7c3aed", tags: ["analyze","video","tag","metadata","hook","detect","organize","catalog"], level: "Proficient" },
  { id: "whatsapp",  name: "WhatsApp Automation",   icon: "💬", color: "#25d366", tags: ["whatsapp","message","chat","automate","bot","wa","notify","send"], level: "Expert" },
  { id: "telegram",  name: "Telegram Bot",          icon: "✈️", color: "#229ed9", tags: ["telegram","bot","channel","group","notify","message","broadcast"], level: "Expert" },
  { id: "smartroute",name: "Smart Model Router",    icon: "🔀", color: "#f59e0b", tags: ["smart","route","model","cost","token","mini","standard","power","cheap","optimize"], level: "Master" },
  { id: "converter", name: "Script Converter",      icon: "🔄", color: "#0891b2", tags: ["convert","script","language","4 languages","regional","translate"], level: "Expert" },
];

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const QUICK_ACTIONS = [
  { label: "🎬 Write a Promo Script", prompt: "Ek Bhojpuri action show ke liye 30s TV promo script likh — show name 'Baaghi Birju', story: ek gaon ka ladka jo zamindar ke khilaf khada hota hai" },
  { label: "🏗️ Architect a Tool", prompt: "Mujhe ek asset search tool banana hai jo natural language query se footage dhundhe — architecture bata" },
  { label: "⚡ DAKSH Full Pipeline", prompt: "DAKSH activate karo — naya show launch: 'Dil Ki Zameen', Haryanvi, emotional drama, synopsis: ek ladki apne baap ki zameen bachane ke liye court jaati hai" },
  { label: "📊 Market Research", prompt: "India ke regional OTT market ka McKinsey-style analysis chahiye — TAM/SAM/SOM with Stage ka competitive positioning" },
  { label: "💬 WhatsApp Setup Guide", prompt: "Mujhe step-by-step batao MANIK.AI ko WhatsApp se kaise connect karun — Meta Cloud API free setup" },
  { label: "🔀 Smart Router Test", prompt: "Explain how your smart model routing works — which tier would you pick for different types of tasks and why?" },
];

function detectSkills(msg) {
  const lower = msg.toLowerCase();
  const activated = [];
  for (const skill of SKILLS) {
    const matchCount = skill.tags.filter(t => lower.includes(t)).length;
    if (matchCount > 0) activated.push({ ...skill, matchCount });
  }
  activated.sort((a, b) => b.matchCount - a.matchCount);
  return activated.slice(0, 4);
}

export default function ManikAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSkills, setActiveSkills] = useState([]);
  const [learnedSkills] = useState([]);
  const [stats, setStats] = useState({ totalMsgs: 0, skillsUsed: new Set(), streak: 0 });
  const [view, setView] = useState("chat");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const detected = detectSkills(text);
    setActiveSkills(detected);
    setMessages(prev => [...prev, { role: "user", content: text, ts: Date.now() }]);
    setInput("");
    setLoading(true);

    const skillContext = detected.length > 0
      ? `\n[Active Skills for this query: ${detected.map(s => s.name).join(", ")}]\nApply these skill domains in your response.`
      : "";

    // Placeholder assistant message we'll build up incrementally
    const assistantId = Date.now();
    setMessages(prev => [...prev, {
      role: "assistant", content: "", ts: assistantId, skills: detected, events: []
    }]);

    try {
      const conversationHistory = messages
        .filter(m => m.role === "user" || (m.role === "assistant" && m.content))
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...conversationHistory, { role: "user", content: text }],
          system_extra: skillContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Backend error ${res.status}: ${await res.text()}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            if (event.type === "model_selected") {
              setMessages(prev => prev.map(m =>
                m.ts === assistantId
                  ? { ...m, tier: event.tier, model: event.model }
                  : m
              ));
            } else if (event.type === "text") {
              setMessages(prev => prev.map(m =>
                m.ts === assistantId
                  ? { ...m, content: m.content + event.content }
                  : m
              ));
            } else if (event.type === "tool_use" || event.type === "tool_result") {
              setMessages(prev => prev.map(m =>
                m.ts === assistantId
                  ? { ...m, events: [...(m.events || []), event] }
                  : m
              ));
            } else if (event.type === "done") {
              setMessages(prev => prev.map(m =>
                m.ts === assistantId
                  ? { ...m, tokens: event.tokens }
                  : m
              ));
              setStats(prev => ({
                totalMsgs: prev.totalMsgs + 1,
                skillsUsed: new Set([...prev.skillsUsed, ...detected.map(s => s.id)]),
                streak: prev.streak + 1,
              }));
            }
          } catch (_) { /* ignore malformed SSE line */ }
        }
      }

    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.ts === assistantId
          ? { ...m, content: `Connection issue — MANIK.AI is still here. Error: ${err.message}\n\nTip: Start the backend with: cd backend && uvicorn main:app --reload` }
          : m
      ));
    }
    setLoading(false);
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
      background: "#0a0a0a",
      color: "#e0e0e0",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* ─── HEADER ─── */}
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

      {/* ─── ACTIVE SKILLS BAR ─── */}
      {activeSkills.length > 0 && view === "chat" && (
        <div style={{
          padding: "6px 20px", background: "#0d0d0d",
          borderBottom: "1px solid #1a1a1a",
          display: "flex", alignItems: "center", gap: 8,
          flexShrink: 0, overflow: "auto",
        }}>
          <span style={{ fontSize: 9, color: "#555", letterSpacing: 1, flexShrink: 0 }}>ACTIVE:</span>
          {activeSkills.map(s => (
            <span key={s.id} style={{
              fontSize: 10, padding: "3px 10px", borderRadius: 4,
              background: `${s.color}15`, color: s.color,
              border: `1px solid ${s.color}30`, whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}>{s.icon} {s.name}</span>
          ))}
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ flex: 1, overflow: "auto" }}>

        {/* CHAT VIEW */}
        {view === "chat" && (
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
                  {QUICK_ACTIONS.map((qa, i) => (
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
        )}

        {/* SKILLS VIEW */}
        {view === "skills" && (
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 4, letterSpacing: 2 }}>
              SKILL REGISTRY
            </div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 20 }}>
              18 specialized skills • WhatsApp + Telegram + Calendar + Gmail • Smart Switching
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {SKILLS.map(s => {
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
        )}

        {/* CONNECT VIEW */}
        {view === "connect" && (
          <div style={{ padding: 20, maxWidth: 720 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#25d366", marginBottom: 4, letterSpacing: 2 }}>
              CONNECTORS
            </div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 20 }}>
              Connect MANIK.AI to messaging apps and Google services via .env settings
            </div>

            {[
              {
                icon: "💬", name: "WhatsApp", color: "#25d366",
                envVars: ["WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_VERIFY_TOKEN"],
                steps: [
                  "Go to developers.facebook.com → Create App → WhatsApp",
                  "Get Phone Number ID + Permanent Access Token",
                  "Set webhook URL: https://your-domain/api/whatsapp/webhook",
                  "Add env vars and restart backend",
                ],
                webhook: "/api/whatsapp/webhook",
              },
              {
                icon: "✈️", name: "Telegram", color: "#229ed9",
                envVars: ["TELEGRAM_BOT_TOKEN"],
                steps: [
                  "Open Telegram → message @BotFather",
                  "/newbot → follow prompts → copy the token",
                  "Add TELEGRAM_BOT_TOKEN to .env",
                  "Restart backend — bot starts polling automatically",
                ],
                webhook: null,
              },
              {
                icon: "📅", name: "Google Calendar + Gmail", color: "#a855f7",
                envVars: ["GOOGLE_TOKEN_JSON", "GOOGLE_CREDENTIALS_JSON"],
                steps: [
                  "console.cloud.google.com → Enable Calendar API + Gmail API",
                  "Create OAuth2 credentials → download credentials.json",
                  "Run: cd backend && python setup_google.py",
                  "Paste output token JSON into GOOGLE_TOKEN_JSON env var",
                ],
                webhook: null,
              },
              {
                icon: "🔀", name: "Smart Model Switching", color: "#f59e0b",
                envVars: ["SMART_ROUTING", "MODEL_MINI", "MODEL_STANDARD", "MODEL_POWER"],
                steps: [
                  "Set SMART_ROUTING=true (default) in .env",
                  "Customize MODEL_MINI, MODEL_STANDARD, MODEL_POWER",
                  "Watch the tier badge (MINI/STD/POWER) on each response",
                  "Simple queries auto-route to cheaper models — saves ~70% cost",
                ],
                webhook: null,
              },
            ].map((c) => (
              <div key={c.name} style={{
                marginBottom: 16, padding: "16px 18px", background: "#111",
                border: `1px solid ${c.color}20`, borderRadius: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <span style={{ fontWeight: 700, color: c.color, fontSize: 13, letterSpacing: 1 }}>{c.name}</span>
                  {c.webhook && (
                    <span style={{ fontSize: 9, color: "#555", marginLeft: "auto", fontFamily: "inherit" }}>
                      webhook: {c.webhook}
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: 10 }}>
                  {c.steps.map((step, i) => (
                    <div key={i} style={{ fontSize: 11, color: "#888", marginBottom: 4, display: "flex", gap: 8 }}>
                      <span style={{ color: c.color, opacity: 0.6, flexShrink: 0 }}>{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {c.envVars.map(v => (
                    <code key={v} style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 3,
                      background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#888",
                      fontFamily: "inherit",
                    }}>{v}</code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BRAIN VIEW */}
        {view === "brain" && (
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
                      const skill = SKILLS.find(sk => sk.name === s);
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
        )}
      </div>

      {/* ─── INPUT BAR ─── */}
      {view === "chat" && (
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
              {SKILLS.length} skills loaded • Powered by Claude Sonnet
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        textarea::placeholder { color: #444; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #333; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
