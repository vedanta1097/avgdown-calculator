"use client";

type Mode = "mode1" | "mode2" | "mode3";

interface ModeSelectorProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSelector({
  activeMode,
  onModeChange,
}: ModeSelectorProps) {
  return (
    <div className="flex gap-2 bg-slate-800 border border-slate-700 rounded-2xl p-1">
      <button
        onClick={() => onModeChange("mode2")}
        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
          activeMode === "mode2"
            ? "bg-emerald-500 text-white shadow-md"
            : "text-slate-400 hover:text-white"
        }`}
      >
        Modal Tersedia
      </button>
      <button
        onClick={() => onModeChange("mode3")}
        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
          activeMode === "mode3"
            ? "bg-emerald-500 text-white shadow-md"
            : "text-slate-400 hover:text-white"
        }`}
      >
        Target Loss %
      </button>
      <button
        onClick={() => onModeChange("mode1")}
        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
          activeMode === "mode1"
            ? "bg-emerald-500 text-white shadow-md"
            : "text-slate-400 hover:text-white"
        }`}
      >
        Target Harga Avg
      </button>
    </div>
  );
}
