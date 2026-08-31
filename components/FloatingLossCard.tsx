"use client";

import { type FloatingLossComparison, formatRupiah } from "@/lib/calculate";

interface FloatingLossRowProps {
  label: string;
  value: string;
  color?: "red" | "green" | "white";
}

function FloatingLossRow({
  label,
  value,
  color = "white",
}: FloatingLossRowProps) {
  const colorClass =
    color === "red"
      ? "text-red-400"
      : color === "green"
        ? "text-emerald-400"
        : "text-white";

  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`font-semibold text-sm ${colorClass}`}>{value}</span>
    </div>
  );
}

interface FloatingLossCardProps {
  comparison: FloatingLossComparison;
  ticker: string;
  marketPrice: number;
}

export default function FloatingLossCard({
  comparison,
  ticker,
  marketPrice,
}: FloatingLossCardProps) {
  const {
    totalCostBefore,
    marketValueBefore,
    floatingLossBefore,
    floatingLossPercentBefore,
    totalCostAfter,
    marketValueAfter,
    floatingLossAfter,
    floatingLossPercentAfter,
  } = comparison;

  const formatLoss = (val: number) =>
    val >= 0 ? `+${formatRupiah(val)}` : `-${formatRupiah(Math.abs(val))}`;

  const formatPercent = (val: number) =>
    `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;

  return (
    <div className="bg-slate-800 rounded-2xl border border-blue-500/30 p-5">
      <h3 className="text-blue-400 font-semibold text-sm mb-1">
        Perbandingan Posisi
        {ticker && (
          <span className="text-slate-400 font-normal ml-1">({ticker}.JK)</span>
        )}
      </h3>
      <p className="text-slate-500 text-xs mb-4">
        Harga pasar saat ini: {formatRupiah(marketPrice)}
      </p>

      {/* Sebelum */}
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
        Sebelum Pembelian
      </p>
      <FloatingLossRow
        label="Total Modal"
        value={formatRupiah(totalCostBefore)}
      />
      <FloatingLossRow
        label="Nilai Pasar"
        value={formatRupiah(marketValueBefore)}
      />
      <FloatingLossRow
        label="Floating Profit/Loss"
        value={`${formatLoss(floatingLossBefore)} (${formatPercent(floatingLossPercentBefore)})`}
        color={floatingLossBefore >= 0 ? "green" : "red"}
      />

      {/* Divider */}
      <div className="my-3 border-t border-slate-600" />

      {/* Sesudah */}
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
        Setelah Pembelian
      </p>
      <FloatingLossRow
        label="Total Modal"
        value={formatRupiah(totalCostAfter)}
      />
      <FloatingLossRow
        label="Nilai Pasar"
        value={formatRupiah(marketValueAfter)}
      />
      <FloatingLossRow
        label="Floating Profit/Loss"
        value={`${formatLoss(floatingLossAfter)} (${formatPercent(floatingLossPercentAfter)})`}
        color={floatingLossAfter >= 0 ? "green" : "red"}
      />
    </div>
  );
}
