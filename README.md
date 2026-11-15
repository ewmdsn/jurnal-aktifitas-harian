# 🧬 Jurnal Aktivitas & Rekonstruksi Biologis Mandiri

Aplikasi web mandiri (*standalone web application*) dan template terintegrasi untuk pencatatan aktivitas kerja harian (timesheet/productivity tracking) serta protokol kesehatan ilmiah rekonstruksi biologis (nutrisi terjadwal, postur V-Taper, pengencangan korset perut *six-pack*, dan sinkronisasi cloud real-time ke Supabase).

---

## 🌟 Fitur Utama

1. **Jurnal Kerja & Timesheet Harian (CRUD Lengkap)**
   - Catat, edit, dan hapus entri aktivitas pekerjaan harian.
   - Pilihan **Metode Latihan** khusus bila aktivitas bertema olah tubuh/olahraga.
   - Perhitungan durasi jam kerja otomatis dan pelacakan prioritas (Tinggi, Sedang, Rendah).
   - Penilaian skor fokus mental harian (skala 1–5).

2. **Log Biologis & Parameter Kesehatan (CRUD Lengkap)**
   - Rekam sesi latihan harian dan metode latihan (Adaptasi 70%, Tempo 2-1-1, Isometrik Korset Perut, Dekompresi Pasif Fasia, Zone 2 Pemulihan, 100% Porsi Penuh, Mobilitas Dinamis).
   - Pelacak asupan air mineral seluler harian dengan target 2.500 – 3.000 ml.
   - Deteksi otomatis puncak Human Growth Hormone (HGH) berdasarkan jam tidur.
   - Sensor peringatan *Red Flags* medis untuk deteksi dini gejala berbahaya.

3. **Jadwal & Menu Makanan Ilmiah (Sesuai Protokol)**
   - 8 Checkpoint ritme makan harian (05.30 air garam hangat s/d 21.30 tidur 10–11 jam puasa malam pemicu autofagi).
   - Menu variasi 7 hari lengkap (Senin s/d Minggu) dengan fokus lauk protein tinggi, omega-3, dan kaldu kolagen.
   - Checklist jadwal makan harian interaktif.

4. **Jadwal Latihan V-Taper & Six-Pack Lengkap**
   - Jadwal terperinci Senin s/d Minggu (Sesi A: Dada/Bahu/Perut, Sesi B: Sayap/Punggung/Korset, Rabu: Pemulihan Aktif, Sabtu: Mobilitas, Minggu: Istirahat Total).
   - Panduan teknis 3 gerakan kunci: *Stomach Vacuum* (5x15s), *Dead Hang* (3x30s), dan *Prone Y-T-W*.
   - Timer audio interaktif dengan Web Audio API.

5. **Katalog 8 Pilihan Metode Latihan Terstandarisasi**
   - Panduan tempo (misal 2-1-1), durasi istirahat, dan manfaat fisiologis.
   - Tombol 1-klik untuk memilih metode langsung ke form Jurnal Kerja atau Log Biologis.

6. **Integrasi Cloud Database Supabase**
   - Sinkronisasi dua arah real-time (*offline-first*) ke database Supabase Cloud.
   - Didukung penyimpanan lokal browser (*LocalStorage*) untuk keandalan tanpa internet.

7. **Ekspor & Cadangan Data**
   - Unduh CSV Jurnal Kerja.
   - Unduh CSV Log Biologis.
   - Cadangan data JSON lengkap.
   - Template Excel terintegrasi 5 sheet di folder `excel/`.

---

## 🚀 Cara Menjalankan

Aplikasi dirancang mandiri tanpa dependensi rumit:
1. **Langsung di Browser**:
   Buka file `index.html` dengan peramban favorit Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, dll).
2. **Melalui Server Lokal (Opsional)**:
   ```bash
   npx serve .
   ```

---

## 📂 Struktur Proyek

```
jurnal-biologis-webapp/
├── index.html              # Aplikasi Web Terpadu (8 Tab)
├── css/
│   └── style.css           # Desain Antarmuka Responsif & Modern
├── js/
│   ├── app.js              # State Manager, Logika CRUD & Event Handler
│   ├── data-master.js      # Master Protokol Nutrisi, Latihan & Metode
│   ├── export.js           # Mesin Ekspor CSV & Backup JSON
│   ├── supabase-client.js  # Integrasi Klien Supabase JS SDK Cloud
│   └── timer.js            # Timer Audio Interaktif Gerakan Kunci
├── excel/
│   ├── Template_Jurnal_Aktivitas_dan_Kesehatan_Biologis.xlsx
│   └── Template_Jurnal_Aktivitas_Harian.xlsx
├── .gitignore
└── README.md
```

---

## ☁️ Konfigurasi Supabase

- **Project URL**: `https://nwjpukscnwbrnjohleco.supabase.co`
- **Region**: `ap-southeast-1` (Singapura)
- **Tabel**:
  - `public.jurnal_kerja` (timesheet, durasi, prioritas, kategori, metode_latihan)
  - `public.log_biologis` (fisiologis, hidrasi, sesi, metode_latihan, kepatuhan, cut-off malam, jam tidur)
- **RLS**: Row Level Security diaktifkan penuh dengan audit keamanan 0 kerentanan.

---

## 📄 Lisensi
Hak Cipta © 2026. Dibuat untuk tujuan produktivitas dan rekonstruksi biologis mandiri.
