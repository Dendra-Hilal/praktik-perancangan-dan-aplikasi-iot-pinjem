# 🌦️ PinJem - Sistem Jemuran Otomatis Berbasis IoT

**PinJem (Pintar Jemur)** adalah sistem jemuran pakaian otomatis berbasis Internet of Things (IoT) yang terintegrasi dengan aplikasi web. Sistem ini dikembangkan untuk mempermudah aktivitas menjemur pakaian, khususnya untuk mencegah pakaian basah akibat hujan.

📍 *Dikembangkan dalam rangka mata kuliah Praktik Rancangan dan Aplikasi IoT, Politeknik Amamapare Timika.*

---

## 🚀 Fitur Utama

- 📡 **Otomatisasi Jemuran:** Atap jemuran terbuka dan tertutup otomatis berdasarkan pembacaan sensor hujan dan cahaya.
- 🖥️ **Aplikasi Web:** Kontrol manual jarak jauh, pemantauan status, dan manajemen pengguna.
- ☔ **Penutupan Paksa Saat Hujan:** Atap tetap tertutup saat hujan, bahkan saat mode manual diaktifkan.
- 👥 **Manajemen Role:** Sistem terdiri dari role `administrator` dan `user` dengan akses yang berbeda.
- 🗂️ **Log Sistem:** Riwayat status atap dan hujan tersimpan berdasarkan tanggal.

---

## ⚙️ Teknologi yang Digunakan

### 🔌 Perangkat Keras (Hardware)
- NodeMCU ESP8266
- Raindrop Sensor
- Photo Sensor
- Motor Servo SG90
- LCD I2C 16x2
- XL4005 DC Step Down
- Adaptor 12V
- PCB Board

### 💻 Perangkat Lunak (Software)
- Arduino IDE (C++ untuk ESP8266)
- Node.js & Express.js (Backend)
- MySQL (Database)
- HTML, CSS, JavaScript (Frontend)
- MQTT Protocol (Komunikasi IoT)

---

## 🧱 Struktur Proyek

\`\`\`
PinJem/
├── firmware/              # Kode ESP8266
├── web-app/
│   ├── routes/
│   ├── views/
│   ├── public/
│   ├── models/
│   └── app.js
├── database/
│   └── schema.sql
└── README.md
\`\`\`

---

## 🧪 Pengujian Sistem

Semua fitur diuji menggunakan metode black-box testing dan hasilnya *berfungsi sesuai rencana*, termasuk:

- Pembacaan sensor dan respons servo motor
- Pengiriman data via MQTT ke server
- Penyimpanan dan pemrosesan data di database
- Tampilan status, kontrol manual, dan fitur log di aplikasi web

---

## 🔧 Instalasi

### 📍 Firmware ESP8266

1. Buka `firmware/` dengan Arduino IDE.
2. Atur WiFi SSID dan Password.
3. Upload ke NodeMCU ESP8266.

### 💻 Aplikasi Web

\`\`\`bash
cd web-app
npm install
node app.js
\`\`\`

Pastikan database MySQL aktif dan kredensial disesuaikan.

---

## 👥 Tim Pengembang

| Nama                     | NIM        | Peran         |
|--------------------------|------------|---------------|
| Dendra Hilal Ma’ruf      | 22512011   | Software      |
| Sarci Aprilia Rahanyaan  | 22512042   | Hardware      |

---

## 💸 Rencana Biaya

| Komponen                  | Jumlah | Harga (Rp) |
|---------------------------|--------|------------|
| NodeMCU ESP8266           | 1      | 53.300     |
| Raindrop Sensor           | 1      | 10.600     |
| Photo Sensor              | 1      | 5.800      |
| Servo Motor SG90          | 1      | 17.800     |
| XL4005 DC Step Down       | 1      | 11.900     |
| LCD I2C                   | 1      | 25.500     |
| PCB Board + Komponen      | -      | 129.200    |
| Ongkir + Miniatur         | -      | 93.000     |
| **Total**                 |        | **Rp 397.100** |

---

## 📌 Rencana Pengembangan

- Desain UI web lebih responsif (mobile-friendly)
- Notifikasi real-time ke WhatsApp/Telegram/email
- Penambahan sensor kelembapan & penjadwalan otomatis
- Peningkatan keamanan komunikasi IoT dan web

---

## 📄 Lisensi

Proyek ini dikembangkan sebagai bagian dari tugas akhir praktikum mata kuliah _Praktik Rancangan dan Aplikasi IoT_ di Politeknik Amamapare Timika.

---
