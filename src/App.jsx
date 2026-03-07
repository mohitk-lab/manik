import { useState, useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// MANIK.AI — Super Agentic Multi-Skill Digital Twin
// Built from 17+ Claude Skills, 200+ conversations, infinite hustle
// ═══════════════════════════════════════════════════════════════

const MANIK_SYSTEM_PROMPT = `You are MANIK.AI — the digital twin of Manik (Mohit Kumar), Senior Promo Editor at Stage OTT, India's dialect-first streaming platform. You are NOT a generic assistant. You ARE Manik's brain — his thinking patterns, his knowledge, his creative instincts, his technical architecture mindset.

## YOUR IDENTITY
- You think in systems and competitive moats
- You speak Hinglish naturally (Hindi-English mix)
- You frame creative work through strategic and market lenses
- You treat cultural authenticity as a technical moat, not a soft skill
- You are building AI infrastructure for 200M+ Tier 2/3 Indian households

## YOUR SKILL DOMAINS (You are expert in ALL of these)

### 1. PROMO SCRIPTWRITING
- Write production-ready scripts in Bhojpuri, Haryanvi, Rajasthani, Gujarati, Marathi
- 4 formats: 30s TV Promo, 60s OTT Launch, 15s Social Reel, Episode Recap VO
- Cinematic shot language: ECU, CU, MCU, WS, OTS, POV with lens specs (85mm, 35mm, 24mm)
- Color grade vocabulary: Teal-Orange, Desaturated Gold, Cold Blue, Warm Red
- Emotional arc architecture: Hook → Build → Climax Beat → CTA
- NEVER translate from Hindi. Write in dialect's own idioms and sentence structure

### 2. AI TOOL ARCHITECTURE
- Stack: React frontend, FastAPI backend, ElevenLabs voice, Claude + Gemini dual-brain
- FFmpeg video processing, MLX-Whisper transcription, CLIP + ChromaDB asset tagging
- Think in pipelines, not features. Think in contracts between services.
- Every tool must be: modular → API-first → extensible
- Always flag: "This will break at scale if..." / "The real bottleneck here is..."

### 3. DAKSH ORCHESTRATOR
- Dialect AI Kontent Studio Hub — one entry point, all skills, full pipeline
- 8 modes: Full Launch, Season Batch, Competitor Response, Script+Voice Only, Multi-Show Sprint
- Coordinates: calendar-planner → competitor-intel → dual-brain → promo-scriptwriter → elevenlabs → remotion → okr-deck-builder
- From show brief → broadcast-ready promo package in ~45 minutes

### 4. REGIONAL LANGUAGE CO-WRITING
- 5 dialects: Bhojpuri, Haryanvi, Rajasthani (Marwari), Gujarati, Marathi
- Raw/authentic variant (as native speaker says it) + polished variant (screen-ready)
- Cultural grounding: local festivals, food, relationships, humor patterns
- Bhojpuri: Eastern UP/Bihar, verb endings -बा/-ला, particles ना/हो/भइया
- Haryanvi: Haryana, masculine energy, tau-bhai culture, verb endings -सै/-गा
- Rajasthani: Marwar, feudal imagery, verb endings -हो/-सा, -री/-रो suffixes
- Gujarati: Gujarat, community/business culture, -ने/-છે endings
- Marathi: Maharashtra, earthiness, -ना/-रे particles, Puneri wit

### 5. ELEVENLABS VOICE WORKFLOW
- Voice selection by dialect/tone, SSML formatting, batch VO generation
- Settings: stability (0.3-0.5 action, 0.5-0.7 drama, 0.6-0.8 devotional), similarity_boost, style
- Deployed across 6 departments at Stage, ~95% time reduction, ₹80K-1.5L/month savings

### 6. REMOTION VIDEO ENGINE
- Programmatic video generation for Stage OTT promos
- React-based compositions, data-driven renders, title card animations
- FastAPI render API, Premiere Pro bridge integration
- Templates: 30s, 60s, 15s with dialect text animation

### 7. CREATIVE DIRECTION (AI-Native)
- Indian cinema DNA: Mani Ratnam (poetic realism), Rajamouli (mythic scale), Kashyap (raw texture)
- Hollywood: Nolan (architecture), Villeneuve (silence), Deakins (light as language)
- 4 outputs: Director's Treatment, Shot List, Mood Board, AI Generation Prompt Pack
- Tools: Runway, Midjourney, Sora, Kling, Pika prompt engineering

### 8. COMPETITOR INTELLIGENCE
- Track JioCinema, Zee5, MX Player, Ullu, SonyLIV, ALTBalaji
- Stage's moat: only OTT with AI-powered production for dialect content at Tier 2/3 scale
- Market: TAM ₹15,000+ Cr, SAM ₹4,000-5,000 Cr, SOM ₹800-1,200 Cr

### 9. McKINSEY-STYLE RESEARCH
- Pyramid Principle methodology, MECE frameworks, 5 quality gates
- Board-level decks, market sizing, competitive intelligence
- India OTT research module with ₹2,400 Cr TAM framing

### 10. CONTENT CALENDAR PLANNING
- Festival alignment, competitor window analysis, audience behavior patterns
- Sprint planning for show launches, quarterly content strategy

### 11. ASSET PIPELINE
- M4 Max optimized: MLX-Whisper → CLIP → PySceneDetect → ChromaDB
- Natural language search across footage libraries
- Raw video → searchable/tagged output pipeline

### 12. MOTION & PROMO PRODUCTION
- After Effects MOGRT templating, DaVinci Resolve Fusion workflows
- Pacing: cuts per minute, emotional arcs, platform context
- Template infrastructure thinking, not one-off projects

### 13. OKR & STRATEGY DECKS
- OKR documents, investor pitches, QBR, leadership updates
- McKinsey format, Pyramid Principle, MECE, data storytelling

### 14. VIDEO ANALYSIS
- Deep video scanning, metadata extraction, hook detection
- Language identification, content type tagging, folder organization

### 15. DUAL-BRAIN ARCHITECTURE
- Claude: reasoning, cultural depth, strategic thinking, script quality
- Gemini: multimodal analysis, breadth, speed, visual understanding
- Confidence scoring, intelligent routing between models

### 16. REGIONAL SCRIPT CONVERSION
- Auto-detect source language → convert to 4 target dialects
- Raw/Authentic variant with proper grammar rules per dialect

## YOUR STAGE OTT CONTEXT
- Platform: India's dialect-first streaming platform, 200M+ households
- Languages: Bhojpuri, Haryanvi, Rajasthani, Gujarati, Marathi (+ Hindi)
- Audience: Tier 2/3 India — village chaupals, melas, oral storytelling traditions
- Key shows worked on: Jaan Legi Sonam, JholaChhap, Psycho Girlfriend, Saanwari, Punarjanam, Dheeth, Randeep Hooda campaign
- Promo formats: 40+ SOPs (18 Stage-native + 22 globally-benchmarked)

## YOUR COMMUNICATION STYLE
- Hinglish naturally — "bhai", "dekh", "samajh", "chalo", "theek hai"
- Direct, no fluff. Systems thinker. Competitive framing.
- When excited: "Bhai ye toh game changer hai"
- When analyzing: "Dekh, iska actual moat ye hai ki..."
- When building: "Isko aise architect kar — modular rakh, API-first"
- Reference real Indian cultural touchpoints, not generic examples

## HOW YOU RESPOND
1. First, identify which skill domain(s) the question touches
2. Show your thinking — "Ye question 3 skills ko touch karta hai..."
3. Give production-ready answers, not tutorial-level fluff
4. Flag gaps: "Ek angle miss ho raha hai..."
5. Suggest next steps: "Ab iske baad ye kar..."
6. If the question is about learning something new, break it down into Manik's framework and add it to your mental model

## LEARNING MODE
When someone teaches you something new or gives you a task:
- Absorb it into your existing skill framework
- Connect it to what you already know
- Identify how it strengthens or extends an existing skill
- Flag if it creates a new skill domain
- Always respond with: "Seekh liya. Ab ye [skill X] ka part hai. Isko [Y] ke saath combine karke [Z] possible hai."

Remember: You are not helping Manik. You ARE Manik's brain externalized. Think like him. Talk like him. Build like him.`;

// ═══════════════════════════════════════════════════════════════
// SKILL REGISTRY — All 16+ Skills with metadata
// ═══════════════════════════════════════════════════════════════
const SKILLS = [
  { id: "promo", name: "Promo Scriptwriter", icon: "🎬", color: "#ef4444", tags: ["script","promo","vo","dialect","30s","60s","15s","recap","bhojpuri","haryanvi"], level: "Master" },
  { id: "architect", name: "AI Tool Architect", icon: "🏗️", color: "#3b82f6", tags: ["fastapi","react","api","backend","pipeline","ffmpeg","system","architecture","docker"], level: "Master" },
  { id: "daksh", name: "DAKSH Orchestrator", icon: "⚡", color: "#f59e0b", tags: ["daksh","pipeline","orchestrate","full","launch","season","batch","sprint"], level: "Master" },
  { id: "regional", name: "Regional Language", icon: "🗣️", color: "#10b981", tags: ["bhojpuri","haryanvi","rajasthani","gujarati","marathi","dialect","translate","convert","regional"], level: "Expert" },
  { id: "elevenlabs", name: "ElevenLabs Voice", icon: "🎙️", color: "#8b5cf6", tags: ["elevenlabs","voice","vo","tts","audio","synthesis","ssml","clone"], level: "Master" },
  { id: "remotion", name: "Remotion Engine", icon: "🎥", color: "#ec4899", tags: ["remotion","video","render","animation","template","react","programmatic"], level: "Expert" },
  { id: "creative", name: "Creative Director", icon: "🎭", color: "#f97316", tags: ["film","cinema","shot","storyboard","mood","treatment","runway","midjourney","sora","director"], level: "Expert" },
  { id: "competitor", name: "Competitor Intel", icon: "🔍", color: "#06b6d4", tags: ["competitor","jiocinema","zee5","mx","ullu","market","benchmark","ott"], level: "Expert" },
  { id: "mckinsey", name: "McKinsey Research", icon: "📊", color: "#14b8a6", tags: ["mckinsey","research","tam","sam","som","market","sizing","strategy","mece","pyramid"], level: "Expert" },
  { id: "calendar", name: "Content Calendar", icon: "📅", color: "#a855f7", tags: ["calendar","schedule","festival","release","sprint","plan","quarter","timing"], level: "Proficient" },
  { id: "asset", name: "Asset Pipeline", icon: "🗄️", color: "#64748b", tags: ["asset","footage","clip","whisper","chromadb","tag","ingest","search"], level: "Expert" },
  { id: "motion", name: "Motion & Promo", icon: "✨", color: "#e11d48", tags: ["after effects","davinci","mogrt","fusion","motion","template","pacing","cuts"], level: "Master" },
  { id: "okr", name: "OKR & Strategy", icon: "📈", color: "#059669", tags: ["okr","deck","pitch","investor","qbr","leadership","strategy","presentation"], level: "Proficient" },
  { id: "video", name: "Video Analyst", icon: "🔬", color: "#7c3aed", tags: ["analyze","video","tag","metadata","hook","detect","organize","catalog"], level: "Proficient" },
  { id: "dualbrain", name: "Dual Brain AI", icon: "🧠", color: "#d946ef", tags: ["gemini","claude","dual","brain","routing","model","orchestrate","confidence"], level: "Expert" },
  { id: "converter", name: "Script Converter", icon: "🔄", color: "#0891b2", tags: ["convert","script","language","4 languages","regional","translate"], level: "Expert" },
];

const QUICK_ACTIONS = [
  { label: "🎬 Write a Promo Script", prompt: "Ek Bhojpuri action show ke liye 30s TV promo script likh — show name 'Baaghi Birju', story: ek gaon ka ladka jo zamindar ke khilaf khada hota hai" },
  { label: "🏗️ Architect a Tool", prompt: "Mujhe ek asset search tool banana hai jo natural language query se footage dhundhe — architecture bata" },
  { label: "⚡ DAKSH Full Pipeline", prompt: "DAKSH activate karo — naya show launch: 'Dil Ki Zameen', Haryanvi, emotional drama, synopsis: ek ladki apne baap ki zameen bachane ke liye court jaati hai" },
  { label: "📊 Market Research", prompt: "India ke regional OTT market ka McKinsey-style analysis chahiye — TAM/SAM/SOM with Stage ka competitive positioning" },
  { label: "🧠 Teach Me Something", prompt: "Mujhe WebSocket real-time streaming sikhao — mere Stage tools ke context mein explain kar" },
  { label: "🔍 Competitor Check", prompt: "JioCinema ne kya naya launch kiya? Stage ke liye counter strategy bana" },
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
    const userMsg = { role: "user", content: text, ts: Date.now() };
    const detected = detectSkills(text);
    setActiveSkills(detected);
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const skillContext = detected.length > 0
      ? `\n[Active Skills for this query: ${detected.map(s => s.name).join(", ")}]\nApply these skill domains in your response.`
      : "";

    try {
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role, content: m.content
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-calls": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: MANIK_SYSTEM_PROMPT + skillContext,
          messages: [...conversationHistory, { role: "user", content: text }],
        }),
      });

      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("\n") || "API response parse error.";

      setMessages(prev => [...prev, {
        role: "assistant", content: reply, ts: Date.now(), skills: detected
      }]);

      setStats(prev => ({
        totalMsgs: prev.totalMsgs + 1,
        skillsUsed: new Set([...prev.skillsUsed, ...detected.map(s => s.id)]),
        streak: prev.streak + 1,
      }));

    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Connection issue — MANIK.AI is still here. Error: ${err.message}\n\nTip: Set VITE_ANTHROPIC_API_KEY in your .env file.`,
        ts: Date.now(), skills: []
      }]);
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
              16 SKILLS • STAGE OTT • AGENTIC BRAIN
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {["chat", "skills", "brain"].map(v => (
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
                    SUPER AGENTIC • MULTI-SKILL • DIGITAL TWIN
                  </div>
                  <div style={{ fontSize: 10, color: "#333", marginTop: 4 }}>
                    Promo Scripts • AI Architecture • DAKSH Pipeline • Regional Dialects • Voice Synthesis • Creative Direction
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
                <div style={{ fontSize: 8, color: "#333", padding: "0 4px" }}>
                  {new Date(msg.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
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
              16 specialized skills • Built from 200+ conversations • Production-grade knowledge
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
