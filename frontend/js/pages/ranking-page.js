let rankHotels = [];
let rankSurveyData = null;
let rankGroupWeights = { w1: 0.4, w2: 0.35, w3: 0.25 };
let rankSubWeights = {};
let rankSampleRules = [];
let rankLastResult = null;
let rankEditingIdx = -1;

async function initRankingPage() {
  const res = await apiGet('/data/survey');
  if (res.success) rankSurveyData = res.data;
  const hres = await apiGet('/data/hotels');
  if (hres.success && (!rankHotels || rankHotels.length === 0)) {
    rankHotels = hres.hotels.map(h => normalizeHotel(h));
  }
  rankSampleRules = [
    { weight: 0.9, antecedents: [3, 3, 3], consequent: [0.0, 0.0, 0.1, 0.5, 0.4] },
    { weight: 0.8, antecedents: [3, 2, 2], consequent: [0.0, 0.1, 0.3, 0.4, 0.2] },
    { weight: 0.7, antecedents: [2, 3, 2], consequent: [0.0, 0.1, 0.2, 0.5, 0.2] },
    { weight: 0.6, antecedents: [2, 2, 3], consequent: [0.0, 0.2, 0.5, 0.2, 0.1] },
    { weight: 0.5, antecedents: [1, 1, 1], consequent: [0.1, 0.4, 0.3, 0.2, 0.0] },
    { weight: 0.4, antecedents: [0, 0, 0], consequent: [0.4, 0.4, 0.2, 0.0, 0.0] }
  ];
  rankRenderGroupWeights();
  rankRenderRules();
  rankRenderHotels();
}

function normalizeHotel(h) {
  const out = { name: h.name, location: h.location || 'Rangamati Sadar', groups: {} };
  for (const [gk, gd] of Object.entries(h.groups || {})) {
    const subs = (rankSurveyData && rankSurveyData[gk]) ? Object.keys(rankSurveyData[gk]) : [];
    out.groups[gk] = {};
    const byName = gd.by_name || {};
    subs.forEach((sub, i) => {
      let b = byName[sub];
      if (!b) {
        const arr = gd.beliefs || [];
        b = arr[i] || [0.2, 0.2, 0.2, 0.2, 0.2];
      }
      b = b.slice(0, 5);
      const sum = b.reduce((a, x) => a + x, 0);
      if (sum > 0 && sum !== 1) b = b.map(x => x / sum);
      out.groups[gk][sub] = b;
    });
  }
  return out;
}

function rankRenderGroupWeights() {
  ['w1', 'w2', 'w3'].forEach(gk => {
    const el = document.getElementById('rank-gw-' + gk);
    if (el) {
      el.value = (rankGroupWeights[gk] || 0).toFixed(2);
      el.oninput = () => {
        rankGroupWeights[gk] = parseFloat(el.value) || 0;
        rankCheckGroupWeights();
      };
    }
  });
}

function rankCheckGroupWeights() {
  const s = Object.values(rankGroupWeights).reduce((a, b) => a + (b || 0), 0);
  const warn = document.getElementById('rank-gw-warn');
  if (warn) warn.style.display = Math.abs(s - 1) > 0.01 ? '' : 'none';
}

function rankAddHotel() {
  if (!rankSurveyData && !rankHotels.length) return;
  if (!rankSurveyData) return;
  const existing = rankHotels.map(h => h.name);
  let base = 'New Hotel';
  let i = 1;
  while (existing.includes(base)) { base = `New Hotel ${i++}`; }
  const emptyGroups = {};
  for (const gk of ['w1', 'w2', 'w3']) {
    emptyGroups[gk] = {};
    Object.keys(rankSurveyData[gk]).forEach(sub => {
      emptyGroups[gk][sub] = [0.2, 0.2, 0.2, 0.2, 0.2];
    });
  }
  rankHotels.push({ name: base, location: 'Rangamati Sadar', groups: emptyGroups });
  rankRenderHotels();
  rankEditHotel(rankHotels.length - 1);
}

async function rankLoadRangamatiSample() {
  const hres = await apiGet('/data/hotels');
  if (hres.success) {
    rankHotels = hres.hotels.map(h => normalizeHotel(h));
    rankRenderHotels();
  } else {
    alert(hres.error || 'Failed to load hotels');
  }
}

function rankRenderHotels() {
  const el = document.getElementById('ranking-hotel-list');
  if (!rankHotels.length) {
    el.innerHTML = '<div class="empty-state"><i class="ti ti-building" aria-hidden="true"></i><p>No hotels added yet. Click "Load Rangamati Hotels" to seed real hotels around Rangamati Sadar.</p></div>';
    return;
  }
  el.innerHTML = rankHotels.map((h, idx) => {
    const g = h.groups || {};
    const counts = Object.values(g).map(gd => Object.keys(gd).length).join('/');
    return `
      <div class="hotel-card">
        <div class="hotel-header">
          <strong>${h.name}</strong>
          <button class="btn btn-sm btn-danger" onclick="rankRemoveHotel(${idx})" style="padding:2px 8px"><i class="ti ti-x" aria-hidden="true"></i></button>
        </div>
        <div style="font-size:12px;color:var(--text-sec)">${h.location || 'Rangamati Sadar'} · sub-criteria (fac/cost/gen): ${counts}</div>
        <button class="btn btn-sm" style="margin-top:6px;margin-right:6px" onclick="rankEditHotel(${idx})"><i class="ti ti-edit" aria-hidden="true"></i> Edit Beliefs</button>
        <button class="btn btn-sm" onclick="rankDuplicateHotel(${idx})"><i class="ti ti-copy" aria-hidden="true"></i> Duplicate</button>
      </div>`;
  }).join('');
}

function rankDuplicateHotel(idx) {
  const h = rankHotels[idx];
  const copy = JSON.parse(JSON.stringify(h));
  copy.name = h.name + ' (copy)';
  rankHotels.push(copy);
  rankRenderHotels();
}

function rankRemoveHotel(idx) {
  rankHotels.splice(idx, 1);
  if (rankEditingIdx === idx) rankCloseEditor();
  rankRenderHotels();
}

function rankEditHotel(idx) {
  rankEditingIdx = idx;
  const h = rankHotels[idx];
  const editor = document.getElementById('ranking-editor');
  const panel = document.getElementById('ranking-edit-panel');
  panel.style.display = '';
  let html = `<div class="card">
    <div class="card-title"><i class="ti ti-edit" aria-hidden="true"></i> Edit Hotel Beliefs
      <button class="btn btn-sm" style="margin-left:auto" onclick="rankCloseEditor()"><i class="ti ti-x" aria-hidden="true"></i> Close</button>
    </div>`;
  html += `<div class="grid2">
      <div class="input-row"><div class="label">Hotel Name</div>
        <input type="text" id="rank-edit-name" value="${h.name}"></div>
      <div class="input-row"><div class="label">Location</div>
        <input type="text" id="rank-edit-loc" value="${h.location || ''}"></div>
    </div>`;
  html += `<p style="font-size:12px;color:var(--text-sec);margin:10px 0 14px">Belief degrees for each sub-criteria must be between 0 and 1. Rows are auto-normalised to sum to 1 on save; the UI shows the current value.</p>`;
  for (const [gk, gd] of Object.entries(h.groups || {})) {
    const gLabel = { w1: 'Facilities (w1)', w2: 'Cost (w2)', w3: 'General (w3)' }[gk] || gk;
    html += `<div class="section-sep">${gLabel}</div>`;
    for (const [sub, b] of Object.entries(gd)) {
      const safeId = `re-${gk}-${sub.replace(/[^a-z0-9]/gi, '_')}`;
      html += `<div style="margin-bottom:8px"><div style="font-size:12px;color:var(--text-sec)">${sub}
        <span id="${safeId}-sum" style="margin-left:8px;font-size:10px;color:var(--coral-400)"></span></div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">
          ${GRADE_KEYS.map((k, j) => `<div><div style="font-size:9px;color:var(--text-ter)">${k}</div>
            <input type="number" min="0" max="1" step="0.001" value="${(b[j] || 0).toFixed(3)}" data-rank-input="${safeId}-${j}" id="${safeId}-${j}" style="padding:3px;font-size:12px" oninput="rankLiveSum('${safeId}')"></div>`).join('')}
        </div></div>`;
    }
  }
  html += `<div style="margin-top:1rem;display:flex;gap:8px">
      <button class="btn btn-primary" onclick="rankSaveEdit()"><i class="ti ti-check" aria-hidden="true"></i> Save Hotel</button>
      <button class="btn btn-sm" onclick="rankCloseEditor()">Cancel</button>
    </div></div>`;
  editor.innerHTML = html;
  editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  Object.keys(h.groups || {}).forEach(gk => {
    Object.keys(h.groups[gk]).forEach(sub => {
      rankLiveSum(`re-${gk}-${sub.replace(/[^a-z0-9]/gi, '_')}`);
    });
  });
}

function rankLiveSum(safeId) {
  let sum = 0;
  for (let j = 0; j < 5; j++) {
    const el = document.getElementById(`${safeId}-${j}`);
    sum += parseFloat(el?.value) || 0;
  }
  const sEl = document.getElementById(`${safeId}-sum`);
  if (sEl) sEl.textContent = `sum = ${sum.toFixed(3)}${sum > 1 ? ' (will normalise)' : ''}`;
}

function rankSaveEdit() {
  const h = rankHotels[rankEditingIdx];
  h.name = document.getElementById('rank-edit-name').value || h.name;
  h.location = document.getElementById('rank-edit-loc').value || h.location;
  for (const [gk, gd] of Object.entries(h.groups || {})) {
    for (const [sub] of Object.entries(gd)) {
      const safeId = `re-${gk}-${sub.replace(/[^a-z0-9]/gi, '_')}`;
      let b = [];
      for (let j = 0; j < 5; j++) {
        b.push(parseFloat(document.getElementById(`${safeId}-${j}`)?.value) || 0);
      }
      const sum = b.reduce((a, x) => a + x, 0);
      if (sum > 1) {
        if (!confirm(`Beliefs for "${sub}" sum to ${sum.toFixed(3)} (> 1). Normalise to sum to 1?`)) {
          h.groups[gk][sub] = b;
          continue;
        }
        b = b.map(x => x / sum);
      }
      h.groups[gk][sub] = b;
    }
  }
  rankCloseEditor();
  rankRenderHotels();
}

function rankCloseEditor() {
  rankEditingIdx = -1;
  const panel = document.getElementById('ranking-edit-panel');
  if (panel) panel.style.display = 'none';
  const editor = document.getElementById('ranking-editor');
  if (editor) editor.innerHTML = '';
}

function rankLoadSampleRules() {
  rankRenderRules();
}

function rankRenderRules() {
  const container = document.getElementById('ranking-brb-rules');
  container.innerHTML = rankSampleRules.map((rule, idx) => `
    <div class="rule-card" style="padding:8px 12px">
      <div style="font-size:12px;color:var(--text-sec)">Rule ${idx+1}: Weight=${rule.weight.toFixed(1)} · Antecedents: [${rule.antecedents.join(', ')}] · Consequent: [${rule.consequent.map(c=>c.toFixed(1)).join(', ')}]</div>
    </div>`).join('');
}

async function rankCalculate() {
  if (!rankHotels.length) { alert('Add at least one hotel.'); return; }
  rankCheckGroupWeights();
  const s = Object.values(rankGroupWeights).reduce((a, b) => a + (b || 0), 0);
  if (Math.abs(s - 1) > 0.01) { alert('Group weights must sum to 1.0.'); return; }

  // Build sub_weights (default equal within group) and hotel payload.
  const subWeights = {};
  const hotels = rankHotels.map(h => {
    const groups = {};
    for (const [gk, gd] of Object.entries(h.groups || {})) {
      if (!subWeights[gk]) subWeights[gk] = {};
      const n = Object.keys(gd).length || 1;
      groups[gk] = { by_name: {} };
      for (const [sub, b] of Object.entries(gd)) {
        if (!(sub in subWeights[gk])) subWeights[gk][sub] = 1 / n;
        groups[gk].by_name[sub] = b;
      }
    }
    return { name: h.name, location: h.location, groups };
  });

  const res = await apiPost('/ranking/evaluate', {
    hotels,
    rules: rankSampleRules,
    group_weights: rankGroupWeights,
    sub_weights: subWeights
  });
  if (!res.success) { alert(res.error); return; }
  const result = res.result;
  rankLastResult = result;
  const resultsEl = document.getElementById('ranking-results');
  resultsEl.style.display = '';
  const winner = result[0] || {};
  document.getElementById('ranking-metrics').innerHTML = `
    <div class="metric"><div class="mlabel">Hotels Evaluated</div><div class="mval blue">${result.length}</div></div>
    <div class="metric"><div class="mlabel">Winner</div><div class="mval teal" style="font-size:16px">${winner.hotel || '—'}</div></div>
    <div class="metric"><div class="mlabel">Top Utility</div><div class="mval purple">${(winner.utility || 0).toFixed(4)}</div></div>
    <div class="metric"><div class="mlabel">Method</div><div class="mval" style="font-size:14px">ER → BRB</div></div>
  `;
  const labels = result.map(r => r.hotel);
  const utils = result.map(r => r.utility);
  createBeliefBarChart('ranking-chart', labels, utils, 'Hotel Utility Comparison (ER→BRB)');
  let t = '<thead><tr><th>Rank</th><th>Hotel</th><th>Location</th><th>Facilities ER</th><th>Cost ER</th><th>General ER</th><th>Utility</th><th>Bar</th></tr></thead><tbody>';
  result.forEach(r => {
    t += `<tr ${r.rank === 1 ? 'class="highlight-row"' : ''}><td><strong>#${r.rank}</strong></td><td>${r.hotel}</td><td>${r.location || '—'}</td>
      <td>${(r.group_er_utilities?.[0] || 0).toFixed(4)}</td><td>${(r.group_er_utilities?.[1] || 0).toFixed(4)}</td><td>${(r.group_er_utilities?.[2] || 0).toFixed(4)}</td>
      <td><strong>${r.utility.toFixed(4)}</strong></td>
      <td><div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round(r.utility * 100)}%;background:${r.rank === 1 ? 'var(--teal-400)' : 'var(--blue-400)'}"></div></div></td></tr>`;
  });
  t += '</tbody>';
  document.getElementById('ranking-table').innerHTML = t;

  // Comparison of final belief distributions
  let ft = '<thead><tr><th>Grade</th>' + result.map(r => `<th>${r.hotel}</th>`).join('') + '</tr></thead><tbody>';
  GRADES.forEach((g, i) => {
    ft += `<tr><td><strong>${g}</strong></td>` + result.map(r => `<td>${(r.belief[i] || 0).toFixed(4)}</td>`).join('') + '</tr>';
  });
  ft += '</tbody>';
  document.getElementById('ranking-belief-table').innerHTML = ft;
}

function rankExport() {
  if (!rankLastResult) return;
  const rows = rankLastResult.map(r => ({
    Rank: r.rank,
    Hotel: r.hotel,
    Location: r.location || '',
    Facilities: (r.group_er_utilities?.[0] || 0).toFixed(4),
    Cost: (r.group_er_utilities?.[1] || 0).toFixed(4),
    General: (r.group_er_utilities?.[2] || 0).toFixed(4),
    Utility: r.utility.toFixed(4)
  }));
  downloadCSV(rows, 'hotel_ranking.csv');
}
