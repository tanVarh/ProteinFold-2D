# ProteinFold-2D: Computational Protein Folding Simulator


> An interactive full-stack research studio for simulating protein folding using the **2D Hydrophobic–Polar (HP) Lattice Model** and **Simulated Annealing** optimization.

---

## 🧬 Project Overview

**ProteinFold-2D** models the folding of linear polypeptide chains into their lowest-energy tertiary conformations on a 2D square lattice ($\mathbb{Z}^2$). 

It solves the simplified lattice folding problem using:
1. **Dill's 2D HP Model (Ken Dill, 1985)**: Classifies amino acids into **Hydrophobic (H)** (core-forming) and **Polar (P)** (solvent-exposed) residues.
2. **Simulated Annealing (Kirkpatrick et al., 1983)**: A stochastic global optimization heuristic based on the Metropolis–Hastings criterion to escape local minima traps.
3. **Greedy Search (Hill Climbing)**: A baseline local search heuristic for comparative benchmark analysis.
4. **Self-Avoiding Walks (SAW)**: Exact lattice constraint enforcement with ergodic Monte Carlo move operators (Pivot moves, Corner flips, End moves, Crankshaft moves).

---

## 🚀 Key Features

* **Interactive Sequence Input & Real-Time HP Conversion**:
  * Direct HP notation (`HHPPHPPHHPPH`).
  * Automatic Kyte–Doolittle hydrophobicity mapping for standard 20 amino acids (`MKVLYR...` or 3-letter codes).
  * Interactive residue breakdown displaying charge, hydropathy index, and structural role.
  * Literature presets (Dill 20-mer, 24-mer, 25-mer, 36-mer, Crambin, Ubiquitin, Insulin).
* **High-Precision 2D Lattice Visualization**:
  * Scalable Vector Graphics (SVG) canvas with pan, zoom, and auto-centering.
  * Hydrophobic residues (glowing amber/orange core) vs Polar residues (cyan/blue).
  * Directional covalent backbone path ($N' \to C'$).
  * Non-covalent $H-H$ energetic interaction lines with live count.
  * Step-by-step folding timeline animation with scrubber.
  * Direct high-resolution SVG export.
* **Analytical Trajectory & Contact Map**:
  * Energy vs. Iteration descent curve.
  * Annealing temperature decay schedule ($T_k = \alpha^k T_0$).
  * Side-by-side comparative overlay of Simulated Annealing vs. Greedy Search.
  * Interactive $N \times N$ topological contact matrix heatmap.
* **Multi-Seed Empirical Experiments**:
  * Batch simulation across multiple random seeds.
  * Statistical metrics: Best energy, Worst energy, Mean energy ($\mu$), Standard deviation ($\sigma$), and Average runtime.
  * Energy level frequency distribution histogram and seed-by-seed inspection log.
* **Educational Biophysics Module**:
  * Explains Levinthal's paradox, thermodynamic hypothesis, Dill's model, NP-completeness, and 2D abstraction vs. all-atom 3D predictors (AlphaFold).

---

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Canvas-Confetti
* **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic
* **No Database / No Cloud APIs / No API Keys**: 100% self-contained local execution.

---

## 📁 Project Structure

```text
c:\mini_project cb/
├── backend/
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── benchmarks.py           # Canonical literature presets
│   │   ├── experiments.py          # Multi-seed statistical runner
│   │   ├── greedy_search.py        # Hill-climbing baseline
│   │   ├── moves.py                # Pivot, corner flip, end, crankshaft moves
│   │   └── simulated_annealing.py  # Metropolis SA optimization engine
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── hp_mapping.py           # Kyte-Doolittle scale & AA converter
│   │   └── lattice.py              # 2D SAW geometry & energy calculations
│   └── main.py                     # FastAPI application & REST endpoints
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChartsSection.jsx       # Recharts energy & temperature curves
│   │   │   ├── ContactMap.jsx          # Matrix contact heatmap
│   │   │   ├── EducationalSection.jsx  # Biophysics theory & disclaimers
│   │   │   ├── ExperimentsSection.jsx  # Multi-seed statistical trial suite
│   │   │   ├── MetricsCards.jsx        # Performance KPI indicators
│   │   │   ├── Navbar.jsx              # Navigation & export controls
│   │   │   ├── ParameterControls.jsx   # Hyperparameters & algorithm selector
│   │   │   ├── Protein2DViewer.jsx     # Interactive SVG lattice visualizer
│   │   │   └── SequenceInput.jsx       # Sequence input & residue inspector
│   │   ├── pages/
│   │   │   └── MainDashboard.jsx       # Main application dashboard
│   │   ├── services/
│   │   │   └── api.js                  # Frontend API client
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Installation & Running Locally

### 1. Prerequisites
* **Python 3.10+** (Python 3.12 recommended)
* **Node.js v18+** and **npm**

### 2. Backend Setup
From the project root:
```bash
# Install Python backend dependencies
pip install fastapi uvicorn

# Start the FastAPI backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will be available at: `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173`.

---

## 🧪 Theoretical Background & Algorithm Rules

### 1. Energy Function
In the 2D HP lattice model, non-covalent topological neighbors contribute to the free energy:
$$E = -\sum_{i < j, \, |i-j| > 1} \delta(\mathbf{r}_i, \mathbf{r}_j) \cdot \mathbb{I}(s_i = \text{'H'} \land s_j = \text{'H'})$$
* **H-H Contact**: $-1$ energy unit (stabilizing).
* **H-P / P-P Contact**: $0$ energy units.
* **Backbone-adjacent residues ($|i-j|=1$)**: Excluded from contact energy.

### 2. Metropolis Simulated Annealing
* Better folds ($\Delta E < 0$) are **always accepted**.
* Worse folds ($\Delta E \ge 0$) are **accepted with probability**:
  $$P(\text{accept}) = \exp\left(-\frac{\Delta E}{T}\right)$$
* Geometric cooling:
  $$T_{k+1} = \alpha \cdot T_k \quad (\alpha \in [0.90, 0.999])$$

---

## 🎓 Academic Disclaimer
*This simulator is an educational 2D mathematical abstraction for B.Tech Computational Biology coursework to demonstrate NP-hard combinatorial optimization, free energy landscapes, and Monte Carlo algorithms. It is not an experimental 3D structural biology predictor.*
