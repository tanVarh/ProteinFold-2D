"""ProteinFold-2D Backend FastAPI Server.

A computational protein folding simulator implementing Dill's 2D Hydrophobic-Polar (HP)
lattice model and Simulated Annealing / Greedy Search optimization algorithms.
"""

import sys
from pathlib import Path

# Ensure both workspace root and backend directory are in sys.path
_current_dir = Path(__file__).resolve().parent
_root_dir = _current_dir.parent
for _p in [str(_root_dir), str(_current_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

try:
    from backend.utils.hp_mapping import convert_amino_acids_to_hp
    from backend.utils.lattice import get_contact_matrix
    from backend.algorithms.simulated_annealing import run_simulated_annealing
    from backend.algorithms.greedy_search import run_greedy_search
    from backend.algorithms.experiments import run_multi_seed_experiment
    from backend.algorithms.benchmarks import get_benchmarks_list
except ImportError:
    from utils.hp_mapping import convert_amino_acids_to_hp
    from utils.lattice import get_contact_matrix
    from algorithms.simulated_annealing import run_simulated_annealing
    from algorithms.greedy_search import run_greedy_search
    from algorithms.experiments import run_multi_seed_experiment
    from algorithms.benchmarks import get_benchmarks_list

app = FastAPI(
    title="ProteinFold-2D API",
    description="Computational Protein Folding Simulator (2D HP Lattice Model & Simulated Annealing)",
    version="1.0.0"
)

# Enable CORS for React Vite frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SequenceRequest(BaseModel):
    sequence: str = Field(..., description="Raw HP or Amino Acid sequence")

class SimulationRequest(BaseModel):
    sequence: str = Field(..., description="HP or Amino Acid sequence")
    algorithm: str = Field("Simulated Annealing", description="'Simulated Annealing', 'Greedy Search', or 'Compare Both'")
    initial_temperature: Optional[float] = Field(5.0, ge=0.01, le=100.0)
    cooling_rate: Optional[float] = Field(0.995, ge=0.8, le=0.9999)
    iterations: Optional[int] = Field(3000, ge=100, le=50000)
    random_seed: Optional[int] = Field(None, description="Optional integer seed for reproducibility")

class ExperimentRequest(BaseModel):
    sequence: str = Field(..., description="HP or Amino Acid sequence")
    algorithm: Optional[str] = Field("Simulated Annealing")
    runs_count: Optional[int] = Field(10, ge=3, le=50)
    iterations_per_run: Optional[int] = Field(2000, ge=100, le=10000)
    initial_temperature: Optional[float] = Field(5.0, ge=0.01, le=100.0)
    cooling_rate: Optional[float] = Field(0.995, ge=0.8, le=0.9999)
    base_seed: Optional[int] = Field(42)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ProteinFold-2D Engine",
        "version": "1.0.0"
    }

@app.get("/api/benchmarks")
def get_benchmarks():
    return {
        "benchmarks": get_benchmarks_list()
    }

@app.post("/api/convert-sequence")
def convert_sequence_endpoint(req: SequenceRequest):
    try:
        hp_seq, details, seq_type = convert_amino_acids_to_hp(req.sequence)
        h_count = hp_seq.count('H')
        p_count = hp_seq.count('P')
        length = len(hp_seq)
        
        return {
            "original_input": req.sequence,
            "hp_sequence": hp_seq,
            "sequence_type": seq_type,
            "length": length,
            "h_count": h_count,
            "p_count": p_count,
            "h_ratio": round((h_count / length) * 100, 1) if length > 0 else 0,
            "residue_details": details
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Conversion error: {str(e)}")

@app.post("/api/simulate")
def simulate_endpoint(req: SimulationRequest):
    try:
        # 1. Convert/validate sequence to pure HP format
        hp_seq, details, seq_type = convert_amino_acids_to_hp(req.sequence)
        
        if len(hp_seq) < 4:
            raise ValueError(f"Sequence length ({len(hp_seq)}) is too short. Minimum 4 residues required.")
        
        alg = req.algorithm.strip()
        
        if alg == "Compare Both":
            # Run both with identical sequence & initial conditions
            sa_result = run_simulated_annealing(
                sequence=hp_seq,
                initial_temperature=req.initial_temperature or 5.0,
                cooling_rate=req.cooling_rate or 0.995,
                iterations=req.iterations or 3000,
                random_seed=req.random_seed
            )
            greedy_result = run_greedy_search(
                sequence=hp_seq,
                iterations=req.iterations or 3000,
                random_seed=req.random_seed
            )
            
            # Compute contact matrices
            sa_matrix = get_contact_matrix(hp_seq, sa_result['best_fold']['raw_coordinates'])
            greedy_matrix = get_contact_matrix(hp_seq, greedy_result['best_fold']['raw_coordinates'])
            
            sa_result['contact_matrix'] = sa_matrix
            greedy_result['contact_matrix'] = greedy_matrix
            
            comparison = {
                'sequence': hp_seq,
                'length': len(hp_seq),
                'sa_best_energy': sa_result['best_energy'],
                'greedy_best_energy': greedy_result['best_energy'],
                'energy_difference': greedy_result['best_energy'] - sa_result['best_energy'],
                'sa_hh_contacts': sa_result['hh_contacts_count'],
                'greedy_hh_contacts': greedy_result['hh_contacts_count'],
                'sa_runtime_ms': sa_result['runtime_ms'],
                'greedy_runtime_ms': greedy_result['runtime_ms'],
                'winner': "Simulated Annealing" if sa_result['best_energy'] < greedy_result['best_energy'] else ("Greedy Search" if greedy_result['best_energy'] < sa_result['best_energy'] else "Tie")
            }
            
            return {
                'mode': 'compare',
                'sequence_info': {
                    'hp_sequence': hp_seq,
                    'sequence_type': seq_type,
                    'length': len(hp_seq),
                    'residue_details': details
                },
                'sa': sa_result,
                'greedy': greedy_result,
                'comparison': comparison
            }
            
        elif alg == "Greedy Search":
            greedy_result = run_greedy_search(
                sequence=hp_seq,
                iterations=req.iterations or 3000,
                random_seed=req.random_seed
            )
            matrix = get_contact_matrix(hp_seq, greedy_result['best_fold']['raw_coordinates'])
            greedy_result['contact_matrix'] = matrix
            greedy_result['residue_details'] = details
            greedy_result['sequence_type'] = seq_type
            return {
                'mode': 'single',
                'result': greedy_result
            }
        else:
            # Default: Simulated Annealing
            sa_result = run_simulated_annealing(
                sequence=hp_seq,
                initial_temperature=req.initial_temperature or 5.0,
                cooling_rate=req.cooling_rate or 0.995,
                iterations=req.iterations or 3000,
                random_seed=req.random_seed
            )
            matrix = get_contact_matrix(hp_seq, sa_result['best_fold']['raw_coordinates'])
            sa_result['contact_matrix'] = matrix
            sa_result['residue_details'] = details
            sa_result['sequence_type'] = seq_type
            return {
                'mode': 'single',
                'result': sa_result
            }
            
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Simulation error: {str(e)}")

@app.post("/api/experiments")
def experiments_endpoint(req: ExperimentRequest):
    try:
        hp_seq, details, seq_type = convert_amino_acids_to_hp(req.sequence)
        
        if len(hp_seq) < 4:
            raise ValueError(f"Sequence length ({len(hp_seq)}) is too short. Minimum 4 residues required.")
            
        exp_result = run_multi_seed_experiment(
            sequence=hp_seq,
            algorithm=req.algorithm or "Simulated Annealing",
            runs_count=req.runs_count or 10,
            iterations_per_run=req.iterations_per_run or 2000,
            initial_temperature=req.initial_temperature or 5.0,
            cooling_rate=req.cooling_rate or 0.995,
            base_seed=req.base_seed or 42
        )
        exp_result['sequence_type'] = seq_type
        exp_result['residue_details'] = details
        return exp_result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Experiment error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app" if "backend" in sys.modules else "main:app", host="127.0.0.1", port=8001, reload=True)
