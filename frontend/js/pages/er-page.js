let erGroup = 'w1';
let erSub = null;
let erSurveyData = null;
let erLastResult = null;

async function initERPage() {
  const res = await apiGet('/data/survey');
  if (res.success) erSurveyData = res.data;
  document.getElementById('er-utility').addEventListener('change', function() {
    document.getElementById('er-utility-custom').style.display = this.value === 'custom' ? 'block' : 'none';
  });
  erLoadGroup();
}

async function erLoadGroup() {
  erGroup = document.getElementById('er-group').value;
  if (erGroup === 'custom') {
    document.getElementById('er-subcriteria-tabs').innerHTML = '';
    erRenderBeliefs('Custom Sub-Criteria', [0.2, 0.2, 0.2, 0.2, 0.2]);
    erSub = 'Custom Sub-Criteria';
    return;
  }
  if (!erSurveyData) {
    const res = await apiGet('/data/survey');
    if (res.success) erSurveyData = res.data;
  }
  const data = erSurveyData[erGroup];
  const subs = Object.keys(data);
  erSub = subs[0];
  erRenderTabs(subs);
  erRenderBeliefs(erSub, data[erSub]);
}

function erRenderTabs(subs) {
  const el = document.getElementById('er-subcriteria-tabs');
  el.innerHTML = subs.map((s, i) =>
    `<button class="tab ${i === 0 ? 'active' : ''}" onclick="erSelectSub('${s.replace(/'/g, "\\'")}')">${s.split('(')[1]?.replace(')', '') || s}</button>`
  ).join('');
}

function erSelectSub(name) {
  erSub = name;
  const data = erSurveyData[erGroup];
  erRenderBeliefs(name, data[name]);
  document.querySelectorAll('#er-subcriteria-tabs .tab').forEach(t => t.classList.remove('active'));
  const idx = Object.keys(data).indexOf(name);
  const tab = document.getElementById('er-subcriteria-tabs').children[idx];
  if (tab) tab.classList.add('active');
}

function erRenderBeliefs(name, values) {
  const container = document.getElementById('er-belief-inputs');
  container.innerHTML = `<p style="font-size:13px;color:var(--text-sec);margin-bottom:10px">Sub-criteria: <strong>${name}</strong></p>`;
  GRADES.forEach((g, i) => {
    const v = values ? values[i].toFixed(3) : '0.000';
    container.innerHTML += `
      <div class="belief-row">
        <div class="blabel">${g} (${GRADE_KEYS[i]})</div>
        <input type="range" min="0" max="1" step="0.001" value="${v}" id="er-range-${i}" oninput="erSyncVal(${i})">
        <div class="bval"><input type="number" min="0" max="1" step="0.001" value="${v}" id="er-num-${i}" oninput="erSyncRange(${i})" style="width:70px;text-align:right"></div>
      </div>`;
  });
}

function erSyncVal(i) {
  const v = document.getElementById('er-range-' + i).value;
  document.getElementById('er-num-' + i).value = parseFloat(v).toFixed(3);
}

function erSyncRange(i) {
  const v = document.getElementById('er-num-' + i).value;
  document.getElementById('er-range-' + i).value = v;
}

async function erLoadSurvey() {
  if (erGroup === 'custom' || !erSurveyData) return;
  const data = erSurveyData[erGroup];
  const sub = erSub || Object.keys(data)[0];
  erRenderBeliefs(sub, data[sub]);
}

function erReset() {
  erRenderBeliefs(erSub || 'Sub-criteria', [0, 0, 0, 0, 0]);
}

function erGetBeliefs() {
  return GRADES.map((_, i) => parseFloat(document.getElementById('er-num-' + i).value) || 0);
}

function erGetUtilities() {
  const mode = document.getElementById('er-utility').value;
  if (mode === 'custom') {
    return document.getElementById('er-custom-util').value.split(',').map(Number);
  }
  return mode === 'linear' ? [0.0, 0.25, 0.5, 0.75, 1.0] : [0.1, 0.3, 0.5, 0.7, 0.9];
}

async function erCalculate() {
  const group = erGroup;
  let allData = {};
  if (group !== 'custom' && erSurveyData) {
    allData = erSurveyData[group];
  } else {
    allData['Custom'] = erGetBeliefs();
  }
  const utils = erGetUtilities();
  const beliefs = Object.values(allData);
  const n = beliefs.length;
  const weights = new Array(n).fill(1 / n);
  const res = await apiPost('/er/aggregate', { beliefs, weights, utilities: utils });
  if (!res.success) { alert(res.error); return; }
  const result = res.result;
  erLastResult = { allData, utils, result };
  const combinedBelief = result.belief;
  const combinedUtil = result.utility;
  document.getElementById('er-results').style.display = '';
  document.getElementById('er-metrics').innerHTML = `
    <div class="metric"><div class="mlabel">Sub-criteria Count</div><div class="mval blue">${Object.keys(allData).length}</div></div>
    <div class="metric"><div class="mlabel">Combined Utility</div><div class="mval teal">${combinedUtil.toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">Ignorance</div><div class="mval purple">${result.ignorance.toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">Method</div><div class="mval" style="font-size:14px">Dempster-Shafer ER</div></div>
  `;
  createBeliefBarChart('er-belief-chart', GRADES, combinedBelief, 'Aggregated Belief Distribution');
  let t = '<thead><tr><th>Grade</th>' + Object.keys(allData).map(s => `<th>${s.split('(')[1]?.replace(')', '') || s}</th>`).join('') + '<th>Combined</th></tr></thead><tbody>';
  const subgroupResults = [];
  let idx = 0;
  for (const [sub, raw] of Object.entries(allData)) {
    const sum = raw.reduce((a, b) => a + b, 0);
    const norm = sum > 0 ? raw.map(b => b / sum) : raw;
    const util = norm.reduce((acc, b, i) => acc + b * utils[i], 0);
    subgroupResults.push({ sub, raw, norm, util });
  }
  GRADES.forEach((g, i) => {
    let row = `<tr><td><strong>${g}</strong></td>`;
    for (const [sub] of Object.entries(allData)) {
      const s = subgroupResults.find(r => r.sub === sub);
      row += `<td>${s ? s.norm[i].toFixed(4) : '0.0000'}</td>`;
    }
    row += `<td><strong>${combinedBelief[i].toFixed(4)}</strong></td></tr>`;
    t += row;
  });
  t += '</tbody>';
  document.getElementById('er-table').innerHTML = t;
  let u = '<thead><tr><th>Sub-Criteria</th><th>Raw Sum</th><th>Utility Score</th><th>Grade Bar</th></tr></thead><tbody>';
  subgroupResults.forEach(r => {
    const rawSum = r.raw.reduce((a, b) => a + b, 0);
    const pct = Math.round(r.util * 100);
    u += `<tr><td>${r.sub}</td><td>${rawSum.toFixed(3)}</td><td><strong>${r.util.toFixed(4)}</strong></td>
      <td><div class="progress-bar-wrap" style="min-width:80px"><div class="progress-bar" style="width:${pct}%"></div></div></td></tr>`;
  });
  u += `<tr class="highlight-row"><td><strong>COMBINED</strong></td><td>—</td><td><strong>${combinedUtil.toFixed(4)}</strong></td>
    <td><div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round(combinedUtil * 100)}%;background:var(--teal-400)"></div></div></td></tr>`;
  u += '</tbody>';
  document.getElementById('er-utility-table').innerHTML = u;
}

function erExport() {
  if (!erLastResult) return;
  const rows = [{ Grade: 'Utility', Value: erLastResult.result.utility.toFixed(4) }];
  erLastResult.result.belief.forEach((b, i) => {
    rows.push({ Grade: GRADES[i], 'Belief Degree': b.toFixed(4) });
  });
  downloadCSV(rows, 'er_results.csv');
}
