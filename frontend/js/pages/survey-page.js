async function initSurveyPage() {
  const res = await apiGet('/data/survey');
  if (!res.success) return;
  const data = res.data;
  for (const [grp, items] of Object.entries(data)) {
    const tbody = document.getElementById('survey-' + grp);
    if (!tbody) continue;
    tbody.innerHTML = Object.entries(items).map(([sub, vals]) =>
      `<tr><td><strong>${sub}</strong></td>${vals.map(v => `<td>${v.toFixed(3)}</td>`).join('')}</tr>`
    ).join('');
  }
}
