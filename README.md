# Stock Average Up & Down Calculator

Aplikasi web untuk menghitung dampak pembelian tambahan terhadap harga rata-rata posisi saham Indonesia. Strategi average up atau average down dideteksi otomatis dari harga beli tambahan.

## Fitur

- **Pencarian harga saham:** Ambil harga pasar saham IDX melalui Yahoo Finance tanpa API key.
- **Modal Tersedia:** Hitung jumlah lot yang dapat dibeli, sisa modal, dan average baru.
- **Target Average:** Hitung lot serta modal yang diperlukan untuk mencapai target average, baik naik maupun turun.
- **Target P/L %:** Hitung pembelian yang diperlukan untuk mendekati target floating profit atau loss.
- **Perbandingan Posisi:** Bandingkan total modal, nilai pasar, serta floating profit/loss sebelum dan setelah pembelian.
- Validasi input, pembulatan ke lot utuh, format angka otomatis, dan tampilan responsif.

## Cara Menggunakan

1. Opsional untuk mode Modal Tersedia dan Target Average: cari ticker saham untuk mengisi harga pasar terbaru.
2. Isi jumlah lot dan harga rata-rata posisi saat ini.
3. Isi harga rencana pembelian tambahan. Nilai ini boleh lebih tinggi atau lebih rendah dari average saat ini.
4. Pilih mode kalkulasi dan klik **Hitung**.

Mode **Target P/L %** memerlukan harga pasar dari pencarian ticker karena harga pasar dan harga rencana beli diperlakukan sebagai dua nilai terpisah.

## Contoh Average Up

Posisi awal 10 lot pada average Rp1.000, lalu membeli 5 lot pada Rp1.300:

```text
average baru = ((10 × Rp1.000) + (5 × Rp1.300)) / 15
             = Rp1.100
```

## Menjalankan Proyek

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Untuk pemeriksaan lokal:

```bash
npm test
npm run typecheck
npm run build
```

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Yahoo Finance untuk harga saham IDX
