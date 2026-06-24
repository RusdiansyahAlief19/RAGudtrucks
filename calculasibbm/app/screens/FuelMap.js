// ===== Screen 4: Kalkulator Estimasi Biaya BBM (menggantikan Peta Efisiensi) =====
// Clean slate — tanpa peta / koordinat / SVG geografis.
// Section A: metrik armada (auto dari fetchFleetBBM)
// Section B: kalkulator interaktif (kalkulasi frontend)
// Section C: perbandingan efisiensi per unit

const rp = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
const rpJuta = (n) => "Rp " + (n / 1e6).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " Jt";

function MetricTile({ icon, tone, value, unit, label, loading }) {
  const t = TONE_MAP[tone] || TONE_MAP.primary;
  return (
    <Card pad={20} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: t.bg, color: t.fg, display: "grid", placeItems: "center" }}>
        <Icon name={icon} size={21} />
      </div>
      {loading ? (
        <div>
          <div style={{ width: 110, height: 30, borderRadius: 7, background: "linear-gradient(90deg,#eef0f4,#f7f8fa,#eef0f4)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite" }} />
          <div style={{ width: 80, height: 13, borderRadius: 5, marginTop: 9, background: "#eef0f4" }} />
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1, fontFamily: "var(--mono)" }}>
            {value}{unit && <span style={{ fontSize: 15, color: "var(--text-3)", fontWeight: 700, marginLeft: 4 }}>{unit}</span>}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 8, fontWeight: 500 }}>{label}</div>
        </div>
      )}
    </Card>
  );
}

function NumField({ label, value, onChange, min, max, prefix, suffix }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 7 }}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && <span style={{ position: "absolute", left: 13, fontSize: 13.5, color: "var(--text-3)", fontWeight: 600, fontFamily: "var(--mono)" }}>{prefix}</span>}
        <input type="number" value={value} min={min} max={max}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          style={{ width: "100%", padding: prefix ? "11px 14px 11px 42px" : "11px 14px", borderRadius: 10, border: "1.5px solid var(--border)",
            background: "var(--bg)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 600, color: "var(--text)", outline: "none" }}
          onFocus={(e) => { e.target.style.borderColor = "var(--primary-light)"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(30,91,184,.1)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg)"; e.target.style.boxShadow = "none"; }} />
        {suffix && <span style={{ position: "absolute", right: 14, fontSize: 12.5, color: "var(--text-3)", fontWeight: 600 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function OutputRow({ label, value, tone, big, sub }) {
  const col = tone === "success" ? "var(--success)" : tone === "danger" ? "var(--danger)" : "var(--text)";
  return (
    <div style={{ padding: big ? "16px 18px" : "13px 18px", borderRadius: 11,
      background: big ? "var(--success-bg)" : "var(--bg)", border: big ? "1px solid rgba(31,169,113,.25)" : "1px solid var(--border-2)" }}>
      <div style={{ fontSize: 12.5, color: big ? "var(--success)" : "var(--text-2)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: big ? 30 : 20, fontWeight: 800, fontFamily: "var(--mono)", color: col, marginTop: big ? 5 : 3, letterSpacing: "-.02em" }}>
        {value}<span style={{ fontSize: big ? 14 : 12, color: "var(--text-3)", fontWeight: 600 }}> / bulan</span>
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function FuelMap() {
  const [api, setApi] = React.useState(null);          // hasil fetchFleetBBM
  const [hargaBBM, setHargaBBM] = React.useState(6800);
  const [jumlahTruk, setJumlahTruk] = React.useState(20);
  const [targetEff, setTargetEff] = React.useState(3.19);
  const [jarakHarian, setJarakHarian] = React.useState(342.5);
  const [result, setResult] = React.useState(null);
  const [calculating, setCalculating] = React.useState(false);

  // Section A: auto-load baseline dari "API" saat mount
  React.useEffect(() => {
    let alive = true;
    fetchFleetBBM().then((data) => {
      if (!alive) return;
      setApi(data);
      // Default kalkulator dari data API (bukan hardcode)
      setHargaBBM(data.baseline_harga_bbm);
      setJumlahTruk(data.fleet_stats.total_trucks);
      setTargetEff(data.fleet_stats.avg_km_per_liter);
      setJarakHarian(data.fleet_stats.avg_jarak_harian_km);
    });
    return () => { alive = false; };
  }, []);

  const baselineEff = api ? api.fleet_stats.avg_km_per_liter : 3.19;
  const langgananPerTruk = api ? api.langganan_per_truk : 120000;

  const hitung = () => {
    setCalculating(true);
    setTimeout(() => {
      const truk = Number(jumlahTruk) || 1;
      const jarak = Number(jarakHarian) || 0;
      const harga = Number(hargaBBM) || 0;
      const target = Number(targetEff) || baselineEff;
      const totalKmBulan = jarak * truk * 30;
      const biayaSaatIni = (totalKmBulan / baselineEff) * harga;
      const biayaTarget = (totalKmBulan / target) * harga;
      const hemat = biayaSaatIni - biayaTarget;
      const biayaFleetSight = truk * langgananPerTruk;
      const roi = biayaFleetSight > 0 ? hemat / biayaFleetSight : 0;
      const payback = hemat > 0 ? biayaFleetSight / hemat : Infinity;
      setResult({ biayaSaatIni, biayaTarget, hemat, biayaFleetSight, roi, payback, target });
      setCalculating(false);
    }, 500);
  };

  const est = api ? api.fleet_stats.total_konsumsi_liter_per_hari * 30 * api.baseline_harga_bbm : 0;

  // payback badge
  let pb = null;
  if (result) {
    if (result.payback < 3) pb = { tone: "success", label: "Sangat Menguntungkan" };
    else if (result.payback <= 6) pb = { tone: "warning", label: "Menguntungkan" };
    else pb = { tone: "neutral", label: "Tergantung kondisi armada" };
  }

  return (
    <div className="screen-enter noshrink" style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%", overflowY: "auto", paddingRight: 4 }}>
      {/* SECTION A — metrik armada */}
      <div>
        <SectionLabel style={{ marginBottom: 12 }}>Ringkasan Armada · baseline 365 hari</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <MetricTile icon="gauge" tone="primary" loading={!api}
            value={api ? api.fleet_stats.avg_km_per_liter.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""} unit="km/L"
            label="Konsumsi Rata-rata Armada" />
          <MetricTile icon="fuel" tone="warning" loading={!api}
            value={api ? Math.round(api.fleet_stats.total_konsumsi_liter_per_hari).toLocaleString("id-ID") : ""} unit="L/hari"
            label="Total BBM per Hari" />
          <MetricTile icon="droplet" tone="danger" loading={!api}
            value={api ? (est / 1e6).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : ""} unit="Jt"
            label="Estimasi Biaya BBM Bulan Ini" />
        </div>
      </div>

      {/* SECTION B — kalkulator */}
      <Card pad={0} style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-2)", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="gauge" size={19} style={{ color: "var(--primary-light)" }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Kalkulator Estimasi &amp; ROI</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,0.9fr) 1.1fr" }}>
          {/* INPUT */}
          <div style={{ padding: 24, borderRight: "1px solid var(--border-2)", display: "flex", flexDirection: "column", gap: 18 }}>
            <NumField label="Harga BBM Solar" prefix="Rp" value={hargaBBM} min={5000} max={12000} onChange={setHargaBBM} suffix="/ liter" />
            <NumField label="Jumlah Truk Armada" value={jumlahTruk} min={1} onChange={setJumlahTruk} suffix="unit" />
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Target Efisiensi BBM</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <input type="range" min={2.5} max={5.0} step={0.1} value={targetEff}
                  onChange={(e) => setTargetEff(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "var(--primary)", height: 6 }} />
                <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 16, color: "var(--primary)", minWidth: 78, textAlign: "right" }}>{Number(targetEff).toFixed(1)} km/L</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>Baseline armada Anda: <strong style={{ color: "var(--text-2)", fontFamily: "var(--mono)" }}>{baselineEff.toFixed(2)} km/L</strong></div>
            </div>
            <NumField label="Jarak Tempuh / Truk / Hari" value={jarakHarian} min={0} onChange={setJarakHarian} suffix="km" />
            <button onClick={hitung} disabled={calculating}
              style={{ marginTop: 4, width: "100%", padding: 14, borderRadius: 11, border: "none", cursor: "pointer",
                background: "var(--primary)", color: "#fff", fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 9, boxShadow: "var(--shadow-md)", opacity: calculating ? 0.7 : 1 }}>
              {calculating ? <><span style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Menghitung…</>
                : <><Icon name="gauge" size={17} /> Hitung Estimasi</>}
            </button>
          </div>

          {/* OUTPUT */}
          <div style={{ padding: 24, background: "linear-gradient(180deg,#FAFBFD,#fff)" }}>
            {!result ? (
              <div style={{ height: "100%", minHeight: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--text-3)" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--bg)", display: "grid", placeItems: "center", marginBottom: 14 }}>
                  <Icon name="trendingUp" size={26} style={{ color: "var(--text-3)" }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>Atur parameter di kiri</div>
                <div style={{ fontSize: 12.5, maxWidth: 240, marginTop: 5, lineHeight: 1.5 }}>Klik “Hitung Estimasi” untuk melihat potensi penghematan &amp; ROI FleetSight.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn .3s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <OutputRow label="Biaya BBM Saat Ini" value={rpJuta(result.biayaSaatIni)} tone="danger" />
                  <OutputRow label="Dengan Target Efisiensi" value={rpJuta(result.biayaTarget)} tone={result.biayaTarget < result.biayaSaatIni ? "success" : "neutral"} />
                </div>
                <OutputRow label="Potensi Penghematan" value={rpJuta(result.hemat)} tone="success" big
                  sub={"setara " + rpJuta(result.hemat * 12).replace(" / bulan", "") + " / tahun"} />

                {/* Output 4 — vs FleetSight Pro */}
                <div style={{ border: "1px solid var(--border)", borderRadius: 11, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 16px", fontSize: 13, borderBottom: "1px solid var(--border-2)" }}>
                    <span style={{ color: "var(--text-2)" }}>Biaya FleetSight Pro</span>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{rpJuta(result.biayaFleetSight)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 16px", fontSize: 13 }}>
                    <span style={{ color: "var(--text-2)" }}>Potensi Hemat BBM</span>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--success)" }}>{rpJuta(result.hemat)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "var(--primary)", color: "#fff" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7 }}><Icon name="trendingUp" size={16} /> Return on Investment</span>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 20 }}>{result.roi.toFixed(1)}× lipat</span>
                  </div>
                </div>

                {/* Output 5 — payback */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 11, background: TONE_MAP[pb.tone].bg }}>
                  <div>
                    <div style={{ fontSize: 12.5, color: "var(--text-2)", fontWeight: 600 }}>Payback Period</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: TONE_MAP[pb.tone].fg, marginTop: 2 }}>
                      {isFinite(result.payback) ? (result.payback < 1 ? "Modal kembali < 1 bulan" : "Modal kembali " + result.payback.toFixed(1) + " bulan") : "Belum ada penghematan"}
                    </div>
                  </div>
                  <Badge tone={pb.tone}>{pb.label}</Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION C — perbandingan per unit */}
      <Card pad={0} style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 24px 14px" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Perbandingan Efisiensi Per Unit</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {[
            { title: "Paling Boros", tone: "danger", rows: api ? api.worst_trucks : [] },
            { title: "Paling Efisien", tone: "success", rows: api ? api.best_trucks : [] },
          ].map((col, ci) => (
            <div key={ci} style={{ borderLeft: ci === 1 ? "1px solid var(--border-2)" : "none" }}>
              <div style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 8, background: "var(--bg)" }}>
                <StatusDot tone={col.tone} />
                <span style={{ fontSize: 12, fontWeight: 700, color: TONE_MAP[col.tone].fg, letterSpacing: ".03em", textTransform: "uppercase" }}>{col.title}</span>
              </div>
              {(col.rows.length ? col.rows : [null, null, null]).map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderTop: "1px solid var(--border-2)" }}>
                  {r ? (
                    <>
                      <div>
                        <div className="plate" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>{r.plate}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 1 }}>{r.driver}</div>
                      </div>
                      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 15, color: TONE_MAP[col.tone].fg }}>{r.km_per_liter.toFixed(2)} <span style={{ fontSize: 11, color: "var(--text-3)" }}>km/L</span></span>
                    </>
                  ) : <div style={{ width: "100%", height: 20, borderRadius: 5, background: "#eef0f4" }} />}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: "11px 24px", borderTop: "1px solid var(--border-2)", fontSize: 11.5, color: "var(--text-3)" }}>Data berdasarkan riwayat operasional 365 hari.</div>
      </Card>
    </div>
  );
}

Object.assign(window, { FuelMap });
