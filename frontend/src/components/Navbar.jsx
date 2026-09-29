import React from 'react';
import { Dna, Activity, FlaskConical, Download } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onExportData, simulationData }) {
  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div
            onClick={() => setActiveTab('simulator')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-400 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Dna className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  ProteinFold-2D
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  HP Model
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Lattice Biophysics & Simulated Annealing Studio
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('experiments')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'experiments'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20 ring-1 ring-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Multi-Seed</span>
              <span>Experiments</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            {simulationData && (
              <button
                type="button"
                onClick={onExportData}
                title="Export simulation results as JSON"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Export JSON</span>
              </button>
            )}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-[11px]">Engine: Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
