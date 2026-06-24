// ===== Shared UI: Sidebar, TopBar, Badge, Card, etc. =====

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "predictive", label: "Predictive Maintenance", icon: "wrench" },
  { id: "drivers", label: "Driver Scoring", icon: "gauge" },
  { id: "fuelmap", label: "Peta Efisiensi", icon: "map" },
  { id: "mechanic", label: "Virtual Mechanic", icon: "chat" },
];

const SCREEN_TITLES = {
  dashboard: "Dashboard Ringkasan",
  predictive: "Predictive Maintenance",
  drivers: "Driver Behavior Scoring",
  fuelmap: "Peta Efisiensi BBM",
  mechanic: "Virtual Mechanic",
};

function Sidebar({ active, onNav }) {
  return (
    <aside style={{ width: 240, flex: "0 0 240px", background: "var(--primary)", color: "#fff",
      display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ padding: "22px 22px 18px", display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#1E5BB8,#3f7fe0)",
          display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(30,91,184,.5)" }}>
          <Icon name="truck" size={19} stroke={2.2} />
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.01em", whiteSpace: "nowrap" }}>UD FleetSight</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.5)", fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase" }}>Fleet Analytics</div>
        </div>
      </div>

      <nav style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 3, marginTop: 6 }}>
        {NAV.map((n) => {
          const on = active === n.id;
          return (
            <button key={n.id} onClick={() => onNav(n.id)}
              style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: "11px 14px", borderRadius: 9, border: "none", textAlign: "left",
                background: on ? "rgba(30,91,184,.32)" : "transparent",
                color: on ? "#fff" : "rgba(255,255,255,.62)",
                fontSize: 13.5, fontWeight: on ? 700 : 500, transition: "all .16s", fontFamily: "var(--sans)" }}
              onMouseEnter={(e) => { if (!on) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={(e) => { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.62)"; } }}>
              {on && <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 3, background: "#5fa0ff" }} />}
              <Icon name={n.icon} size={18} stroke={on ? 2.3 : 2} />
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.id === "predictive" && <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--danger)", animation: "pulseDot 1.8s infinite" }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: "16px 22px 20px" }}>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.45)", fontWeight: 500, letterSpacing: ".02em" }}>v2.4.1 — Juni 2026</div>
      </div>
    </aside>
  );
}

function TopBar({ screen, notifCount = 3, onNav }) {
  const [open, setOpen] = React.useState(false);
  return (
    <header style={{ height: 64, flex: "0 0 64px", background: "var(--surface)", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", padding: "0 32px", gap: 16, position: "relative", zIndex: 5 }}>
      <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-.02em", color: "var(--text)" }}>{SCREEN_TITLES[screen]}</h1>
      <div style={{ flex: 1 }} />

      <button onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 13px", borderRadius: 9,
          border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13, fontWeight: 600 }}>
        <Icon name="truck" size={15} style={{ color: "var(--text-2)" }} />
        Semua Armada
        <Icon name="chevronDown" size={14} style={{ color: "var(--text-2)" }} />
      </button>

      <button title="Notifikasi" style={{ position: "relative", width: 40, height: 40, borderRadius: 9,
        border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-2)", display: "grid", placeItems: "center" }}>
        <Icon name="bell" size={18} />
        {notifCount > 0 && <span style={{ position: "absolute", top: -5, right: -5, minWidth: 17, height: 17, padding: "0 4px",
          borderRadius: 99, background: "var(--danger)", color: "#fff", fontSize: 10, fontWeight: 700,
          display: "grid", placeItems: "center", border: "2px solid #fff" }}>{notifCount}</span>}
      </button>

      <div style={{ width: 1, height: 28, background: "var(--border)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--primary)", color: "#fff",
          display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>PT</div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{COMPANY}</div>
          <div style={{ fontSize: 11, color: "var(--text-2)" }}>Fleet Manager</div>
        </div>
      </div>
    </header>
  );
}

const TONE_MAP = {
  success: { fg: "var(--success)", bg: "var(--success-bg)" },
  warning: { fg: "var(--warning)", bg: "var(--warning-bg)" },
  danger: { fg: "var(--danger)", bg: "var(--danger-bg)" },
  neutral: { fg: "var(--text-2)", bg: "#F0F1F4" },
  primary: { fg: "var(--primary-light)", bg: "#E8F0FB" },
};

function Badge({ tone = "neutral", children, dot }) {
  const t = TONE_MAP[tone] || TONE_MAP.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: dot ? "4px 10px 4px 8px" : "4px 10px",
      borderRadius: 99, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: 99, background: t.fg }} />}
      {children}
    </span>
  );
}

function StatusDot({ tone, size = 9, pulse }) {
  const t = TONE_MAP[tone] || TONE_MAP.neutral;
  return <span style={{ width: size, height: size, borderRadius: 99, background: t.fg, flex: "none",
    animation: pulse ? "pulseDot 1.8s infinite" : "none", boxShadow: `0 0 0 3px ${t.bg}` }} />;
}

function Card({ children, style, className, onClick, pad = 20 }) {
  return (
    <div onClick={onClick} className={className}
      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)", padding: pad, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, style }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-3)", ...style }}>{children}</div>;
}

Object.assign(window, { Sidebar, TopBar, Badge, StatusDot, Card, SectionLabel, NAV, SCREEN_TITLES, TONE_MAP });
