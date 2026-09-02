let combSurveyData = null;
let combLastResult = null;
let combUseCustom = false;
let combFinalMethod = 'er';

async function initCombinedPage() {
  const res = await apiGet('/data/survey');
  if (res.success) combSurveyData = res.data;
  document.querySelectorAll('input[name=comb-method]').forEach(r => {
    r.addEventListener('change', () => {
      combFinalMethod = document.querySelector('input[name=comb-method]:checked').value;
      document.getElementById('comb-brb-rules-card').style.display = combFinalMethod === 'brb' ? '' : 'none';
    });
  });
  ['comb-w1', 'comb-w2', 'comb-w3'].forEach(id => {
    document.getElementById(id).addEventListener('input', combCheckWeights);
  });
  combShowTab('w1');
  combRenderRules();
}

function combCheckWeights() {
  const s = ['comb-w1', 'comb-w2', 'comb-w3'].reduce((a, i) => a + parseFloat(document.getElementById(i).value || 0), 0);
  document.getElementById('comb-weight-sum-warn').style.display = Math.abs(s - 1) > 0.01 ? '' : 'none';
}

function combDefaultRules() {
  return [
    { weight: 0.9, antecedents: [3, 3, 3], consequent: [0.0, 0.0, 0.1, 0.5, 0.4] },
    { weight: 0.8, antecedents: [3, 2, 2], consequent: [0.0, 0.1, 0.3, 0.4, 0.2] },
    { weight: 0.7, antecedents: [2, 3, 2], consequent: [0.0, 0.1, 0.2, 0.5, 0.2] },
    { weight: 0.6, antecedents: [2, 2, 3], consequent: [0.0, 0.2, 0.5, 0.2, 0.1] },
    { weight: 0.5, antecedents: [1, 1, 1], consequent: [0.1, 0.4, 0.3, 0.2, 0.0] },
    { weight: 0.4, antecedents: [0, 0, 0], consequent: [0.4, 0.4, 0.2, 0.0, 0.0] }
  ];
}

let combRules = [];

function combRenderRules() {
  combRules = combDefaultRules();
  const container = document.getElementById('comb-brb-rules-list');
  if (!container) return;
  container.innerHTML = combRules.map((rule, idx) => `
    <div class="rule-card" style="padding:8px 12px">
      <div class="rule-head" style="display:flex;justify-content:space-between">
        <span style="font-size:12px">Rule ${idx+1}</span>
        <button class="btn btn-sm" onclick="combRemoveRule(${idx})" style="padding:2px 8px;font-size:11px"><i class="ti ti-x" aria-hidden="true"></i></button>
      </div>
      <div style="font-size:12px;color:var(--text-sec)">Weight: <input type="number" min="0" max="1" step="0.01" value="${rule.weight.toFixed(2)}" style="width:60px" id="comb-rule-w-${idx}" oninput="combUpdateRule(${idx})">
        · Antecedents: ${GRADE_KEYS.map((k, j) => `<select id="comb-rule-ant-${idx}-${j}" onchange="combUpdateRule(${idx})" style="width:48px">${GRADES.map((g, gi) => `<option value="${gi}" ${(rule.antecedents[j]||0)===gi?'selected':''}>${gi}</option>`).join('')}</select>`).join(' ')}
        · Consequent: ${GRADE_KEYS.map((k, j) => `<input type="number" min="0" max="1" step="0.01" value="${rule.consequent[j].toFixed(2)}" style="width:42px" id="comb-rule-c-${idx}-${j}" oninput="combUpdateRule(${idx})">`).join(' ')}
      </div>
    </div>`).join('');
}

function combUpdateRule(idx) {
  if (!combRules[idx]) return;
  combRules[idx].weight = parseFloat(document.getElementById(`comb-rule-w-${idx}`).value) || 0;
  combRules[idx].antecedents = [0, 1, 2].map(j => parseInt(document.getElementById(`comb-rule-ant-${idx}-${j}`)?.value || 0));
  combRules[idx].consequent = GRADE_KEYS.map((_, j) => parseFloat(document.getElementById(`comb-rule-c-${idx}-${j}`)?.value || 0));
}

function combAddRule() {
  combRules.push({ weight: 0.8, antecedents: [2, 2, 2], consequent: [0.0, 0.1, 0.4, 0.3, 0.2] });
  combRenderRulesHTML();
}

function combRemoveRule(idx) {
  combRules.splice(idx, 1);
  combRenderRulesHTML();
}

function combRenderRulesHTML() {
  const container = document.getElementById('comb-brb-rules-list');
  if (!container) return;
  container.innerHTML = combRules.map((rule, idx) => `
    <div class="rule-card" style="padding:8px 12px">
      <div class="rule-head" style="display:flex;justify-content:space-between">
        <span style="font-size:12px">Rule ${idx+1}</span>
        <button class="btn btn-sm" onclick="combRemoveRule(${idx})" style="padding:2px 8px;font-size:11px"><i class="ti ti-x" aria-hidden="true"></i></button>
      </div>
      <div style="font-size:12px;color:var(--text-sec)">Weight: <input type="number" min="0" max="1" step="0.01" value="${rule.weight.toFixed(2)}" style="width:60px" id="comb-rule-w-${idx}" oninput="combUpdateRule(${idx})">
        · Antecedents: ${GRADE_KEYS.map((k, j) => `<select id="comb-rule-ant-${idx}-${j}" onchange="combUpdateRule(${idx})" style="width:48px">${GRADES.map((g, gi) => `<option value="${gi}" ${(rule.antecedents[j]||0)===gi?'selected':''}>${gi}</option>`).join('')}</select>`).join(' ')}
        · Consequent: ${GRADE_KEYS.map((k, j) => `<input type="number" min="0" max="1" step="0.01" value="${rule.consequent[j].toFixed(2)}" style="width:42px" id="comb-rule-c-${idx}-${j}" oninput="combUpdateRule(${idx})">`).join(' ')}
      </div>
    </div>`).join('');
}

function combShowTab(g) {
  document.querySelectorAll('.tab-row .tab').forEach(t => t.classList.remove('active'));
  const tabs = document.querySelectorAll('.tab-row .tab');
  const tabMap = { w1: tabs[0], w2: tabs[1], w3: tabs[2] };
  if (tabMap[g]) tabMap[g].classList.add('active');
  combRenderSubWeights(g);
}

function combRenderSubWeights(g) {
  if (!combSurveyData) return;
  const data = combSurveyData[g];
  const el = document.getElementById('comb-subweights');
  el.innerHTML = '<p style="font-size:12px;color:var(--text-sec);margin-bottom:8px">Sub-criteria weights within group (should sum to 1.0)</p>';
  Object.keys(data).forEach(sub => {
    const defW = (1 / Object.keys(data).length).toFixed(4);
    const safeId = `cw-${g}-${sub.replace(/[^a-z0-9]/gi, '_')}`;
    el.innerHTML += `<div class="input-row" style="display:flex;align-items:center;gap:10px">
      <div style="flex:1;font-size:13px;color:var(--text-sec)">${sub}</div>
      <input type="number" min="0" max="1" step="0.0001" value="${defW}" id="${safeId}" style="width:80px;text-align:right">
    </div>`;
  });
}

function combToggleData() {
  const val = document.querySelector('input[name=comb-data]:checked').value;
  document.getElementById('comb-custom-data').style.display = val === 'custom' ? '' : 'none';
  if (val === 'custom') combRenderCustom();
}

function combRenderCustom() {
  if (!combSurveyData) return;
  const el = document.getElementById('comb-custom-inputs');
  el.innerHTML = '';
  for (const [grp, data] of Object.entries(combSurveyData)) {
    el.innerHTML += `<div style="margin-bottom:12px"><div class="label">${grp.toUpperCase()} Group</div>`;
    Object.keys(data).forEach(sub => {
      el.innerHTML += `<div style="margin-bottom:6px"><div style="font-size:12px;color:var(--text-sec)">${sub} <span id="cc-${grp}-${sub.replace(/[^a-z0-9]/gi, '_')}-sum" style="font-size:10px;color:var(--coral-400)"></span></div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">
          ${GRADE_KEYS.map((k, j) => `<div><div style="font-size:10px;color:var(--text-ter)">${k}</div>
            <input type="number" min="0" max="1" step="0.001" value="${(data[sub][j] || 0).toFixed(3)}" id="cc-${grp}-${sub.replace(/[^a-z0-9]/gi, '_')}-${j}" oninput="combCustomSum('${grp}','${sub.replace(/[^a-z0-9]/gi, '_')}')" style="padding:4px;font-size:12px"></div>`).join('')}
        </div></div>`;
    });
    el.innerHTML += '</div>';
  }
  // compute sums
  for (const [grp, data] of Object.entries(combSurveyData)) {
    Object.keys(data).forEach(sub => combCustomSum(grp, sub.replace(/[^a-z0-9]/gi, '_')));
  }
}

function combCustomSum(grp, safeSub) {
  let sum = 0;
  for (let j = 0; j < 5; j++) {
    sum += parseFloat(document.getElementById(`cc-${grp}-${safeSub}-${j}`)?.value) || 0;
  }
  const el = document.getElementById(`cc-${grp}-${safeSub}-sum`);
  if (el) el.textContent = `sum = ${sum.toFixed(3)}${sum > 1 ? ' (must be ≤ 1)' : ''}`;
}

async function combCalculate() {
  if (!combSurveyData) return;
  const w1 = parseFloat(document.getElementById('comb-w1').value) || 0;
  const w2 = parseFloat(document.getElementById('comb-w2').value) || 0;
  const w3 = parseFloat(document.getElementById('comb-w3').value) || 0;
  if (Math.abs(w1 + w2 + w3 - 1) > 0.01) {
    document.getElementById('comb-weight-sum-warn').style.display = '';
    alert('Group weights must sum to 1.0.');
    return;
  }
  document.getElementById('comb-weight-sum-warn').style.display = 'none';
  const groupWeights = { w1, w2, w3 };
  const useCustom = document.querySelector('input[name=comb-data]:checked').value === 'custom';
  let beliefsData = null;
  if (useCustom) {
    beliefsData = {};
    // validate sums
    for (const [grp, data] of Object.entries(combSurveyData)) {
      beliefsData[grp] = {};
      Object.keys(data).forEach(sub => {
        const vals = GRADE_KEYS.map((_, j) =>
          parseFloat(document.getElementById(`cc-${grp}-${sub.replace(/[^a-z0-9]/gi, '_')}-${j}`)?.value || 0)
        );
        const s = vals.reduce((a, b) => a + b, 0);
        if (s > 1.001) {
          alert(`Beliefs for "${sub}" sum to ${s.toFixed(3)} (> 1). Each sub-criteria must sum to ≤ 1.0.`);
          return;
        }
        beliefsData[grp][sub] = vals;
      });
    }
    for (const [grp, data] of Object.entries(combSurveyData)) {
      for (const sub of Object.keys(data)) {
        if (!beliefsData[grp][sub]) { alert('Fix belief inputs and retry.'); return; }
      }
    }
  }
  const subWeights = {};
  let subOk = true;
  for (const grp of ['w1', 'w2', 'w3']) {
    subWeights[grp] = {};
    const data = combSurveyData[grp];
    let gsum = 0;
    Object.keys(data).forEach(sub => {
      const safeId = `cw-${grp}-${sub.replace(/[^a-z0-9]/gi, '_')}`;
      const el = document.getElementById(safeId);
      const v = el ? parseFloat(el.value) || (1 / Object.keys(data).length) : (1 / Object.keys(data).length);
      subWeights[grp][sub] = v;
      gsum += v;
    });
    if (Math.abs(gsum - 1) > 0.02) {
      alert(`Sub-criteria weights in ${grp.toUpperCase()} sum to ${gsum.toFixed(3)}. Should be ≈ 1.0.`);
      subOk = false;
    }
  }
  if (!subOk) return;

  let brbRules = null;
  if (combFinalMethod === 'brb') {
    brbRules = combRules.map(r => ({
      weight: r.weight,
      antecedents: r.antecedents,
      consequent: r.consequent
    }));
  }

  const res = await apiPost('/combined/analyze', {
    group_weights: groupWeights,
    sub_weights: subWeights,
    beliefs_data: beliefsData,
    brb_rules: brbRules,
    final_method: combFinalMethod
  });
  if (!res.success) { alert(res.error); return; }
  const result = res.result;
  combLastResult = result;
  const gs = result.group_scores;
  document.getElementById('combined-results').style.display = '';
  document.getElementById('comb-metrics').innerHTML = `
    <div class="metric"><div class="mlabel">Final Utility (${result.final_method})</div><div class="mval teal">${result.final_utility.toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">Dominant Grade</div><div class="mval purple">${GRADES[result.top_grade_index]}</div></div>
    <div class="metric"><div class="mlabel">Final Ignorance</div><div class="mval coral">${(result.ignorance || 0).toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">w1 Facilities</div><div class="mval blue">${(gs.w1?.utility || 0).toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">w2 Cost</div><div class="mval blue">${(gs.w2?.utility || 0).toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">w3 General</div><div class="mval blue">${(gs.w3?.utility || 0).toFixed(4)}</div></div>
  `;
  createBeliefBarChart('comb-belief-chart', GRADES, result.final_belief, `Final Belief Distribution (${result.final_method})`);
  let gt = '<thead><tr><th>Group</th><th>Weight</th><th>ER Utility</th><th>ER Ignorance</th><th>Bar</th></tr></thead><tbody>';
  for (const [grp, score] of Object.entries(gs)) {
    const gw = (groupWeights[grp] || 0);
    gt += `<tr><td><strong>${grp.toUpperCase()}</strong></td><td>${gw.toFixed(3)}</td><td>${(score.utility || 0).toFixed(4)}</td><td>${(score.ignorance || 0).toFixed(4)}</td>
      <td><div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round((score.utility || 0) * 100)}%"></div></div></td></tr>`;
  }
  gt += `<tr class="highlight-row"><td><strong>COMBINED</strong></td><td>1.000</td><td><strong>${result.final_utility.toFixed(4)}</strong></td><td>${(result.ignorance || 0).toFixed(4)}</td>
    <td><div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round(result.final_utility * 100)}%;background:var(--teal-400)"></div></div></td></tr>`;
  gt += '</tbody>';
  document.getElementById('comb-group-table').innerHTML = gt;
  let ft = '<thead><tr><th>Group</th><th>Sub-Criteria</th><th>VL</th><th>L</th><th>M</th><th>H</th><th>VH</th><th>Utility</th></tr></thead><tbody>';
  result.all_sub_results.forEach(r => {
    ft += `<tr><td>${r.group}</td><td>${r.sub}</td>${r.normalized.map(b => `<td>${b.toFixed(4)}</td>`).join('')}<td><strong>${r.utility.toFixed(4)}</strong></td></tr>`;
  });
  ft += '</tbody>';
  document.getElementById('comb-full-table').innerHTML = ft;
  // BRB / final distribution table
  let bt = '<thead><tr><th>Grade</th><th>Belief</th><th>Bar</th></tr></thead><tbody>';
  result.final_belief.forEach((b, i) => {
    bt += `<tr ${i === result.top_grade_index ? 'class="highlight-row"' : ''}><td><strong>${GRADES[i]}</strong></td><td>${b.toFixed(4)}</td>
      <td><div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round(b * 100)}%;background:${i === result.top_grade_index ? 'var(--teal-400)' : 'var(--blue-400)'}"></div></div></td></tr>`;
  });
  bt += `<tr class="highlight-row"><td><strong>Final Utility</strong></td><td><strong>${result.final_utility.toFixed(4)}</strong></td><td>—</td></tr></tbody>`;
  document.getElementById('comb-brb-table').innerHTML = bt;

  // BRB activation info if available
  document.getElementById('comb-brb-activation').style.display = result.brb_info ? '' : 'none';
  if (result.brb_info) {
    let at = '<thead><tr><th>Rule</th><th>Matching Degree</th><th>Activation Weight</th></tr></thead><tbody>';
    result.brb_info.activation_weights.forEach((aw, i) => {
      const md = result.brb_info.matching_degrees?.[i] || 0;
      at += `<tr><td>Rule ${i + 1}</td><td>${md.toFixed(4)}</td><td>${aw.toFixed(4)}</td></tr>`;
    });
    at += '</tbody>';
    document.getElementById('comb-brb-activation-table').innerHTML = at;
  }
}

function combExport() {
  if (!combLastResult) return;
  const rows = [];
  combLastResult.final_belief.forEach((b, i) => {
    rows.push({ Grade: GRADES[i], 'Belief Degree': b.toFixed(4) });
  });
  rows.push({ Grade: 'Final Utility', 'Belief Degree': combLastResult.final_utility.toFixed(4) });
  downloadCSV(rows, 'combined_results.csv');
}
