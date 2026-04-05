// ═══════════════════════════════════════════════════════════════
// MANIK.AI v2 — Free, Open-Source, Self-Hosted Autonomous AI Agent
// Connects AI to WhatsApp/Telegram • Smart model switching • Local-first
// ═══════════════════════════════════════════════════════════════

export const TIER_STYLE = {
  mini:     { bg: "#0a1a0a", border: "#10b98140", text: "#10b981", label: "⚡ MINI" },
  standard: { bg: "#0a0a1a", border: "#3b82f640", text: "#3b82f6", label: "◈ STD"  },
  power:    { bg: "#1a0a0a", border: "#ef444440", text: "#ef4444", label: "◉ POWER"},
};

// ═══════════════════════════════════════════════════════════════
// SKILL REGISTRY — 18 Skills
// ═══════════════════════════════════════════════════════════════
export const SKILLS = [
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

export const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const QUICK_ACTIONS = [
  { label: "🎬 Write a Promo Script", prompt: "Ek Bhojpuri action show ke liye 30s TV promo script likh — show name 'Baaghi Birju', story: ek gaon ka ladka jo zamindar ke khilaf khada hota hai" },
  { label: "🏗️ Architect a Tool", prompt: "Mujhe ek asset search tool banana hai jo natural language query se footage dhundhe — architecture bata" },
  { label: "⚡ DAKSH Full Pipeline", prompt: "DAKSH activate karo — naya show launch: 'Dil Ki Zameen', Haryanvi, emotional drama, synopsis: ek ladki apne baap ki zameen bachane ke liye court jaati hai" },
  { label: "📊 Market Research", prompt: "India ke regional OTT market ka McKinsey-style analysis chahiye — TAM/SAM/SOM with Stage ka competitive positioning" },
  { label: "💬 WhatsApp Setup Guide", prompt: "Mujhe step-by-step batao MANIK.AI ko WhatsApp se kaise connect karun — Meta Cloud API free setup" },
  { label: "🔀 Smart Router Test", prompt: "Explain how your smart model routing works — which tier would you pick for different types of tasks and why?" },
];

export function detectSkills(msg, skillList) {
  const lower = msg.toLowerCase();
  const activated = [];
  for (const skill of skillList) {
    const matchCount = (skill.tags || []).filter(t => lower.includes(t)).length;
    if (matchCount > 0) activated.push({ ...skill, matchCount });
  }
  activated.sort((a, b) => b.matchCount - a.matchCount);
  return activated.slice(0, 4);
}
