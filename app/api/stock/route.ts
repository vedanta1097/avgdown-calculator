import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");

  if (!ticker || !/^[A-Z]{2,5}$/.test(ticker)) {
    return NextResponse.json(
      { error: "Kode saham tidak valid (contoh: BBCA, TLKM)" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.JK?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        next: { revalidate: 60 },
      },
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
        { error: "Harga tidak tersedia untuk saham ini" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ticker, price });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data saham, coba lagi" },
      { status: 500 },
    );
  }
}
