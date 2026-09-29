import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2, Download, Eye, Layers, Sparkles, HelpCircle } from 'lucide-react';

export default function Protein2DViewer({
  sequence,
  bestFold,
  initialFold,
  snapshots = [],
  residueDetails = [],
  title = "2D Lattice Protein Conformation",
  algorithmName = "Simulated Annealing"
}) {
  const [viewMode, setViewMode] = useState('best'); // 'best', 'initial', 'snapshots'
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredResidue, setHoveredResidue] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showHHContacts, setShowHHContacts] = useState(true);
  const [showResidueIndices, setShowResidueIndices] = useState(true);

  const svgRef = useRef(null);

  // Active coordinates based on view mode
  const activeCoordinates = useMemo(() => {
    if (viewMode === 'initial' && initialFold?.coordinates) {
      return initialFold.coordinates;
    }
    if (viewMode === 'snapshots' && snapshots.length > 0) {
      const snap = snapshots[Math.min(snapshotIndex, snapshots.length - 1)];
      return snap?.coordinates || bestFold?.coordinates || [];
    }
    return bestFold?.coordinates || [];
  }, [viewMode, snapshotIndex, initialFold, bestFold, snapshots]);

  // Compute bounding box
  const bounds = useMemo(() => {
    if (!activeCoordinates || activeCoordinates.length === 0) {
      return { minX: 0, maxX: 10, minY: 0, maxY: 10, width: 10, height: 10 };
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    activeCoordinates.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
    // Add padding margin
    const padding = 2;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
      width: Math.max(8, maxX - minX + 2 * padding),
      height: Math.max(8, maxY - minY + 2 * padding),
    };
  }, [activeCoordinates]);

  // Compute active non-covalent contacts for currently displayed coordinates
  const activeContacts = useMemo(() => {
    if (!activeCoordinates || !sequence || activeCoordinates.length !== sequence.length) {
      return { hh: [], hp: [], pp: [] };
    }
    const hh = [];
    const hp = [];
    const pp = [];
    const n = sequence.length;

    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        const [x1, y1] = activeCoordinates[i];
        const [x2, y2] = activeCoordinates[j];
        const dist = Math.abs(x1 - x2) + Math.abs(y1 - y2);
        if (dist === 1) {
          const t1 = sequence[i];
          const t2 = sequence[j];
          const contactObj = { from: i, to: j, p1: [x1, y1], p2: [x2, y2] };
          if (t1 === 'H' && t2 === 'H') hh.push(contactObj);
          else if (t1 === 'P' && t2 === 'P') pp.push(contactObj);
          else hp.push(contactObj);
        }
      }
    }
    return { hh, hp, pp };
  }, [activeCoordinates, sequence]);

  // Playback timer for snapshot trajectory animation
  useEffect(() => {
    let interval = null;
    if (isPlaying && snapshots && snapshots.length > 1) {
      interval = setInterval(() => {
        setSnapshotIndex((prev) => {
          if (prev >= snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, snapshots]);

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Export SVG function
  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `proteinfold_2d_${sequence.slice(0, 10)}_fold.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Grid coordinates mapping
  const scale = 50; // pixels per lattice unit
  const offsetX = -bounds.minX * scale + 50;
  const offsetY = -bounds.minY * scale + 50;
  const viewWidth = bounds.width * scale + 100;
  const viewHeight = bounds.height * scale + 100;

  const currentEnergy = useMemo(() => {
    if (viewMode === 'initial') return initialFold?.energy ?? 0;
    if (viewMode === 'snapshots' && snapshots[snapshotIndex]) {
      return snapshots[snapshotIndex].energy;
    }
    return bestFold?.energy ?? -activeContacts.hh.length;
  }, [viewMode, snapshotIndex, snapshots, initialFold, bestFold, activeContacts]);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-2xl space-y-4">
      {/* Viewer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-100">{title}</h3>
            <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded-md bg-orange-950/80 text-orange-400 border border-orange-800/50">
              Energy: {currentEnergy}
            </span>
            <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              H-H Contacts: {activeContacts.hh.length}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive self-avoiding walk on 2D square lattice with hydrophobic core contacts
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setViewMode('best');
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'best'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Optimized Fold
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('initial');
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'initial'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Initial State
          </button>
          {snapshots && snapshots.length > 0 && (
            <button
              type="button"
              onClick={() => setViewMode('snapshots')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1 ${
                viewMode === 'snapshots'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Timeline Steps</span>
            </button>
          )}
        </div>
      </div>

      {/* Snapshot Stepper / Animation Bar */}
      {viewMode === 'snapshots' && snapshots.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <span className="font-semibold text-purple-300">
                {snapshots[snapshotIndex]?.label || `Step ${snapshotIndex + 1}`}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
              <span>Step: <strong>{snapshotIndex + 1}</strong> / {snapshots.length}</span>
              <span>Iter: <strong>{snapshots[snapshotIndex]?.iteration}</strong></span>
              <span>Temp: <strong>{snapshots[snapshotIndex]?.temperature}</strong></span>
              <span className="text-orange-400 font-bold">E = {snapshots[snapshotIndex]?.energy}</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max={snapshots.length - 1}
            value={snapshotIndex}
            onChange={(e) => {
              setSnapshotIndex(parseInt(e.target.value, 10));
              setIsPlaying(false);
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      )}

      {/* Main SVG Visualization Canvas */}
      <div className="relative w-full h-[450px] sm:h-[500px] rounded-xl bg-[#070A12] border border-slate-800/80 overflow-hidden cursor-grab active:cursor-grabbing select-none">
        {/* Floating Canvas Controls Overlay */}
        <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg text-slate-300">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.5))}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.4))}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            title="Reset View (Center & Zoom 100%)"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-700"></div>
          <button
            type="button"
            onClick={handleDownloadSVG}
            title="Export high-resolution SVG"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-cyan-400 hover:text-cyan-300 transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Visual Layer Toggles */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-[11px] text-slate-300">
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showHHContacts}
              onChange={(e) => setShowHHContacts(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="text-emerald-400 font-medium">H-H Bonds</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showResidueIndices}
              onChange={(e) => setShowResidueIndices(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Residue #</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-slate-400 focus:ring-0"
            />
            <span className="text-slate-400">Grid</span>
          </label>
        </div>

        {/* SVG Render Element */}
        <svg
          ref={svgRef}
          className="w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        >
          <defs>
            {/* Hydrophobic Node Radial Gradient */}
            <radialGradient id="hydroGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>

            {/* Polar Node Radial Gradient */}
            <radialGradient id="polarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#cffafe" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0e7490" />
            </radialGradient>

            {/* Glow Filter for HH Contact Bonds */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Backbone Arrow Marker */}
            <marker
              id="backboneArrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748B" />
            </marker>
          </defs>

          {/* Interactive Transform Group */}
          <g
            transform={`translate(${panOffset.x + (1 - zoomLevel) * (viewWidth / 2)}, ${
              panOffset.y + (1 - zoomLevel) * (viewHeight / 2)
            }) scale(${zoomLevel})`}
          >
            {/* 1. Lattice Background Grid */}
            {showGrid && (
              <g className="opacity-15">
                {Array.from({ length: bounds.width + 2 }).map((_, i) => {
                  const gx = (bounds.minX + i - 1) * scale + offsetX;
                  return (
                    <line
                      key={`grid-x-${i}`}
                      x1={gx}
                      y1={0}
                      x2={gx}
                      y2={viewHeight}
                      stroke="#475569"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                    />
                  );
                })}
                {Array.from({ length: bounds.height + 2 }).map((_, j) => {
                  const gy = (bounds.minY + j - 1) * scale + offsetY;
                  return (
                    <line
                      key={`grid-y-${j}`}
                      x1={0}
                      y1={gy}
                      x2={viewWidth}
                      y2={gy}
                      stroke="#475569"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                    />
                  );
                })}
              </g>
            )}

            {/* 2. Non-Covalent H-H Interaction Contacts (Energy Contributing) */}
            {showHHContacts && (
              <g className="contacts-layer">
                {activeContacts.hh.map((c, idx) => {
                  const x1 = c.p1[0] * scale + offsetX;
                  const y1 = c.p1[1] * scale + offsetY;
                  const x2 = c.p2[0] * scale + offsetX;
                  const y2 = c.p2[1] * scale + offsetY;
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;

                  return (
                    <g key={`hh-contact-${idx}`} filter="url(#neonGlow)">
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#10B981"
                        strokeWidth="3.5"
                        strokeDasharray="5 5"
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                      {/* Interaction Badge Indicator */}
                      <circle cx={midX} cy={midY} r="4" fill="#10B981" />
                    </g>
                  );
                })}
              </g>
            )}

            {/* 3. Covalent Backbone Bonds */}
            <g className="backbone-layer">
              {activeCoordinates.map((coord, idx) => {
                if (idx === activeCoordinates.length - 1) return null;
                const nextCoord = activeCoordinates[idx + 1];
                const x1 = coord[0] * scale + offsetX;
                const y1 = coord[1] * scale + offsetY;
                const x2 = nextCoord[0] * scale + offsetX;
                const y2 = nextCoord[1] * scale + offsetY;

                return (
                  <line
                    key={`backbone-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#94A3B8"
                    strokeWidth="4"
                    strokeLinecap="round"
                    markerEnd="url(#backboneArrow)"
                  />
                );
              })}
            </g>

            {/* 4. Residue Nodes */}
            <g className="nodes-layer">
              {activeCoordinates.map((coord, idx) => {
                const cx = coord[0] * scale + offsetX;
                const cy = coord[1] * scale + offsetY;
                const char = sequence[idx] || 'H';
                const isH = char === 'H';
                const isNTerminus = idx === 0;
                const isCTerminus = idx === activeCoordinates.length - 1;
                const isHovered = hoveredResidue?.index === idx + 1;
                const resDetail = residueDetails[idx];

                return (
                  <g
                    key={`residue-node-${idx}`}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() =>
                      setHoveredResidue({
                        index: idx + 1,
                        type: char,
                        coord,
                        name: resDetail?.name || (isH ? 'Hydrophobic Residue' : 'Polar Residue'),
                        aa_code: resDetail?.aa_code || char,
                        kd_index: resDetail?.kd_index ?? (isH ? 1.0 : -1.0),
                      })
                    }
                    onMouseLeave={() => setHoveredResidue(null)}
                  >
                    {/* Glowing Halo on Hover or Termini */}
                    {(isHovered || isNTerminus || isCTerminus) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 26 : 22}
                        fill={
                          isNTerminus
                            ? '#22c55e'
                            : isCTerminus
                            ? '#ef4444'
                            : isH
                            ? '#f97316'
                            : '#06b6d4'
                        }
                        opacity={isHovered ? 0.35 : 0.2}
                        className="animate-pulse"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 18 : 15}
                      fill={isH ? 'url(#hydroGlow)' : 'url(#polarGlow)'}
                      stroke={isHovered ? '#ffffff' : isH ? '#ea580c' : '#0891b2'}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="shadow-xl"
                    />

                    {/* Residue Type (H or P) */}
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize={isHovered ? "13" : "11"}
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      pointerEvents="none"
                    >
                      {char}
                    </text>

                    {/* Residue Index Label (#) */}
                    {showResidueIndices && (
                      <text
                        x={cx}
                        y={cy - 18}
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="600"
                        pointerEvents="none"
                      >
                        {idx + 1}
                      </text>
                    )}

                    {/* Terminus Badges */}
                    {isNTerminus && (
                      <text
                        x={cx - 20}
                        y={cy + 3}
                        textAnchor="end"
                        fill="#4ade80"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        N'
                      </text>
                    )}
                    {isCTerminus && (
                      <text
                        x={cx + 20}
                        y={cy + 3}
                        textAnchor="start"
                        fill="#f87171"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        C'
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Hovered Residue Tooltip Popup */}
        {hoveredResidue && (
          <div className="absolute bottom-14 right-3 z-20 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-xs space-y-1 animate-fadeIn max-w-xs">
            <div className="flex items-center justify-between space-x-2 border-b border-slate-800 pb-1">
              <span className="font-bold text-white">
                Residue #{hoveredResidue.index}: {hoveredResidue.name}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  hoveredResidue.type === 'H'
                    ? 'bg-orange-950 text-orange-400 border border-orange-800'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}
              >
                {hoveredResidue.type === 'H' ? 'Hydrophobic (H)' : 'Polar (P)'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <p>Lattice Coord: <strong className="font-mono text-cyan-400">({hoveredResidue.coord[0]}, {hoveredResidue.coord[1]})</strong></p>
              <p>Hydrophobicity: <strong className="font-mono text-amber-400">{hoveredResidue.kd_index}</strong></p>
              <p className="text-slate-400 text-[10px]">
                {hoveredResidue.type === 'H' ? 'Drives core collapse & stability' : 'Interacts with surrounding solvent'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Visual Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Hydrophobic Legend */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 border border-orange-400 shadow-sm shadow-orange-500/50"></div>
            <span className="text-slate-300">
              Hydrophobic (<strong>H</strong>) Residue
            </span>
          </div>

          {/* Polar Legend */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-400 shadow-sm shadow-cyan-500/50"></div>
            <span className="text-slate-300">
              Polar (<strong>P</strong>) Residue
            </span>
          </div>

          {/* Backbone Legend */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-1 bg-slate-400 rounded"></div>
            <span className="text-slate-300">Covalent Backbone</span>
          </div>

          {/* H-H Contact Legend */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-1 border-b-2 border-dashed border-emerald-400"></div>
            <span className="text-emerald-400 font-semibold">
              H-H Non-Covalent Contact (-1 Energy)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
          <span>Drag to pan canvas</span>
          <span>•</span>
          <span>Scroll/buttons to zoom</span>
        </div>
      </div>
    </div>
  );
}
