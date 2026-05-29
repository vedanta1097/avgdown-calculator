# Averaging Down Calculator - Planning Document

---

## Feature: Mode 3 – Target Floating Loss % → Dana yang Dibutuhkan

### Objective

User bisa input target floating loss % setelah avg down (misal: -5%), lalu sistem hitung berapa lot dan dana yang dibutuhkan untuk mencapai floating loss tersebut.

### Prerequisite

Fitur ini **membutuhkan market price** (harga pasar saat ini dari ticker). Jika user belum fetch ticker, mode 3 di-disable / tampilkan pesan.

---

### Math Formula

```
Given:
  S = currentLots * 100          (shares sekarang)
  C = S * avgPrice               (total cost sekarang)
  P = currentPrice               (harga beli avg down)
  M = marketPrice                (harga pasar real-time)
  T = targetFloatingLossPercent  (misal: -5 untuk -5%)

Solve for n (additional shares):
  T/100 = ((S + n) * M - (C + n * P)) / (C + n * P)

  n = (C * (1 + T/100) - S * M) / (M - P * (1 + T/100))

  additionalLots = ceil(n / 100)
  moneyNeeded = additionalLots * 100 * P
```

---

### Implementation Steps

#### Step 1: Add `calculateMode3` to `lib/calculate.ts`

```typescript
export type Mode3Result = {
  additionalLots: number;
  moneyNeeded: number;
  newAvgPrice: number;
  totalLots: number;
  actualFloatingLossPercent: number; // actual % after rounding to lots
};

export function calculateMode3(
  currentLots: number,
  avgPrice: number,
  currentPrice: number,
  marketPrice: number,
  targetFloatingLossPercent: number, // e.g. -5 for -5%
): Mode3Result {
  const S = currentLots * 100;
  const C = S * avgPrice;
  const P = currentPrice;
  const M = marketPrice;
  const T = targetFloatingLossPercent;

  const numerator = C * (1 + T / 100) - S * M;
  const denominator = M - P * (1 + T / 100);

  const n = numerator / denominator;
  const additionalLots = Math.ceil(n / 100);
  const additionalShares = additionalLots * 100;

  const totalCostAfter = C + additionalShares * P;
  const totalSharesAfter = S + additionalShares;
  const newAvgPrice = totalCostAfter / totalSharesAfter;
  const marketValueAfter = totalSharesAfter * M;
  const actualFloatingLossPercent =
    ((marketValueAfter - totalCostAfter) / totalCostAfter) * 100;

  return {
    additionalLots,
    moneyNeeded: additionalShares * P,
    newAvgPrice,
    totalLots: currentLots + additionalLots,
    actualFloatingLossPercent,
  };
}
```

---

#### Step 2: Create `components/Mode3Form.tsx`

Input field: **Target Floating Loss %** (number input, negative value, misal -5).

```typescript
interface Mode3FormProps {
  targetLossPercent: string;
  onTargetLossPercentChange: (value: string) => void;
  error?: string;
  disabled?: boolean; // disabled jika marketPrice belum ada
}
```

- Tampilkan pesan "Fetch harga saham dulu" jika `disabled=true`.
- Input accept angka negatif (atau auto-tambah minus).

---

#### Step 3: Update `components/ModeSelector.tsx`

- Tambah Mode type: `"mode1" | "mode2" | "mode3"`
- Tambah button ketiga: **"Target Loss %"**

---

#### Step 4: Update `components/Calculator.tsx`

1. Add state: `targetLossPercent`, `mode3Result`
2. Update `Mode` type to include `"mode3"`
3. Add validation for mode3:
   - `targetLossPercent` harus negatif (antara -99 dan 0)
   - `marketPrice` harus tersedia
   - Hasil `n` harus positif (target achievable)
4. Add calculation logic di `handleCalculate`
5. Render `Mode3Form` when `mode === "mode3"`
6. Show result & floating loss card

---

#### Step 5: Update `components/ResultCard.tsx`

Add mode3 result display:

- Lot yang harus dibeli
- Dana yang dibutuhkan
- Harga rata-rata baru
- Total lot setelah avg down
- Actual floating loss % (setelah pembulatan lot)

---

### Validation Rules (Mode 3)

| Condition                   | Error Message                                     |
| --------------------------- | ------------------------------------------------- |
| `targetLossPercent` kosong  | "Masukkan target floating loss %"                 |
| `targetLossPercent >= 0`    | "Target harus negatif (misal: -5)"                |
| `targetLossPercent <= -100` | "Target tidak boleh kurang dari -100%"            |
| `marketPrice` null          | "Fetch harga saham terlebih dahulu"               |
| Hasil `n <= 0`              | "Target sudah tercapai tanpa avg down"            |
| `denominator === 0`         | "Target tidak bisa dicapai dengan harga beli ini" |

---

### File Changes Summary

| File                          | Action                                           |
| ----------------------------- | ------------------------------------------------ |
| `lib/calculate.ts`            | Add `Mode3Result` type + `calculateMode3()`      |
| `components/Mode3Form.tsx`    | **Create** – input target loss %                 |
| `components/ModeSelector.tsx` | Add mode3 button                                 |
| `components/Calculator.tsx`   | Add mode3 state, validation, calculation, render |
| `components/ResultCard.tsx`   | Add mode3 result display                         |

---

---

## Feature: Stock Ticker + Floating Loss Comparison

### Objective

Tambahkan input kode saham (ticker) untuk fetch harga saham terbaru secara otomatis, lalu hitung dan tampilkan perbandingan **floating loss sebelum avg down** vs **floating loss setelah avg down**.

---

### Data Source

Gunakan **Yahoo Finance API** (gratis, tidak perlu API key). Format ticker saham Indonesia: `BBCA.JK`, `TLKM.JK`, `BMRI.JK`.

URL endpoint:

```
https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}.JK?interval=1d&range=1d
```

Response structure (yang kita butuhkan):

```json
{
  "chart": {
    "result": [
      {
        "meta": {
          "regularMarketPrice": 9250
        }
      }
    ]
  }
}
```

---

### Implementation Steps

#### Step 1: Create API Route (`app/api/stock/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");

  if (!ticker || !/^[A-Z]{4}$/.test(ticker)) {
    return NextResponse.json(
      { error: "Kode saham tidak valid (contoh: BBCA)" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.JK?interval=1d&range=1d`,
      { next: { revalidate: 60 } }, // cache 60 detik
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Saham tidak ditemukan" },
        { status: 404 },
      );
    }

    const data = await res.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (!price) {
      return NextResponse.json(
        { error: "Harga tidak tersedia" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ticker, price });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data saham" },
      { status: 500 },
    );
  }
}
```

---

#### Step 2: Create `components/StockTickerInput.tsx`

Komponen input kode saham dengan tombol "Cari" dan loading state.

**Props:**

```typescript
interface StockTickerInputProps {
  onPriceFetched: (price: number, ticker: string) => void;
}
```

**Behavior:**

- Input text (4 huruf kapital, auto-uppercase)
- Tombol "Cari" di samping input
- Saat diklik, panggil `/api/stock?ticker=XXXX`
- Jika berhasil: panggil `onPriceFetched(price, ticker)` → otomatis isi field "Harga Saat Ini"
- Jika gagal: tampilkan error message di bawah input
- Loading state: disable button + tampilkan spinner/text "Mencari..."

**UI mockup:**

```
┌─────────────────────────────────────────┐
│ Kode Saham (opsional)                   │
│ ┌───────────────────┐ ┌──────────────┐  │
│ │ BBCA              │ │ Cari Harga   │  │
│ └───────────────────┘ └──────────────┘  │
│ ✓ Harga terbaru: Rp 9,250              │
└─────────────────────────────────────────┘
```

---

#### Step 3: Add Floating Loss Calculation to `lib/calculate.ts`

Tambahkan fungsi dan type baru:

```typescript
export type FloatingLossComparison = {
  // Sebelum avg down
  totalCostBefore: number; // currentLots * 100 * avgPrice
  marketValueBefore: number; // currentLots * 100 * marketPrice
  floatingLossBefore: number; // marketValueBefore - totalCostBefore (negatif = rugi)
  floatingLossPercentBefore: number; // (floatingLossBefore / totalCostBefore) * 100

  // Setelah avg down
  totalCostAfter: number; // (currentLots + additionalLots) * 100 * newAvgPrice equivalent
  marketValueAfter: number; // totalLotsAfter * 100 * marketPrice
  floatingLossAfter: number; // marketValueAfter - totalCostAfter
  floatingLossPercentAfter: number;

  // Improvement
  lossDifference: number; // floatingLossAfter - floatingLossBefore (positif = improvement)
  breakEvenPrice: number; // newAvgPrice (harga yang harus dicapai supaya BEP)
};

export function calculateFloatingLoss(
  currentLots: number,
  avgPrice: number,
  marketPrice: number, // harga pasar terbaru dari API
  additionalLots: number,
  buyPrice: number, // harga beli avg down (currentPrice dari form)
): FloatingLossComparison {
  const sharesBefore = currentLots * 100;
  const totalCostBefore = sharesBefore * avgPrice;
  const marketValueBefore = sharesBefore * marketPrice;
  const floatingLossBefore = marketValueBefore - totalCostBefore;
  const floatingLossPercentBefore =
    (floatingLossBefore / totalCostBefore) * 100;

  const sharesAfter = (currentLots + additionalLots) * 100;
  const totalCostAfter = totalCostBefore + additionalLots * 100 * buyPrice;
  const marketValueAfter = sharesAfter * marketPrice;
  const floatingLossAfter = marketValueAfter - totalCostAfter;
  const floatingLossPercentAfter = (floatingLossAfter / totalCostAfter) * 100;

  const lossDifference = floatingLossAfter - floatingLossBefore;
  const breakEvenPrice = totalCostAfter / sharesAfter;

  return {
    totalCostBefore,
    marketValueBefore,
    floatingLossBefore,
    floatingLossPercentBefore,
    totalCostAfter,
    marketValueAfter,
    floatingLossAfter,
    floatingLossPercentAfter,
    lossDifference,
    breakEvenPrice,
  };
}
```

---

#### Step 4: Create `components/FloatingLossCard.tsx`

Komponen untuk menampilkan perbandingan floating loss.

**Props:**

```typescript
interface FloatingLossCardProps {
  comparison: FloatingLossComparison;
  ticker: string;
  marketPrice: number;
}
```

**UI mockup:**

```
┌─────────────────────────────────────────┐
│ 📊 Floating Loss Comparison (BBCA)      │
│                                         │
│ Harga Pasar Saat Ini    Rp 9,250       │
│─────────────────────────────────────────│
│                                         │
│ SEBELUM Average Down:                   │
│ Total Modal             Rp 50,000,000   │
│ Nilai Pasar             Rp 46,250,000   │
│ Floating Loss           -Rp 3,750,000   │
│ Persentase              -7.50%          │
│                                         │
│ SETELAH Average Down:                   │
│ Total Modal             Rp 68,500,000   │
│ Nilai Pasar             Rp 66,600,000   │
│ Floating Loss           -Rp 1,900,000   │
│ Persentase              -2.77%          │
│                                         │
│─────────────────────────────────────────│
│ Perbaikan Loss          +Rp 1,850,000   │
│ Harga BEP Baru          Rp 9,514       │
└─────────────────────────────────────────┘
```

Styling: Gunakan pattern yang sama dengan `ResultCard.tsx` (bg-slate-800, border, ResultRow pattern). Warna merah untuk loss, hijau untuk improvement.

---

#### Step 5: Update `components/Calculator.tsx`

Perubahan yang diperlukan:

1. **Import** `StockTickerInput` dan `FloatingLossCard`
2. **State baru:**
   ```typescript
   const [ticker, setTicker] = useState("");
   const [marketPrice, setMarketPrice] = useState<number | null>(null);
   const [floatingLoss, setFloatingLoss] =
     useState<FloatingLossComparison | null>(null);
   ```
3. **Handler baru:**
   ```typescript
   const handlePriceFetched = (price: number, fetchedTicker: string) => {
     setMarketPrice(price);
     setTicker(fetchedTicker);
     // Otomatis isi currentPrice jika kosong
     if (!currentPrice) {
       setCurrentPrice(formatNumberInput(String(price)));
     }
   };
   ```
4. **Update `handleCalculate`:** Setelah kalkulasi mode1/mode2, jika `marketPrice` ada, panggil `calculateFloatingLoss()` dan simpan hasilnya ke state.
5. **Render `StockTickerInput`:** Di atas section "Posisi Saat Ini"
6. **Render `FloatingLossCard`:** Di bawah `ResultCard` (hanya tampil jika `floatingLoss` ada)

---

### File Changes Summary

| File                              | Action | Description                                                      |
| --------------------------------- | ------ | ---------------------------------------------------------------- |
| `app/api/stock/route.ts`          | CREATE | API route untuk fetch harga saham                                |
| `components/StockTickerInput.tsx` | CREATE | Input kode saham + tombol cari                                   |
| `components/FloatingLossCard.tsx` | CREATE | Card perbandingan floating loss                                  |
| `lib/calculate.ts`                | EDIT   | Tambah `FloatingLossComparison` type + `calculateFloatingLoss()` |
| `components/Calculator.tsx`       | EDIT   | Integrasikan ticker input + floating loss card                   |

---

### Important Notes

- `marketPrice` (dari API) bisa berbeda dengan `currentPrice` (harga beli avg down). User mungkin ingin beli di harga berbeda dari harga pasar saat ini.
- Floating loss card hanya muncul jika user sudah fetch harga via ticker DAN sudah klik "Hitung".
- Jika Yahoo Finance API down/blocked, fitur tetap opsional — user bisa manual input currentPrice tanpa ticker.
- Validasi ticker: hanya 4 huruf kapital (format IDX).

---

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
