let sensSurveyData = null;
let sensLastSweep = null;
let sensLastMC = null;

async function initSensitivityPage() {
  const res = await apiGet('/data/survey');
  if (res.success) sensSurveyData = res.data;
}

async function sensRunSweep() {
  if (!sensSurveyData) return;
  const step = parseFloat(document.getElementById('sens-step').value);
  const groupWeights = { w1: 0.4, w2: 0.35, w3: 0.25 };
  const res = await apiPost('/sensitivity/sweep', {
    group_weights: groupWeights,
    sub_weights: {},
    step
  });
  if (!res.success) { alert(res.error); return; }
  const data = res.result;
  sensLastSweep = data;
  const groupKeys = ['w1', 'w2', 'w3'];
  const datasets = groupKeys.map(gk => {
    const pts = data.filter(d => d.variable_group === gk).sort((a, b) => a.sweep_value - b.sweep_value);
    return {
      label: gk.toUpperCase() + ' varying',
      data: pts.map(p => ({ x: p.sweep_value, y: p.final_utility }))
    };
  });
  createSensitivityChart('sens-sweep-chart', datasets, 'Systematic Weight Sweep — Impact on Utility');
}

async function sensRunMC() {
  if (!sensSurveyData) return;
  const n = parseInt(document.getElementById('sens-iterations').value);
  const groupWeights = { w1: 0.4, w2: 0.35, w3: 0.25 };
  const res = await apiPost('/sensitivity/montecarlo', {
    group_weights: groupWeights,
    sub_weights: {},
    iterations: n
  });
  if (!res.success) { alert(res.error); return; }
  const result = res.result;
  sensLastMC = result;
  document.getElementById('sens-mc-metrics').style.display = '';
  document.getElementById('sens-mc-metrics').innerHTML = `
    <div class="metric"><div class="mlabel">Mean Utility</div><div class="mval teal">${result.mean_utility.toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">Std Dev</div><div class="mval blue">${result.std_utility.toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">P5</div><div class="mval">${result.percentile_5.toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">P50 (Median)</div><div class="mval purple">${result.percentile_50.toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">P95</div><div class="mval">${result.percentile_95.toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">Range</div><div class="mval">${(result.max_utility - result.min_utility).toFixed(4)}</div></div>
  `;
  const utilities = result.results.map(r => r.final_utility);
  createHistogramChart('sens-mc-chart', utilities, `Monte Carlo Distribution (${n} iterations)`);
}
