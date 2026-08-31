"use client";

import { formatNumberInput } from "@/lib/calculate";

interface Mode2FormProps {
  availableMoney: string;
  onAvailableMoneyChange: (value: string) => void;
  error?: string;
}

export default function Mode2Form({
  availableMoney,
  onAvailableMoneyChange,
  error,
}: Mode2FormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAvailableMoneyChange(formatNumberInput(e.target.value));
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-400 font-medium">
        Modal yang Tersedia
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
          inputMode="numeric"
          value={availableMoney}
          onChange={handleChange}
          placeholder="1,000,000"
          className="flex-1 bg-transparent px-3 py-3 text-white placeholder-slate-500 focus:outline-none text-sm"
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <p className="text-xs text-slate-500 mt-0.5">
        Jumlah uang yang ingin digunakan untuk pembelian tambahan
      </p>
    </div>
  );
}
