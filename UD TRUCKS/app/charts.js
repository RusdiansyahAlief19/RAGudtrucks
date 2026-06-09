// ===== Charts (hand-built SVG, no libs) =====

// Smooth-ish line chart with area fill, optional dashed projection + threshold
function LineChart({ data, projection, threshold, yMin, yMax, color = "var(--primary-light)", height = 220, animate = true, valueFmt, xLabels }) {
  const W = 720, H = 260, padL = 44, padR = 24, padT = 20, padB = 34;
  const all = projection ? data.concat(projection.slice(1)) : data;
  const lo = yMin != null ? yMin : Math.min(...all) * 0.9;
  const hi = yMax != null ? yMax : Math.max(...all) * 1.05;
  const n = all.length;
  const x = (i) => padL + (i / (n - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

  const linePts = data.map((v, i) => [x(i), y(v)]);
  const lineD = linePts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const areaD = lineD + ` L ${x(data.length - 1).toFixed(1)} ${(H - padB)} L ${padL} ${(H - padB)} Z`;

  let projD = null;
  if (projection) {
    const start = data.length - 1;
    projD = projection.map((v, k) => {
      const i = start + k;
      return (k ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1);
    }).join(" ");
  }

  const ticks = 4;
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => lo + (i / ticks) * (hi - lo));
  const uid = React.useId().replace(/:/g, "");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, display: "block" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={"area" + uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridY.map((g, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} stroke="var(--border)" strokeWidth="1" />
          <text x={padL - 10} y={y(g) + 4} textAnchor="end" fontSize="11" fill="var(--text-3)" fontFamily="var(--mono)">
            {valueFmt ? valueFmt(g) : Math.round(g)}
          </text>
        </g>
      ))}
      {threshold != null && (
        <g>
          <line x1={padL} x2={W - padR} y1={y(threshold)} y2={y(threshold)} stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
          <rect x={W - padR - 96} y={y(threshold) - 20} width="96" height="16" rx="4" fill="var(--danger-bg)" />
          <text x={W - padR - 48} y={y(threshold) - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--danger)">BATAS KRITIS</text>
        </g>
      )}
      {xLabels && xLabels.map((lab, i) => {
        const px = padL + (i / (xLabels.length - 1)) * (W - padL - padR);
        return (
          <text key={i} x={px} y={H - 10}
            textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
            fontSize="11" fill="var(--text-3)" fontFamily="var(--mono)">{lab}</text>
        );
      })}
      <path d={areaD} fill={`url(#area${uid})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {projD && (
        <path d={projD} fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" />
      )}
      {projD && projection.map((v, k) => k === projection.length - 1 && (
        <circle key={k} cx={x(data.length - 1 + k)} cy={y(v)} r="4.5" fill="var(--danger)" stroke="#fff" strokeWidth="2" />
      ))}
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="4.5" fill={color} stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

// Semicircular gauge for "remaining %"
function Gauge({ value, label, size = 200 }) {
  const r = 80, cx = 100, cy = 100, sw = 16;
  const col = compColor(value);
  const circ = Math.PI * r; // semicircle length
  const off = circ * (1 - value / 100);
  return (
    <svg viewBox="0 0 200 124" style={{ width: size, maxWidth: "100%", display: "block" }}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--border)" strokeWidth={sw} strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={off}
        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)" }} />
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="40" fontWeight="800" fill="var(--text)" fontFamily="var(--mono)">{value}<tspan fontSize="20" fill="var(--text-2)">%</tspan></text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="12" fontWeight="600" fill={col} letterSpacing="0.04em">{label}</text>
    </svg>
  );
}

// Horizontal component bar (Rem / Aki / Ban mini bars)
function CompBar({ value, height = 6 }) {
  return (
    <div style={{ height, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
      <div style={{ width: value + "%", height: "100%", background: compColor(value), borderRadius: 99 }} />
    </div>
  );
}

// 7-day mini bar chart
function BarMini({ data, color = "var(--primary-light)", height = 56, suffix = "" }) {
  const max = Math.max(...data, 1);
  const days = ["S", "S", "R", "K", "J", "S", "M"];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: height + 16 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div title={v + suffix} style={{ width: "100%", maxWidth: 22, height: (v / max) * height + 2, background: color,
            borderRadius: 4, opacity: 0.35 + 0.65 * (v / max) }} />
          <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--mono)" }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { LineChart, Gauge, CompBar, BarMini });
