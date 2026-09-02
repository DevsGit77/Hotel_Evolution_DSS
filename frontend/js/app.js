const PAGES = ['er', 'brb', 'combined', 'ranking', 'sensitivity', 'survey'];
let currentPage = 'er';

const GRADES = ['Very Low', 'Low', 'Middle', 'High', 'Very High'];
const GRADE_KEYS = ['VL', 'L', 'M', 'H', 'VH'];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateTo(page);
    });
  });
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  navigateTo('er');
});

// ===== Theme =====
function initTheme() {
  const saved = localStorage.getItem('dss-theme');
  if (saved === 'dark') {
    document.documentElement.classList.remove('light-mode');
    document.documentElement.classList.add('dark-mode');
  } else if (saved === 'light') {
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.add('light-mode');
  }
}

function toggleTheme() {
  const html = document.documentElement;
  if (html.classList.contains('dark-mode')) {
    html.classList.remove('dark-mode');
    html.classList.add('light-mode');
    localStorage.setItem('dss-theme', 'light');
  } else {
    html.classList.remove('light-mode');
    html.classList.add('dark-mode');
    localStorage.setItem('dss-theme', 'dark');
  }
}

// ===== Navigation =====
async function navigateTo(page) {
  if (!PAGES.includes(page)) return;
  destroyAllCharts();
  currentPage = page;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-page="${page}"]`)?.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  pageEl.classList.add('active');
  const content = await loadPageContent(page);
  pageEl.innerHTML = '';
  requestAnimationFrame(() => {
    pageEl.innerHTML = content;
    initializePage(page);
  });
}

async function loadPageContent(page) {
  try {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) throw new Error('Page not found');
    return await res.text();
  } catch {
    return `<div class="empty-state"><i class="ti ti-error-404"></i><p>Page content not found</p></div>`;
  }
}

function initializePage(page) {
  switch (page) {
    case 'er': initERPage(); break;
    case 'brb': initBRBPage(); break;
    case 'combined': initCombinedPage(); break;
    case 'ranking': initRankingPage(); break;
    case 'sensitivity': initSensitivityPage(); break;
    case 'survey': initSurveyPage(); break;
  }
}

function destroyAllCharts() {
  Object.keys(chartInstances).forEach(key => destroyChart(key));
}
