"""2D Lattice Geometry and Energy Calculations for HP Model.

Rules:
1. Each residue occupies a unique integer coordinate (x, y) on a 2D square lattice.
2. Consecutive residues |i - (i+1)| = 1 must be adjacent on the grid (Manhattan distance = 1).
3. Non-consecutive H-H contacts (Manhattan distance = 1, |i - j| > 1) contribute -1 energy.
4. H-P and P-P contacts contribute 0 energy.
5. Backbone-adjacent residues (|i - j| == 1) do NOT count as contacts.
"""

from typing import List, Tuple, Dict, Any, Set, Optional
import random

Point = Tuple[int, int]

def manhattan_distance(p1: Point, p2: Point) -> int:
    """Compute Manhattan (L1) distance on 2D square grid."""
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

def is_valid_saw(coords: List[Point]) -> bool:
    """
    Validate if a given coordinate list represents a valid Self-Avoiding Walk (SAW):
    - All coordinates must be unique.
    - Consecutive residues must be grid neighbors (distance == 1).
    """
    n = len(coords)
    if n == 0:
        return False
    if len(set(coords)) != n:
        return False
    for i in range(n - 1):
        if manhattan_distance(coords[i], coords[i + 1]) != 1:
            return False
    return True

def generate_straight_fold(length: int) -> List[Point]:
    """Generate an extended straight line configuration along the X-axis: [(0,0), (1,0), (2,0), ...]."""
    return [(i, 0) for i in range(length)]

def generate_random_saw(length: int, max_attempts: int = 500) -> List[Point]:
    """
    Generate a random valid self-avoiding walk of given length.
    Falls back to straight fold if random walk gets trapped.
    """
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    for _ in range(max_attempts):
        coords = [(0, 0)]
        occupied: Set[Point] = {(0, 0)}
        trapped = False
        for _ in range(length - 1):
            curr = coords[-1]
            valid_next = [
                (curr[0] + dx, curr[1] + dy)
                for dx, dy in directions
                if (curr[0] + dx, curr[1] + dy) not in occupied
            ]
            if not valid_next:
                trapped = True
                break
            nxt = random.choice(valid_next)
            coords.append(nxt)
            occupied.add(nxt)
        if not trapped and len(coords) == length:
            return coords
    return generate_straight_fold(length)

def calculate_energy(sequence: str, coords: List[Point]) -> int:
    """
    Calculate the total HP energy of the folded chain:
    E = -1 * sum_{i < j, |i-j| > 1, dist(pos_i, pos_j) == 1} (1 if seq[i]=='H' and seq[j]=='H' else 0)
    """
    n = len(sequence)
    if len(coords) != n:
        raise ValueError(f"Sequence length ({n}) does not match coords length ({len(coords)})")
    
    hh_contacts = 0
    # Find all pairs (i, j) with |i - j| > 1 that are Manhattan neighbors
    for i in range(n):
        if sequence[i] != 'H':
            continue
        for j in range(i + 2, n):
            if sequence[j] == 'H':
                if manhattan_distance(coords[i], coords[j]) == 1:
                    hh_contacts += 1
    
    return -hh_contacts

def get_contact_details(sequence: str, coords: List[Point]) -> Dict[str, Any]:
    """
    Extract comprehensive topological contact details:
    - hh_contacts: List of (i, j) residue pairs with 'H'-'H' non-covalent bond
    - hp_contacts: List of (i, j) residue pairs with 'H'-'P' proximity
    - pp_contacts: List of (i, j) residue pairs with 'P'-'P' proximity
    - backbone_bonds: List of consecutive (i, i+1) bonds
    - total_hh: count of HH contacts
    - energy: total energy (-total_hh)
    """
    n = len(sequence)
    hh_contacts = []
    hp_contacts = []
    pp_contacts = []
    backbone_bonds = []
    
    for i in range(n - 1):
        backbone_bonds.append({
            'from_index': i,
            'to_index': i + 1,
            'from_coord': list(coords[i]),
            'to_coord': list(coords[i + 1]),
            'type': 'backbone'
        })
        
    for i in range(n):
        for j in range(i + 2, n):
            if manhattan_distance(coords[i], coords[j]) == 1:
                t1 = sequence[i]
                t2 = sequence[j]
                contact_item = {
                    'from_index': i,
                    'to_index': j,
                    'from_coord': list(coords[i]),
                    'to_coord': list(coords[j]),
                    'type': f"{t1}-{t2}"
                }
                if t1 == 'H' and t2 == 'H':
                    hh_contacts.append(contact_item)
                elif (t1 == 'H' and t2 == 'P') or (t1 == 'P' and t2 == 'H'):
                    hp_contacts.append(contact_item)
                elif t1 == 'P' and t2 == 'P':
                    pp_contacts.append(contact_item)
                    
    return {
        'hh_contacts': hh_contacts,
        'hp_contacts': hp_contacts,
        'pp_contacts': pp_contacts,
        'backbone_bonds': backbone_bonds,
        'total_hh': len(hh_contacts),
        'total_hp': len(hp_contacts),
        'total_pp': len(pp_contacts),
        'energy': -len(hh_contacts)
    }

def get_contact_matrix(sequence: str, coords: List[Point]) -> List[List[int]]:
    """
    Generate an NxN contact matrix:
    0: No contact
    1: Backbone bond (|i - j| == 1)
    2: Non-covalent H-H contact (energy contributing, -1)
    3: Non-covalent H-P proximity
    4: Non-covalent P-P proximity
    """
    n = len(sequence)
    matrix = [[0 for _ in range(n)] for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i == j:
                matrix[i][j] = 0
            elif abs(i - j) == 1:
                matrix[i][j] = 1
            elif manhattan_distance(coords[i], coords[j]) == 1:
                t1, t2 = sequence[i], sequence[j]
                if t1 == 'H' and t2 == 'H':
                    matrix[i][j] = 2
                elif (t1 == 'H' and t2 == 'P') or (t1 == 'P' and t2 == 'H'):
                    matrix[i][j] = 3
                else:
                    matrix[i][j] = 4
    return matrix

def normalize_coordinates(coords: List[Point]) -> List[List[int]]:
    """Shift coordinates so that minimum x and y are centered / non-negative."""
    if not coords:
        return []
    min_x = min(c[0] for c in coords)
    min_y = min(c[1] for c in coords)
    return [[c[0] - min_x, c[1] - min_y] for c in coords]
