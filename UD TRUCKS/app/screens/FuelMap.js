// ===== Screen 4: Peta Efisiensi BBM =====
const ROUTE_PINS = [
  { x: 360, y: 250, tone: "danger", label: "Terminal Batuah", note: "Idling 18 mnt" },
  { x: 560, y: 175, tone: "danger", label: "KM 42–48", note: "Akselerasi agresif" },
  { x: 690, y: 300, tone: "warning", label: "Samarinda Seberang", note: "Stop-and-go" },
];

function FuelMap() {
  const [active, setActive] = React.useState(1);
  return (
    <div className="screen-enter" style={{ display: "grid", gridTemplateColumns: "1fr minmax(300px, 32%)", gap: 16, height: "100%" }}>
      {/* MAP */}
      <Card pad={0} style={{ overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 3, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "rgba(230, 57, 70, 0.95)", color: "white", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 800, textTransform: "uppercase", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center" }}>
            <Icon name="info" size={16} style={{ marginRight: 6 }} />
            Data Ilustrasi / Simulasi
          </div>
          <div style={{ background: "rgba(255,255,255,.92)", backdropFilter: "blur(6px)", borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-md)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: ".06em", textTransform: "uppercase" }}>Rute Aktif</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>Balikpapan → Samarinda</div>
          </div>
        </div>
        {/* Legend */}
        <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 3, background: "rgba(255,255,255,.92)", backdropFilter: "blur(6px)",
          borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", letterSpacing: ".05em", textTransform: "uppercase" }}>Efisiensi BBM</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 90, height: 8, borderRadius: 99, background: "linear-gradient(90deg,var(--success),var(--warning),var(--danger))" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-2)" }}><span>Efisien</span><span>Boros</span></div>
        </div>

        <svg viewBox="0 0 880 560" style={{ width: "100%", height: "100%", display: "block", background: "#EAF0F2" }} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1FA971" />
              <stop offset="45%" stopColor="#F5A623" />
              <stop offset="62%" stopColor="#E63946" />
              <stop offset="78%" stopColor="#F5A623" />
              <stop offset="100%" stopColor="#1FA971" />
            </linearGradient>
            <pattern id="mapGrid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M44 0H0V44" fill="none" stroke="rgba(120,140,150,.10)" strokeWidth="1" />
            </pattern>
          </defs>
          {/* land tone blocks (abstract placeholder map) */}
          <rect width="880" height="560" fill="#EAF0F2" />
          <path d="M0 380 Q220 340 380 400 T880 360 V560 H0 Z" fill="#E3EBE6" opacity="0.8" />
          <path d="M120 0 Q300 120 240 280 T420 540" fill="none" stroke="#BFD6E4" strokeWidth="14" strokeLinecap="round" opacity="0.6" />
          <rect width="880" height="560" fill="url(#mapGrid)" />
          {/* faint secondary roads */}
          <path d="M60 120 L400 220 L700 120" fill="none" stroke="rgba(120,140,150,.18)" strokeWidth="6" strokeLinecap="round" />
          <path d="M150 520 L420 420 L760 470" fill="none" stroke="rgba(120,140,150,.18)" strokeWidth="6" strokeLinecap="round" />
          <path d="M790 60 L740 300 L800 520" fill="none" stroke="rgba(120,140,150,.14)" strokeWidth="5" strokeLinecap="round" />

          {/* MAIN ROUTE */}
          <path d="M150 430 C 280 420 320 300 360 250 C 420 175 500 150 560 175 C 630 205 640 280 690 300 C 740 320 760 380 790 360"
            fill="none" stroke="#fff" strokeWidth="13" strokeLinecap="round" opacity="0.7" />
          <path d="M150 430 C 280 420 320 300 360 250 C 420 175 500 150 560 175 C 630 205 640 280 690 300 C 740 320 760 380 790 360"
            fill="none" stroke="url(#routeGrad)" strokeWidth="7" strokeLinecap="round" />

          {/* endpoints */}
          <g>
            <circle cx="150" cy="430" r="9" fill="#fff" stroke="var(--primary)" strokeWidth="3" />
            <text x="150" y="462" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--primary)">Balikpapan</text>
          </g>
          <g>
            <circle cx="790" cy="360" r="9" fill="var(--primary)" stroke="#fff" strokeWidth="3" />
            <text x="790" y="392" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--primary)">Samarinda</text>
          </g>

          {/* PINS */}
          {ROUTE_PINS.map((p, i) => (
            <g key={i} style={{ cursor: "pointer" }} onClick={() => setActive(i)}>
              {active === i && (
                <g>
                  <rect x={p.x - 78} y={p.y - 62} width="156" height="44" rx="8" fill="#fff" stroke="var(--border)" />
                  <text x={p.x} y={p.y - 44} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">{p.label}</text>
                  <text x={p.x} y={p.y - 28} textAnchor="middle" fontSize="11" fill={TONE_MAP[p.tone].fg}>{p.note}</text>
                </g>
              )}
              <circle cx={p.x} cy={p.y} r={active === i ? 13 : 10} fill={TONE_MAP[p.tone].fg} opacity="0.25">
                {p.tone === "danger" && <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />}
              </circle>
              <circle cx={p.x} cy={p.y} r="7" fill={TONE_MAP[p.tone].fg} stroke="#fff" strokeWidth="2.5" />
            </g>
          ))}
        </svg>
      </Card>

      {/* INSIGHT PANEL */}
      <div className="noshrink" style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingRight: 2 }}>
        <Card pad={20}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Icon name="route" size={18} style={{ color: "var(--primary-light)" }} />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Balikpapan → Samarinda</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500 }}>Konsumsi rata-rata</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--mono)", marginTop: 4 }}>3,2 <span style={{ fontSize: 12, color: "var(--text-3)" }}>km/L</span></div>
            </div>
            <div style={{ background: "var(--success-bg)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>Potensi hemat</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--mono)", marginTop: 4, color: "var(--success)" }}>11%</div>
            </div>
          </div>
        </Card>

        <Card pad={0} style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 10px" }}><h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>Temuan di Sepanjang Rute</h3></div>
          <div>
            {MAP_FINDINGS.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 11, padding: "12px 20px", borderTop: "1px solid var(--border-2)", alignItems: "flex-start" }}>
                <div style={{ paddingTop: 3 }}><StatusDot tone={f.tone} pulse={f.tone === "danger"} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{f.text}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2, lineHeight: 1.4 }}>{f.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ background: "linear-gradient(120deg,#0A2463,#13357f)", color: "#fff", borderRadius: "var(--radius)", padding: "18px 20px", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name="sparkles" size={16} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>Rekomendasi</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,.9)" }}>
            Kurangi idling di Terminal Batuah dengan matikan mesin saat bongkar muat &gt;3 mnt. Hemat estimasi <strong>±1,1 jt/bulan</strong> untuk rute ini.
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FuelMap });
