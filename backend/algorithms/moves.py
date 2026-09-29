"""Move Set Operators for 2D Lattice Self-Avoiding Walks.

Implements standard Monte Carlo moves used in polymer physics and lattice HP modeling:
1. Pivot Moves: Global rotational / reflection symmetry around a random pivot residue.
2. Local Corner Flips (V-flips): Local reorientation of a single 90-degree corner.
3. End Moves: Terminal residue repositioning.
4. Crankshaft Moves: Sub-segment 180-degree inversion of U-turns.
"""

from typing import List, Tuple, Optional
import random
try:
    from backend.utils.lattice import Point, is_valid_saw, manhattan_distance
except ImportError:
    from utils.lattice import Point, is_valid_saw, manhattan_distance

def apply_pivot_move(coords: List[Point]) -> Optional[List[Point]]:
    """
    Apply a Pivot move (Lal 1969 / Madras & Sokal 1988).
    Picks a random pivot residue k, rotates or reflects the subchain [k+1, N-1] or [0, k-1]
    around coords[k], and checks if the resulting chain is self-avoiding.
    """
    n = len(coords)
    if n < 3:
        return None
    
    pivot_idx = random.randint(0, n - 1)
    px, py = coords[pivot_idx]
    
    # 7 symmetry transformations on 2D square lattice (excluding identity)
    # (dx, dy) relative to pivot
    transformations = [
        lambda dx, dy: (-dy, dx),    # +90 deg rotation
        lambda dx, dy: (dy, -dx),    # -90 deg rotation
        lambda dx, dy: (-dx, -dy),   # 180 deg rotation
        lambda dx, dy: (dx, -dy),    # Reflect X
        lambda dx, dy: (-dx, dy),    # Reflect Y
        lambda dx, dy: (dy, dx),     # Reflect diagonal y = x
        lambda dx, dy: (-dy, -dx),   # Reflect diagonal y = -x
    ]
    
    transform = random.choice(transformations)
    
    # Randomly choose to transform the right subchain or left subchain
    transform_right = (random.random() < 0.5) if (0 < pivot_idx < n - 1) else (pivot_idx == 0)
    
    new_coords = list(coords)
    if transform_right:
        for i in range(pivot_idx + 1, n):
            dx = coords[i][0] - px
            dy = coords[i][1] - py
            ndx, ndy = transform(dx, dy)
            new_coords[i] = (px + ndx, py + ndy)
    else:
        for i in range(0, pivot_idx):
            dx = coords[i][0] - px
            dy = coords[i][1] - py
            ndx, ndy = transform(dx, dy)
            new_coords[i] = (px + ndx, py + ndy)
            
    if is_valid_saw(new_coords):
        return new_coords
    return None

def apply_corner_flip(coords: List[Point]) -> Optional[List[Point]]:
    """
    Apply a Corner Flip (V-flip) move on an internal residue i in [1, n-2].
    If coords[i-1] and coords[i+1] are diagonal neighbors (|dx|==1, |dy|==1),
    residue i can flip to the alternative corner point: coords[i-1] + coords[i+1] - coords[i].
    """
    n = len(coords)
    if n < 3:
        return None
    
    # Find all eligible corner residues
    corner_indices = []
    for i in range(1, n - 1):
        p_prev = coords[i - 1]
        p_next = coords[i + 1]
        # Diagonal neighbors: |x1 - x2| == 1 and |y1 - y2| == 1
        if abs(p_prev[0] - p_next[0]) == 1 and abs(p_prev[1] - p_next[1]) == 1:
            corner_indices.append(i)
            
    if not corner_indices:
        return None
        
    random.shuffle(corner_indices)
    for idx in corner_indices:
        p_prev = coords[idx - 1]
        p_next = coords[idx + 1]
        p_curr = coords[idx]
        
        # New target position is the reflection across diagonal
        new_point = (p_prev[0] + p_next[0] - p_curr[0], p_prev[1] + p_next[1] - p_curr[1])
        
        # Check if the new point is not occupied by any other residue
        if new_point not in coords:
            new_coords = list(coords)
            new_coords[idx] = new_point
            if is_valid_saw(new_coords):
                return new_coords
                
    return None

def apply_end_move(coords: List[Point]) -> Optional[List[Point]]:
    """
    Reposition either end residue (0 or n-1) to an unoccupied adjacent square of its neighbor.
    """
    n = len(coords)
    if n < 3:
        return None
        
    ends = [0, n - 1]
    random.shuffle(ends)
    
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    occupied = set(coords)
    
    for end_idx in ends:
        neighbor_idx = 1 if end_idx == 0 else n - 2
        nx, ny = coords[neighbor_idx]
        
        possible_new = [(nx + dx, ny + dy) for dx, dy in directions if (nx + dx, ny + dy) not in occupied]
        if possible_new:
            new_p = random.choice(possible_new)
            new_coords = list(coords)
            new_coords[end_idx] = new_p
            if is_valid_saw(new_coords):
                return new_coords
                
    return None

def apply_crankshaft_move(coords: List[Point]) -> Optional[List[Point]]:
    """
    Apply a Crankshaft move on 4 consecutive residues [i, i+1, i+2, i+3] forming a U-shape:
    coords[i] and coords[i+3] are at distance 1 or 2, allowing residues i+1 and i+2 to rotate 180 deg.
    """
    n = len(coords)
    if n < 4:
        return None
        
    candidate_indices = list(range(n - 3))
    random.shuffle(candidate_indices)
    
    occupied = set(coords)
    
    for i in candidate_indices:
        p0 = coords[i]
        p1 = coords[i + 1]
        p2 = coords[i + 2]
        p3 = coords[i + 3]
        
        # Check if p0 and p3 are adjacent or diagonal
        # If vector p0 -> p1 is orthogonal to axis p0 -> p3
        dx03 = p3[0] - p0[0]
        dy03 = p3[1] - p0[1]
        
        # Classic 180-degree flip for U-turns where p0 and p3 are parallel or adjacent
        if abs(dx03) + abs(dy03) == 1:
            # U-turn of length 3: p1 and p2 form a cap
            # Target spots: p0 + (p2 - p3) and p3 + (p1 - p0)
            target1 = (p0[0] - (p1[0] - p0[0]), p0[1] - (p1[1] - p0[1]))
            target2 = (p3[0] - (p2[0] - p3[0]), p3[1] - (p2[1] - p3[1]))
            
            non_segment_occupied = occupied - {p1, p2}
            if target1 not in non_segment_occupied and target2 not in non_segment_occupied:
                new_coords = list(coords)
                new_coords[i + 1] = target1
                new_coords[i + 2] = target2
                if is_valid_saw(new_coords):
                    return new_coords
                    
    return None

def generate_neighbor_fold(coords: List[Point], max_attempts: int = 25) -> Optional[List[Point]]:
    """
    Generate a valid neighboring fold by sampling from move operators.
    Combines Pivot moves (powerful global space search) and local moves (fine-tuning).
    """
    for _ in range(max_attempts):
        r = random.random()
        candidate = None
        if r < 0.65:
            candidate = apply_pivot_move(coords)
        elif r < 0.85:
            candidate = apply_corner_flip(coords)
        elif r < 0.95:
            candidate = apply_end_move(coords)
        else:
            candidate = apply_crankshaft_move(coords)
            
        if candidate is not None and candidate != coords:
            return candidate
            
    # Fallback attempt to force a pivot move
    for _ in range(10):
        res = apply_pivot_move(coords)
        if res is not None and res != coords:
            return res
            
    return None
