let brbRules = [];
let brbAntCount = 2;
let brbLastResult = null;
let brbLastMeta = null;

function initBRBPage() {
  brbGenerateInputs();
}

function brbGenerateInputs() {
  brbAntCount = parseInt(document.getElementById('brb-ant-count').value) || 2;
  const antDefs = document.getElementById('brb-ant-defs');
  antDefs.innerHTML = '';
  for (let i = 0; i < brbAntCount; i++) {
    antDefs.innerHTML += `
      <div class="input-row">
        <div class="label">Antecedent ${i+1} Name</div>
        <input type="text" id="brb-ant-name-${i}" value="${i === 0 ? 'Facilities Score' : i === 1 ? 'Cost Score' : 'Criterion ' + (i+1)}">
      </div>`;
  }
  const obsEl = document.getElementById('brb-observations');
  obsEl.innerHTML = '<p style="font-size:12px;color:var(--text-sec);margin-bottom:8px">Belief degrees for each antecedent (must sum ≤ 1.0 per antecedent)</p>';
  for (let i = 0; i < brbAntCount; i++) {
    obsEl.innerHTML += `<div style="margin-bottom:10px"><div class="label" id="brb-obs-label-${i}">Antecedent ${i+1}</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">` +
      GRADE_KEYS.map((k, j) => `<div><div style="font-size:10px;color:var(--text-ter);margin-bottom:2px">${k}</div>
        <input type="number" min="0" max="1" step="0.001" value="${j === 2 ? '0.600' : j === 3 ? '0.400' : '0.000'}" id="brb-obs-${i}-${j}" style="padding:4px;font-size:12px"></div>`).join('') +
      '</div></div>';
  }
  brbRenderRules();
}

function brbAddRule() {
  const idx = brbRules.length;
  brbRules.push({ id: idx, weight: 1.0, antecedents: new Array(brbAntCount).fill(2), consequent: [0.1, 0.1, 0.2, 0.3, 0.3] });
  brbRenderRules();
}

function brbRenderRules() {
  const container = document.getElementById('brb-rules-container');
  if (brbRules.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="ti ti-git-branch" aria-hidden="true"></i><p>No rules defined. Click "Add Rule" to start.</p></div>';
    return;
  }
  container.innerHTML = brbRules.map((rule, idx) => `
    <div class="rule-card">
      <div class="rule-head" style="display:flex;justify-content:space-between">
        <span>Rule ${idx+1}</span>
        <button class="btn btn-sm" onclick="brbRemoveRule(${idx})" style="padding:2px 8px;font-size:11px"><i class="ti ti-x" aria-hidden="true"></i></button>
      </div>
      <div class="rule-inputs">
        <div class="input-row" style="margin-bottom:0">
          <div class="label">Rule Weight</div>
          <input type="number" min="0" max="1" step="0.01" value="${rule.weight.toFixed(2)}" id="brb-rule-w-${idx}" oninput="brbUpdateRule(${idx})">
        </div>
        ${Array.from({length: brbAntCount}, (_, i) => `
          <div class="input-row" style="margin-bottom:0">
            <div class="label">Ant.${i+1} Grade</div>
            <select id="brb-rule-ant-${idx}-${i}" onchange="brbUpdateRule(${idx})">
              ${GRADES.map((g, j) => `<option value="${j}" ${(rule.antecedents[i] || 0) === j ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>`).join('')}
      </div>
      <div style="margin-top:8px"><div class="label">Consequent Beliefs (VL, L, M, H, VH)</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">
          ${GRADE_KEYS.map((k, j) => `<div>
            <div style="font-size:10px;color:var(--text-ter)">${k}</div>
            <input type="number" min="0" max="1" step="0.001" value="${(rule.consequent[j] || 0).toFixed(3)}" id="brb-rule-c-${idx}-${j}" oninput="brbUpdateRule(${idx})" style="padding:4px;font-size:12px">
          </div>`).join('')}
        </div>
      </div>
    </div>`).join('');
}

function brbUpdateRule(idx) {
  if (!brbRules[idx]) return;
  brbRules[idx].weight = parseFloat(document.getElementById(`brb-rule-w-${idx}`).value) || 0;
  brbRules[idx].antecedents = Array.from({length: brbAntCount}, (_, i) => parseInt(document.getElementById(`brb-rule-ant-${idx}-${i}`)?.value || 0));
  brbRules[idx].consequent = GRADE_KEYS.map((_, j) => parseFloat(document.getElementById(`brb-rule-c-${idx}-${j}`)?.value || 0));
}

function brbRemoveRule(idx) {
  brbRules.splice(idx, 1);
  brbRules.forEach((r, i) => r.id = i);
  brbRenderRules();
}

function brbClearRules() { brbRules = []; brbRenderRules(); }

function brbLoadSample() {
  brbRules = [
    { id: 0, weight: 0.9, antecedents: [3, 3], consequent: [0.0, 0.0, 0.1, 0.5, 0.4] },
    { id: 1, weight: 0.8, antecedents: [3, 2], consequent: [0.0, 0.1, 0.3, 0.4, 0.2] },
    { id: 2, weight: 0.7, antecedents: [2, 3], consequent: [0.0, 0.1, 0.2, 0.5, 0.2] },
    { id: 3, weight: 0.6, antecedents: [2, 2], consequent: [0.0, 0.2, 0.5, 0.2, 0.1] },
    { id: 4, weight: 0.5, antecedents: [1, 1], consequent: [0.1, 0.4, 0.3, 0.2, 0.0] },
    { id: 5, weight: 0.4, antecedents: [0, 0], consequent: [0.4, 0.4, 0.2, 0.0, 0.0] }
  ];
  brbRenderRules();
}

async function brbCalculate() {
  if (brbRules.length === 0) { alert('Please add at least one rule.'); return; }
  const observations = Array.from({length: brbAntCount}, (_, i) =>
    GRADE_KEYS.map((_, j) => parseFloat(document.getElementById(`brb-obs-${i}-${j}`)?.value || 0))
  );
  for (let i = 0; i < observations.length; i++) {
    const s = observations[i].reduce((a, b) => a + b, 0);
    if (s > 1.001) {
      alert(`Antecedent ${i + 1} belief degrees sum to ${s.toFixed(3)} (> 1.0). Each antecedent must sum to ≤ 1.0.`);
      return;
    }
  }
  for (const r of brbRules) {
    if (r.consequent.reduce((a, b) => a + b, 0) > 1.001) {
      alert('A rule consequent sums to > 1.0. Each consequent must sum to ≤ 1.0.');
      return;
    }
  }
  const method = document.getElementById('brb-method').value === 'simple'
    ? 'weighted_average' : 'analytical_er';
  const rules = brbRules.map(r => ({
    weight: r.weight,
    antecedents: r.antecedents,
    consequent: r.consequent
  }));
  const res = await apiPost('/brb/infer', { observations, rules, method });
  if (!res.success) { alert(res.error); return; }
  const result = res.result;
  brbLastResult = result;
  brbLastMeta = { observations, rules, antCount: brbAntCount };
  const belief = result.belief;
  const utility = result.utility;
  const topIdx = belief.indexOf(Math.max(...belief));
  document.getElementById('brb-results').style.display = '';
  document.getElementById('brb-metrics').innerHTML = `
    <div class="metric"><div class="mlabel">Rules Fired</div><div class="mval blue">${rules.length}</div></div>
    <div class="metric"><div class="mlabel">Utility Score</div><div class="mval teal">${utility.toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">Dominant Grade</div><div class="mval purple">${GRADES[topIdx]}</div></div>
    <div class="metric"><div class="mlabel">Method</div><div class="mval" style="font-size:14px">${result.method === 'weighted_average' ? 'Weighted Average' : 'Analytical ER'}</div></div>
  `;
  createBeliefBarChart('brb-belief-chart', GRADES, belief, 'Consequent Belief Distribution');
  let t = '<thead><tr><th>Grade</th><th>Belief Degree</th><th>Bar</th></tr></thead><tbody>';
  belief.forEach((b, i) => {
    t += `<tr ${i === topIdx ? 'class="highlight-row"' : ''}><td><strong>${GRADES[i]}</strong></td><td>${b.toFixed(4)}</td>
      <td><div class="progress-bar-wrap" style="min-width:120px"><div class="progress-bar" style="width:${Math.round(b * 100)}%;background:${i === topIdx ? 'var(--teal-400)' : 'var(--blue-400)'}"></div></div></td></tr>`;
  });
  t += `<tr class="highlight-row"><td><strong>Utility</strong></td><td><strong>${utility.toFixed(4)}</strong></td><td>—</td></tr></tbody>`;
  document.getElementById('brb-table').innerHTML = t;
  let at = '<thead><tr><th>Rule</th><th>Weight</th><th>Matching Degree</th><th>Raw Activation</th><th>Normalised</th></tr></thead><tbody>';
  result.activation_weights.forEach((aw, ri) => {
    const md = result.matching_degrees?.[ri] || 0;
    const raw = result.raw_weights?.[ri] || 0;
    at += `<tr><td>Rule ${ri+1}</td><td>${rules[ri].weight.toFixed(2)}</td><td>${md.toFixed(4)}</td><td>${raw.toFixed(4)}</td><td>${aw.toFixed(4)}</td></tr>`;
  });
  at += '</tbody>';
  document.getElementById('brb-activation-table').innerHTML = at;
}

function brbExport() {
  if (!brbLastResult) return;
  const rows = [];

  rows.push({ Section: 'BRB INFERENCE RESULTS', '': '' });

  rows.push({ Section: 'Consequent Belief Distribution:', '': '' });
  brbLastResult.belief.forEach((b, i) => {
    rows.push({ Section: GRADES[i], 'Belief Degree': b.toFixed(4) });
  });
  rows.push({ Section: 'Utility Score', 'Belief Degree': brbLastResult.utility.toFixed(4) });

  if (brbLastMeta) {
    rows.push({ Section: '', '': '' });
    rows.push({ Section: 'ACTIVATION WEIGHTS:', '': '' });
    brbLastResult.activation_weights.forEach((aw, ri) => {
      const rule = brbLastMeta.rules[ri];
      rows.push({
        Section: `Rule ${ri+1}`,
        'Belief Degree': '',
        'Weight': rule.weight.toFixed(2),
        'Antecedents': `[${rule.antecedents.join(', ')}]`,
        'Consequent': `[${rule.consequent.map(c=>c.toFixed(3)).join(', ')}]`,
        'Activation Wt': aw.toFixed(4)
      });
    });

    rows.push({ Section: '', '': '' });
    rows.push({ Section: 'OBSERVATION INPUTS:', '': '' });
    brbLastMeta.observations.forEach((obs, antIdx) => {
      rows.push({
        Section: `Antecedent ${antIdx+1}`,
        'Belief Degree': '',
        'VL': obs[0].toFixed(3),
        'L': obs[1].toFixed(3),
        'M': obs[2].toFixed(3),
        'H': obs[3].toFixed(3),
        'VH': obs[4].toFixed(3)
      });
    });
  }

  downloadCSV(rows, 'brb_results.csv');
}
