"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/calculate";

interface StockTickerInputProps {
  onPriceFetched: (price: number, ticker: string) => void;
}

export default function StockTickerInput({
  onPriceFetched,
}: StockTickerInputProps) {
  const [tickerInput, setTickerInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);
  const [fetchedTicker, setFetchedTicker] = useState("");

  const handleSearch = async () => {
    const ticker = tickerInput.trim().toUpperCase();
    if (!ticker) return;

    setLoading(true);
    setError("");
    setFetchedPrice(null);

    try {
      const res = await fetch(`/api/stock?ticker=${ticker}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal mengambil data saham");
        return;
      }

      setFetchedPrice(data.price);
      setFetchedTicker(data.ticker);
      onPriceFetched(data.price, data.ticker);
    } catch {
      setError("Gagal mengambil data saham, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-400 font-medium">
        Kode Saham{" "}
        <span className="text-slate-500 font-normal">(opsional)</span>
      </label>
      <div className="flex gap-2">
        <div
          className={`flex items-center flex-1 bg-slate-700 rounded-xl border transition-colors ${
            error
              ? "border-red-500"
              : "border-slate-600 focus-within:border-emerald-500"
          }`}
        >
          <input
            type="text"
            value={tickerInput}
            onChange={(e) =>
              setTickerInput(
                e.target.value.toUpperCase().replace(/[^A-Z]/g, ""),
              )
            }
            onKeyDown={handleKeyDown}
            placeholder="BBCA"
            maxLength={5}
            className="flex-1 bg-transparent px-3 py-3 text-white placeholder-slate-500 focus:outline-none text-sm uppercase tracking-widest min-w-0"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !tickerInput.trim()}
          className="px-4 py-3 bg-slate-600 hover:bg-slate-500 active:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer"
        >
          {loading ? "Mencari..." : "Cari Harga"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {fetchedPrice !== null && !error && (
        <p className="text-emerald-400 text-xs">
          ✓ Harga terbaru {fetchedTicker}.JK: {formatRupiah(fetchedPrice)}
        </p>
      )}
    </div>
  );
}
