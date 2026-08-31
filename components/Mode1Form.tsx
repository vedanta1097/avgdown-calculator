"use client";

import { formatDecimalInput } from "@/lib/calculate";

interface Mode1FormProps {
  targetAvgPrice: string;
  onTargetAvgPriceChange: (value: string) => void;
  error?: string;
}

export default function Mode1Form({
  targetAvgPrice,
  onTargetAvgPriceChange,
  error,
}: Mode1FormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTargetAvgPriceChange(formatDecimalInput(e.target.value));
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-400 font-medium">
        Target Harga Rata-rata (per lembar)
      </label>
      <div
        className={`flex items-center bg-slate-700 rounded-xl border transition-colors ${
          error
            ? "border-red-500"
            : "border-slate-600 focus-within:border-emerald-500"
        }`}
      >
        <span className="pl-3 text-slate-400 text-sm select-none">Rp</span>
        <input
          type="text"
          inputMode="decimal"
          value={targetAvgPrice}
          onChange={handleChange}
          placeholder="900"
          className="flex-1 bg-transparent px-3 py-3 text-white placeholder-slate-500 focus:outline-none text-sm"
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <p className="text-xs text-slate-500 mt-0.5">
        Target harus berada di antara average saat ini dan harga beli tambahan
      </p>
    </div>
  );
}
