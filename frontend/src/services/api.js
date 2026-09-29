/**
 * API Service for communicating with FastAPI backend
 */

const API_BASE_URL = ''; // Relative path leverages Vite proxy to http://127.0.0.1:8001

async function handleResponseError(res, defaultMsg) {
  let errorMsg = defaultMsg;
  try {
    const data = await res.json();
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map((e) => e.msg || e.loc?.join('.') || JSON.stringify(e)).join(', ');
      } else {
        errorMsg = JSON.stringify(data.detail);
      }
    }
  } catch {
    try {
      const text = await res.text();
      if (text && text.length < 300) {
        errorMsg = text;
      }
    } catch {
      // Fallback to defaultMsg
    }
  }
  return new Error(errorMsg);
}

export async function convertSequence(sequence) {
  const res = await fetch(`${API_BASE_URL}/api/convert-sequence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sequence }),
  });
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to validate or convert sequence');
  }
  return res.json();
}

export async function runSimulation({
  sequence,
  algorithm = 'Simulated Annealing',
  initial_temperature = 5.0,
  cooling_rate = 0.995,
  iterations = 3000,
  random_seed = null,
}) {
  const res = await fetch(`${API_BASE_URL}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sequence,
      algorithm,
      initial_temperature: Number(initial_temperature),
      cooling_rate: Number(cooling_rate),
      iterations: Number(iterations),
      random_seed: random_seed !== null && random_seed !== '' ? Number(random_seed) : null,
    }),
  });
  if (!res.ok) {
    throw await handleResponseError(res, 'Simulation execution failed');
  }
  return res.json();
}

export async function runExperiments({
  sequence,
  algorithm = 'Simulated Annealing',
  runs_count = 10,
  iterations_per_run = 2000,
  initial_temperature = 5.0,
  cooling_rate = 0.995,
  base_seed = 42,
}) {
  const res = await fetch(`${API_BASE_URL}/api/experiments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sequence,
      algorithm,
      runs_count: Number(runs_count),
      iterations_per_run: Number(iterations_per_run),
      initial_temperature: Number(initial_temperature),
      cooling_rate: Number(cooling_rate),
      base_seed: Number(base_seed),
    }),
  });
  if (!res.ok) {
    throw await handleResponseError(res, 'Experiments execution failed');
  }
  return res.json();
}

export async function fetchBenchmarks() {
  const res = await fetch(`${API_BASE_URL}/api/benchmarks`);
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to load benchmarks');
  }
  return res.json();
}
