import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SequenceInput from '../components/SequenceInput';
import ParameterControls from '../components/ParameterControls';
import MetricsCards from '../components/MetricsCards';
import Protein2DViewer from '../components/Protein2DViewer';
import ChartsSection from '../components/ChartsSection';
import ContactMap from '../components/ContactMap';
import ExperimentsSection from '../components/ExperimentsSection';

import {
  convertSequence,
  runSimulation,
  fetchBenchmarks,
} from '../services/api';

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator', 'experiments'
  const [inputSequence, setInputSequence] = useState('HPHPPHHPHPPHPHHPPHPH'); // Default 20-mer Dill benchmark
  const [convertedData, setConvertedData] = useState(null);
  const [benchmarks, setBenchmarks] = useState([]);
  
  // Algorithm & Hyperparameters
  const [algorithm, setAlgorithm] = useState('Simulated Annealing');
  const [temperature, setTemperature] = useState(5.0);
  const [coolingRate, setCoolingRate] = useState(0.995);
  const [iterations, setIterations] = useState(3000);
  const [seed, setSeed] = useState(42);

  // Simulation Results
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scroll to top on tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load benchmark list on mount
  useEffect(() => {
    async function init() {
      try {
        const benchRes = await fetchBenchmarks();
        if (benchRes.benchmarks) {
          setBenchmarks(benchRes.benchmarks);
        }
      } catch (err) {
        console.warn('Could not fetch benchmarks from backend:', err);
      }
    }
    init();
  }, []);

  // Handle sequence conversion on input change
  const handleConvert = useCallback(async (seq) => {
    const cleanSeq = (seq || '').replace(/[\s\-,]+/g, '');
    if (!cleanSeq || cleanSeq.length < 4) {
      setConvertedData(null);
      return;
    }
    try {
      const data = await convertSequence(seq);
      setConvertedData(data);
      setError(null);
    } catch (err) {
      setConvertedData(null);
      setError(err.message);
    }
  }, []);

  // Debounced conversion on typing
  useEffect(() => {
    const timer = setTimeout(() => {
      handleConvert(inputSequence);
    }, 250);
    return () => clearTimeout(timer);
  }, [inputSequence, handleConvert]);

  // Execute simulation (clean)
  const handleRunSimulation = async () => {
    if (!inputSequence || inputSequence.trim().length < 4) {
      setError('Protein sequence must contain at least 4 residues.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await runSimulation({
        sequence: inputSequence,
        algorithm,
        initial_temperature: temperature,
        cooling_rate: coolingRate,
        iterations,
        random_seed: seed,
      });

      setSimulationData(data);
    } catch (err) {
      setError(err.message || 'Simulation execution failed.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial simulation once on startup
  useEffect(() => {
    handleRunSimulation();
  }, []);

  // Handle preset selection
  const handleSelectBenchmark = (bench) => {
    if (bench.raw_sequence) {
      setInputSequence(bench.raw_sequence);
    } else {
      setInputSequence(bench.sequence);
    }
  };

  // Export JSON function
  const handleExportJSON = () => {
    if (!simulationData) return;
    const jsonStr = JSON.stringify(simulationData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proteinfold_2d_${algorithm.toLowerCase().replace(/\s+/g, '_')}_results.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col bg-grid-pattern">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onExportData={handleExportJSON}
        simulationData={simulationData}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert Box */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center justify-between shadow-lg">
            <span className="font-mono">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-white px-2 py-0.5 rounded bg-red-900/50"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: Main Simulator View */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Row: Input & Parameters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-6 flex flex-col">
                <SequenceInput
                  inputSequence={inputSequence}
                  setInputSequence={setInputSequence}
                  convertedData={convertedData}
                  benchmarks={benchmarks}
                  onSelectBenchmark={handleSelectBenchmark}
                  onConvert={handleConvert}
                  loading={loading}
                />
              </div>

              <div className="lg:col-span-6 flex flex-col">
                <ParameterControls
                  algorithm={algorithm}
                  setAlgorithm={setAlgorithm}
                  temperature={temperature}
                  setTemperature={setTemperature}
                  coolingRate={coolingRate}
                  setCoolingRate={setCoolingRate}
                  iterations={iterations}
                  setIterations={setIterations}
                  seed={seed}
                  setSeed={setSeed}
                  onRunSimulation={handleRunSimulation}
                  loading={loading}
                />
              </div>
            </div>

            {/* Performance Metrics Cards */}
            {simulationData && <MetricsCards simulationData={simulationData} />}

            {/* Middle Row: 2D Protein Conformation Viewers */}
            {simulationData && (
              <div>
                {simulationData.mode === 'compare' ? (
                  /* Side-by-Side Viewers for Compare Mode */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Protein2DViewer
                      sequence={simulationData.sequence_info.hp_sequence}
                      bestFold={simulationData.sa.best_fold}
                      initialFold={simulationData.sa.initial_fold}
                      snapshots={simulationData.sa.snapshots}
                      residueDetails={simulationData.sequence_info.residue_details}
                      title="Simulated Annealing Fold"
                      algorithmName="Simulated Annealing"
                    />

                    <Protein2DViewer
                      sequence={simulationData.sequence_info.hp_sequence}
                      bestFold={simulationData.greedy.best_fold}
                      initialFold={simulationData.greedy.initial_fold}
                      snapshots={simulationData.greedy.snapshots}
                      residueDetails={simulationData.sequence_info.residue_details}
                      title="Greedy Search Fold"
                      algorithmName="Greedy Search"
                    />
                  </div>
                ) : (
                  /* Single Viewer */
                  <Protein2DViewer
                    sequence={simulationData.result.sequence}
                    bestFold={simulationData.result.best_fold}
                    initialFold={simulationData.result.initial_fold}
                    snapshots={simulationData.result.snapshots}
                    residueDetails={simulationData.result.residue_details}
                    title={`2D Lattice Structure (${simulationData.result.algorithm})`}
                    algorithmName={simulationData.result.algorithm}
                  />
                )}
              </div>
            )}

            {/* Bottom Row: Charts & Contact Map */}
            {simulationData && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <ChartsSection simulationData={simulationData} />
                </div>

                <div className="lg:col-span-5">
                  <ContactMap
                    contactMatrix={
                      simulationData.mode === 'compare'
                        ? simulationData.sa.contact_matrix
                        : simulationData.result.contact_matrix
                    }
                    sequence={
                      simulationData.mode === 'compare'
                        ? simulationData.sequence_info.hp_sequence
                        : simulationData.result.sequence
                    }
                    residueDetails={
                      simulationData.mode === 'compare'
                        ? simulationData.sequence_info.residue_details
                        : simulationData.result.residue_details
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Multi-Seed Experiments */}
        {activeTab === 'experiments' && (
          <div className="animate-fadeIn">
            <ExperimentsSection
              sequence={convertedData?.hp_sequence || inputSequence}
              benchmarks={benchmarks}
              onSelectBenchmark={handleSelectBenchmark}
            />
          </div>
        )}
      </main>

      {/* Clean Scientific Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p>
            <strong>ProteinFold-2D</strong> • B.Tech Computational Biology Mini-Project • 2D Hydrophobic-Polar Lattice Model & Simulated Annealing
          </p>
          <p className="text-[11px] text-slate-600">
            Educational abstraction based on Dill et al. (1985-1995) and Kirkpatrick et al. (1983). Zero external APIs or databases required.
          </p>
        </div>
      </footer>
    </div>
  );
}
