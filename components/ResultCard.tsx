"use client";

import {
  type AveragingStrategy,
  type Mode1Result,
  type Mode2Result,
  type Mode3Result,
  formatRupiah,
} from "@/lib/calculate";

const strategyLabel: Record<AveragingStrategy, string> = {
  up: "Average Up",
  down: "Average Down",
  unchanged: "Average Tetap",
};

function formatChange(percent: number) {
  return `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;
}

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
  mode: "mode1" | "mode2" | "mode3";
  mode1Result?: Mode1Result | null;
  mode2Result?: Mode2Result | null;
  mode3Result?: Mode3Result | null;
  currentAvgPrice: number;
}

export default function ResultCard({
  mode,
  mode1Result,
  mode2Result,
  mode3Result,
  currentAvgPrice,
}: ResultCardProps) {
  if (mode === "mode1" && mode1Result) {
    const {
      additionalLots,
      moneyNeeded,
      actualNewAvg,
      totalLots,
      avgChangePercent,
      strategy,
    } = mode1Result;

    return (
      <div className="bg-slate-800 rounded-2xl border border-emerald-500/30 p-5">
        <h3 className="text-emerald-400 font-semibold text-sm mb-1">
          Hasil Kalkulasi
        </h3>
        <ResultRow label="Strategi" value={strategyLabel[strategy]} />
        <ResultRow
          label="Lot yang perlu dibeli"
          value={`${additionalLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow
          label="Modal yang dibutuhkan"
          value={formatRupiah(moneyNeeded)}
        />
        <ResultRow
          label="Total lot setelah pembelian"
          value={`${totalLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow
          label="Harga rata-rata baru"
          value={formatRupiah(actualNewAvg)}
          highlight
        />
        <ResultRow
          label="Perubahan average"
          value={formatChange(avgChangePercent)}
        />
        <p className="text-xs text-slate-500 mt-3">
          * Pembelian dibulatkan ke atas ke lot utuh, sehingga average aktual
          bisa sedikit melewati target.
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
      avgChangePercent,
      strategy,
    } = mode2Result;

    return (
      <div className="bg-slate-800 rounded-2xl border border-emerald-500/30 p-5">
        <h3 className="text-emerald-400 font-semibold text-sm mb-1">
          Hasil Kalkulasi
        </h3>
        <ResultRow label="Strategi" value={strategyLabel[strategy]} />
        <ResultRow
          label="Lot yang bisa dibeli"
          value={`${affordableLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow label="Uang yang terpakai" value={formatRupiah(moneyUsed)} />
        <ResultRow label="Sisa uang" value={formatRupiah(moneyLeft)} />
        <ResultRow
          label="Total lot setelah pembelian"
          value={`${totalLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow
          label="Harga rata-rata baru"
          value={formatRupiah(newAvgPrice)}
          highlight
        />
        <ResultRow
          label="Perubahan average"
          value={formatChange(avgChangePercent)}
        />
      </div>
    );
  }

  if (mode === "mode3" && mode3Result) {
    const {
      additionalLots,
      moneyNeeded,
      newAvgPrice,
      totalLots,
      actualProfitLossPercent,
      strategy,
    } = mode3Result;
    const avgChangePercent =
      ((newAvgPrice - currentAvgPrice) / currentAvgPrice) * 100;
    const lossColor =
      actualProfitLossPercent < 0 ? "text-red-400" : "text-emerald-400";

    return (
      <div className="bg-slate-800 rounded-2xl border border-emerald-500/30 p-5">
        <h3 className="text-emerald-400 font-semibold text-sm mb-1">
          Hasil Kalkulasi
        </h3>
        <ResultRow label="Strategi" value={strategyLabel[strategy]} />
        <ResultRow
          label="Lot yang perlu dibeli"
          value={`${additionalLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow
          label="Dana yang dibutuhkan"
          value={formatRupiah(moneyNeeded)}
          highlight
        />
        <ResultRow
          label="Total lot setelah pembelian"
          value={`${totalLots.toLocaleString("en-US")} lot`}
        />
        <ResultRow
          label="Harga rata-rata baru"
          value={formatRupiah(newAvgPrice)}
        />
        <ResultRow
          label="Perubahan average"
          value={formatChange(avgChangePercent)}
        />
        <div className="flex justify-between items-center py-2.5">
          <span className="text-slate-400 text-sm">Profit/loss aktual</span>
          <span className={`font-semibold text-sm ${lossColor}`}>
            {formatChange(actualProfitLossPercent)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          * Pembelian dibulatkan ke atas ke lot utuh, sehingga profit/loss
          aktual bisa sedikit berbeda dari target.
        </p>
      </div>
    );
  }

  return null;
}
