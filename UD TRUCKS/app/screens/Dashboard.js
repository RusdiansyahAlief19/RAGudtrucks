// ===== Screen 1: Dashboard Overview =====
function MetricCard({ icon, iconTone, value, label, trend, onClick }) {
  const t = TONE_MAP[iconTone] || TONE_MAP.primary;
  return (
    <Card onClick={onClick} pad={20}
      style={{ cursor: onClick ? "pointer" : "default", transition: "transform .15s, box-shadow .15s",
        display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden" }}
      className={onClick ? "metric-clickable" : ""}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: t.bg, color: t.fg, display: "grid", placeItems: "center" }}>
          <Icon name={icon} size={21} />
        </div>
        {trend && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700,
            color: trend.dir === "up" ? "var(--success)" : "var(--danger)" }}>
            <Icon name={trend.dir === "up" ? "trendingUp" : "trendingDown"} size={15} />
            {trend.val}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: String(value).length > 6 ? 24 : 30, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.05, fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 7, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
          {label}
          {onClick && <Icon name="arrowRight" size={13} style={{ color: "var(--primary-light)" }} />}
        </div>
      </div>
    </Card>
  );
}

function Dashboard({ onNav, onSelectTruck }) {
  const { useState, useEffect } = React;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(365);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/dashboard/data?day=${selectedDay}`)
      .then(r => r.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard data", err);
        setLoading(false);
      });
  }, [selectedDay]);

  if (loading || !data) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Loading live data from AI...</div>;
  }

  const { summary, trucks, alerts } = data;
  const tableTrucks = trucks.slice(0, 5);
  
  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Scenario Banner & Toggle */}
      <Card pad={16} style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ marginTop: 2, color: "var(--primary)" }}>
            <Icon name="info" size={20} />
          </div>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
            <strong>Skenario Simulasi:</strong> Kondisi armada setelah <strong>{selectedDay} hari</strong> beroperasi TANPA jadwal servis preventif.<br/>
            <span style={{ color: "var(--text-2)" }}>Data ini mendemonstrasikan bagaimana FleetSight mendeteksi akumulasi keausan yang luput dari pemantauan manual.</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", whiteSpace: "nowrap" }}>Snapshot Hari:</span>
          <select 
            value={selectedDay} 
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            style={{ padding: "6px 12px", borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border-2)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none" }}
          >
            <option value={90}>Hari ke-90</option>
            <option value={180}>Hari ke-180</option>
            <option value={365}>Hari ke-365 (Akhir Simulasi)</option>
          </select>
        </div>
      </Card>

      {/* Metric row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <MetricCard icon="truck" iconTone="primary" value={summary.activeTrucks} label="Truk Aktif" trend={{ dir: "up", val: "Online" }} />
        <MetricCard icon="alert" iconTone={summary.criticalTrucks > 0 ? "danger" : "success"} value={summary.criticalTrucks} label="Perlu Perhatian" trend={summary.criticalTrucks > 0 ? { dir: "down", val: "Cek!" } : null} onClick={() => onNav("predictive")} />
        <MetricCard icon="shield" iconTone={scoreTone(summary.avgScore)} value={`${summary.avgScore}/100`} label="Skor Armada Rata-rata" trend={{ dir: "up", val: "Live" }} />
        <MetricCard icon="droplet" iconTone="success" value="Rp 14,2 Jt" label="Estimasi Hemat BBM Bulan Ini" trend={{ dir: "up", val: "+8%" }} />
      </div>

      {/* Two panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "stretch" }}>
        <Card pad={22} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Tren Kesehatan Armada <span style={{ color: "var(--text-3)", fontWeight: 600 }}>(30 Hari)</span></h2>
            <Badge tone="success" dot>Stabil</Badge>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <LineChart data={FLEET_TREND} yMin={70} yMax={95} height={240} xLabels={FLEET_LABELS} />
          </div>
        </Card>

        <Card pad={0} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border-2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Peringatan Terbaru</h2>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>{alerts.length} item</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {alerts.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>Semua komponen aman! Tidak ada peringatan.</div>
            ) : alerts.map((a, i) => (
              <button key={i} onClick={() => { onSelectTruck && onSelectTruck(a.truckId); onNav("predictive"); }}
                style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "13px 20px", border: "none",
                  borderBottom: i < alerts.length - 1 ? "1px solid var(--border-2)" : "none", background: "transparent",
                  textAlign: "left", transition: "background .14s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <div style={{ paddingTop: 4 }}><StatusDot tone={a.tone} pulse={a.tone === "danger"} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                    <span className="plate" style={{ fontSize: 12.5, color: "var(--primary)" }}>{a.truck}</span>
                    <span style={{ color: "var(--text-2)", margin: "0 5px" }}>—</span>
                    <span style={{ color: "var(--text)" }}>{a.text}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{a.time}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Fleet table */}
      <Card pad={0} style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Ringkasan Armada</h2>
          <button onClick={() => onNav("predictive")} style={{ display: "inline-flex", alignItems: "center", gap: 5,
            background: "transparent", border: "none", color: "var(--primary-light)", fontSize: 13, fontWeight: 700 }}>
            Lihat semua <Icon name="chevronRight" size={15} />
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "var(--bg)", color: "var(--text-2)" }}>
              {["Nomor Truk", "Model", "Pengemudi", "Skor", "Status Komponen", ""].map((h, i) => (
                <th key={i} style={{ textAlign: i === 3 ? "center" : "left", padding: "10px 22px", fontSize: 11,
                  fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableTrucks.map((t, i) => {
              const worst = Math.min(...t.components.map((c) => c.value));
              return (
                <tr key={t.id} style={{ borderTop: "1px solid var(--border-2)", transition: "background .14s", cursor: "pointer" }}
                  onClick={() => { onSelectTruck(t.id); onNav("predictive"); }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 22px" }}><span className="plate" style={{ color: "var(--primary)" }}>{t.plate}</span></td>
                  <td style={{ padding: "13px 22px", color: "var(--text-2)" }}>{t.model}</td>
                  <td style={{ padding: "13px 22px" }}>{t.driver}</td>
                  <td style={{ padding: "13px 22px", textAlign: "center" }}>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: scoreColor(t.score) }}>{t.score}</span>
                  </td>
                  <td style={{ padding: "13px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", gap: 4, width: 120 }}>
                        {t.components.slice(0, 3).map((c) => (
                          <div key={c.key} style={{ flex: 1 }}><CompBar value={c.value} /></div>
                        ))}
                      </div>
                      <Badge tone={t.status === 'kritis' ? 'danger' : t.status === 'perhatian' ? 'warning' : 'success'}>
                        {t.status === 'kritis' ? "Kritis" : t.status === 'perhatian' ? "Perhatian" : "Aman"}
                      </Badge>
                    </div>
                  </td>
                  <td style={{ padding: "13px 22px", textAlign: "right" }}><Icon name="chevronRight" size={16} style={{ color: "var(--text-3)" }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

Object.assign(window, { Dashboard });
