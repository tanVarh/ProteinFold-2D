import React, { useState } from 'react';
import { Dna, Shuffle } from 'lucide-react';

export default function SequenceInput({
  inputSequence,
  setInputSequence,
  convertedData,
  benchmarks = [],
  onSelectBenchmark,
  onConvert,
  loading,
}) {
  const [selectedResidue, setSelectedResidue] = useState(null);
  const [randomLen, setRandomLen] = useState(20);
  const [randomHRatio, setRandomHRatio] = useState(0.5);

  const handleGenerateRandom = () => {
    let result = '';
    for (let i = 0; i < randomLen; i++) {
      result += Math.random() < randomHRatio ? 'H' : 'P';
    }
    setInputSequence(result);
  };

  const cleanSeq = (inputSequence || '').replace(/[\s\-,]+/g, '');

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col justify-between h-full space-y-4">
      {/* 1. Header & Controls: [Icon] [Title + subtitle]        [Preset dropdown] [Random] */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Dna className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-100 whitespace-nowrap leading-tight">
              Protein Sequence Input
            </h2>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              HP notation or 20 standard amino acids
            </p>
          </div>
        </div>

        {/* Preset Selector Dropdown & Random Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              id="benchmark-preset-select"
              aria-label="Load Literature Preset"
              onChange={(e) => {
                const b = benchmarks.find((item) => item.id === e.target.value);
                if (b) onSelectBenchmark(b);
              }}
              defaultValue=""
              className="bg-slate-900/90 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none pr-7 cursor-pointer font-sans max-w-[150px] sm:max-w-[190px] truncate transition"
            >
              <option value="" disabled>
                Presets...
              </option>
              {benchmarks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (N={b.length})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            id="random-sequence-btn"
            onClick={handleGenerateRandom}
            title="Generate Random Sequence"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition shrink-0 shadow-sm active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Random</span>
          </button>
        </div>
      </div>

      {/* 2. Sequence String section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="sequence-box" className="text-slate-300 font-medium flex items-center gap-1.5">
            <span>Sequence String</span>
            <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
              (Case-insensitive, stripped automatically)
            </span>
          </label>
          <span className="text-xs font-mono text-slate-400">
            Length: <strong className="text-cyan-400 font-semibold">{cleanSeq.length}</strong>
          </span>
        </div>

        <div className="relative">
          <textarea
            id="sequence-box"
            rows={3}
            value={inputSequence}
            onChange={(e) => setInputSequence(e.target.value)}
            placeholder="e.g. HPHPPHHPHPPHPHHPPHPH or MQIFVKTLTGKTITLE"
            className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition tracking-wider uppercase resize-none h-[76px] leading-relaxed"
          />
        </div>
      </div>

      {/* 3. HP Statistics & 4. Mapped HP Residue Chain */}
      {convertedData && (
        <div className="space-y-3.5">
          {/* Summary Statistics Bar: Type, Hydrophobic, Polar horizontally aligned with equal spacing */}
          <div className="grid grid-cols-3 gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs items-center">
            {/* Type */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 min-w-0">
              <span className="text-slate-400 text-[11px] font-medium shrink-0">Type:</span>
              <span className="px-1.5 py-0.5 rounded text-[11px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 font-mono font-semibold truncate">
                {convertedData.sequence_type}
              </span>
            </div>

            {/* Hydrophobic (H) */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50 shrink-0"></span>
              <span className="text-slate-300 text-[11px] truncate">
                Hydrophobic: <strong className="text-orange-400 font-mono font-bold">{convertedData.h_count}</strong>
                <span className="text-slate-400 font-mono text-[10px] ml-1">({convertedData.h_ratio}%)</span>
              </span>
            </div>

            {/* Polar (P) */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 shrink-0"></span>
              <span className="text-slate-300 text-[11px] truncate">
                Polar: <strong className="text-cyan-400 font-mono font-bold">{convertedData.p_count}</strong>
                <span className="text-slate-400 font-mono text-[10px] ml-1">({(100 - convertedData.h_ratio).toFixed(1)}%)</span>
              </span>
            </div>
          </div>

          {/* Mapped HP Residue Chain Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">Mapped HP Residue Chain</span>
              <span className="text-[11px] text-slate-500 font-mono">N → C Terminus</span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 max-h-36 overflow-y-auto content-start">
              {convertedData.residue_details?.map((res, idx) => {
                const isH = res.hp === 'H';
                const isSelected = selectedResidue?.index === res.index;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedResidue(isSelected ? null : res)}
                    title={`#${res.index} ${res.name} (${res.original}) → ${res.hp} | Kyte-Doolittle: ${res.kd_index}`}
                    className={`w-9 h-11 flex flex-col items-center justify-between p-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                      isH
                        ? 'bg-gradient-to-b from-orange-500/20 to-amber-600/30 text-orange-400 border border-orange-500/40 hover:border-orange-400 hover:shadow-md hover:shadow-orange-500/20'
                        : 'bg-gradient-to-b from-cyan-500/20 to-blue-600/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-500/20'
                    } ${isSelected ? 'ring-2 ring-white scale-105 shadow-lg z-10' : ''}`}
                  >
                    <span className="text-[9px] text-slate-400 font-normal leading-none opacity-80">{res.index}</span>
                    <span className="text-xs font-extrabold leading-none">{res.hp}</span>
                    <span className="text-[8px] leading-none opacity-70 font-sans">
                      {res.original !== res.hp ? res.original : '·'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Residue Detail Card */}
          {selectedResidue && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-700/80 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fadeIn">
              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Position:</span>
                <span className="font-mono font-bold text-white text-xs">#{selectedResidue.index} ({selectedResidue.name})</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">HP Type:</span>
                <span className="font-mono font-bold text-xs truncate block">
                  {selectedResidue.original} →{' '}
                  <strong className={selectedResidue.hp === 'H' ? 'text-orange-400' : 'text-cyan-400'}>
                    {selectedResidue.hp === 'H' ? 'Hydrophobic' : 'Polar'}
                  </strong>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Kyte-Doolittle:</span>
                <span className={`font-mono font-bold text-xs ${selectedResidue.kd_index > 0 ? 'text-orange-400' : 'text-cyan-400'}`}>
                  {selectedResidue.kd_index > 0 ? `+${selectedResidue.kd_index}` : selectedResidue.kd_index}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Lattice Role:</span>
                <span className="font-mono text-slate-200 text-xs truncate block">
                  {selectedResidue.hp === 'H' ? 'Buried Core' : 'Solvent Exposed'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
