"use client";

import { useState } from "react";
import InputForm from "./InputForm";
import ModeSelector from "./ModeSelector";
import Mode1Form from "./Mode1Form";
import Mode2Form from "./Mode2Form";
import ResultCard from "./ResultCard";
import {
  parseNumber,
  formatRupiah,
  calculateMode1,
  calculateMode2,
  type Mode1Result,
  type Mode2Result,
} from "@/lib/calculate";

type Mode = "mode1" | "mode2";

type Errors = {
  currentLots?: string;
  avgPrice?: string;
  currentPrice?: string;
  targetAvgPrice?: string;
  availableMoney?: string;
};

export default function Calculator() {
  const [mode, setMode] = useState<Mode>("mode1");

  // Shared inputs (stored as formatted strings with commas)
  const [currentLots, setCurrentLots] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");

  // Mode-specific inputs
  const [targetAvgPrice, setTargetAvgPrice] = useState("");
  const [availableMoney, setAvailableMoney] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [mode1Result, setMode1Result] = useState<Mode1Result | null>(null);
  const [mode2Result, setMode2Result] = useState<Mode2Result | null>(null);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setMode1Result(null);
    setMode2Result(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    const lots = parseNumber(currentLots);
    const avg = parseNumber(avgPrice);
    const current = parseNumber(currentPrice);

    if (!currentLots || lots <= 0) {
      newErrors.currentLots = "Masukkan jumlah lot yang valid";
    }
    if (!avgPrice || avg <= 0) {
      newErrors.avgPrice = "Masukkan harga rata-rata yang valid";
    }
    if (!currentPrice || current <= 0) {
      newErrors.currentPrice = "Masukkan harga saham saat ini yang valid";
    }
    if (lots > 0 && avg > 0 && current > 0 && current >= avg) {
      newErrors.currentPrice =
        "Harga saat ini harus lebih rendah dari harga rata-rata (avg down hanya berlaku saat harga turun)";
    }

    if (mode === "mode1") {
      const target = parseNumber(targetAvgPrice);
      if (!targetAvgPrice || target <= 0) {
        newErrors.targetAvgPrice = "Masukkan target harga rata-rata yang valid";
      } else if (avg > 0 && target >= avg) {
        newErrors.targetAvgPrice =
          "Target harga harus lebih rendah dari harga rata-rata saat ini";
      } else if (current > 0 && target <= current) {
        newErrors.targetAvgPrice =
          "Target harga harus lebih tinggi dari harga saham saat ini";
      }
    }

    if (mode === "mode2") {
      const money = parseNumber(availableMoney);
      if (!availableMoney || money <= 0) {
        newErrors.availableMoney = "Masukkan jumlah modal yang valid";
      } else if (current > 0 && money < current * 100) {
        newErrors.availableMoney = `Modal tidak cukup untuk membeli 1 lot (minimal ${formatRupiah(current * 100)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) return;

    const lots = parseNumber(currentLots);
    const avg = parseNumber(avgPrice);
    const current = parseNumber(currentPrice);

    if (mode === "mode1") {
      const target = parseNumber(targetAvgPrice);
      setMode1Result(calculateMode1(lots, avg, current, target));
      setMode2Result(null);
    } else {
      const money = parseNumber(availableMoney);
      setMode2Result(calculateMode2(lots, avg, current, money));
      setMode1Result(null);
    }
  };

  const hasResult = mode === "mode1" ? !!mode1Result : !!mode2Result;

  return (
    <div className="max-w-md mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-white">
          Kalkulator Averaging Down
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Hitung strategi avg down saham kamu
        </p>
      </div>

      {/* Shared Inputs */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <h2 className="text-white font-semibold text-sm mb-4">
          Posisi Saat Ini
        </h2>
        <InputForm
          currentLots={currentLots}
          avgPrice={avgPrice}
          currentPrice={currentPrice}
          onLotsChange={setCurrentLots}
          onAvgPriceChange={setAvgPrice}
          onCurrentPriceChange={setCurrentPrice}
          errors={{
            currentLots: errors.currentLots,
            avgPrice: errors.avgPrice,
            currentPrice: errors.currentPrice,
          }}
        />
      </div>

      {/* Mode Selector */}
      <ModeSelector activeMode={mode} onModeChange={handleModeChange} />

      {/* Mode-specific Input */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <h2 className="text-white font-semibold text-sm mb-4">
          {mode === "mode1" ? "Target Averaging Down" : "Modal Averaging Down"}
        </h2>
        {mode === "mode1" ? (
          <Mode1Form
            targetAvgPrice={targetAvgPrice}
            onTargetAvgPriceChange={setTargetAvgPrice}
            error={errors.targetAvgPrice}
          />
        ) : (
          <Mode2Form
            availableMoney={availableMoney}
            onAvailableMoneyChange={setAvailableMoney}
            error={errors.availableMoney}
          />
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold rounded-2xl transition-colors text-base cursor-pointer"
      >
        Hitung
      </button>

      {/* Result */}
      {hasResult && (
        <ResultCard
          mode={mode}
          mode1Result={mode1Result}
          mode2Result={mode2Result}
          currentAvgPrice={parseNumber(avgPrice)}
        />
      )}
    </div>
  );
}
