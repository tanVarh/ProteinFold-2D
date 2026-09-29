"""Simulated Annealing Algorithm for 2D HP Protein Folding.

Uses the Metropolis-Hastings criterion to escape local minima:
- Better folds (Delta E < 0) are always accepted.
- Worse folds (Delta E >= 0) are accepted with probability P = exp(-Delta E / T).
- Temperature cools down monotonically from T_initial to T_min.
"""

import math
import random
import time
from typing import List, Dict, Any, Optional, Tuple
try:
    from backend.utils.lattice import (
        Point,
        calculate_energy,
        generate_straight_fold,
        get_contact_details,
        normalize_coordinates,
        is_valid_saw
    )
    from backend.algorithms.moves import generate_neighbor_fold
except ImportError:
    from utils.lattice import (
        Point,
        calculate_energy,
        generate_straight_fold,
        get_contact_details,
        normalize_coordinates,
        is_valid_saw
    )
    from algorithms.moves import generate_neighbor_fold

def run_simulated_annealing(
    sequence: str,
    initial_temperature: float = 5.0,
    cooling_rate: float = 0.995,
    iterations: int = 3000,
    random_seed: Optional[int] = None,
    initial_fold: Optional[List[Point]] = None
) -> Dict[str, Any]:
    """
    Execute Simulated Annealing optimization on the HP sequence.
    """
    if random_seed is not None:
        random.seed(random_seed)
        
    start_time = time.perf_counter()
    n = len(sequence)
    
    # Initialize fold
    if initial_fold is not None and is_valid_saw(initial_fold) and len(initial_fold) == n:
        current_fold = [tuple(p) for p in initial_fold]
    else:
        current_fold = generate_straight_fold(n)
        
    current_energy = calculate_energy(sequence, current_fold)
    
    best_fold = list(current_fold)
    best_energy = current_energy
    
    initial_state_record = {
        'coordinates': normalize_coordinates(current_fold),
        'energy': current_energy,
        'contacts': get_contact_details(sequence, current_fold)
    }
    
    temperature = max(float(initial_temperature), 0.0001)
    min_temp = 0.001
    
    history_raw = []
    accepted_count = 0
    worse_accepted_count = 0
    total_valid_moves = 0
    
    # Snapshots for visualization timeline
    snapshot_intervals = set(
        [0, iterations // 4, iterations // 2, (3 * iterations) // 4, iterations - 1]
    )
    snapshots: List[Dict[str, Any]] = []
    
    snapshots.append({
        'iteration': 0,
        'label': 'Initial Configuration (Linear / Start)',
        'energy': current_energy,
        'temperature': temperature,
        'coordinates': normalize_coordinates(current_fold)
    })
    
    for it in range(iterations):
        # Generate valid neighbor fold
        neighbor = generate_neighbor_fold(current_fold)
        
        accepted = False
        delta_e = 0
        acceptance_prob = 1.0
        
        if neighbor is not None:
            total_valid_moves += 1
            neighbor_energy = calculate_energy(sequence, neighbor)
            delta_e = neighbor_energy - current_energy
            
            if delta_e < 0:
                # Always accept strictly improving move
                accepted = True
                acceptance_prob = 1.0
                current_fold = neighbor
                current_energy = neighbor_energy
            else:
                # Metropolis criterion for uphill move
                # Avoid overflow / underflow
                exponent = -delta_e / max(temperature, 1e-7)
                if exponent < -700:
                    acceptance_prob = 0.0
                else:
                    acceptance_prob = math.exp(exponent)
                    
                if random.random() < acceptance_prob:
                    accepted = True
                    worse_accepted_count += 1
                    current_fold = neighbor
                    current_energy = neighbor_energy
                    
            if accepted:
                accepted_count += 1
                if current_energy < best_energy:
                    best_energy = current_energy
                    best_fold = list(current_fold)
                    # Snapshot key milestones when a new optimal minimum is discovered
                    if len(snapshots) < 15:
                        snapshots.append({
                            'iteration': it,
                            'label': f'New Minimum (E = {best_energy})',
                            'energy': best_energy,
                            'temperature': round(temperature, 4),
                            'coordinates': normalize_coordinates(best_fold)
                        })
        
        history_raw.append({
            'iteration': it,
            'energy': current_energy,
            'best_energy': best_energy,
            'temperature': round(temperature, 5),
            'accepted': accepted,
            'delta_e': delta_e,
            'prob': round(acceptance_prob, 4)
        })
        
        # Periodic snapshot
        if it in snapshot_intervals and not any(s['iteration'] == it for s in snapshots):
            snapshots.append({
                'iteration': it,
                'label': f'Step {it} (T = {temperature:.2f})',
                'energy': current_energy,
                'temperature': round(temperature, 4),
                'coordinates': normalize_coordinates(current_fold)
            })
            
        # Cool down temperature
        temperature = max(temperature * cooling_rate, min_temp)
        
    end_time = time.perf_counter()
    runtime_ms = round((end_time - start_time) * 1000, 2)
    
    # Add final best fold snapshot if not already present
    snapshots.append({
        'iteration': iterations,
        'label': f'Global Best (E = {best_energy})',
        'energy': best_energy,
        'temperature': round(temperature, 4),
        'coordinates': normalize_coordinates(best_fold)
    })
    
    # Sample history uniformly to max ~800 points so chart rendering is buttery smooth
    step_size = max(1, len(history_raw) // 800)
    history_sampled = history_raw[::step_size]
    if history_raw and history_sampled[-1]['iteration'] != history_raw[-1]['iteration']:
        history_sampled.append(history_raw[-1])
        
    best_contacts = get_contact_details(sequence, best_fold)
    
    return {
        'algorithm': 'Simulated Annealing',
        'sequence': sequence,
        'sequence_length': n,
        'parameters': {
            'initial_temperature': initial_temperature,
            'cooling_rate': cooling_rate,
            'iterations': iterations,
            'random_seed': random_seed
        },
        'initial_energy': initial_state_record['energy'],
        'final_energy': current_energy,
        'best_energy': best_energy,
        'energy_improvement': initial_state_record['energy'] - best_energy,
        'hh_contacts_count': best_contacts['total_hh'],
        'hp_contacts_count': best_contacts['total_hp'],
        'pp_contacts_count': best_contacts['total_pp'],
        'runtime_ms': runtime_ms,
        'accepted_moves': accepted_count,
        'worse_accepted_moves': worse_accepted_count,
        'acceptance_rate': round((accepted_count / max(1, total_valid_moves)) * 100, 2),
        'initial_fold': initial_state_record,
        'best_fold': {
            'coordinates': normalize_coordinates(best_fold),
            'raw_coordinates': best_fold,
            'energy': best_energy,
            'contacts': best_contacts
        },
        'history': history_sampled,
        'snapshots': snapshots
    }
