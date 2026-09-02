const CHART_COLORS = {
  blue: 'rgba(55, 138, 221, 0.8)',
  teal: 'rgba(29, 158, 117, 0.8)',
  purple: 'rgba(127, 119, 221, 0.8)',
  amber: 'rgba(186, 117, 23, 0.8)',
  coral: 'rgba(216, 90, 48, 0.8)',
  blueLight: 'rgba(55, 138, 221, 0.2)',
  tealLight: 'rgba(29, 158, 117, 0.2)',
  purpleLight: 'rgba(127, 119, 221, 0.2)'
};

let chartInstances = {};

function destroyChart(key) {
  if (chartInstances[key]) {
    chartInstances[key].destroy();
    delete chartInstances[key];
  }
}

function createBeliefBarChart(canvasId, labels, beliefData, title) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Belief Degree',
        data: beliefData,
        backgroundColor: [
          'rgba(55, 138, 221, 0.7)',
          'rgba(127, 119, 221, 0.7)',
          'rgba(29, 158, 117, 0.7)',
          'rgba(186, 117, 23, 0.7)',
          'rgba(216, 90, 48, 0.7)'
        ],
        borderColor: [
          'rgba(55, 138, 221, 1)',
          'rgba(127, 119, 221, 1)',
          'rgba(29, 158, 117, 1)',
          'rgba(186, 117, 23, 1)',
          'rgba(216, 90, 48, 1)'
        ],
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: !!title, text: title, font: { size: 14 } },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, max: 1, ticks: { callback: v => v.toFixed(2) } }
      }
    }
  });
}

function createRadarChart(canvasId, labels, datasets, title) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: i === 0 ? 'rgba(55, 138, 221, 0.2)' : 'rgba(29, 158, 117, 0.2)',
        borderColor: i === 0 ? 'rgba(55, 138, 221, 1)' : 'rgba(29, 158, 117, 1)',
        pointBackgroundColor: i === 0 ? 'rgba(55, 138, 221, 1)' : 'rgba(29, 158, 117, 1)',
        borderWidth: 2
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: !!title, text: title, font: { size: 14 } }
      },
      scales: {
        r: { beginAtZero: true, max: 1, ticks: { stepSize: 0.2 } }
      }
    }
  });
}

function createComparisonChart(canvasId, labels, datasets, title) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const colors = ['rgba(55, 138, 221, 0.7)', 'rgba(29, 158, 117, 0.7)', 'rgba(127, 119, 221, 0.7)', 'rgba(186, 117, 23, 0.7)', 'rgba(216, 90, 48, 0.7)'];
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: colors[i % colors.length],
        borderRadius: 3
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: !!title, text: title, font: { size: 14 } }
      },
      scales: {
        y: { beginAtZero: true, max: 1, ticks: { callback: v => v.toFixed(2) } }
      }
    }
  });
}

function createSensitivityChart(canvasId, datasets, title) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const colors = ['rgba(55, 138, 221, 1)', 'rgba(29, 158, 117, 1)', 'rgba(127, 119, 221, 1)'];
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: colors[i % colors.length],
        backgroundColor: colors[i % colors.length].replace('1)', '0.1)'),
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        borderWidth: 2
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: !!title, text: title, font: { size: 14 } }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: { display: true, text: 'Weight Value' }
        },
        y: {
          beginAtZero: true,
          max: 1,
          title: { display: true, text: 'Utility Score' },
          ticks: { callback: v => v.toFixed(2) }
        }
      }
    }
  });
}

function createHistogramChart(canvasId, data, title) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const bins = 20;
  const binWidth = (max - min) / bins || 0.01;
  const counts = new Array(bins).fill(0);
  data.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
    counts[idx]++;
  });
  const labels = counts.map((_, i) => (min + i * binWidth).toFixed(3));
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Frequency',
        data: counts,
        backgroundColor: 'rgba(55, 138, 221, 0.7)',
        borderRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: !!title, text: title, font: { size: 14 } }
      },
      scales: {
        x: { title: { display: true, text: 'Utility' } },
        y: { title: { display: true, text: 'Count' }, beginAtZero: true }
      }
    }
  });
}
