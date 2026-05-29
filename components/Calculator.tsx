"use client";

import { useState } from "react";
import InputForm from "./InputForm";
import ModeSelector from "./ModeSelector";
import Mode1Form from "./Mode1Form";
import Mode2Form from "./Mode2Form";
import Mode3Form from "./Mode3Form";
import ResultCard from "./ResultCard";
import StockTickerInput from "./StockTickerInput";
import FloatingLossCard from "./FloatingLossCard";
import {
  parseNumber,
  formatDecimalInput,
  formatRupiah,
  calculateMode1,
  calculateMode2,
  calculateMode3,
  calculateFloatingLoss,
  type Mode1Result,
  type Mode2Result,
  type Mode3Result,
  type FloatingLossComparison,
} from "@/lib/calculate";

type Mode = "mode1" | "mode2" | "mode3";

type Errors = {
  currentLots?: string;
  avgPrice?: string;
  currentPrice?: string;
  targetAvgPrice?: string;
  availableMoney?: string;
  targetLossPercent?: string;
};

export default function Calculator() {
  const [mode, setMode] = useState<Mode>("mode2");

  // Shared inputs (stored as formatted strings with commas)
  const [currentLots, setCurrentLots] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");

  // Mode-specific inputs
  const [targetAvgPrice, setTargetAvgPrice] = useState("");
  const [availableMoney, setAvailableMoney] = useState("");
  const [targetLossPercent, setTargetLossPercent] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [mode1Result, setMode1Result] = useState<Mode1Result | null>(null);
  const [mode2Result, setMode2Result] = useState<Mode2Result | null>(null);
  const [mode3Result, setMode3Result] = useState<Mode3Result | null>(null);

  // Stock ticker + floating loss state
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [ticker, setTicker] = useState("");
  const [floatingLoss, setFloatingLoss] =
    useState<FloatingLossComparison | null>(null);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setMode1Result(null);
    setMode2Result(null);
    setMode3Result(null);
    setFloatingLoss(null);
    setErrors({});
  };

  const handlePriceFetched = (price: number, fetchedTicker: string) => {
    setMarketPrice(price);
    setTicker(fetchedTicker);
    setFloatingLoss(null);
    // Always update current price field when a new ticker is fetched
    setCurrentPrice(formatDecimalInput(String(price)));
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

    if (mode === "mode3") {
      const t = parseFloat(targetLossPercent);
      if (!targetLossPercent || isNaN(t)) {
        newErrors.targetLossPercent = "Masukkan target floating loss %";
      } else if (t >= 0) {
        newErrors.targetLossPercent = "Target harus negatif (contoh: -5)";
      } else if (t <= -100) {
        newErrors.targetLossPercent = "Target tidak boleh kurang dari -100%";
      } else if (lots > 0 && avg > 0 && current > 0) {
        // Check denominator & achievability using current price from input
        const S = lots * 100;
        const C = S * avg;
        const P = current;
        const M = current;
        const T = t;
        const denominator = M - P * (1 + T / 100);
        if (Math.abs(denominator) < 1e-9) {
          newErrors.targetLossPercent =
            "Target tidak bisa dicapai dengan harga beli ini";
        } else {
          const numerator = C * (1 + T / 100) - S * M;
          const n = numerator / denominator;
          if (n <= 0) {
            newErrors.targetLossPercent =
              "Target sudah tercapai tanpa avg down";
          }
        }
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

    let additionalLots = 0;

    if (mode === "mode1") {
      const target = parseNumber(targetAvgPrice);
      const result = calculateMode1(lots, avg, current, target);
      setMode1Result(result);
      setMode2Result(null);
      setMode3Result(null);
      additionalLots = result.additionalLots;
    } else if (mode === "mode2") {
      const money = parseNumber(availableMoney);
      const result = calculateMode2(lots, avg, current, money);
      setMode2Result(result);
      setMode1Result(null);
      setMode3Result(null);
      additionalLots = result.affordableLots;
    } else {
      const t = parseFloat(targetLossPercent);
      // Use current price from input as market price for mode3
      const result = calculateMode3(lots, avg, current, current, t);
      setMode3Result(result);
      setMode1Result(null);
      setMode2Result(null);
      additionalLots = result.additionalLots;
    }

    // Always use current price from input for floating loss calculation
    setFloatingLoss(
      calculateFloatingLoss(lots, avg, current, additionalLots, current),
    );
  };

  const hasResult =
    mode === "mode1"
      ? !!mode1Result
      : mode === "mode2"
        ? !!mode2Result
        : !!mode3Result;

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

      {/* Stock Ticker */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <h2 className="text-white font-semibold text-sm mb-4">
          Cari Harga Saham
        </h2>
        <StockTickerInput onPriceFetched={handlePriceFetched} />
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
          {mode === "mode1"
            ? "Target Averaging Down"
            : mode === "mode2"
              ? "Modal Averaging Down"
              : "Target Floating Loss"}
        </h2>
        {mode === "mode1" ? (
          <Mode1Form
            targetAvgPrice={targetAvgPrice}
            onTargetAvgPriceChange={setTargetAvgPrice}
            error={errors.targetAvgPrice}
          />
        ) : mode === "mode2" ? (
          <Mode2Form
            availableMoney={availableMoney}
            onAvailableMoneyChange={setAvailableMoney}
            error={errors.availableMoney}
          />
        ) : (
          <Mode3Form
            targetLossPercent={targetLossPercent}
            onTargetLossPercentChange={setTargetLossPercent}
            error={errors.targetLossPercent}
            disabled={false}
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
          mode3Result={mode3Result}
          currentAvgPrice={parseNumber(avgPrice)}
        />
      )}

      {/* Floating Loss Comparison */}
      {floatingLoss !== null && (
        <FloatingLossCard
          comparison={floatingLoss}
          ticker={ticker}
          marketPrice={parseNumber(currentPrice)}
        />
      )}
    </div>
  );
}
