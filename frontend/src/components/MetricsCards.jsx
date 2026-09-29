import React from 'react';
import { Zap, Clock, ShieldCheck, TrendingDown, Target, Award, Hash, CheckCircle2, Trophy } from 'lucide-react';

export default function MetricsCards({ simulationData }) {
  if (!simulationData) return null;

  const isCompare = simulationData.mode === 'compare';

  if (isCompare) {
    const { sa, greedy, comparison } = simulationData;
    const isSATie = comparison.winner === 'Tie';
    const isSAWon = comparison.winner === 'Simulated Annealing';

    return (
      <div className="space-y-4">
        {/* Comparison Header Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Head-to-Head Outcome:</span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono ${
                  isSAWon ? 'bg-orange-950 text-orange-400 border border-orange-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}>
                  {comparison.winner} {isSATie ? '(Identical Global Ground State)' : 'Achieved Lower Energy!'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                SA Energy: <strong className="text-orange-400 font-mono">{comparison.sa_best_energy}</strong> ({comparison.sa_hh_contacts} HH contacts) vs Greedy Energy: <strong className="text-cyan-400 font-mono">{comparison.greedy_best_energy}</strong> ({comparison.greedy_hh_contacts} HH contacts)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Energy Advantage</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {comparison.energy_difference > 0 ? `-${comparison.energy_difference} E (SA superior)` : `${comparison.energy_difference} E`}
              </span>
            </div>
            <div className="text-right border-l border-slate-700 pl-4">
              <span className="text-slate-400 block text-[11px]">Runtime (SA / Greedy)</span>
              <span className="font-mono text-slate-300">
                {sa.runtime_ms}ms / {greedy.runtime_ms}ms
              </span>
            </div>
          </div>
        </div>

        {/* Side-by-side Dual Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SA Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-orange-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-sm text-orange-400 flex items-center gap-1.5">
                🔥 Simulated Annealing
              </span>
              <span className="text-xs font-mono text-slate-400">{sa.runtime_ms} ms</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Best Energy</span>
                <span className="text-base font-bold font-mono text-orange-400">{sa.best_energy}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">H-H Contacts</span>
                <span className="text-base font-bold font-mono text-emerald-400">{sa.hh_contacts_count}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Improvement</span>
                <span className="text-base font-bold font-mono text-cyan-400">ΔE = {sa.energy_improvement}</span>
              </div>
            </div>
          </div>

          {/* Greedy Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-sm text-cyan-400 flex items-center gap-1.5">
                ⚡ Greedy Search
              </span>
              <span className="text-xs font-mono text-slate-400">{greedy.runtime_ms} ms</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Best Energy</span>
                <span className="text-base font-bold font-mono text-cyan-400">{greedy.best_energy}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">H-H Contacts</span>
                <span className="text-base font-bold font-mono text-emerald-400">{greedy.hh_contacts_count}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Improvement</span>
                <span className="text-base font-bold font-mono text-cyan-400">ΔE = {greedy.energy_improvement}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single Algorithm Mode
  const res = simulationData.result;
  const isSA = res.algorithm === 'Simulated Annealing';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Initial Energy */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Initial Energy</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800">E_init</span>
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-bold font-mono text-slate-300">
            {res.initial_energy}
          </span>
        </div>
        <span className="text-[10px] text-slate-500">Unfolded chain state</span>
      </div>

      {/* 2. Best / Final Energy */}
      <div className="glass-panel p-3.5 rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-900 flex flex-col justify-between shadow-lg shadow-orange-500/5">
        <div className="flex items-center justify-between text-orange-300 text-xs">
          <span className="font-semibold">Optimized Energy</span>
          <Target className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-black font-mono text-orange-400">
            {res.best_energy}
          </span>
        </div>
        <span className="text-[10px] text-orange-400/80">Ground-state search</span>
      </div>

      {/* 3. H-H Non-Covalent Contacts */}
      <div className="glass-panel p-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 flex flex-col justify-between shadow-lg shadow-emerald-500/5">
        <div className="flex items-center justify-between text-emerald-300 text-xs">
          <span className="font-semibold">H-H Contacts</span>
          <Award className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-black font-mono text-emerald-400">
            {res.hh_contacts_count}
          </span>
        </div>
        <span className="text-[10px] text-emerald-400/80">-1 per contact</span>
      </div>

      {/* 4. Energy Improvement */}
      <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
        <div className="flex items-center justify-between text-cyan-300 text-xs">
          <span className="font-semibold">Improvement</span>
          <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-bold font-mono text-cyan-400">
            -{res.energy_improvement}
          </span>
        </div>
        <span className="text-[10px] text-cyan-400/80">ΔE = E_init - E_best</span>
      </div>

      {/* 5. Runtime */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Execution Time</span>
          <Clock className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-bold font-mono text-slate-200">
            {res.runtime_ms} <span className="text-xs font-normal text-slate-400">ms</span>
          </span>
        </div>
        <span className="text-[10px] text-slate-500">Local computation</span>
      </div>

      {/* 6. Sequence Length & Acceptance */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Residues / Length</span>
          <Hash className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-bold font-mono text-purple-400">
            {res.sequence_length}
          </span>
        </div>
        <span className="text-[10px] text-slate-500">
          Acceptance: <strong className="text-slate-300 font-mono">{res.acceptance_rate}%</strong>
        </span>
      </div>
    </div>
  );
}
