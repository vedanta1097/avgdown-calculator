"use client";

import {
  type Mode1Result,
  type Mode2Result,
  formatRupiah,
} from "@/lib/calculate";

interface ResultRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function ResultRow({ label, value, highlight }: ResultRowProps) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-700 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span
        className={`font-semibold ${
          highlight ? "text-emerald-400 text-base" : "text-white text-sm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

interface ResultCardProps {
  mode: "mode1" | "mode2";
  mode1Result?: Mode1Result | null;
  mode2Result?: Mode2Result | null;
  currentAvgPrice: number;
}

export default function ResultCard({
  mode,
  mode1Result,
  mode2Result,
  currentAvgPrice,
}: ResultCardProps) {
  if (mode === "mode1" && mode1Result) {
    const { additionalLots, moneyNeeded, actualNewAvg, totalLots } =
      mode1Result;
    const dropPercent =
      ((currentAvgPrice - actualNewAvg) / currentAvgPrice) * 100;

    return (
      <div className="bg-slate-800 rounded-2xl border border-emerald-500/30 p-5">
        <h3 className="text-emerald-400 font-semibold text-sm mb-1">
          Hasil Kalkulasi
        </h3>
        <ResultRow
          label="Lot yang perlu dibeli"
          value={`${additionalLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow
          label="Modal yang dibutuhkan"
          value={formatRupiah(moneyNeeded)}
        />
        <ResultRow
          label="Total lot setelah avg down"
          value={`${totalLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow
          label="Harga rata-rata baru"
          value={formatRupiah(actualNewAvg)}
          highlight
        />
        <ResultRow
          label="Penurunan avg price"
          value={`${dropPercent.toFixed(2)}%`}
        />
        <p className="text-xs text-slate-500 mt-3">
          * Pembelian dibulatkan ke atas (lot utuh), sehingga avg baru bisa
          sedikit lebih rendah dari target.
        </p>
      </div>
    );
  }

  if (mode === "mode2" && mode2Result) {
    const {
      affordableLots,
      moneyUsed,
      moneyLeft,
      newAvgPrice,
      totalLots,
      avgDropPercent,
    } = mode2Result;

    return (
      <div className="bg-slate-800 rounded-2xl border border-emerald-500/30 p-5">
        <h3 className="text-emerald-400 font-semibold text-sm mb-1">
          Hasil Kalkulasi
        </h3>
        <ResultRow
          label="Lot yang bisa dibeli"
          value={`${affordableLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow label="Uang yang terpakai" value={formatRupiah(moneyUsed)} />
        <ResultRow label="Sisa uang" value={formatRupiah(moneyLeft)} />
        <ResultRow
          label="Total lot setelah avg down"
          value={`${totalLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow
          label="Harga rata-rata baru"
          value={formatRupiah(newAvgPrice)}
          highlight
        />
        <ResultRow
          label="Penurunan avg price"
          value={`${avgDropPercent.toFixed(2)}%`}
        />
      </div>
    );
  }

  return null;
}
