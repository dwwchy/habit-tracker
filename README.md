# HABIT TRACKER DAILY 🌟
> **Modern Bento & Glassmorphism Progressive Web App (PWA)**  
> Dibangun dengan Vanilla JavaScript (ES6+), HTML5 Semantik, dan CSS3 Modern.

---

## 📱 Ringkasan Aplikasi

**HABIT TRACKER DAILY** adalah aplikasi web mandiri bertipe Progressive Web App (PWA) untuk melacak kebiasaan harian dengan pendekatan visual baru yang segar, bersih, dan estetik (*Modern Bento & Clean Glassmorphism UI*).

Aplikasi ini dapat diinstal langsung ke layar utama (*Homescreen*) perangkat HP (Android/iOS) maupun Desktop (Windows/macOS/Linux) tanpa perlu melalui toko aplikasi (Play Store / App Store).

---

## ✨ Fitur Utama

### 1. 🏠 Halaman Utama: "Today" (Pelacakan Harian)
* **Header Navigasi:** Ikon Pengaturan (⚙️) di kiri, Judul "Today" dengan tanggal aktif di tengah, dan Ikon Kalender Bulanan (📅) di kanan.
* **Horizontal Week Date Strip:** Baris navigasi tanggal mingguan (Senin–Minggu) dengan indikator status dot progres hari ini dan riwayat hari sebelumnya.
* **Daily Progress Bar Dinamis:** Persentase penyelesaian harian real-time, rasio jumlah habit selesai, status motivasi adaptif, serta efek selebrasi **Confetti 🎉** saat mencapai 100% (*All Done*).
* **Daftar Kartu Habit Bento:**
  * Ikon Emoji badge dengan aksen warna khusus.
  * Tombol check-in satu ketukan di sisi kiri dengan animasi pantulan (*bounce check*).
  * Menu opsi tiga titik (`⋮`) untuk melihat detail kalender, edit habit, arsip, atau hapus.
* **Floating Action Button (+):** Tombol melayang cepat untuk membuka katalog preset & form habit baru.

### 2. ✏️ Alur Tambah & Kustomisasi Habit
* **Katalog Preset Siap Pakai (Sistem Akordeon):**
  * **Sport:** Walk 🚶, Run 🏃, Yoga 🧘, Exercise 💪, Stretch 🤸, Swim 🏊, Cycling 🚴, Dance 💃, Interval Training ⏱️
  * **Health:** Drink Water 💧, Take Vitamins 💊, Eat Fruit 🍎, Sleep Early 😴
* **Form Create / Edit Habit Kustom:**
  * Pemilih nama dan grid emoji interaktif.
  * Deskripsi habit (*maksimal 40 karakter* dengan indikator live counter `0/40`).
  * Color picker palet warna modern.
  * Frekuensi: *Setiap Hari (Daily)* atau pilih hari-hari tertentu (*Sen, Sel, Rab, Kam, Jum, Sab, Min*).
  * Toggle & input jam pengingat (*Web Notifications*).
  * Tanggal mulai & opsi tanpa batas akhir (*No End Date*).

### 3. 📊 Halaman Statistik ("Statistics" - Progress at a Glance)
* **Ringkasan Mingguan:** Rasio total habit selesai, persentase total minggu berjalan, dan pemilih rentang tanggal mingguan (`< 20 Feb – 26 Feb >`).
* **Weekly Bar Chart (Grafik Batang 7 Hari):** Visualisasi diagram aktivitas 7 hari dengan sorotan khusus untuk hari aktif.
* **Breakdown Performa per Habit:** Rasio penyelesaian per habit (`5/7 times`), persentase progress bar berwarna (`71%`), dan jumlah *streak* aktif (`🔥`).

### 4. 📅 Kalender Bulanan & Streaks Insights
* **Global Monthly Calendar:**
  * Grid kalender satu bulan penuh dengan indikator lingkaran progres di setiap tanggal.
  * Ringkasan bulanan Total Done disertai 4 metrik utama:
    * 🟣 **All Done Streak** (X times)
    * 🏆 **Best Streak** (X times)
    * ✅ **All Done** (X days)
    * ❌ **Zero Done** (X days)
  * Klik tanggal mana saja untuk memeriksa riwayat habit pada tanggal tersebut.
* **Individual Habit Detail Modal:**
  * Kalender bulanan khusus untuk habit tertentu (hijau jika selesai, merah jika terlewat).
  * Statistik: *Current Streak*, *Best Streak*, *Done in Month*, *Total Done*.
  * Opsi aksi: 📁 Arsipkan / Pulihkan, ✏️ Edit Habit, dan 🗑️ Hapus Habit.

### 5. ⚙️ Menu Pengaturan & Fitur "INSTAL APP" (PWA)
* **📲 Kartu Utama INSTAL APP:**
  * Mendukung event `beforeinstallprompt` untuk instalasi native satu klik.
  * Modal panduan instalasi langkah-demi-langkah otomatis untuk:
    * 🍏 **Apple iOS Safari:** *Share -> Add to Home Screen (Tambah ke Layar Utama)*.
    * 🤖 **Android Chrome:** *Menu (⋮) -> Instal Aplikasi*.
    * 💻 **Desktop Chrome / Edge:** *Klik ikon instal di address bar*.
* **Pengaturan Tambahan:**
  * Toggle **Dark Mode** (Deep Slate `#0F172A`) dan **Light Mode** (Soft Alabaster `#F8FAFC`).
  * Kelola Arsip Habit (melihat & memulihkan habit yang diarsipkan).
  * Pengaturan & pengujian Notifikasi Pengingat Lokal.
  * **Ekspor Data (JSON)** & **Impor Data (JSON)** untuk cadangan (*backup & restore*).
  * Reset data ke bawaan awal.

---

## 🗂️ Struktur Proyek

```
TRACKER HABIT/
├── index.html                # Markup semantik utama & shell aplikasi
├── manifest.json             # Konfigurasi PWA (Web App Manifest)
├── sw.js                     # Service Worker untuk akses offline & caching
├── README.md                 # Dokumentasi proyek
├── css/
│   └── style.css             # Design system Bento, Glassmorphism & tema
├── js/
│   ├── data.js               # Manajemen state terpusat & localStorage (Observer pattern)
│   ├── confetti.js           # Mesin partikel selebrasi kanvas Vanilla JS
│   ├── statistics.js         # Logika grafik mingguan & breakdown habit
│   ├── calendar.js           # Kalender bulanan global & detail insight streak
│   ├── pwa.js                # Penanganan PWA install prompt & deteksi standalone
│   └── app.js                # Controller utama, navigasi routing, modal & kartu habit
└── assets/
    └── icons/
        ├── favicon.svg       # Favicon SVG
        ├── icon.svg          # Ikon vektor resolusi tinggi
        ├── icon-192.png      # Ikon PNG 192x192
        ├── icon-512.png      # Ikon PNG 512x512 (Maskable)
        └── apple-touch-icon.png # Ikon Apple Touch
```

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini dibuat murni dengan teknologi web standar tanpa framework eksternal, sehingga dapat langsung dijalankan menggunakan server lokal apa pun:

### Opsi 1: Menggunakan Node.js
```bash
# Jalankan server lokal bawaan atau npx serve:
npx serve .
```

### Opsi 2: Menggunakan Python
```bash
# Python 3
python -m http.server 8080
```

### Opsi 3: VS Code Live Server
Cukup klik kanan pada `index.html` dan pilih **"Open with Live Server"**.

Buka browser di `http://localhost:8080` (atau port yang aktif).

---

## 💾 Struktur Data (`localStorage`)

Data disimpan secara reaktif di bawah kunci `habit_tracker_daily_data` dengan skema terpusat:

```javascript
{
  "settings": {
    "theme": "dark", // "dark" | "light"
    "remindersEnabled": true
  },
  "habits": [
    {
      "id": "h-1",
      "name": "Walk",
      "icon": "🚶",
      "description": "Jalan pagi 30 menit",
      "color": "#F59E0B",
      "frequency": "daily",
      "reminder": "07:00",
      "startDate": "2026-02-01",
      "endDate": null,
      "archived": false,
      "completedDates": ["2026-02-20", "2026-02-21", "..."]
    }
  ]
}
```
