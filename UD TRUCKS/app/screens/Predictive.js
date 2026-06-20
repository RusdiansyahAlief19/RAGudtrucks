// ===== Screen 2: Predictive Maintenance (HERO) =====
const COMP_ICON = { rem: "disc", aki: "battery", ban: "disc", filter: "filter" };

function TruckListCard({ t, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", textAlign: "left", border: active ? "1.5px solid var(--primary-light)" : t.critical ? "1px solid rgba(230,57,70,.35)" : "1px solid var(--border)",
        borderRadius: 11, background: active ? "#F4F8FE" : "var(--surface)", padding: 14, cursor: "pointer",
        boxShadow: active ? "0 0 0 3px rgba(30,91,184,.1)" : "var(--shadow-sm)", transition: "all .15s", position: "relative" }}>
      {t.critical && <span style={{ position: "absolute", top: 12, right: 12 }}><Badge tone="danger">Kritis</Badge></span>}
      <div className="plate" style={{ fontSize: 15, color: "var(--primary)", fontWeight: 700 }}>{t.plate}</div>
      <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2, marginBottom: 12 }}>{t.model} · {t.driver}</div>
      <div style={{ display: "flex", gap: 10 }}>
        {t.components.slice(0, 3).map((c) => (
          <div key={c.key} style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10.5, color: "var(--text-2)", fontWeight: 600, textTransform: "capitalize" }}>{c.key}</span>
              <span style={{ fontSize: 10.5, fontFamily: "var(--mono)", fontWeight: 700, color: compColor(c.value) }}>{c.value}%</span>
            </div>
            <CompBar value={c.value} height={5} />
          </div>
        ))}
      </div>
    </button>
  );
}

function Predictive({ selectedId, onSelectTruck }) {
  const [sort, setSort] = React.useState("Paling Kritis");
  const [query, setQuery] = React.useState("");
  const list = React.useMemo(() => {
    let l = TRUCKS.filter((t) => t.plate.toLowerCase().includes(query.toLowerCase()) || t.driver.toLowerCase().includes(query.toLowerCase()));
    if (sort === "Paling Kritis") l = [...l].sort((a, b) => a.score - b.score);
    else l = [...l].sort((a, b) => b.score - a.score);
    return l;
  }, [sort, query]);

  const truck = TRUCKS.find((t) => t.id === selectedId) || TRUCKS[0];
  const primary = truck.components[0]; // brake pad is the headline
  const isHero = truck.id === "kt9012";

  return (
    <div className="screen-enter" style={{ display: "grid", gridTemplateColumns: "minmax(300px, 35%) 1fr", gap: 16, height: "100%" }}>
      {/* LEFT — truck list */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Icon name="search" size={16} style={{ position: "absolute", left: 12, top: 11, color: "var(--text-3)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nomor / pengemudi…"
              style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: 9, border: "1px solid var(--border)",
                fontSize: 13, fontFamily: "var(--sans)", background: "var(--surface)", outline: "none" }} />
          </div>
          <button onClick={() => setSort(sort === "Paling Kritis" ? "Paling Sehat" : "Paling Kritis")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", borderRadius: 9,
              border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>
            <Icon name="filter" size={14} style={{ color: "var(--text-2)" }} /> {sort}
          </button>
        </div>
        <div className="noshrink" style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", paddingRight: 4, paddingBottom: 4 }}>
          {list.map((t) => <TruckListCard key={t.id} t={t} active={t.id === truck.id} onClick={() => onSelectTruck(t.id)} />)}
        </div>
      </div>

      {/* RIGHT — detail */}
      <div className="noshrink" style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingRight: 4, minHeight: 0 }}>
        {/* Header */}
        <Card pad={22}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="plate" style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)", letterSpacing: "-.01em" }}>{truck.plate}</span>
                {truck.critical && <Badge tone="danger" dot>Perlu Servis</Badge>}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-2)", marginTop: 5 }}>{truck.model} · {truck.driver} · {truck.odo.toLocaleString("id-ID")} km</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 62, height: 62, borderRadius: 14, background: TONE_MAP[scoreTone(truck.score)].bg, color: scoreColor(truck.score), display: "grid", placeItems: "center", fontSize: 26, fontWeight: 800, fontFamily: "var(--mono)" }}>{truck.score}</div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>Skor Kesehatan</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: scoreColor(truck.score) }}>{truck.critical ? "Kritis" : truck.score >= 80 ? "Sehat" : "Perhatian"}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Primary prediction card — vertical stack */}
        <Card pad={24} style={{ border: "1px solid rgba(230,57,70,.25)", background: "linear-gradient(180deg,#FDF0F1,#fff)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--danger-bg)", color: "var(--danger)", display: "grid", placeItems: "center" }}>
              <Icon name="alert" size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Prediksi: {primary.name}</h2>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 14.5, color: "var(--text-2)", fontWeight: 500 }}>Kondisi Saat Ini</span>
              <span style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--mono)", color: compColor(primary.value), lineHeight: 1 }}>{primary.value}%</span>
            </div>
            <div style={{ height: 16, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
              <div style={{ width: primary.value + "%", height: "100%", background: compColor(primary.value), borderRadius: 99 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: compColor(primary.value), letterSpacing: ".04em" }}>{primary.value < 30 ? "KRITIS" : primary.value < 60 ? "PERHATIAN" : "SEHAT"}</span>
              <span style={{ fontSize: 12.5, color: "var(--text-3)", fontFamily: "var(--mono)" }}>100%</span>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 11, padding: "16px 18px", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--text)" }}>
              Diprediksi mencapai batas aus dalam <strong style={{ color: "var(--danger)" }}>{primary.eta}</strong> (estimasi {primary.km}).
              {isHero && <> Penyebab utama: <strong>frekuensi hard braking tinggi</strong> (rata-rata 14×/hari, 2× lipat rata-rata armada).</>}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--primary)", color: "#fff",
              border: "none", borderRadius: 10, padding: "12px 18px", fontSize: 13.5, fontWeight: 700, boxShadow: "var(--shadow-md)" }}>
              <Icon name="calendar" size={16} /> Jadwalkan Servis
              <span style={{ fontSize: 10.5, fontWeight: 700, background: "rgba(255,255,255,.18)", padding: "3px 8px", borderRadius: 99 }}>fitur pengembangan</span>
            </button>
          </div>
        </Card>

        {/* Degradation chart — separate card */}
        <Card pad={24}>
          <div style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Tren Penurunan Kampas Rem</h3>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3, display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ display: "inline-block", width: 18, borderTop: "2.5px dashed var(--danger)" }} />
              Garis putus-putus = proyeksi prediktif (% sisa umur)
            </div>
          </div>
          <LineChart data={isHero ? BRAKE_HISTORY : [primary.value + 34, primary.value + 27, primary.value + 20, primary.value + 14, primary.value + 8, primary.value + 3, primary.value].map((v) => Math.min(98, Math.max(6, v)))}
            projection={isHero ? BRAKE_PROJECTION : null}
            threshold={isHero ? BRAKE_THRESHOLD : null}
            xLabels={isHero ? BRAKE_LABELS : ["1 Apr", "20 Apr", "1 Mei", "10 Mei", "20 Mei", "28 Mei", "6 Jun"]}
            yMin={0} yMax={80} color="var(--primary-light)" height={220}
            valueFmt={(v) => Math.round(v) + "%"} />
        </Card>

        {/* Other components */}
        <Card pad={20}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Komponen Lain</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {truck.components.slice(1).map((c) => (
              <div key={c.key} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: TONE_MAP[compTone(c.value)].bg, color: compColor(c.value), display: "grid", placeItems: "center", flex: "none" }}>
                  <Icon name={COMP_ICON[c.key] || "wrench"} size={19} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 13, fontFamily: "var(--mono)", fontWeight: 700, color: compColor(c.value) }}>{c.value}%</span>
                  </div>
                  <CompBar value={c.value} height={5} />
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>Estimasi ganti: {c.eta}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Telematics Simulator */}
        <TelematicsSimulator />
      </div>
    </div>
  );
}

function TelematicsSimulator() {
  const [comp, setComp] = React.useState("aki");
  const [params, setParams] = React.useState({});
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const COMP_FIELDS = {
    aki: [
      { id: "jarak_km", label: "Jarak Tempuh Harian", min: 0, max: 600, unit: "KM", def: 150 },
      { id: "suhu_mesin", label: "Suhu Mesin", min: 60, max: 120, unit: "°C", def: 85 },
      { id: "idle_minutes", label: "Idle Minutes", min: 0, max: 120, unit: "Menit", def: 15 },
      { id: "suhu_mesin_r7", label: "Suhu Mesin (Rata-rata 7 Hari)", min: 60, max: 120, unit: "°C", def: 85 },
      { id: "cumulative_km", label: "Total Odometer", min: 0, max: 100000, unit: "KM", def: 20000 },
    ],
    ban: [
      { id: "jarak_km", label: "Jarak Tempuh Harian", min: 0, max: 600, unit: "KM", def: 150 },
      { id: "muatan_ton", label: "Muatan", min: 0, max: 35, unit: "Ton", def: 10 },
      { id: "overspeed", label: "Overspeed", min: 0, max: 30, unit: "Kali", def: 2 },
      { id: "jarak_km_r7", label: "Jarak KM (Rata-rata 7 Hari)", min: 0, max: 600, unit: "KM", def: 150 },
      { id: "cumulative_km", label: "Total Odometer", min: 0, max: 100000, unit: "KM", def: 20000 },
    ],
    rem: [
      { id: "hard_brake", label: "Pengereman Mendadak", min: 0, max: 40, unit: "Kali", def: 4 },
      { id: "jarak_km", label: "Jarak Tempuh Harian", min: 0, max: 600, unit: "KM", def: 150 },
      { id: "overspeed", label: "Overspeed", min: 0, max: 30, unit: "Kali", def: 2 },
      { id: "hard_brake_r7", label: "Hard Brake (Rata-rata 7 Hari)", min: 0, max: 40, unit: "Kali", def: 4 },
      { id: "cumulative_km", label: "Total Odometer", min: 0, max: 100000, unit: "KM", def: 20000 },
      { id: "hard_brake_std", label: "Fluktuasi Hard Brake (Std Dev)", min: 0, max: 15, unit: "Var", def: 2 },
    ]
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const payload = {};
      COMP_FIELDS[comp].forEach(f => {
        const val = params[f.id] === undefined ? f.def : params[f.id];
        let norm = (val - f.min) / (f.max - f.min);
        if (norm < 0) norm = 0;
        if (norm > 1) norm = 1;
        payload[f.id] = norm;
      });

      const res = await fetch(`http://127.0.0.1:8000/predict/${comp}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.prediction !== undefined) setResult(data.prediction);
      else alert("Error: " + data.error);
    } catch (err) {
      alert("Gagal menghubungi model AI: " + err.message);
    }
    setLoading(false);
  };

  return (
    <Card pad={24} style={{ marginTop: 20 }}>
      <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, display: "flex", gap: 10, alignItems: "center", color: "var(--text)" }}>
        <Icon name="cpu" size={20} /> Telematics Simulator
      </h3>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {["aki", "ban", "rem"].map(c => (
          <button key={c} onClick={() => { setComp(c); setResult(null); setParams({}); }}
            style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--border)",
              background: comp === c ? "var(--primary)" : "transparent", color: comp === c ? "#fff" : "var(--text-2)", fontWeight: 700, cursor: "pointer", textTransform: "capitalize", transition: "all .15s" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
        {COMP_FIELDS[comp].map(f => (
          <div key={f.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 8, fontWeight: 600, color: "var(--text-2)" }}>
              <span>{f.label}</span>
              <span style={{ fontFamily: "var(--mono)", color: "var(--text)" }}>{params[f.id] === undefined ? f.def : params[f.id]} {f.unit}</span>
            </div>
            <input type="range" min={f.min} max={f.max} value={params[f.id] === undefined ? f.def : params[f.id]}
              onChange={e => setParams({...params, [f.id]: parseInt(e.target.value)})}
              style={{ width: "100%", cursor: "pointer" }} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 28, alignItems: "center" }}>
        <button onClick={handlePredict} disabled={loading}
          style={{ background: "var(--primary)", color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 800, border: "none", cursor: "pointer", fontSize: 14 }}>
          {loading ? "Memprediksi..." : "Prediksi Kerusakan"}
        </button>
        {result !== null && (
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, marginBottom: 2 }}>
              {comp === 'rem' ? 'Ketebalan Kampas Rem' : 'Kondisi Aktual Diprediksi'}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--mono)", color: (comp === 'rem' ? result < 7 : result < 70) ? "#e74c3c" : (comp === 'rem' ? result < 8 : result < 80) ? "#f39c12" : "#2ecc71", lineHeight: 1 }}>
              {result.toFixed(1)}{comp === 'rem' ? ' mm' : '%'} <span style={{ fontSize: 14, fontFamily: "var(--sans)", opacity: 0.8, fontWeight: 600 }}>{(comp === 'rem' ? result < 7 : result < 70) ? "(Kritis)" : (comp === 'rem' ? result < 8 : result < 80) ? "(Perhatian)" : "(Aman)"}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

Object.assign(window, { Predictive });
