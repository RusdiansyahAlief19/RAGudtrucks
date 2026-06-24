// ===== Screen 5: Virtual Mechanic (RAG chatbot) =====
const SEED_MESSAGES = [
  { role: "user", text: "Lampu indikator tekanan oli di Quester saya menyala merah, ini bahaya tidak?" },
  {
    role: "ai",
    text: "Indikator tekanan oli merah menandakan tekanan oli mesin di bawah batas aman. **Tindakan segera:** hentikan kendaraan di tempat aman dan matikan mesin untuk mencegah kerusakan serius. Periksa level oli mesin saat dingin. Jangan lanjut berkendara bila lampu tetap menyala — segera hubungi bengkel resmi UD terdekat.",
    note: "Untuk kepastian diagnosis, pemeriksaan oleh mekanik tetap diperlukan.",
    warn: true,
    sources: [
      { doc: "Manual Quester", loc: 'Bab 7 "Sistem Pelumasan", hal. 142' },
      { doc: "Manual Quester", loc: "hal. 145 — Prosedur Darurat" },
    ],
    found: 3,
  },
];

const CANNED = {
  text: "Kode error DTC adalah kode diagnostik yang tersimpan di ECU kendaraan. Untuk membaca pada Quester: gunakan menu *Diagnostics* di instrument cluster atau alat scan UD. Catat kode (mis. **P0524** = tekanan oli rendah) lalu cocokkan dengan tabel kode di manual servis.",
  note: "Selalu verifikasi kode dengan alat scan resmi sebelum mengganti komponen.",
  sources: [
    { doc: "Manual Quester", loc: "Bab 12 — Daftar Kode Diagnostik, hal. 318" },
    { doc: "Panduan Diagnosa", loc: "hal. 51 — Membaca DTC" },
  ],
  found: 4,
};

function fmt(t) {
  // bold **x**, italic *x*
  const parts = [];
  let rest = t, key = 0;
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0, m;
  while ((m = re.exec(t))) {
    if (m.index > last) parts.push(t.slice(last, m.index));
    if (m[1]) parts.push(<strong key={key++}>{m[1]}</strong>);
    else parts.push(<em key={key++} style={{ color: "var(--text-2)" }}>{m[2]}</em>);
    last = re.lastIndex;
  }
  if (last < t.length) parts.push(t.slice(last));
  return parts;
}

function SourceChip({ doc, loc }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "7px 11px", fontSize: 12, maxWidth: "100%" }}>
      <Icon name="file" size={14} style={{ color: "var(--primary-light)", flex: "none" }} />
      <span><strong style={{ color: "var(--primary)" }}>{doc}</strong> <span style={{ color: "var(--text-2)" }}>— {loc}</span></span>
    </div>
  );
}

function AiBubble({ m }) {
  return (
    <div style={{ display: "flex", gap: 12, maxWidth: "82%" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center", flex: "none" }}>
        <Icon name="wrench" size={17} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px 14px 14px 14px",
          padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65 }}>
            {m.warn && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--danger)", fontWeight: 700, marginRight: 6 }}><Icon name="alert" size={15} /></span>}
            {fmt(m.text)}
          </p>
          {m.note && (
            <p style={{ margin: "12px 0 0", fontSize: 12, lineHeight: 1.5, color: "var(--text-2)", paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
              <em>Catatan: {m.note}</em>
            </p>
          )}
        </div>
        {/* RAG sources */}
        {m.sources && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
            <SectionLabel style={{ fontSize: 10, color: "var(--text-2)" }}>Sumber dari dokumen resmi</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {m.sources.map((s, i) => <SourceChip key={i} {...s} />)}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--success)", fontWeight: 600, marginTop: 2 }}>
              <Icon name="check" size={14} /> {m.found} referensi ditemukan dari dokumen resmi
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Mechanic() {
  const [msgs, setMsgs] = React.useState(SEED_MESSAGES);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = (text) => {
    if (!text.trim() || typing) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { role: "ai", ...CANNED }]);
    }, 1400);
  };

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%", maxWidth: 900, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <Card pad={0} style={{ overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border-2)", display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: "linear-gradient(135deg,#0A2463,#1E5BB8)", color: "#fff", display: "grid", placeItems: "center" }}>
            <Icon name="wrench" size={21} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Virtual Mechanic</div>
            <div style={{ fontSize: 12, color: "var(--text-2)" }}>Didukung Manual Servis Resmi UD Trucks</div>
          </div>
          <Badge tone="success" dot>Manual Quester termuat</Badge>
        </div>

        {/* Astra banner */}
        <div style={{ background: "#EEF3FB", padding: "9px 22px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--primary)", borderBottom: "1px solid var(--border-2)" }}>
          <Icon name="user" size={14} />
          Untuk masalah kompleks, sistem akan mengarahkan Anda ke mekanik ahli Astra (human-in-the-loop).
        </div>

        {/* Conversation */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "22px", display: "flex", flexDirection: "column", gap: 20, background: "var(--bg)" }}>
          {msgs.map((m, i) => m.role === "user" ? (
            <div key={i} style={{ alignSelf: "flex-end", maxWidth: "78%" }}>
              <div style={{ background: "var(--primary)", color: "#fff", borderRadius: "14px 4px 14px 14px", padding: "12px 16px",
                fontSize: 13.5, lineHeight: 1.55, boxShadow: "var(--shadow-sm)" }}>{m.text}</div>
            </div>
          ) : <AiBubble key={i} m={m} />)}
          {typing && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center", flex: "none" }}>
                <Icon name="wrench" size={17} />
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map((d) => <span key={d} style={{ width: 7, height: 7, borderRadius: 99, background: "var(--text-3)", animation: `pulseDot 1s ${d * 0.2}s infinite` }} />)}
                <span style={{ fontSize: 11.5, color: "var(--text-3)", marginLeft: 6 }}>menelusuri manual…</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ borderTop: "1px solid var(--border-2)", padding: "14px 22px 16px", background: "var(--surface)" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 11, flexWrap: "wrap" }}>
            {QUICK_CHIPS.map((c) => (
              <button key={c} onClick={() => send(c)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 99,
                  border: "1px solid var(--border)", background: "var(--surface)", color: "var(--primary)", fontSize: 12.5, fontWeight: 600, transition: "all .14s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#F4F8FE"; e.currentTarget.style.borderColor = "var(--primary-light)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                <Icon name="sparkles" size={13} /> {c}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tanyakan masalah teknis…"
              style={{ flex: 1, padding: "13px 16px", borderRadius: 11, border: "1px solid var(--border)", fontSize: 13.5,
                fontFamily: "var(--sans)", outline: "none", background: "var(--bg)" }} />
            <button type="submit" disabled={!input.trim() || typing}
              style={{ width: 46, height: 46, borderRadius: 11, border: "none", background: input.trim() && !typing ? "var(--primary)" : "var(--border)",
                color: "#fff", display: "grid", placeItems: "center", transition: "background .15s", flex: "none" }}>
              <Icon name="send" size={18} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { Mechanic });
