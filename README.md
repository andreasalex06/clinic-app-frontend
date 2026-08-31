# ClinicApp Dashboard Frontend

Dashboard petugas untuk mengelola pasien, antrean, konsultasi, invoice, farmasi, serta laporan. Menggunakan React, Vite, Tailwind CSS, React Router, Axios, dan Zustand.

Dashboard ini berbeda dari [web pasien](../../user-side-frontend/README.md). Keduanya menggunakan [backend yang sama](../backend/README.md).

## Prasyarat dan urutan startup

- Node.js 22.12+ dalam major 22 atau Node.js 24, serta npm, sesuai persyaratan toolchain pada lockfile.
- PostgreSQL dan backend sudah disiapkan mengikuti README backend.
- Backend aktif pada `http://localhost:5050`.

| Aplikasi | Folder dari root project | Port lokal panduan |
| --- | --- | --- |
| Backend + Socket.IO | `dashboard/backend` | `5050` |
| Dashboard ini | `dashboard/frontend` | `5173` |
| Web pasien | `user-side-frontend` | `5174` |

Jalankan PostgreSQL -> backend -> dashboard -> web pasien. Gunakan terminal terpisah dan biarkan masing-masing dev server berjalan. Setiap folder aplikasi adalah repository Git terpisah.

## Instalasi pertama

Dari folder induk `clinic-app-mobileuserfirst` (contoh menggunakan PowerShell):

```powershell
cd dashboard/frontend
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

`npm ci` mengikuti `package-lock.json`; gunakan npm secara konsisten. Lengkapi `.env` berikut tanpa menimpa konfigurasi lain. Template saat ini baru berisi URL API:

```dotenv
VITE_API_URL="http://localhost:5050/api"
VITE_PATIENT_FRONTEND_URL="http://localhost:5174"
```

| Variabel | Fungsi |
| --- | --- |
| `VITE_API_URL` | Base URL API Express. Sertakan `/api`, jangan `/api/public`, karena dashboard mengakses berbagai modul internal. |
| `VITE_PATIENT_FRONTEND_URL` | Alamat web pasien untuk tautan/QR login dan registrasi pada halaman QR Pasien. |

Variabel `VITE_*` masuk ke bundle browser dan bukan tempat menyimpan secret. Jangan menaruh Server Key Midtrans, password database, atau JWT secret di frontend. Setelah mengubah `.env`, restart Vite; hasil build lama perlu dibangun ulang.

## Menjalankan dashboard

```powershell
npm run dev -- --port 5173 --strictPort
```

Buka [http://localhost:5173](http://localhost:5173). `--strictPort` mencegah Vite diam-diam berpindah ke port lain yang tidak cocok dengan CORS backend. Untuk startup berikutnya cukup jalankan perintah di atas; `npm ci` diperlukan saat instalasi/dependency berubah.

Di `.env` backend, origin dashboard harus cocok:

```dotenv
FRONTEND_URL="http://localhost:5173"
```

Jika port sudah dipakai, cek apakah dashboard ini sudah berjalan. Jangan menghentikan proses lain sembarangan. Jika memilih port berbeda, ubah juga `FRONTEND_URL` di backend dan restart backend. `localhost` dan `127.0.0.1` adalah origin berbeda. Hentikan dev server dengan `Ctrl+C`.

## Login dan uji alur

Akun berikut tersedia apabila seed backend sudah berhasil dijalankan pada database aktif:

| Role | Email | Password demo |
| --- | --- | --- |
| Admin | `admin@clinic.test` | `password123` |
| Staff | `staff@clinic.test` | `password123` |
| Doctor | `doctor@clinic.test` | `password123` |

Gunakan akun Admin untuk memeriksa seluruh menu demo. Akses role lain mengikuti izin aplikasi. Jika akun tidak tersedia, periksa data backend; **jangan menjalankan seed pada database penting**, karena seed menghapus data lama.

1. Login dan pastikan data dashboard berhasil dimuat dari API.
2. Buat pasien/kunjungan dari dashboard atau check-in pasien dari user-side.
3. Proses antrean dan simpan konsultasi dengan tindakan serta obat sesuai kebutuhan.
4. Periksa invoice yang dibuat dari konsultasi.
5. Untuk menguji **Midtrans**, buka web pasien dan bayar dari Riwayat atau tracking farmasi. Setup pembayaran berada di [README backend](../backend/README.md#midtrans-sandbox-dan-ngrok).
6. Setelah pembayaran valid, periksa antrean farmasi dan lanjutkan proses penyiapan/pengambilan obat.

Popup Midtrans adalah alur user-side. Menandai invoice dibayar melalui dashboard bukan pengujian popup/webhook Midtrans.

## Build dan preview

```powershell
npm run build
npm run preview -- --port 4173 --strictPort
```

Build menghasilkan folder `dist/`. Tersedia juga `npm run check`, yang saat ini merupakan alias `vite build`, bukan lint atau unit test. Preview pada [http://localhost:4173](http://localhost:4173) digunakan untuk pemeriksaan lokal, bukan server deployment production.

Untuk mengakses API dari preview, ubah sementara `FRONTEND_URL` backend menjadi `http://localhost:4173` lalu restart backend. Pulihkan `5173` ketika kembali ke dev server. PostgreSQL/backend tetap harus aktif; frontend preview tidak menjalankannya.

Untuk hosting statis, konfigurasi fallback route ke `index.html` karena aplikasi memakai BrowserRouter, tetapkan URL API yang dapat dijangkau browser saat build, dan sesuaikan origin CORS backend.

## Membuka dari perangkat lain

`localhost` di ponsel menunjuk ke ponsel itu sendiri, bukan komputer development. Gunakan IP LAN komputer pada `VITE_API_URL`, `VITE_PATIENT_FRONTEND_URL`, dan origin CORS backend yang sesuai. Untuk akses LAN, jalankan:

```powershell
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Pastikan firewall hanya mengizinkan jaringan yang dipercaya. QR pasien harus berisi URL web pasien yang dapat dijangkau perangkat pemindai. Lihat panduan akses ponsel pada README user-side.

## Troubleshooting

| Gejala | Pemeriksaan |
| --- | --- |
| `npm ci` gagal karena versi Node | Periksa `node --version`; gunakan versi yang memenuhi prasyarat, jangan menghapus lockfile sebagai langkah pertama. |
| Port 5173 sudah digunakan | Gunakan server project yang sudah aktif atau pilih port lain dan sesuaikan CORS. |
| `Network Error` / data tidak tampil | Coba `http://localhost:5050/api/test`, cek `VITE_API_URL`, log backend, dan PostgreSQL. Tes HTTP sukses belum membuktikan query database berhasil. |
| CORS | Cocokkan alamat browser dengan `FRONTEND_URL` backend, termasuk host dan port. |
| Login gagal / sesi lama tidak valid | Pastikan akun ada pada database aktif; login ulang setelah reset data atau perubahan JWT secret. |
| QR membuka alamat yang salah | Periksa `VITE_PATIENT_FRONTEND_URL`; restart Vite setelah perubahan env. |
| Refresh halaman deployment menghasilkan 404 | Atur SPA fallback ke `index.html` pada host statis. |

## Lokasi kode penting

- [API client dan bearer token](src/api/client.js).
- [Routing](src/App.jsx) dan [layout dashboard](src/layouts/AppLayout.jsx).
- [QR pasien](src/pages/QrPage.jsx), [konsultasi](src/pages/ConsultationPage.jsx), dan [farmasi](src/pages/PharmacyPage.jsx).
