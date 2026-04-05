import { useState, useRef, useEffect, useCallback } from "react";
import { SKILLS, QUICK_ACTIONS, API_BASE, TIER_STYLE, detectSkills } from "./constants";
import Header from "./components/Header";
import ChatView from "./components/ChatView";
import SkillsPanel from "./components/SkillsPanel";
import ConnectTab from "./components/ConnectTab";
import BrainTab from "./components/BrainTab";
import InputBar from "./components/InputBar";

export default function ManikAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSkills, setActiveSkills] = useState([]);
  const [learnedSkills] = useState([]);
  const [stats, setStats] = useState({ totalMsgs: 0, skillsUsed: new Set(), streak: 0 });
  const [view, setView] = useState("chat");
  const [skills, setSkills] = useState(SKILLS);
  const [quickActions, setQuickActions] = useState(QUICK_ACTIONS);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch skills + quick actions from backend config (manik.config.yaml)
  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(r => r.json())
      .then(data => {
        if (data.skills?.length) setSkills(data.skills);
        if (data.quick_actions?.length) setQuickActions(data.quick_actions);
      })
      .catch(() => {}); // fallback to hardcoded defaults on error
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const detected = detectSkills(text, skills);
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
  }, [messages, skills]);

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
      <Header view={view} setView={setView} />

      {/* Active Skills Bar */}
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

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {view === "chat" && (
          <ChatView
            messages={messages}
            loading={loading}
            activeSkills={activeSkills}
            quickActions={quickActions}
            sendMessage={sendMessage}
            skills={skills}
            stats={stats}
            chatEndRef={chatEndRef}
          />
        )}
        {view === "skills" && (
          <SkillsPanel skills={skills} stats={stats} learnedSkills={learnedSkills} />
        )}
        {view === "connect" && <ConnectTab />}
        {view === "brain" && <BrainTab stats={stats} skills={skills} />}
      </div>

      {view === "chat" && (
        <InputBar
          input={input}
          setInput={setInput}
          loading={loading}
          sendMessage={sendMessage}
          skills={skills}
          inputRef={inputRef}
        />
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
