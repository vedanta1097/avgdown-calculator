"use client";

import { formatNumberInput } from "@/lib/calculate";

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  prefix?: string;
  suffix?: string;
}

function NumberInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  prefix,
  suffix,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(formatNumberInput(e.target.value));
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-400 font-medium">{label}</label>
      <div
        className={`flex items-center bg-slate-700 rounded-xl border transition-colors ${
          error
            ? "border-red-500"
            : "border-slate-600 focus-within:border-emerald-500"
        }`}
      >
        {prefix && (
          <span className="pl-3 text-slate-400 text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-3 text-white placeholder-slate-500 focus:outline-none text-sm min-w-0"
        />
        {suffix && (
          <span className="pr-3 text-slate-400 text-sm select-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

interface InputFormProps {
  currentLots: string;
  avgPrice: string;
  currentPrice: string;
  onLotsChange: (value: string) => void;
  onAvgPriceChange: (value: string) => void;
  onCurrentPriceChange: (value: string) => void;
  errors: {
    currentLots?: string;
    avgPrice?: string;
    currentPrice?: string;
  };
}

export default function InputForm({
  currentLots,
  avgPrice,
  currentPrice,
  onLotsChange,
  onAvgPriceChange,
  onCurrentPriceChange,
  errors,
}: InputFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <NumberInput
        label="Jumlah Lot Saat Ini"
        value={currentLots}
        onChange={onLotsChange}
        error={errors.currentLots}
        placeholder="10"
        suffix="lot"
      />
      <NumberInput
        label="Harga Rata-rata Beli (per lembar)"
        value={avgPrice}
        onChange={onAvgPriceChange}
        error={errors.avgPrice}
        placeholder="1,000"
        prefix="Rp"
      />
      <NumberInput
        label="Harga Saham Saat Ini (per lembar)"
        value={currentPrice}
        onChange={onCurrentPriceChange}
        error={errors.currentPrice}
        placeholder="800"
        prefix="Rp"
      />
    </div>
  );
}
