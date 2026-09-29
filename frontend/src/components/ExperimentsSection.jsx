import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { FlaskConical, Play, Trophy, Sparkles, BarChart2, Table, Clock, Eye, AlertCircle } from 'lucide-react';
import { runExperiments } from '../services/api';

export default function ExperimentsSection({ sequence, benchmarks, onSelectBenchmark }) {
  const [runsCount, setRunsCount] = useState(10);
  const [iterationsPerRun, setIterationsPerRun] = useState(2000);
  const [algorithm, setAlgorithm] = useState('Simulated Annealing');
  const [initialTemp, setInitialTemp] = useState(5.0);
  const [coolingRate, setCoolingRate] = useState(0.995);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [experimentData, setExperimentData] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);

  const handleRunBatchExperiment = async () => {
    if (!sequence || sequence.length < 4) {
      setError('Sequence must have at least 4 residues.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await runExperiments({
        sequence,
        algorithm,
        runs_count: runsCount,
        iterations_per_run: iterationsPerRun,
        initial_temperature: initialTemp,
        cooling_rate: coolingRate,
        base_seed: 42,
      });
      setExperimentData(data);
      if (data.runs && data.runs.length > 0) {
        setSelectedRun(data.runs[0]);
      }
    } catch (err) {
      setError(err.message || 'Experiment execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Multi-Seed Empirical Benchmark Experiment
              </h2>
              <p className="text-xs text-slate-400">
                Execute Monte Carlo trials with diverse random seeds to measure statistical convergence & ground state stability
              </p>
            </div>
          </div>
        </div>

        {/* Experiment Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Algorithm selector */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <label className="text-slate-300 font-medium">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-sans outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="Simulated Annealing">Simulated Annealing</option>
              <option value="Greedy Search">Greedy Search (Baseline)</option>
            </select>
          </div>

          {/* Number of Runs */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Number of Seed Runs</span>
              <span className="font-mono font-bold text-amber-400">{runsCount}</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={runsCount}
              onChange={(e) => setRunsCount(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Iterations per run */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Iterations / Run</span>
              <span className="font-mono font-bold text-cyan-400">{iterationsPerRun.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={iterationsPerRun}
              onChange={(e) => setIterationsPerRun(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Action Button */}
          <div className="flex items-end">
            <button
              type="button"
              disabled={loading}
              onClick={handleRunBatchExperiment}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center space-x-2 transition ${
                loading
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/20 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                  <span>Running {runsCount} Trials...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute {runsCount} Runs</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Display */}
      {experimentData && (
        <div className="space-y-6">
          {/* Statistical Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Best Energy */}
            <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900">
              <span className="text-xs text-emerald-300 block font-semibold">Best Energy (Min E)</span>
              <span className="text-3xl font-black font-mono text-emerald-400 mt-1 block">
                {experimentData.stats.best_energy}
              </span>
              <span className="text-[10px] text-slate-500">Global minimum found across trials</span>
            </div>

            {/* Worst Energy */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Worst Energy</span>
              <span className="text-3xl font-bold font-mono text-slate-300 mt-1 block">
                {experimentData.stats.worst_energy}
              </span>
              <span className="text-[10px] text-slate-500">Shallowest trial minimum</span>
            </div>

            {/* Mean Energy */}
            <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-900">
              <span className="text-xs text-cyan-300 block font-semibold">Mean Energy (μ)</span>
              <span className="text-3xl font-bold font-mono text-cyan-400 mt-1 block">
                {experimentData.stats.mean_energy}
              </span>
              <span className="text-[10px] text-slate-500">Average energy over {runsCount} seeds</span>
            </div>

            {/* Standard Deviation */}
            <div className="glass-panel p-4 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-900">
              <span className="text-xs text-purple-300 block font-semibold">Standard Deviation (σ)</span>
              <span className="text-3xl font-bold font-mono text-purple-400 mt-1 block">
                ±{experimentData.stats.std_dev}
              </span>
              <span className="text-[10px] text-slate-500">Heuristic variance & stability</span>
            </div>
          </div>

          {/* Energy Distribution Bar Chart */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Energy Level Frequency Distribution (Histogram)
              </h3>
            </div>
            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={experimentData.frequency_distribution} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="energy"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    label={{ value: 'Final Energy Level (E)', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                    label={{ value: 'Trial Count', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                    formatter={(val) => [`${val} runs`, 'Frequency']}
                    labelFormatter={(label) => `Energy Level: E = ${label}`}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                    {experimentData.frequency_distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.energy === experimentData.stats.best_energy ? '#10B981' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Seed-by-Seed Table */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Table className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Trial-by-Trial Empirical Log</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Total Compute Time: {experimentData.stats.total_experiment_time_ms}ms
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="p-3">Run #</th>
                    <th className="p-3">Random Seed</th>
                    <th className="p-3">Final Energy</th>
                    <th className="p-3">H-H Contacts</th>
                    <th className="p-3">ΔE Improvement</th>
                    <th className="p-3">Runtime</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {experimentData.runs.map((run) => {
                    const isBest = run.best_energy === experimentData.stats.best_energy;
                    return (
                      <tr
                        key={run.run_index}
                        className={`hover:bg-slate-800/40 transition ${
                          isBest ? 'bg-emerald-950/20' : ''
                        }`}
                      >
                        <td className="p-3 text-slate-300 font-bold">#{run.run_index}</td>
                        <td className="p-3 text-slate-400">{run.seed}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isBest
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'text-orange-400'
                            }`}
                          >
                            {run.best_energy} {isBest ? '★ Best' : ''}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-400 font-semibold">{run.hh_contacts}</td>
                        <td className="p-3 text-cyan-400">-{run.energy_improvement}</td>
                        <td className="p-3 text-slate-400">{run.runtime_ms} ms</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedRun(run)}
                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition"
                          >
                            Inspect Fold
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
