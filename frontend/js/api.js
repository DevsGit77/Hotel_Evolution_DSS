const API_BASE = (window.DSS_API_BASE || 'http://127.0.0.1:5000') + '/api';

async function apiRequest(endpoint, options) {
  const res = await fetch(API_BASE + endpoint, options);
  let data;
  try {
    data = await res.json();
  } catch {
    data = { success: false, error: `Server returned HTTP ${res.status} (not JSON)` };
  }
  if (!res.ok && !('success' in data)) {
    data = { success: false, error: data.error || `Request failed (HTTP ${res.status})` };
  }
  return data;
}

async function apiPost(endpoint, body) {
  try {
    return await apiRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    return { success: false, error: `Network error: ${err.message}` };
  }
}

async function apiGet(endpoint) {
  try {
    return await apiRequest(endpoint);
  } catch (err) {
    return { success: false, error: `Network error: ${err.message}` };
  }
}

window.DSS_API_BASE = API_BASE.replace(/\/api$/, '');
