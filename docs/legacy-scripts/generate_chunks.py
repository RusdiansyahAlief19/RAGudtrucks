import json
import os

new_chunks = [
    # Daily Inspection (INSP)
    {
        "chunk_id": "INSP_001",
        "category": "daily_inspection",
        "sub_category": "pemeriksaan_oli_mesin",
        "applies_to": "all",
        "user_role": ["driver", "mekanik"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Pemeriksaan oli mesin harus dilakukan setiap hari sebelum menghidupkan mesin. Parkir truk di permukaan yang rata. Cabut dipstick, bersihkan, lalu masukkan kembali dan cabut untuk melihat level oli. Level oli harus berada di antara tanda 'MIN' dan 'MAX'. Jika di bawah 'MIN', tambahkan oli yang sesuai (UD Genuine Oil). Jangan mengisi melebihi tanda 'MAX' karena dapat merusak seal mesin dan menyebabkan kebocoran.",
        "keywords": ["cek oli", "oli mesin", "dipstick", "level oli", "pemeriksaan harian", "sebelum jalan", "tanda MIN MAX"]
    },
    {
        "chunk_id": "INSP_002",
        "category": "daily_inspection",
        "sub_category": "pemeriksaan_coolant",
        "applies_to": "all",
        "user_role": ["driver", "mekanik"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Periksa level cairan pendingin (coolant) di tangki reservoir transparan. Level coolant harus berada di antara garis MIN dan MAX pada saat mesin dingin. PERINGATAN: Jangan pernah membuka tutup radiator atau tutup tangki reservoir saat mesin masih panas, karena air panas bertekanan dapat menyembur dan menyebabkan luka bakar. Selalu gunakan UD Genuine Coolant yang sudah dicampur (pre-mixed).",
        "keywords": ["cairan pendingin", "coolant", "air radiator", "tangki reservoir", "mesin dingin", "luka bakar", "pemeriksaan harian"]
    },
    {
        "chunk_id": "INSP_003",
        "category": "daily_inspection",
        "sub_category": "pemeriksaan_sistem_udara",
        "applies_to": "all",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Sistem rem udara memerlukan pemeriksaan kebocoran setiap hari. Setelah mesin dihidupkan dan tekanan udara mencapai maksimum (compressor cut-out), matikan mesin. Dengarkan apakah ada suara desisan udara dari katup, selang, atau tabung udara (air tank). Tarik katup pembuang (drain valve) di bawah tabung udara untuk membuang embun air. Air yang menumpuk di tabung udara dapat masuk ke sistem pengereman dan menyebabkan rem blong atau membeku di cuaca dingin.",
        "keywords": ["rem udara", "air brake", "kebocoran udara", "tabung udara", "air tank", "drain valve", "buang air", "pemeriksaan harian"]
    },
    {
        "chunk_id": "INSP_004",
        "category": "daily_inspection",
        "sub_category": "pemeriksaan_roda_dan_ban",
        "applies_to": "all",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Periksa tekanan ban menggunakan alat pengukur tekanan (tire gauge) setiap pagi saat ban dalam keadaan dingin. Memukul ban dengan besi tidak memberikan indikasi tekanan yang akurat. Periksa keausan telapak ban dan pastikan tidak ada benda tajam yang tertancap. Periksa juga mur roda (wheel nut), pastikan tidak ada yang longgar atau hilang. Mur roda yang kendur biasanya ditandai dengan adanya garis karat di sekitar lubang baut velg.",
        "keywords": ["tekanan ban", "tire gauge", "ban dingin", "mur roda", "wheel nut", "baut velg", "pemeriksaan harian"]
    },
    {
        "chunk_id": "INSP_005",
        "category": "daily_inspection",
        "sub_category": "pemeriksaan_lampu",
        "applies_to": "all",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Sebelum beroperasi, hidupkan semua saklar lampu: lampu utama (headlight), lampu kota, lampu sein (turn signal), lampu hazard, lampu rem, dan lampu mundur. Lakukan pemeriksaan visual dengan mengelilingi truk (walk-around inspection) untuk memastikan semua lampu menyala dan mika lampu tidak pecah. Lampu yang mati dapat membahayakan pengemudi dan pengguna jalan lain serta melanggar peraturan lalu lintas.",
        "keywords": ["cek lampu", "lampu utama", "lampu sein", "lampu hazard", "lampu rem", "walk-around", "pemeriksaan harian"]
    },

    # Driving Operation (DRV)
    {
        "chunk_id": "DRV_001",
        "category": "driving_operation",
        "sub_category": "menghidupkan_mesin",
        "applies_to": "all",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Prosedur menghidupkan mesin: Pastikan rem parkir (parking brake) aktif dan tuas transmisi di posisi Netral. Putar kunci kontak ke posisi ON. Tunggu hingga lampu indikator pemanas (glow plug) mati dan jarum instrumen kembali ke posisi awal. Putar kunci ke posisi START (maksimal 15 detik). Jika mesin tidak hidup, tunggu 1 menit sebelum mencoba lagi agar dinamo starter tidak terbakar. Biarkan mesin idle selama 1-2 menit sebelum mulai berjalan.",
        "keywords": ["menghidupkan mesin", "start mesin", "kunci kontak", "glow plug", "dinamo starter", "idle", "pemanasan"]
    },
    {
        "chunk_id": "DRV_002",
        "category": "driving_operation",
        "sub_category": "penggunaan_escot",
        "applies_to": "quester_gwe_410_escot",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Untuk menjalankan truk dengan transmisi ESCOT: Injak pedal rem, geser tuas transmisi dari N (Neutral) ke D (Drive). Transmisi akan otomatis memilih gigi awal yang tepat berdasarkan beban dan kemiringan jalan. Lepaskan rem parkir, lepaskan pedal rem perlahan, lalu injak pedal gas. ESCOT akan otomatis memindahkan gigi (shifting) pada putaran mesin yang paling efisien (Green Band). Pengemudi dapat melakukan intervensi manual dengan menggeser tuas ke arah +/-.",
        "keywords": ["ESCOT", "cara pakai ESCOT", "transmisi otomatis", "tuas transmisi", "gigi awal", "green band"]
    },
    {
        "chunk_id": "DRV_003",
        "category": "driving_operation",
        "sub_category": "penggunaan_rem_engine",
        "applies_to": "all",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Gunakan Engine Brake (Exhaust Brake) untuk mengurangi kecepatan di jalan menurun panjang, bukan mengandalkan rem kaki (service brake). Penggunaan rem kaki terus-menerus akan menyebabkan rem panas dan blong (brake fade). Tarik tuas engine brake di sisi setir. Engine brake paling efektif pada putaran mesin tinggi (RPM tinggi, tapi jangan sampai masuk zona merah/redline). Jika menggunakan ESCOT, transmisi akan otomatis menurunkan gigi untuk memaksimalkan daya pengereman mesin.",
        "keywords": ["engine brake", "exhaust brake", "rem mesin", "turunan panjang", "rem blong", "brake fade"]
    },
    {
        "chunk_id": "DRV_004",
        "category": "driving_operation",
        "sub_category": "green_band_driving",
        "applies_to": "all",
        "user_role": ["driver", "fleet_manager"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Untuk mendapatkan efisiensi bahan bakar maksimal, selalu pertahankan jarum tachometer (RPM) berada di zona hijau (Green Band) pada instrumen panel saat melaju di jalan datar. Memutar mesin melebihi zona hijau (over-revving) hanya akan membuang bahan bakar tanpa menambah kecepatan signifikan. Mengemudi di bawah zona hijau (lugging) dapat merusak mesin karena kurang pelumasan dan tenaga lambat merespon.",
        "keywords": ["green band", "zona hijau", "RPM", "efisiensi BBM", "hemat bahan bakar", "over revving", "lugging"]
    },
    {
        "chunk_id": "DRV_005",
        "category": "driving_operation",
        "sub_category": "penguncian_diferensial",
        "applies_to": "quester_cwe_euro5",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Penguncian Diferensial (Differential Lock) digunakan SAAT truk terjebak di lumpur atau jalan licin di mana salah satu roda berputar selip. Cara pakai: Hentikan truk sepenuhnya, tekan saklar diff-lock. Indikator di dashboard akan menyala. Jalankan truk perlahan. PERINGATAN: Matikan diff-lock SEGERA setelah melewati jalan licin. Menggunakan diff-lock di jalan keras/aspal akan merusak gardan (axle) dan membuat truk sulit dibelokkan.",
        "keywords": ["diff lock", "differential lock", "pengunci gardan", "jalan licin", "selip", "lumpur", "gardan rusak"]
    },

    # Emergency Procedures (EMG)
    {
        "chunk_id": "EMG_001",
        "category": "emergency_procedures",
        "sub_category": "tekanan_udara_rendah",
        "applies_to": "all",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Jika buzzer peringatan tekanan udara berbunyi dan lampu peringatan tekanan udara menyala merah saat mengemudi: SEGERA menepi ke tempat yang aman dan hentikan kendaraan. Jangan lanjutkan perjalanan karena rem tidak akan berfungsi jika tekanan udara habis. Tunggu hingga kompresor mengisi tabung udara. Jika tekanan tetap tidak naik, berarti ada kebocoran besar. Hubungi UD Mobile Service atau mekanik terdekat.",
        "keywords": ["tekanan udara rendah", "low air pressure", "buzzer bunyi", "rem blong", "berhenti darurat"]
    },
    {
        "chunk_id": "EMG_002",
        "category": "emergency_procedures",
        "sub_category": "mesin_overheat",
        "applies_to": "all",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Jika jarum temperatur coolant mendekati zona merah atau lampu peringatan overheat menyala: Menepi dengan aman, biarkan mesin tetap hidup di putaran idle agar kipas dan pompa air terus mendinginkan mesin secara perlahan. JANGAN langsung mematikan mesin saat sangat panas (kecuali kipas putus/radiator bocor parah) karena panas akan terjebak dan membengkokkan kepala silinder. JANGAN pernah membuka tutup radiator saat mesin overheat.",
        "keywords": ["overheat", "mesin panas", "temperatur naik", "zona merah", "jangan matikan mesin", "jangan buka radiator"]
    },
    {
        "chunk_id": "EMG_003",
        "category": "emergency_procedures",
        "sub_category": "lampu_tekanan_oli_menyala",
        "applies_to": "all",
        "user_role": ["driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Jika lampu indikator tekanan oli (Oil Pressure Warning Light) menyala merah saat mengemudi: MATIKAN MESIN SEGERA secepat yang aman dilakukan. Menjalankan mesin tanpa tekanan oli akan menyebabkan kerusakan total (mesin jebol/nge-jam) dalam hitungan menit. Periksa level oli. Jika level oli normal tetapi lampu tetap menyala, jangan hidupkan mesin. Hubungi ASTRA UD 24H Technical Assistance.",
        "keywords": ["tekanan oli", "oil pressure", "lampu oli menyala", "matikan mesin segera", "mesin jebol"]
    },
    {
        "chunk_id": "EMG_004",
        "category": "emergency_procedures",
        "sub_category": "kabina_dimiringkan",
        "applies_to": "all",
        "user_role": ["driver", "mekanik"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Prosedur memiringkan kabin (Cabin Tilt) untuk perbaikan: Pastikan truk di tanah rata, rem parkir aktif, tuas transmisi Netral, dan mesin mati. Singkirkan barang-barang lepas di dalam kabin. Pastikan tidak ada orang di depan kabin. Putar katup hidrolik pompa tilt ke posisi 'TILT'. Pompa tuas hidrolik secara penuh hingga kabin miring sempurna dan mekanisme pengunci keamanan terkunci. Jangan pernah bekerja di bawah kabin yang tidak dimiringkan penuh.",
        "keywords": ["jungkit kabin", "cabin tilt", "pompa kabin", "miringkan kabin", "prosedur aman"]
    },
    {
        "chunk_id": "EMG_005",
        "category": "emergency_procedures",
        "sub_category": "cara_towing",
        "applies_to": "all",
        "user_role": ["driver", "mekanik"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Saat truk harus diderek (towing) karena mogok: JIKA mesin tidak bisa hidup, as roda penggerak (propeller shaft) HARUS dilepas sebelum truk diderek. Jika as roda tidak dilepas, perputaran roda belakang akan memutar gigi transmisi dalam keadaan tanpa pelumasan (karena pompa oli transmisi mati), menyebabkan gearbox hancur. Untuk truk towing transmisi otomatis ESCOT, keharusan melepas propeller shaft adalah mutlak.",
        "keywords": ["derek truk", "towing", "propeller shaft", "lepas kopel", "transmisi rusak", "mogok"]
    },

    # Fault Codes (ERR) - Sample of 10 common fault codes
    {
        "chunk_id": "ERR_001",
        "category": "fault_codes",
        "sub_category": "P0087",
        "applies_to": "all",
        "user_role": ["mekanik", "fleet_manager"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC P0087: Fuel Rail/System Pressure - Too Low. Penyebab kemungkinan: Filter bahan bakar tersumbat parah, pompa bahan bakar (fuel pump) lemah, kebocoran pada injektor, atau sensor tekanan rail rusak. Efek pada truk: Mesin kehilangan tenaga drastis, susah dihidupkan (hard start), lampu MIL menyala. Solusi: Ganti filter BBM primer dan sekunder, cek kebocoran saluran bahan bakar dari tangki.",
        "keywords": ["P0087", "DTC P0087", "fuel rail pressure", "tekanan BBM rendah", "filter BBM mampet", "hilang tenaga"]
    },
    {
        "chunk_id": "ERR_002",
        "category": "fault_codes",
        "sub_category": "P228F",
        "applies_to": "all",
        "user_role": ["mekanik"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC P228F: Fuel Pressure Regulator 1 Exceeded Learning Limits - Too High. Penyebab: Kualitas bahan bakar sangat buruk (kotoran/air) merusak Supply Pump MPROP (Metering Unit), atau Supply pump mulai aus. Truk dapat mengalami surging (gas naik turun sendiri). Solusi: Kurasi tangki bahan bakar, bersihkan atau ganti MPROP, jika berlanjut ganti Supply Pump Assy.",
        "keywords": ["P228F", "DTC P228F", "MPROP", "supply pump", "gas naik turun", "kualitas BBM buruk"]
    },
    {
        "chunk_id": "ERR_003",
        "category": "fault_codes",
        "sub_category": "P20EE",
        "applies_to": "quester_gwe_euro5",
        "user_role": ["mekanik", "driver"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC P20EE: SCR NOx Catalyst Efficiency Below Threshold (Bank 1). Ini spesifik untuk truk Euro 5. Penyebab: Kualitas AdBlue/Urea di bawah standar, injektor AdBlue tersumbat kristal urea, atau sensor NOx rusak. Efek: Sistem ECU akan membatasi tenaga mesin (Derate) setelah beberapa waktu. Solusi: Kuras tangki AdBlue dan isi dengan UD Genuine AdBlue baru, bersihkan injektor dosing AdBlue menggunakan air panas.",
        "keywords": ["P20EE", "DTC P20EE", "SCR", "NOx", "AdBlue mampet", "Euro 5", "derate tenaga"]
    },
    {
        "chunk_id": "ERR_004",
        "category": "fault_codes",
        "sub_category": "P203F",
        "applies_to": "quester_gwe_euro5",
        "user_role": ["driver"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC P203F: Reductant Level Too Low. Penyebab: Cairan AdBlue di dalam tangki sudah habis atau level sensor macet. Peringatan di dashboard akan muncul. Jika diabaikan, tenaga mesin akan dibatasi menjadi 50-70% (Engine Derate). Solusi segera: Isi ulang tangki AdBlue. Sistem akan memulihkan tenaga mesin secara otomatis setelah mendeteksi AdBlue terisi.",
        "keywords": ["P203F", "AdBlue habis", "reductant level", "engine derate", "truk lambat"]
    },
    {
        "chunk_id": "ERR_005",
        "category": "fault_codes",
        "sub_category": "P0234",
        "applies_to": "all",
        "user_role": ["mekanik"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC P0234: Turbocharger/Supercharger Overboost Condition. Penyebab: Wastegate pada turbo macet dalam posisi tertutup, VGT actuator bermasalah, atau sensor MAP rusak. Efek: Tenaga mesin dipotong untuk melindungi dari over-pressure yang bisa merusak komponen internal mesin. Solusi: Periksa pergerakan tuas aktuator turbo, pastikan selang vakum/udara kontrol tidak bocor.",
        "keywords": ["P0234", "overboost", "turbocharger", "wastegate macet", "tenaga potong"]
    },
    {
        "chunk_id": "ERR_006",
        "category": "fault_codes",
        "sub_category": "P0108",
        "applies_to": "all",
        "user_role": ["mekanik"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC P0108: Manifold Absolute Pressure/Barometric Pressure Circuit High. Penyebab: Sensor MAP di intake manifold rusak, kabel korslet ke tegangan positif (short to Vbat), atau kotoran menyumbat sensor. Solusi: Periksa kabel dari ECU ke sensor MAP. Jika voltase dari sensor selalu mentok 5V meskipun mesin mati, ganti sensor MAP.",
        "keywords": ["P0108", "MAP sensor", "manifold pressure", "sensor rusak", "short to Vbat"]
    },
    {
        "chunk_id": "ERR_007",
        "category": "fault_codes",
        "sub_category": "P0335",
        "applies_to": "all",
        "user_role": ["mekanik"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC P0335: Crankshaft Position Sensor 'A' Circuit. Penyebab: Sensor putaran mesin (CKP) mati, kabel terputus, atau jarak sensor dengan flywheel terlalu jauh. Efek: Mesin sulit hidup (cranking panjang) karena ECU mengandalkan sensor Camshaft (CMP) sebagai cadangan (limp-home mode). Solusi: Cek resistansi sensor CKP, pastikan soket tidak kemasukan air atau oli.",
        "keywords": ["P0335", "CKP", "crankshaft sensor", "mesin susah hidup", "sensor putaran"]
    },
    {
        "chunk_id": "ERR_008",
        "category": "fault_codes",
        "sub_category": "U0101",
        "applies_to": "quester_gwe_410_escot",
        "user_role": ["mekanik"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC U0101: Lost Communication with TCM (Transmission Control Module). Penyebab: ECU mesin tidak menerima data CAN bus dari ECU transmisi ESCOT. Biasanya karena konektor transmisi kemasukan air, kabel CAN bus putus, atau relay TCM rusak. Efek: Transmisi ESCOT tidak bisa masuk gigi, huruf indikator gigi di dashboard berubah jadi strip (-). Solusi: Cek wiring harness transmisi dan bersihkan konektor.",
        "keywords": ["U0101", "TCM", "komunikasi putus", "CAN bus", "ESCOT error", "tidak bisa masuk gigi"]
    },
    {
        "chunk_id": "ERR_009",
        "category": "fault_codes",
        "sub_category": "P0650",
        "applies_to": "all",
        "user_role": ["mekanik"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC P0650: Malfunction Indicator Lamp (MIL) Control Circuit. Penyebab: Bohlam atau LED lampu Check Engine di dashboard putus, atau sirkuit dari ECU ke meter cluster terputus. Kode ini memastikan pengemudi bisa melihat peringatan jika ada kerusakan lain. Solusi: Cek panel instrumen dan jalur kabel dari ECU pin ke dashboard.",
        "keywords": ["P0650", "MIL", "lampu check engine mati", "indikator rusak", "meter cluster"]
    },
    {
        "chunk_id": "ERR_010",
        "category": "fault_codes",
        "sub_category": "P0502",
        "applies_to": "all",
        "user_role": ["mekanik"],
        "source_url": "UD-HDE Quester Error Code List",
        "language": "id",
        "text": "DTC P0502: Vehicle Speed Sensor Circuit Low Input. Penyebab: Sensor kecepatan kendaraan (VSS) di output transmisi rusak, gigi speedometer rontok, atau kabel putus/short ke massa. Efek: Speedometer mati, cruise control tidak berfungsi, dan konsumsi BBM bisa lebih boros. Solusi: Ganti VSS dan pastikan kabel tidak terjepit sasis.",
        "keywords": ["P0502", "VSS", "speedometer mati", "sensor kecepatan", "cruise control mati"]
    },

    # Maintenance Schedule (MAINT)
    {
        "chunk_id": "MAINT_001",
        "category": "maintenance_schedule",
        "sub_category": "pemeriksaan_10000km",
        "applies_to": "all",
        "user_role": ["mekanik", "fleet_manager"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Inspeksi Berkala Pertama (10.000 KM): Ini adalah servis kritis untuk truk baru. Meliputi: Penggantian oli mesin, filter oli, dan filter bahan bakar untuk membersihkan gram/serpihan logam dari masa inreyen. Pengencangan ulang mur roda, baut U-bolt per (spring), dan baut mounting mesin. Pengecekan celah klep (valve clearance). Servis 10.000 km pertama gratis jasa sesuai buku garansi.",
        "keywords": ["servis 10000 km", "servis pertama", "inreyen", "ganti oli pertama", "kencangkan baut", "U-bolt"]
    },
    {
        "chunk_id": "MAINT_002",
        "category": "maintenance_schedule",
        "sub_category": "penyetelan_klep",
        "applies_to": "all",
        "user_role": ["mekanik"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Jadwal Penyetelan Celah Klep (Valve Clearance Adjustment): Untuk mesin GH8E dan GH11E, celah klep harus diperiksa dan disetel ulang setiap 120.000 KM atau 12 bulan. Celah yang terlalu rapat menyebabkan klep terbakar dan idle tidak rata. Celah yang terlalu longgar menyebabkan suara mesin kasar (ngelitik) dan performa turun. Lakukan penyetelan pada saat mesin benar-benar dingin (di bawah 40 derajat celcius).",
        "keywords": ["stel klep", "valve clearance", "120000 km", "suara mesin kasar", "celah klep"]
    },
    {
        "chunk_id": "MAINT_003",
        "category": "maintenance_schedule",
        "sub_category": "penggantian_air_dryer",
        "applies_to": "all",
        "user_role": ["mekanik", "fleet_manager"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Jadwal Penggantian Cartridge Air Dryer (Pengering Udara): Wajib diganti setiap 100.000 KM atau 1 tahun. Fungsi air dryer adalah menyerap kelembaban dari udara yang dihasilkan kompresor sebelum masuk ke tabung rem. Jika cartridge jenuh, air akan masuk ke sistem rem pneumatik dan memicu karat pada katup-katup rem, yang berujung pada rem macet atau blong.",
        "keywords": ["air dryer", "cartridge pengering udara", "100000 km", "rem macet", "udara kompresor"]
    },

    # Service Data (SD)
    {
        "chunk_id": "SD_001",
        "category": "service_data",
        "sub_category": "kapasitas_oli",
        "applies_to": "all",
        "user_role": ["mekanik"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Data Kapasitas Oli Mesin (Termasuk Filter): Mesin GH8E (Quester CKE, CWE, CDE, GKE) membutuhkan sekitar 25 Liter oli (spesifikasi VDS-4 atau API CJ-4). Mesin GH11E (Quester GWE 410) membutuhkan sekitar 33 Liter oli. Kapasitas transmisi manual: 14-16 liter tergantung tipe. Kapasitas oli gardan (Differential) tandem 6x4: 21 liter gardan depan, 21 liter gardan belakang. Selalu gunakan dipstick/lubang kontrol sebagai acuan final saat mengisi oli.",
        "keywords": ["kapasitas oli", "berapa liter oli", "GH8E", "GH11E", "VDS-4", "oli gardan", "oli transmisi"]
    },
    {
        "chunk_id": "SD_002",
        "category": "service_data",
        "sub_category": "torsi_pengencangan_roda",
        "applies_to": "all",
        "user_role": ["mekanik", "driver"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Data Torsi Pengencangan Baut/Mur Roda: Untuk velg roda ISO 10-baut, torsi pengencangan standar adalah 600 Nm (Newton Meter). Kencangkan mur roda menggunakan kunci momen (torque wrench) secara menyilang (bintang) agar velg terpasang rata. Setelah ban dilepas pasang, mur roda WAJIB dikencangkan ulang (retorque) setelah truk berjalan sejauh 100 KM - 200 KM untuk mencegah roda terlepas di jalan.",
        "keywords": ["torsi roda", "baut roda", "mur roda", "600 Nm", "kunci momen", "retorque", "roda lepas"]
    },
    {
        "chunk_id": "SD_003",
        "category": "service_data",
        "sub_category": "celah_klep_standar",
        "applies_to": "all",
        "user_role": ["mekanik"],
        "source_url": "ManualsLib - Quester Series",
        "language": "id",
        "text": "Spesifikasi Celah Klep (Valve Clearance) Mesin GH8E dan GH11E saat Mesin Dingin: Celah Klep Masuk (Intake): 0.30 mm. Celah Klep Buang (Exhaust): 0.60 mm. Unit injektor bahan bakar tidak memiliki penyetelan mekanis mandiri karena dikontrol secara elektronik (Electronic Unit Injector/Common Rail). Pastikan menggunakan feeler gauge yang presisi dan dikerjakan oleh mekanik bersertifikat UD.",
        "keywords": ["celah klep", "intake", "exhaust", "ukuran klep", "feeler gauge", "0.30 mm", "0.60 mm"]
    }
]

file_path = "astra_ud_trucks_rag_dataset.json"
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Update the metadata
data["dataset_meta"]["total_chunks"] = 91

# Append new chunks
data["chunks"].extend(new_chunks)

# Save the updated file
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(new_chunks)} new chunks. Total chunks in dataset: {len(data['chunks'])}.")
