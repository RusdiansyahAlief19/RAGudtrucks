// ===== UD FleetSight — shared simulated data =====
const COMPANY = "PT Logistik Nusantara";

// color helpers
function compColor(v) { return v >= 60 ? "var(--success)" : v >= 30 ? "var(--warning)" : "var(--danger)"; }
function compTone(v) { return v >= 60 ? "success" : v >= 30 ? "warning" : "danger"; }
function scoreColor(v) { return v >= 80 ? "var(--success)" : v >= 60 ? "var(--warning)" : "var(--danger)"; }
function scoreTone(v) { return v >= 80 ? "success" : v >= 60 ? "warning" : "danger"; }

const TRUCKS = [
  {
    id: "kt9012", plate: "KT 9012 AB", model: "UD Quester GWE 280",
    driver: "Rahmat Hidayat", driverId: "rahmat", score: 52, critical: true,
    route: "Tenggarong – Pelabuhan Palaran", odo: 412380,
    components: [
      { key: "rem", name: "Kampas Rem Depan", value: 18, eta: "~12 hari", km: "± 2.400 km" },
      { key: "aki", name: "Aki / Baterai", value: 76, eta: "~7 bulan", km: "—" },
      { key: "ban", name: "Ban (set depan)", value: 44, eta: "~2 bulan", km: "± 9.800 km" },
      { key: "filter", name: "Filter Oli", value: 61, eta: "~3 bulan", km: "± 11.000 km" },
    ],
  },
  {
    id: "b9456", plate: "B 9456 XY", model: "UD Quester GWE 280",
    driver: "Agus Wijaya", driverId: "agus", score: 67, critical: false,
    route: "Jakarta – Bandung", odo: 287910,
    components: [
      { key: "rem", name: "Kampas Rem Depan", value: 58, eta: "~3 bulan", km: "± 14.000 km" },
      { key: "aki", name: "Aki / Baterai", value: 49, eta: "~4 bulan", km: "—" },
      { key: "ban", name: "Ban (set depan)", value: 71, eta: "~6 bulan", km: "± 22.000 km" },
      { key: "filter", name: "Filter Oli", value: 80, eta: "~5 bulan", km: "± 18.000 km" },
    ],
  },
  {
    id: "kt8841", plate: "KT 8841 CD", model: "UD Quester CWE",
    driver: "Budi Santoso", driverId: "budi", score: 81, critical: false,
    route: "Balikpapan – Samarinda", odo: 198640,
    components: [
      { key: "rem", name: "Kampas Rem Depan", value: 72, eta: "~5 bulan", km: "± 19.000 km" },
      { key: "aki", name: "Aki / Baterai", value: 84, eta: "~9 bulan", km: "—" },
      { key: "ban", name: "Ban (set depan)", value: 39, eta: "~6 minggu", km: "± 7.200 km" },
      { key: "filter", name: "Filter Oli", value: 88, eta: "~6 bulan", km: "± 21.000 km" },
    ],
  },
  {
    id: "da7723", plate: "DA 7723 EF", model: "UD Quester CWE",
    driver: "Slamet Riyadi", driverId: "slamet", score: 94, critical: false,
    route: "Balikpapan – Samarinda", odo: 156220,
    components: [
      { key: "rem", name: "Kampas Rem Depan", value: 88, eta: "~8 bulan", km: "± 28.000 km" },
      { key: "aki", name: "Aki / Baterai", value: 91, eta: "~11 bulan", km: "—" },
      { key: "ban", name: "Ban (set depan)", value: 82, eta: "~7 bulan", km: "± 25.000 km" },
      { key: "filter", name: "Filter Oli", value: 79, eta: "~5 bulan", km: "± 17.000 km" },
    ],
  },
  {
    id: "da6190", plate: "DA 6190 JK", model: "UD Quester GWE 280",
    driver: "Eko Prasetyo", driverId: "eko", score: 88, critical: false,
    route: "Balikpapan – Samarinda", odo: 132080,
    components: [
      { key: "rem", name: "Kampas Rem Depan", value: 80, eta: "~7 bulan", km: "± 26.000 km" },
      { key: "aki", name: "Aki / Baterai", value: 70, eta: "~6 bulan", km: "—" },
      { key: "ban", name: "Ban (set depan)", value: 85, eta: "~7 bulan", km: "± 27.000 km" },
      { key: "filter", name: "Filter Oli", value: 90, eta: "~6 bulan", km: "± 22.000 km" },
    ],
  },
];

const ALERTS = [
  { tone: "danger", truck: "KT 9012 AB", text: "Kampas rem kritis (sisa ~12 hari)", time: "2 jam lalu", truckId: "kt9012" },
  { tone: "warning", truck: "B 9456 XY", text: "Idling berlebih terdeteksi (28 mnt)", time: "5 jam lalu", truckId: "b9456" },
  { tone: "danger", truck: "DA 7723 EF", text: "Suhu mesin tinggi di rute Palaran", time: "kemarin", truckId: "da7723" },
  { tone: "warning", truck: "KT 8841 CD", text: "Tekanan ban set depan di bawah ambang", time: "kemarin", truckId: "kt8841" },
  { tone: "success", truck: "DA 6190 JK", text: "Servis berkala 40.000 km selesai", time: "2 hari lalu", truckId: "da6190" },
];

const DRIVERS = [
  { id: "slamet", rank: 1, name: "Slamet Riyadi", plate: "DA 7723 EF", score: 94, hb: 2, idling: 4, speed: 0, trips: 142,
    hb7: [3,2,1,2,2,1,2], idle7: [6,4,3,5,4,4,3], spd7: [0,0,1,0,0,0,0] },
  { id: "budi", rank: 2, name: "Budi Santoso", plate: "KT 8841 CD", score: 81, hb: 6, idling: 12, speed: 1, trips: 118,
    hb7: [5,7,6,8,5,6,6], idle7: [10,14,11,13,12,12,11], spd7: [1,0,2,1,1,0,1] },
  { id: "agus", rank: 3, name: "Agus Wijaya", plate: "B 9456 XY", score: 67, hb: 11, idling: 28, speed: 4, trips: 96,
    hb7: [9,12,10,13,11,12,10], idle7: [24,30,26,32,28,27,29], spd7: [3,5,4,6,3,4,4] },
  { id: "rahmat", rank: 4, name: "Rahmat Hidayat", plate: "KT 9012 AB", score: 52, hb: 14, idling: 35, speed: 7, trips: 104,
    hb7: [12,15,13,16,14,15,14], idle7: [30,38,33,40,35,34,36], spd7: [6,8,7,9,6,7,7] },
];

// 30-day fleet health trend (avg score)
const FLEET_TREND = [84,83,85,84,82,81,83,82,80,81,82,83,82,80,79,81,82,81,83,82,81,80,82,83,82,81,82,83,82,82];

// brake pad remaining-life (%) history for KT 9012 — declining + projection
// historical (solid) then projected (dashed) crossing the 20% critical threshold
const BRAKE_HISTORY = [65,58,50,39,31,25,18]; // sisa umur % — last = today (6 Jun)
const BRAKE_PROJECTION = [18,13,9]; // proyeksi: 6 Jun → 12 Jun → 18 Jun
const BRAKE_THRESHOLD = 20; // batas kritis (%)
const BRAKE_LABELS = ["1 Apr","10 Apr","20 Apr","1 Mei","10 Mei","20 Mei","6 Jun","12 Jun","18 Jun"];
const FLEET_LABELS = ["1 Mei","10 Mei","19 Mei","28 Mei","6 Jun"];

const MAP_FINDINGS = [
  { tone: "danger", text: "Idling lama di Terminal Batuah", detail: "18 menit — mesin menyala saat bongkar muat" },
  { tone: "danger", text: "Akselerasi agresif KM 42–48", detail: "Tanjakan Sungai Merdeka, 6× hard accel" },
  { tone: "warning", text: "Kecepatan tidak stabil di pusat kota", detail: "Samarinda Seberang, stop-and-go" },
  { tone: "success", text: "Segmen tol Balsam efisien", detail: "4,1 km/liter — di atas rata-rata" },
];

const QUICK_CHIPS = ["Arti kode error DTC", "Cek sebelum perjalanan jauh", "Indikator oli menyala"];

// ===== Simulated /api/dashboard/bbm response (baseline dari riwayat 365 hari) =====
// Bentuk JSON mengikuti spesifikasi endpoint; di prototipe ini di-serve lokal.
const FLEET_BBM = {
  fleet_stats: {
    total_trucks: 20,
    avg_km_per_liter: 3.19,            // rata-rata km/L seluruh armada
    avg_jarak_harian_km: 342.5,        // rata-rata jarak per truk per hari
    avg_idle_minutes: 21.0,            // rata-rata idle per truk per hari
    total_konsumsi_liter_per_hari: 2143.6,
  },
  baseline_harga_bbm: 6800,            // Rp/liter
  langganan_per_truk: 120000,          // Rp/truk/bulan — FleetSight Pro
  worst_trucks: [
    { plate: "KT 9012 AB", driver: "Rahmat Hidayat", km_per_liter: 2.95 },
    { plate: "B 9456 XY", driver: "Agus Wijaya", km_per_liter: 3.02 },
    { plate: "KT 8841 CD", driver: "Budi Santoso", km_per_liter: 3.11 },
  ],
  best_trucks: [
    { plate: "DA 7723 EF", driver: "Slamet Riyadi", km_per_liter: 3.45 },
    { plate: "DA 6190 JK", driver: "Eko Prasetyo", km_per_liter: 3.38 },
    { plate: "KT 4455 GH", driver: "Hendra Saputra", km_per_liter: 3.31 },
  ],
};

// Meniru pemanggilan GET /api/dashboard/bbm (async + sedikit delay)
function fetchFleetBBM() {
  return new Promise((resolve) => setTimeout(() => resolve(FLEET_BBM), 650));
}

Object.assign(window, {
  COMPANY, TRUCKS, ALERTS, DRIVERS, FLEET_TREND,
  BRAKE_HISTORY, BRAKE_PROJECTION, BRAKE_THRESHOLD, BRAKE_LABELS, FLEET_LABELS,
  MAP_FINDINGS, QUICK_CHIPS, FLEET_BBM, fetchFleetBBM,
  compColor, compTone, scoreColor, scoreTone,
});
