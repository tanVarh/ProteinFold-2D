"""Hydrophobic-Polar (HP) Model Amino Acid Mapping and Sequence Validation.

In the standard Dill 2D HP model:
- H: Hydrophobic (non-polar) amino acids that prefer the core
- P: Polar (hydrophilic or charged) amino acids that prefer the aqueous exterior
"""

import re
from typing import Dict, Tuple, List, Any

# Standard 20 Amino Acids with Kyte-Doolittle Hydrophobicity Index
# Values > 0 are predominantly hydrophobic (H), <= 0 are polar/charged (P)
AMINO_ACID_DATA: Dict[str, Dict[str, Any]] = {
    'A': {'name': 'Alanine', '3letter': 'ALA', 'kd_index': 1.8, 'hp': 'H', 'charge': 'Neutral'},
    'V': {'name': 'Valine', '3letter': 'VAL', 'kd_index': 4.2, 'hp': 'H', 'charge': 'Neutral'},
    'I': {'name': 'Isoleucine', '3letter': 'ILE', 'kd_index': 4.5, 'hp': 'H', 'charge': 'Neutral'},
    'L': {'name': 'Leucine', '3letter': 'LEU', 'kd_index': 3.8, 'hp': 'H', 'charge': 'Neutral'},
    'M': {'name': 'Methionine', '3letter': 'MET', 'kd_index': 1.9, 'hp': 'H', 'charge': 'Neutral'},
    'F': {'name': 'Phenylalanine', '3letter': 'PHE', 'kd_index': 2.8, 'hp': 'H', 'charge': 'Aromatic'},
    'W': {'name': 'Tryptophan', '3letter': 'TRP', 'kd_index': -0.9, 'hp': 'H', 'charge': 'Aromatic'},  # Large hydrophobic aromatic ring
    'P': {'name': 'Proline', '3letter': 'PRO', 'kd_index': -1.6, 'hp': 'H', 'charge': 'Aliphatic ring'},  # Non-polar backbone ring
    'C': {'name': 'Cysteine', '3letter': 'CYS', 'kd_index': 2.5, 'hp': 'H', 'charge': 'Thiol'},
    'Y': {'name': 'Tyrosine', '3letter': 'TYR', 'kd_index': -1.3, 'hp': 'H', 'charge': 'Aromatic'},  # Hydrophobic aromatic core
    'G': {'name': 'Glycine', '3letter': 'GLY', 'kd_index': -0.4, 'hp': 'P', 'charge': 'Neutral'},
    'S': {'name': 'Serine', '3letter': 'SER', 'kd_index': -0.8, 'hp': 'P', 'charge': 'Polar'},
    'T': {'name': 'Threonine', '3letter': 'THR', 'kd_index': -0.7, 'hp': 'P', 'charge': 'Polar'},
    'N': {'name': 'Asparagine', '3letter': 'ASN', 'kd_index': -3.5, 'hp': 'P', 'charge': 'Polar'},
    'Q': {'name': 'Glutamine', '3letter': 'GLN', 'kd_index': -3.5, 'hp': 'P', 'charge': 'Polar'},
    'D': {'name': 'Aspartate', '3letter': 'ASP', 'kd_index': -3.5, 'hp': 'P', 'charge': 'Negative (-)'},
    'E': {'name': 'Glutamate', '3letter': 'GLU', 'kd_index': -3.5, 'hp': 'P', 'charge': 'Negative (-)'},
    'K': {'name': 'Lysine', '3letter': 'LYS', 'kd_index': -3.9, 'hp': 'P', 'charge': 'Positive (+)'},
    'R': {'name': 'Arginine', '3letter': 'ARG', 'kd_index': -4.5, 'hp': 'P', 'charge': 'Positive (+)'},
    'H': {'name': 'Histidine', '3letter': 'HIS', 'kd_index': -3.2, 'hp': 'P', 'charge': 'Positive (+)'},
}

THREE_LETTER_MAP: Dict[str, str] = {
    v['3letter']: k for k, v in AMINO_ACID_DATA.items()
}

def clean_raw_sequence(seq: str) -> str:
    """Remove whitespace, dashes, commas, and normalize to uppercase."""
    return re.sub(r'[\s\-\,]+', '', seq).upper()

def is_pure_hp_sequence(seq: str) -> bool:
    """Check if sequence contains only H and P characters after removing spaces/dashes."""
    cleaned = clean_raw_sequence(seq)
    return len(cleaned) > 0 and all(c in ('H', 'P') for c in cleaned)

def convert_amino_acids_to_hp(input_seq: str) -> Tuple[str, List[Dict[str, Any]], str]:
    """
    Convert an input sequence (HP string or 1-letter/3-letter AA sequence) into HP notation.
    
    Rules:
    1. If input contains ONLY 'H' and 'P' (case-insensitive, ignoring spaces and dashes),
       it is treated directly as an HP sequence without amino acid conversion.
    2. If input contains 3-letter amino acid codes (space/dash-separated), converts via Kyte-Doolittle.
    3. If input contains standard 1-letter amino acid codes, converts via Kyte-Doolittle.
    4. If input contains unsupported characters, raises a descriptive ValueError.
    
    Returns:
        (hp_sequence, residue_details, sequence_type)
    """
    if input_seq is None:
        raise ValueError("Sequence cannot be empty. Please enter an HP or amino acid sequence.")
    
    raw = input_seq.strip()
    if not raw:
        raise ValueError("Sequence cannot be empty. Please enter an HP or amino acid sequence.")
    
    # 1. Check if 3-letter amino acid sequence (e.g. "MET-ALA-VAL" or "Met Ala Val Pro")
    tokens = [t.strip().upper() for t in raw.replace('-', ' ').replace(',', ' ').replace(';', ' ').split()]
    if len(tokens) > 1 and all(t in THREE_LETTER_MAP for t in tokens):
        converted_aas = [THREE_LETTER_MAP[t] for t in tokens]
        hp_chars = []
        details = []
        for idx, aa in enumerate(converted_aas):
            info = AMINO_ACID_DATA[aa]
            hp_char = info['hp']
            hp_chars.append(hp_char)
            details.append({
                'index': idx + 1,
                'original': info['3letter'],
                'aa_code': aa,
                'name': info['name'],
                'kd_index': info['kd_index'],
                'hp': hp_char,
                'charge': info['charge']
            })
        return "".join(hp_chars), details, "3-Letter Amino Acids"
    
    # 2. Clean sequence (strip whitespace, dashes, commas, lowercase to uppercase)
    cleaned = clean_raw_sequence(raw)
    if not cleaned:
        raise ValueError("Sequence cannot be empty after removing spaces and dashes.")
    
    # 3. Check if sequence is purely HP notation (only 'H' and 'P')
    if all(c in ('H', 'P') for c in cleaned):
        details = []
        for idx, c in enumerate(cleaned):
            details.append({
                'index': idx + 1,
                'original': c,
                'aa_code': c,
                'name': 'Hydrophobic Residue' if c == 'H' else 'Polar Residue',
                'kd_index': 1.0 if c == 'H' else -1.0,
                'hp': c,
                'charge': 'Hydrophobic (core)' if c == 'H' else 'Polar (solvent)'
            })
        return cleaned, details, "HP Sequence"
    
    # 4. Check for invalid characters not present in standard 20 amino acids
    invalid_chars = [(c, idx + 1) for idx, c in enumerate(cleaned) if c not in AMINO_ACID_DATA]
    if invalid_chars:
        sample_invalid = ", ".join([f"'{c}' (position {pos})" for c, pos in invalid_chars[:5]])
        if len(invalid_chars) > 5:
            sample_invalid += f" and {len(invalid_chars) - 5} more"
        raise ValueError(
            f"Invalid sequence: Unsupported character(s) found: {sample_invalid}. "
            "Please provide a valid HP sequence (containing only 'H' and 'P') or standard 20 amino acids "
            "(A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y)."
        )
    
    # 5. Standard 1-letter amino acid sequence
    hp_chars = []
    details = []
    for idx, char in enumerate(cleaned):
        info = AMINO_ACID_DATA[char]
        hp_char = info['hp']
        hp_chars.append(hp_char)
        details.append({
            'index': idx + 1,
            'original': char,
            'aa_code': char,
            'name': info['name'],
            'kd_index': info['kd_index'],
            'hp': hp_char,
            'charge': info['charge']
        })
    
    return "".join(hp_chars), details, "1-Letter Amino Acids"
