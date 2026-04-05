export default function ConnectTab() {
  return (
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
  );
}
