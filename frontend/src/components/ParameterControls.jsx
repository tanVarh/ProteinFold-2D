import React from 'react';
import { Sliders, Play, RotateCcw, Flame, Sparkles, Zap, GitCompare } from 'lucide-react';

export default function ParameterControls({
  algorithm,
  setAlgorithm,
  temperature,
  setTemperature,
  coolingRate,
  setCoolingRate,
  iterations,
  setIterations,
  seed,
  setSeed,
  onRunSimulation,
  loading,
}) {
  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 99999) + 1);
  };

  const resetDefaults = () => {
    setAlgorithm('Simulated Annealing');
    setTemperature(5.0);
    setCoolingRate(0.995);
    setIterations(3000);
    setSeed(42);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-100 whitespace-nowrap leading-tight">
              Algorithm & Hyperparameters
            </h2>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              Optimization dynamics & lattice search rules
            </p>
          </div>
        </div>

        <button
          type="button"
          id="reset-defaults-btn"
          onClick={resetDefaults}
          title="Reset to recommended default parameters"
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition shrink-0 shadow-sm active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
          <span>Defaults</span>
        </button>
      </div>

      {/* 1. Algorithm Selection Buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Optimization Engine</span>
          <span className="text-[11px] text-slate-500 font-normal">Choose heuristic approach</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Simulated Annealing */}
          <button
            type="button"
            id="algo-sa-btn"
            onClick={() => setAlgorithm('Simulated Annealing')}
            className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
              algorithm === 'Simulated Annealing'
                ? 'bg-gradient-to-br from-orange-500/20 to-amber-600/10 border-orange-500/60 shadow-lg shadow-orange-500/10 text-orange-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Flame className={`w-3.5 h-3.5 ${algorithm === 'Simulated Annealing' ? 'text-orange-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-white">Annealing (SA)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Metropolis <span className="font-mono text-orange-400/80">exp(-ΔE/T)</span>
            </p>
          </button>

          {/* Greedy Search */}
          <button
            type="button"
            id="algo-greedy-btn"
            onClick={() => setAlgorithm('Greedy Search')}
            className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
              algorithm === 'Greedy Search'
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10 text-cyan-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Zap className={`w-3.5 h-3.5 ${algorithm === 'Greedy Search' ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-white">Greedy Search</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Hill-climbing (<span className="font-mono text-cyan-400/80">ΔE &lt; 0</span>)
            </p>
          </button>

          {/* Compare Both */}
          <button
            type="button"
            id="algo-compare-btn"
            onClick={() => setAlgorithm('Compare Both')}
            className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
              algorithm === 'Compare Both'
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border-emerald-500/60 shadow-lg shadow-emerald-500/10 text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <GitCompare className={`w-3.5 h-3.5 ${algorithm === 'Compare Both' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-white">Compare Both</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Side-by-side folding
            </p>
          </button>
        </div>
      </div>

      {/* 2. Parameter Sliders (2x2 Grid with balanced widths & spacing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Initial Temperature (Only active for SA & Compare) */}
        <div className={`space-y-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 ${algorithm === 'Greedy Search' ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Initial Temp (T₀)</span>
            <span className="font-mono font-bold text-amber-400">{temperature.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="20.0"
            step="0.5"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 leading-none">
            <span>0.5 (Cold)</span>
            <span>20.0 (High Chaos)</span>
          </div>
        </div>

        {/* Cooling Rate alpha */}
        <div className={`space-y-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 ${algorithm === 'Greedy Search' ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Cooling Rate (α)</span>
            <span className="font-mono font-bold text-cyan-400">{coolingRate.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.850"
            max="0.999"
            step="0.001"
            value={coolingRate}
            onChange={(e) => setCoolingRate(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 leading-none">
            <span>0.850 (Fast)</span>
            <span>0.999 (Slow)</span>
          </div>
        </div>

        {/* Iterations */}
        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Iterations (N)</span>
            <span className="font-mono font-bold text-emerald-400">{iterations.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="500"
            max="15000"
            step="500"
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 leading-none">
            <span>500 steps</span>
            <span>15,000 steps</span>
          </div>
        </div>

        {/* Random Seed */}
        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Random Seed</span>
            <span className="font-mono text-slate-400">{seed ? `#${seed}` : 'Auto'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <input
              type="number"
              value={seed === null ? '' : seed}
              onChange={(e) => setSeed(e.target.value === '' ? null : parseInt(e.target.value, 10))}
              placeholder="e.g. 42"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-100 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
            <button
              type="button"
              onClick={randomizeSeed}
              title="Roll new seed"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-none">Fix seed for reproducibility</p>
        </div>
      </div>

      {/* 3. Run Simulation Trigger */}
      <div className="pt-1">
        <button
          type="button"
          id="run-simulation-btn"
          disabled={loading}
          onClick={onRunSimulation}
          className={`w-full py-3 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2.5 transition-all duration-200 ${
            loading
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-500 hover:from-orange-600 hover:via-amber-600 hover:to-cyan-600 shadow-lg shadow-orange-500/20 hover:shadow-cyan-500/25 active:scale-[0.99] border border-white/20'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
              <span>Simulating 2D Lattice Folding Trajectory...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run {algorithm} Simulation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
