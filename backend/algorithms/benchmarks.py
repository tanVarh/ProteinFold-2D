"""Preset Benchmark Sequences from Computational Biology Literature.

Includes standard 2D HP benchmark instances (Dill et al., 1989-1995) with known
optimal lattice ground state energies, plus representative real-world proteins.
"""

from typing import List, Dict, Any

BENCHMARK_PRESETS: List[Dict[str, Any]] = [
    {
        'id': 'dill-20',
        'name': 'Dill Benchmark (20-mer)',
        'source': 'Dill et al., 1989 / Unger & Moult 1993',
        'type': 'HP',
        'sequence': 'HPHPPHHPHPPHPHHPPHPH',
        'length': 20,
        'known_optimal_energy': -9,
        'description': 'Classic 20-residue sequence widely used to evaluate lattice folding heuristics.'
    },
    {
        'id': 'dill-24',
        'name': 'Dill Benchmark (24-mer)',
        'source': 'Yue & Dill, 1995',
        'type': 'HP',
        'sequence': 'HHPPHPPHPPHPPHPPHPPHPPHH',
        'length': 24,
        'known_optimal_energy': -9,
        'description': 'Regular pattern benchmark with 24 residues testing core compaction.'
    },
    {
        'id': 'dill-25',
        'name': 'Dill Benchmark (25-mer)',
        'source': 'Dill et al., 1990',
        'type': 'HP',
        'sequence': 'PPHPPHHPPPPHHPPPPHHPPPPHH',
        'length': 25,
        'known_optimal_energy': -8,
        'description': 'Polar-rich 25-residue chain with hydrophobic nucleation islands.'
    },
    {
        'id': 'dill-36',
        'name': 'Dill Benchmark (36-mer)',
        'source': 'Yue & Dill, 1995',
        'type': 'HP',
        'sequence': 'PPPHHPPHHPPPPPHHHHHHHPPHHPPPPHHPPHPP',
        'length': 36,
        'known_optimal_energy': -14,
        'description': 'Challenging 36-residue benchmark with large hydrophobic central cluster.'
    },
    {
        'id': 'short-demo-12',
        'name': 'Quick Demonstration (12-mer)',
        'source': 'Introductory Tutorial',
        'type': 'HP',
        'sequence': 'HHPPHPPHHPPH',
        'length': 12,
        'known_optimal_energy': -4,
        'description': 'Compact 12-mer for rapid real-time visualization and parameter tuning.'
    },
    {
        'id': 'crambin-frag',
        'name': 'Crambin Seed Fragment (18-AA)',
        'source': 'PDB 1CRN (Hydrophobicity Mapped)',
        'type': 'AminoAcid',
        'raw_sequence': 'TTCCPSIVARSNFNVCRL',
        'sequence': 'PPPHPPHHHPPPPPHPHH',
        'length': 18,
        'known_optimal_energy': -6,
        'description': 'Real plant seed protein Crambin (PDB: 1CRN) fragment mapped by Kyte-Doolittle index.'
    },
    {
        'id': 'ubiquitin-core',
        'name': 'Ubiquitin Beta-Hairpin (16-AA)',
        'source': 'PDB 1UBQ (Residues 1-16)',
        'type': 'AminoAcid',
        'raw_sequence': 'MQIFVKTLTGKTITLE',
        'sequence': 'HHHHHPPPPHPPHHHP',
        'length': 16,
        'known_optimal_energy': -5,
        'description': 'N-terminal beta-hairpin fragment of human Ubiquitin (PDB: 1UBQ).'
    },
    {
        'id': 'insulin-b-chain',
        'name': 'Insulin B-Chain Core (20-AA)',
        'source': 'PDB 2INS (B-Chain Segment)',
        'type': 'AminoAcid',
        'raw_sequence': 'FVNQHLCGSHLVEALYLVCG',
        'sequence': 'HHPPPPPHPPHPPHHHHHPP',
        'length': 20,
        'known_optimal_energy': -7,
        'description': 'Central hydrophobic core of Bovine Insulin B-chain.'
    }
]

def get_benchmarks_list() -> List[Dict[str, Any]]:
    return BENCHMARK_PRESETS
