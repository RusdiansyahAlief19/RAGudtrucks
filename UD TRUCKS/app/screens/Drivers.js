// ===== Screen 3: Driver Behavior Scoring =====
function Drivers({ onNav, onSelectTruck }) {
  const [drivers, setDrivers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selId, setSelId] = React.useState("");

  React.useEffect(() => {
    fetch('http://127.0.0.1:8000/api/dashboard/drivers')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error("Drivers: Failed to load", data.error);
          setDrivers({ error: data.error });
          setLoading(false);
          return;
        }
        const ranked = data.map((d, i) => ({ ...d, id: d.name.toLowerCase().replace(/ /g, ""), rank: i + 1 }));
        setDrivers(ranked);
        setSelId(ranked[0].id);
        setLoading(false);
      })
      .catch(err => {
        console.error("Drivers: Network error", err);
        setDrivers({ error: err.message });
        setLoading(false);
      });
  }, []);

  const sel = drivers.find((d) => d.id === selId);
  const medal = { 1: "🥇", 2: "🥈", 3: "🥉" };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Menganalisis performa 20 supir secara Live...</div>;
  }

  if (drivers.error || !Array.isArray(drivers) || drivers.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "var(--danger)" }}>
        <Icon name="alert" size={48} style={{ marginBottom: 16, opacity: 0.8 }} />
        <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Data Pengemudi gagal dimuat</h3>
        <p style={{ margin: 0, color: "var(--text-2)", fontSize: 14 }}>{drivers.error || "Tidak ada data pengemudi."}</p>
      </div>
    );
  }

  const sel = drivers.find((d) => d.id === selId);
  if (!sel) return null;

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Insight header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(100deg,#0A2463,#13357f)",
        color: "#fff", borderRadius: "var(--radius)", padding: "18px 22px", boxShadow: "var(--shadow-md)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.12)", display: "grid", placeItems: "center", flex: "none" }}>
          <Icon name="sparkles" size={20} />
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,.92)" }}>
          <strong>Insight:</strong> Skor pengemudi memengaruhi <strong>umur komponen</strong> &amp; <strong>konsumsi BBM</strong>. Pengemudi dengan skor rendah meningkatkan biaya operasional hingga <strong>23% lebih tinggi</strong>.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Leaderboard */}
        <Card pad={0} style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 22px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="trophy" size={18} style={{ color: "var(--warning)" }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Papan Peringkat Pengemudi</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg)", color: "var(--text-2)" }}>
                {["#", "Pengemudi", "Skor", "Hard Brake", "Idling", "Ngebut"].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 0 || i > 2 ? "center" : "left", padding: "10px 16px", fontSize: 10.5,
                    fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} onClick={() => setSelId(d.id)}
                  style={{ borderTop: "1px solid var(--border-2)", cursor: "pointer",
                    background: selId === d.id ? "#F4F8FE" : "transparent", transition: "background .14s" }}
                  onMouseEnter={(e) => { if (selId !== d.id) e.currentTarget.style.background = "var(--bg)"; }}
                  onMouseLeave={(e) => { if (selId !== d.id) e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ padding: "13px 16px", textAlign: "center", fontSize: 15 }}>{medal[d.rank] || <span style={{ fontFamily: "var(--mono)", color: "var(--text-3)", fontSize: 13 }}>{d.rank}</span>}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                    <div className="plate" style={{ fontSize: 11, color: "var(--text-2)" }}>{d.plate}</div>
                  </td>
                  <td style={{ padding: "13px 16px", textAlign: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 15, color: scoreColor(d.score) }}>{d.score}</span>
                      <StatusDot tone={scoreTone(d.score)} size={8} />
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", textAlign: "center", fontFamily: "var(--mono)", color: d.breakdown.hard_brake < 50 ? "var(--danger)" : "var(--text-2)" }}>{d.raw.hard_brake}×<span style={{ fontSize: 10, color: "var(--text-3)" }}>/hr</span></td>
                  <td style={{ padding: "13px 16px", textAlign: "center", fontFamily: "var(--mono)", color: d.breakdown.idle < 50 ? "var(--danger)" : "var(--text-2)" }}>{d.raw.idle}<span style={{ fontSize: 10, color: "var(--text-3)" }}>m</span></td>
                  <td style={{ padding: "13px 16px", textAlign: "center", fontFamily: "var(--mono)", color: d.breakdown.overspeed < 50 ? "var(--danger)" : "var(--text-2)" }}>{d.raw.overspeed}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Selected driver detail */}
        <Card pad={22}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 13, background: "var(--primary)", color: "#fff",
              display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18 }}>
              {sel.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Detail: {sel.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-2)" }}><span className="plate">{sel.plate}</span> · Data 7 hari terakhir</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "var(--mono)", color: scoreColor(sel.score), lineHeight: 1 }}>{sel.score}</div>
              <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600 }}>SKOR</div>
            </div>
          </div>

          <SectionLabel style={{ marginBottom: 12 }}>Metrik 7 hari terakhir</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { t: "Hard Braking", d: [sel.raw.hard_brake, sel.raw.hard_brake*1.1, sel.raw.hard_brake*0.8, sel.raw.hard_brake], c: "var(--danger)", s: "×" },
              { t: "Idling", d: [sel.raw.idle, sel.raw.idle*0.9, sel.raw.idle*1.1, sel.raw.idle], c: "var(--warning)", s: "m" },
              { t: "Ngebut", d: [sel.raw.overspeed, sel.raw.overspeed*0.8, sel.raw.overspeed*1.2, sel.raw.overspeed], c: "var(--primary-light)", s: "×" },
            ].map((m) => (
              <div key={m.t}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>{m.t}</div>
                <BarMini data={m.d} color={m.c} height={48} suffix={m.s} />
              </div>
            ))}
          </div>

          {sel.id === "rahmathidayat" && (
            <button onClick={() => { onSelectTruck("kt9012"); onNav("predictive"); }}
              style={{ marginTop: 18, width: "100%", textAlign: "left", display: "flex", gap: 12, alignItems: "flex-start",
                background: "var(--danger-bg)", border: "1px solid rgba(230,57,70,.2)", borderRadius: 10, padding: "14px 16px", cursor: "pointer" }}>
              <Icon name="alert" size={17} style={{ color: "var(--danger)", flex: "none", marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--text)" }}>
                  <strong>Catatan:</strong> Hard braking Rahmat <strong>2× lipat</strong> rata-rata armada → berkontribusi langsung pada keausan rem <span className="plate">KT 9012 AB</span> yang saat ini dalam kondisi kritis <strong style={{ color: "var(--danger)" }}>(18%)</strong>. Perlu coaching segera.
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--danger)", marginTop: 7, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Lihat dampak di Predictive Maintenance <Icon name="arrowRight" size={13} />
                </div>
              </div>
            </button>
          )}
          {sel.id !== "rahmathidayat" && (
            <div style={{ marginTop: 18, background: "var(--bg)", borderRadius: 10, padding: "13px 15px", fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
              {sel.score >= 80
                ? <>Perilaku berkendara <strong style={{ color: "var(--success)" }}>efisien</strong> — keausan komponen di bawah rata-rata armada.</>
                : <>Idling &amp; akselerasi <strong style={{ color: "var(--warning)" }}>sedang</strong> — pantau konsumsi BBM rute {sel.plate}.</>}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { Drivers });
