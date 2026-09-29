"""Multi-Seed Statistical Experiment Engine for ProteinFold-2D."""

import math
import statistics
import time
from typing import List, Dict, Any, Optional
try:
    from backend.algorithms.simulated_annealing import run_simulated_annealing
    from backend.algorithms.greedy_search import run_greedy_search
except ImportError:
    from algorithms.simulated_annealing import run_simulated_annealing
    from algorithms.greedy_search import run_greedy_search

def run_multi_seed_experiment(
    sequence: str,
    algorithm: str = "Simulated Annealing",
    runs_count: int = 10,
    iterations_per_run: int = 2000,
    initial_temperature: float = 5.0,
    cooling_rate: float = 0.995,
    base_seed: int = 42
) -> Dict[str, Any]:
    """
    Run an empirical benchmark across multiple random seeds and compute statistical distributions:
    - Best Energy (min E)
    - Worst Energy (max E among finals)
    - Mean Energy
    - Standard Deviation
    - Average Runtime
    - Run-by-run breakdown table
    """
    start_total_time = time.perf_counter()
    run_results = []
    energies: List[int] = []
    runtimes: List[float] = []
    
    for i in range(runs_count):
        seed = base_seed + i * 17 + 7
        if algorithm == "Greedy Search":
            res = run_greedy_search(
                sequence=sequence,
                iterations=iterations_per_run,
                random_seed=seed
            )
        else:
            res = run_simulated_annealing(
                sequence=sequence,
                initial_temperature=initial_temperature,
                cooling_rate=cooling_rate,
                iterations=iterations_per_run,
                random_seed=seed
            )
            
        best_e = res['best_energy']
        energies.append(best_e)
        runtimes.append(res['runtime_ms'])
        
        run_results.append({
            'run_index': i + 1,
            'seed': seed,
            'best_energy': best_e,
            'hh_contacts': res['hh_contacts_count'],
            'energy_improvement': res['energy_improvement'],
            'runtime_ms': res['runtime_ms'],
            'accepted_rate': res.get('acceptance_rate', 0.0),
            'final_coordinates': res['best_fold']['coordinates']
        })
        
    total_time_ms = round((time.perf_counter() - start_total_time) * 1000, 2)
    
    best_energy = min(energies) if energies else 0
    worst_energy = max(energies) if energies else 0
    mean_energy = round(statistics.mean(energies), 3) if energies else 0.0
    std_dev_energy = round(statistics.stdev(energies), 3) if len(energies) > 1 else 0.0
    mean_runtime = round(statistics.mean(runtimes), 2) if runtimes else 0.0
    
    # Find overall best run configuration
    best_run = min(run_results, key=lambda x: x['best_energy'])
    
    # Energy frequency distribution for bar chart / histogram
    energy_freq: Dict[int, int] = {}
    for e in energies:
        energy_freq[e] = energy_freq.get(e, 0) + 1
        
    freq_data = [{'energy': e, 'count': count} for e, count in sorted(energy_freq.items())]
    
    return {
        'sequence': sequence,
        'sequence_length': len(sequence),
        'algorithm': algorithm,
        'total_runs': runs_count,
        'iterations_per_run': iterations_per_run,
        'stats': {
            'best_energy': best_energy,
            'worst_energy': worst_energy,
            'mean_energy': mean_energy,
            'std_dev': std_dev_energy,
            'mean_runtime_ms': mean_runtime,
            'total_experiment_time_ms': total_time_ms
        },
        'best_run_seed': best_run['seed'],
        'best_run_coordinates': best_run['final_coordinates'],
        'frequency_distribution': freq_data,
        'runs': run_results
    }
