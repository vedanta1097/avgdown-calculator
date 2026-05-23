# Stock Averaging Down Calculator

A web app that helps you calculate the optimal strategy for averaging down your Indonesian stock positions, with live price lookup and floating loss comparison.

https://github.com/user-attachments/assets/6096bc31-c91e-4ed3-9543-31c0dfa9a9d1

## Features

- **Live Stock Price Lookup:** Enter an IDX ticker (e.g. `BBCA`, `TLKM`) to fetch the latest market price automatically via Yahoo Finance — no API key needed
- **Mode 1 – Target Average Price:** Enter your desired new average price → get the number of lots and capital required to reach it
- **Mode 2 – Available Capital:** Enter how much money you have → get the new average price after buying
- **Floating Loss Comparison:** After calculating, see a side-by-side breakdown of your floating loss (Rp & %) _before_ and _after_ averaging down, plus your new break-even price
- Auto-formats numbers with comma separators as you type (e.g. `1000000` → `1,000,000`)
- Full input validation with clear error messages
- Dark mode, mobile-first, responsive design

## How It Works

1. **(Optional)** Type your stock ticker and click **Cari Harga** — the current price field is filled automatically
2. Fill in your current lots, average buy price, and the price you want to buy at
3. Choose a mode and enter your target price or available capital
4. Click **Hitung** to see:
   - How many lots to buy and capital needed (or new average price)
   - A floating loss comparison card showing the impact of averaging down at current market price

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build & Production

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Leave all settings as default
4. Click **Deploy**

No environment variables required.

## Tech Stack

- [Next.js 15](https://nextjs.org/) – App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Yahoo Finance API](https://finance.yahoo.com/) – live IDX stock prices (no key required)
