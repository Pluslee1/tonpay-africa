const KEY = 'tonpay_history';

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addHistory(entry) {
  const items = readAll();
  const now = new Date().toISOString();
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  items.unshift({ id, createdAt: now, source: 'tonpay_africa', ...entry });
  writeAll(items);
  return id;
}

export function getHistory({ section = 'all', source = 'all', query = '' } = {}) {
  let items = readAll();
  if (section !== 'all') items = items.filter(i => i.section === section);
  if (source !== 'all') items = items.filter(i => i.source === source);
  if (query) {
    const q = query.toLowerCase();
    items = items.filter(i =>
      (i.title || '').toLowerCase().includes(q) ||
      (i.note || '').toLowerCase().includes(q) ||
      (i.meta && Object.values(i.meta).some(v => String(v).toLowerCase().includes(q)))
    );
  }
  return items;
}

export function clearHistory() {
  writeAll([]);
}
