"use client";

interface Mode3FormProps {
  targetProfitLossPercent: string;
  onTargetProfitLossPercentChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function Mode3Form({
  targetProfitLossPercent,
  onTargetProfitLossPercentChange,
  error,
  disabled,
}: Mode3FormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow minus sign, digits, and single decimal point
    if (/^-?\d*\.?\d*$/.test(raw) || raw === "" || raw === "-") {
      onTargetProfitLossPercentChange(raw);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {disabled ? (
        <p className="text-amber-400 text-sm bg-amber-400/10 rounded-xl px-4 py-3">
          Cari harga saham terlebih dahulu agar nilai pasar dapat dihitung.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-slate-400 text-xs">
            Target Profit/Loss Setelah Pembelian (%)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={targetProfitLossPercent}
              onChange={handleChange}
              placeholder="-5"
              className={`w-full bg-slate-700 text-white rounded-xl px-4 py-3 pr-10 text-sm outline-none border ${
                error
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-600 focus:border-emerald-500"
              } transition-colors`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              %
            </span>
          </div>
          {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
          <p className="text-slate-500 text-xs">
            Gunakan angka negatif untuk loss atau positif untuk profit
          </p>
        </div>
      )}
    </div>
  );
}
