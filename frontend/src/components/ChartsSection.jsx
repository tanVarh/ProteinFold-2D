import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingDown, Thermometer, GitCompare, Activity, Info } from 'lucide-react';

export default function ChartsSection({ simulationData }) {
  if (!simulationData) return null;

  const [chartTab, setChartTab] = useState('energy'); // 'energy', 'temperature', 'dual'
  const isCompare = simulationData.mode === 'compare';

  // Prepare chart dataset
  let chartData = [];

  if (isCompare) {
    const saHist = simulationData.sa.history || [];
    const greedyHist = simulationData.greedy.history || [];
    const maxLen = Math.max(saHist.length, greedyHist.length);

    for (let i = 0; i < maxLen; i++) {
      const saPoint = saHist[i] || saHist[saHist.length - 1];
      const greedyPoint = greedyHist[i] || greedyHist[greedyHist.length - 1];
      chartData.push({
        iteration: saPoint?.iteration ?? (greedyPoint?.iteration ?? i),
        sa_energy: saPoint?.energy,
        sa_best_energy: saPoint?.best_energy,
        greedy_energy: greedyPoint?.energy,
        greedy_best_energy: greedyPoint?.best_energy,
        temperature: saPoint?.temperature,
      });
    }
  } else {
    chartData = simulationData.result.history || [];
  }

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-xs space-y-1">
          <p className="font-mono font-bold text-slate-200 border-b border-slate-800 pb-1">
            Iteration: #{label}
          </p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between space-x-3 text-[11px]">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === 'number' ? (Number.isInteger(entry.value) ? entry.value : entry.value.toFixed(4)) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-2xl space-y-4">
      {/* Charts Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Folding Optimization Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Real-time energy descent, Metropolis acceptance fluctuations, and annealing cooling curve
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setChartTab('energy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
              chartTab === 'energy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Energy vs Iteration</span>
          </button>

          {!isCompare && (
            <button
              type="button"
              onClick={() => setChartTab('temperature')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                chartTab === 'temperature'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Temperature Decay</span>
            </button>
          )}

          {isCompare && (
            <button
              type="button"
              onClick={() => setChartTab('dual')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                chartTab === 'dual'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Comparative Overlay</span>
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartTab === 'energy' && !isCompare ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="iteration"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="energy"
                name="Current Energy (E)"
                stroke="#f97316"
                strokeWidth={1.5}
                dot={false}
                opacity={0.7}
              />
              <Line
                type="stepAfter"
                dataKey="best_energy"
                name="Global Best Energy"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          ) : chartTab === 'temperature' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="iteration" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="temperature"
                name="Temperature T(k)"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tempGrad)"
              />
            </AreaChart>
          ) : (
            // Comparative Overlay for "Compare Both"
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="iteration" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="sa_best_energy"
                name="Simulated Annealing (Best E)"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="greedy_best_energy"
                name="Greedy Search (Best E)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Analytical Footnote */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p>
          {isCompare ? (
            <span>
              <strong>Lattice Biophysics Insight:</strong> Notice how Greedy Search flattens out early when it encounters a local minimum barrier. Simulated Annealing temporarily accepts uphill moves ($\Delta E &gt; 0$) during high temperatures, allowing the chain to untangle and locate deeper energy funnels.
            </span>
          ) : (
            <span>
              <strong>Thermodynamic Trajectory:</strong> As temperature $T \to 0$, the acceptance of higher-energy conformations decreases, condensing the folding landscape towards the ground-state conformation.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
