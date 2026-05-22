# Stock Averaging Down Calculator

A web app that helps you calculate the optimal strategy for averaging down your stock positions.

## Features

- **Mode 1 – Target Average Price:** Enter your desired new average price → get the number of lots and capital required to reach it
- **Mode 2 – Available Capital:** Enter how much money you have → get the new average price after buying
- Auto-formats numbers with comma separators as you type (e.g. `1000000` → `1,000,000`)
- Full input validation with clear error messages
- Dark mode, mobile-first, responsive design

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
