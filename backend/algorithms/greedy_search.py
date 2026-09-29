"""Greedy Search (Hill Climbing) Baseline for 2D HP Protein Folding.

Greedy search only accepts moves that strictly improve energy (Delta E < 0).
It rejects all uphill / energetically unfavorable moves, making it susceptible to getting
trapped in local energy minima.
"""

import random
import time
from typing import List, Dict, Any, Optional
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

def run_greedy_search(
    sequence: str,
    iterations: int = 3000,
    random_seed: Optional[int] = None,
    initial_fold: Optional[List[Point]] = None,
    samples_per_step: int = 5
) -> Dict[str, Any]:
    """
    Execute Greedy Hill Climbing optimization on the HP sequence.
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
    
    history_raw = []
    accepted_count = 0
    stagnation_counter = 0
    
    snapshot_intervals = set(
        [0, iterations // 4, iterations // 2, (3 * iterations) // 4, iterations - 1]
    )
    snapshots: List[Dict[str, Any]] = []
    
    snapshots.append({
        'iteration': 0,
        'label': 'Initial Configuration (Linear / Start)',
        'energy': current_energy,
        'temperature': 0.0,
        'coordinates': normalize_coordinates(current_fold)
    })
    
    for it in range(iterations):
        # Sample candidate neighbors to find an improving move
        best_candidate = None
        best_cand_energy = current_energy
        
        for _ in range(samples_per_step):
            neighbor = generate_neighbor_fold(current_fold)
            if neighbor is not None:
                cand_energy = calculate_energy(sequence, neighbor)
                if cand_energy < best_cand_energy:
                    best_cand_energy = cand_energy
                    best_candidate = neighbor
                    
        accepted = False
        delta_e = 0
        if best_candidate is not None and best_cand_energy < current_energy:
            accepted = True
            delta_e = best_cand_energy - current_energy
            current_fold = best_candidate
            current_energy = best_cand_energy
            accepted_count += 1
            stagnation_counter = 0
            
            if current_energy < best_energy:
                best_energy = current_energy
                best_fold = list(current_fold)
                if len(snapshots) < 15:
                    snapshots.append({
                        'iteration': it,
                        'label': f'Greedy Improvement (E = {best_energy})',
                        'energy': best_energy,
                        'temperature': 0.0,
                        'coordinates': normalize_coordinates(best_fold)
                    })
        else:
            stagnation_counter += 1
            
        history_raw.append({
            'iteration': it,
            'energy': current_energy,
            'best_energy': best_energy,
            'temperature': 0.0,
            'accepted': accepted,
            'delta_e': delta_e,
            'prob': 1.0 if accepted else 0.0
        })
        
        if it in snapshot_intervals and not any(s['iteration'] == it for s in snapshots):
            snapshots.append({
                'iteration': it,
                'label': f'Step {it}',
                'energy': current_energy,
                'temperature': 0.0,
                'coordinates': normalize_coordinates(current_fold)
            })
            
    end_time = time.perf_counter()
    runtime_ms = round((end_time - start_time) * 1000, 2)
    
    snapshots.append({
        'iteration': iterations,
        'label': f'Greedy Best (E = {best_energy})',
        'energy': best_energy,
        'temperature': 0.0,
        'coordinates': normalize_coordinates(best_fold)
    })
    
    step_size = max(1, len(history_raw) // 800)
    history_sampled = history_raw[::step_size]
    if history_raw and history_sampled[-1]['iteration'] != history_raw[-1]['iteration']:
        history_sampled.append(history_raw[-1])
        
    best_contacts = get_contact_details(sequence, best_fold)
    
    return {
        'algorithm': 'Greedy Search',
        'sequence': sequence,
        'sequence_length': n,
        'parameters': {
            'iterations': iterations,
            'random_seed': random_seed,
            'samples_per_step': samples_per_step
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
        'stagnation_steps': stagnation_counter,
        'acceptance_rate': round((accepted_count / max(1, iterations)) * 100, 2),
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
