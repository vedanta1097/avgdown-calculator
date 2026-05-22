# Averaging Down Calculator - Planning Document

## Overview

Aplikasi web kalkulator averaging down saham Indonesia, dibangun dengan Next.js (App Router) dan di-deploy ke Vercel.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Deployment**: Vercel
- **State Management**: React useState (no external library needed)

---

## Project Structure

```
avgdown-calculator/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main calculator page
│   └── globals.css         # Tailwind imports + custom styles
├── components/
│   ├── Calculator.tsx      # Main calculator component (client component)
│   ├── ModeSelector.tsx    # Toggle between Mode 1 and Mode 2
│   ├── InputForm.tsx       # Shared input fields (lots, avg price, current price)
│   ├── Mode1Form.tsx       # Target price input + result display
│   ├── Mode2Form.tsx       # Available money input + result display
│   └── ResultCard.tsx      # Styled result display component
├── lib/
│   └── calculate.ts        # Pure calculation functions
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## Business Logic (lib/calculate.ts)

### Constants

```
1 lot = 100 lembar saham
```

### Shared Inputs (selalu diminta)

| Field        | Type   | Description                                      |
| ------------ | ------ | ------------------------------------------------ |
| currentLots  | number | Jumlah lot yang dimiliki saat ini                |
| avgPrice     | number | Harga rata-rata beli saat ini (per lembar)       |
| currentPrice | number | Harga saham saat ini (harga beli untuk avg down) |

### Mode 1: Target Harga Average Down

**Additional Input:**

- `targetAvgPrice` (number): Harga rata-rata yang diinginkan setelah avg down

**Formula:**

```
totalSharesNow = currentLots * 100
totalCostNow = totalSharesNow * avgPrice

// Target: (totalCostNow + additionalShares * currentPrice) / (totalSharesNow + additionalShares) = targetAvgPrice
// Solve for additionalShares:
additionalShares = (totalCostNow - targetAvgPrice * totalSharesNow) / (targetAvgPrice - currentPrice)

additionalLots = Math.ceil(additionalShares / 100)  // Bulatkan ke atas (lot utuh)
moneyNeeded = additionalLots * 100 * currentPrice
actualNewAvg = (totalCostNow + (additionalLots * 100 * currentPrice)) / (totalSharesNow + additionalLots * 100)
```

**Output:**

- Jumlah lot yang perlu dibeli
- Total uang yang dibutuhkan (formatted Rupiah)
- Harga rata-rata baru yang sebenarnya (setelah pembulatan lot)
- Total lot setelah avg down

**Validasi:**

- `targetAvgPrice` harus < `avgPrice` (tujuan avg down menurunkan harga rata-rata)
- `targetAvgPrice` harus > `currentPrice` (tidak mungkin avg down ke harga di bawah harga beli baru)
- `currentPrice` harus < `avgPrice` (avg down hanya masuk akal jika harga turun)

### Mode 2: Input Jumlah Uang

**Additional Input:**

- `availableMoney` (number): Jumlah uang yang tersedia untuk avg down

**Formula:**

```
totalSharesNow = currentLots * 100
totalCostNow = totalSharesNow * avgPrice

affordableLots = Math.floor(availableMoney / (currentPrice * 100))  // Bulatkan ke bawah
additionalShares = affordableLots * 100
actualMoneyUsed = affordableLots * 100 * currentPrice

newAvgPrice = (totalCostNow + actualMoneyUsed) / (totalSharesNow + additionalShares)
```

**Output:**

- Jumlah lot yang bisa dibeli
- Uang yang terpakai (formatted Rupiah)
- Sisa uang (formatted Rupiah)
- Harga rata-rata baru setelah avg down
- Total lot setelah avg down
- Persentase penurunan avg price

**Validasi:**

- `availableMoney` harus cukup untuk beli minimal 1 lot
- `currentPrice` harus < `avgPrice`

---

## UI/UX Specifications

### Layout

- Single page, centered, max-width 480px (mobile-first)
- Dark mode default with clean modern design
- Card-based layout with subtle shadows

### Sections (top to bottom)

1. **Header**: "Kalkulator Averaging Down" + deskripsi singkat
2. **Shared Inputs Card**: Jumlah lot, harga avg, harga saat ini
3. **Mode Selector**: 2 tab/toggle buttons (Mode 1 | Mode 2)
4. **Mode-specific Input Card**: Input tambahan sesuai mode
5. **Calculate Button**: Button "Hitung" yang menjalankan kalkulasi
6. **Result Card**: Menampilkan hasil perhitungan dengan format yang jelas

### Formatting

- Semua harga dalam format Rupiah: `Rp 1,234,567` (koma sebagai pemisah ribuan)
- Gunakan `Intl.NumberFormat('en-US')` untuk formatting
- Input harga tanpa "Rp" prefix (angka saja), tapi auto-format dengan koma saat user mengetik
- Tampilkan persentase penurunan avg price di hasil

### Auto-format Input

- Saat user mengetik angka di field harga/uang, otomatis diformat dengan koma (e.g. `1000000` → `1,000,000`)
- Implementasi: strip semua non-digit dari input, parse sebagai number, format ulang dengan `Intl.NumberFormat('en-US')`
- Saat kalkulasi, strip koma sebelum parsing: `value.replace(/,/g, '')`

### Responsive

- Mobile-first (360px minimum)
- Centered on desktop with max-width

### Color Scheme (Dark Mode)

- Background: slate-900
- Cards: slate-800 with border slate-700
- Accent: emerald-500 (untuk hasil positif/button)
- Text: white/slate-200
- Error: red-400

---

## Implementation Steps (untuk AI)

### Step 1: Initialize Project

```bash
npx create-next-app@latest avgdown-calculator --typescript --tailwind --eslint --app --src=false --import-alias="@/*"
cd avgdown-calculator
```

### Step 2: Implement lib/calculate.ts

- Buat fungsi `calculateMode1(currentLots, avgPrice, currentPrice, targetAvgPrice)`
- Buat fungsi `calculateMode2(currentLots, avgPrice, currentPrice, availableMoney)`
- Buat fungsi `formatRupiah(amount: number): string` → `Rp 1,234,567`
- Buat fungsi `formatNumberInput(raw: string): string` → auto-format input dengan koma
- Buat fungsi `parseNumber(formatted: string): number` → strip koma, parse ke number
- Buat fungsi `validateInputs(...)` untuk validasi
- Export semua fungsi dan types

### Step 3: Implement Components

- Buat semua components sebagai Client Components ("use client")
- `Calculator.tsx`: Parent component yang manage state dan mode
- `ModeSelector.tsx`: Tab toggle (props: activeMode, onModeChange)
- `InputForm.tsx`: 3 input fields (lots, avg price, current price)
- `Mode1Form.tsx`: Input target price + tombol hitung
- `Mode2Form.tsx`: Input available money + tombol hitung
- `ResultCard.tsx`: Display hasil dengan format yang rapi

### Step 4: Implement Main Page

- `app/page.tsx`: Server component, render `<Calculator />`
- `app/layout.tsx`: Metadata (title, description), font setup
- `app/globals.css`: Tailwind directives

### Step 5: Styling & Polish

- Responsive design
- Input validation with error messages
- Loading states tidak perlu (kalkulasi instant)
- Animasi transisi antar mode (optional)

---

## Contoh Skenario Test

### Mode 1 Test Case:

- Punya: 10 lot @ Rp 1,000
- Harga sekarang: Rp 800
- Target avg: Rp 900
- Expected: perlu beli 10 lot, butuh Rp 800,000, avg baru = Rp 900

### Mode 2 Test Case:

- Punya: 10 lot @ Rp 1,000
- Harga sekarang: Rp 800
- Uang tersedia: Rp 1,000,000
- Expected: bisa beli 12 lot, avg baru = ~Rp 891, sisa Rp 40,000

---

## Deployment Notes

- Push ke GitHub
- Connect repo ke Vercel
- No environment variables needed
- No database needed
- Build command: `next build` (default Vercel)

---

## Prompt untuk AI Implementasi

Gunakan prompt berikut untuk menyuruh AI mengimplementasikan:

```
Buatkan aplikasi Next.js 15 (App Router, TypeScript, Tailwind CSS) berdasarkan planning berikut:

[paste seluruh isi PLANNING.md ini]

Implementasikan seluruh file yang disebutkan di Project Structure.
Pastikan:
1. Semua kalkulasi benar sesuai formula
2. Validasi input lengkap dengan error messages dalam Bahasa Indonesia
3. UI responsive dan dark mode
4. Format angka menggunakan format Rupiah Indonesia
5. Gunakan "use client" di semua components yang punya interaktivitas
```
