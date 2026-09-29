import React, { useState } from 'react';
import { Grid3X3, Info, Award } from 'lucide-react';

export default function ContactMap({ contactMatrix, sequence, residueDetails = [] }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!contactMatrix || contactMatrix.length === 0) return null;

  const n = contactMatrix.length;

  // Cell color helper
  const getCellColor = (val) => {
    switch (val) {
      case 2: // H-H Non-covalent Contact (-1 Energy)
        return 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm shadow-emerald-500/50';
      case 1: // Backbone Bond
        return 'bg-slate-700/80 hover:bg-slate-600 text-white';
      case 3: // H-P Proximity
        return 'bg-amber-500/30 hover:bg-amber-500/50 text-amber-200';
      case 4: // P-P Proximity
        return 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200';
      default: // No contact
        return 'bg-slate-950 hover:bg-slate-900 border border-slate-900/60';
    }
  };

  const getCellLabel = (val) => {
    switch (val) {
      case 2:
        return 'H-H Contact (Energy -1)';
      case 1:
        return 'Covalent Backbone Bond';
      case 3:
        return 'H-P Spatial Proximity';
      case 4:
        return 'P-P Spatial Proximity';
      default:
        return 'No Contact (Separated on Grid)';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Grid3X3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Residue Contact Map Matrix</h3>
          </div>
          <p className="text-xs text-slate-400">
            2D symmetric topological interaction matrix representing covalent backbone and pairwise non-covalent contacts
          </p>
        </div>

        {/* Matrix Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="font-semibold text-emerald-400">H-H (-1)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-slate-700"></span>
            <span>Backbone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/40"></span>
            <span>H-P (0)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500/30"></span>
            <span>P-P (0)</span>
          </div>
        </div>
      </div>

      {/* Matrix Display Container */}
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#070A12] border border-slate-800/80 overflow-x-auto">
        <div className="inline-block">
          {/* Top Column Index Labels */}
          <div className="flex pl-8 mb-1">
            {Array.from({ length: n }).map((_, col) => (
              <div
                key={`col-idx-${col}`}
                style={{ width: `${Math.max(14, Math.min(26, 600 / n))}px` }}
                className="text-[9px] font-mono text-center text-slate-500 truncate"
              >
                {col + 1}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {contactMatrix.map((row, rIdx) => (
            <div key={`row-${rIdx}`} className="flex items-center">
              {/* Row Header Label */}
              <div className="w-8 text-[9px] font-mono text-right pr-2 text-slate-500 flex items-center justify-end space-x-1">
                <span>{sequence[rIdx]}</span>
                <span className="text-slate-600">{rIdx + 1}</span>
              </div>

              {/* Row Cells */}
              <div className="flex">
                {row.map((val, cIdx) => {
                  const sizePx = Math.max(14, Math.min(26, 600 / n));
                  return (
                    <button
                      key={`cell-${rIdx}-${cIdx}`}
                      type="button"
                      onMouseEnter={() =>
                        setHoveredCell({
                          row: rIdx + 1,
                          col: cIdx + 1,
                          res1: sequence[rIdx],
                          res2: sequence[cIdx],
                          val,
                          label: getCellLabel(val),
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        width: `${sizePx}px`,
                        height: `${sizePx}px`,
                      }}
                      className={`m-[0.5px] rounded-sm transition-all duration-150 flex items-center justify-center text-[8px] font-mono font-bold ${getCellColor(
                        val
                      )}`}
                    >
                      {val === 2 ? '•' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hover Info Footer */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between min-h-[44px]">
        {hoveredCell ? (
          <div className="flex items-center space-x-3 text-slate-200">
            <span className="font-mono font-bold text-cyan-400">
              Pair ({hoveredCell.row}, {hoveredCell.col}):
            </span>
            <span>
              Residue #{hoveredCell.row} (<strong>{hoveredCell.res1}</strong>) ↔ Residue #{hoveredCell.col} (<strong>{hoveredCell.res2}</strong>)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                hoveredCell.val === 2
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {hoveredCell.label}
            </span>
          </div>
        ) : (
          <div className="text-slate-500 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Hover any matrix cell to inspect residue pair interaction thermodynamics</span>
          </div>
        )}
      </div>
    </div>
  );
}
