// In-memory MOCK of the Supabase endpoints used by Study Now (auth user, roadmap_items, curriculum_lessons).
// For UI testing only. It is NOT the real backend: results from it prove UI behaviour, not database/RLS behaviour.
import http from 'node:http';

export const state = { roadmap_items: [], curriculum_lessons: [], writes: [] };
const USER = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'tester@example.test', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', '*');
}
const send = (res, code, body, extra = {}) => { cors(res); res.writeHead(code, { 'Content-Type': 'application/json', ...extra }); res.end(body === undefined ? '' : JSON.stringify(body)); };

function filterRows(rows, q) {
  return rows.filter((r) => {
    for (const [k, v] of q.entries()) {
      if (['select', 'limit', 'order', 'on_conflict', 'columns'].includes(k)) continue;
      if (v.startsWith('eq.') && String(r[k]) !== v.slice(3)) return false;
      if (v.startsWith('like.')) { const rx = new RegExp('^' + v.slice(5).replace(/%/g, '.*') + '$'); if (!rx.test(String(r[k]))) return false; }
      if (v.startsWith('in.(')) { const set = v.slice(4, -1).split(',').map((x) => x.replace(/^"|"$/g, '')); if (!set.includes(String(r[k]))) return false; }
    }
    return true;
  });
}

export function start(port = 54399) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); return res.end(); }
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const path = url.pathname;
      if (path === '/auth/v1/user') return send(res, 200, USER);
      if (path.startsWith('/auth/v1/token')) return send(res, 200, { access_token: 'x', token_type: 'bearer', expires_in: 3600, refresh_token: 'r', user: USER });
      const m = path.match(/^\/rest\/v1\/(\w+)$/);
      if (!m) return send(res, 404, { message: 'not mocked: ' + path });
      const table = m[1];
      const rows = (state[table] ??= []);
      if (req.method === 'GET') {
        const out = filterRows(rows, url.searchParams);
        if ((req.headers.accept || '').includes('vnd.pgrst.object')) return out.length ? send(res, 200, out[0]) : send(res, 406, { message: 'no rows', code: 'PGRST116' });
        return send(res, 200, out);
      }
      if (req.method === 'POST') {
        const items = JSON.parse(body || '[]'); const list = Array.isArray(items) ? items : [items];
        const ignore = (req.headers.prefer || '').includes('ignore-duplicates');
        const key = table === 'roadmap_items' ? ['user_id', 'slug'] : table === 'curriculum_lessons' ? ['user_id', 'topic_key'] : table === 'topic_documents' ? ['user_id', 'topic_id'] : ['id'];
        for (const it of list) {
          if (!it.id && key[0] === 'id') it.id = 'gen-' + Math.random().toString(36).slice(2, 10);
          const i = rows.findIndex((r) => key.every((k) => r[k] === it[k]));
          state.writes.push({ table, ...it });
          if (i >= 0) { if (!ignore) rows[i] = { ...rows[i], ...it }; } else rows.push(it);
        }
        return send(res, 201);
      }
      if (req.method === 'PATCH') {
        const patch = JSON.parse(body || '{}');
        for (const r of filterRows(rows, url.searchParams)) { Object.assign(r, patch); state.writes.push({ table, patch, slug: r.slug }); }
        return send(res, 204);
      }
      return send(res, 200, []);
    });
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}
export const mockUser = USER;
