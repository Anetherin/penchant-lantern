/**
 * Hollowmere Nights — Cloudflare Worker + R2 sync backend.
 * Deploy once with Wrangler (`cd cloud && npx wrangler deploy`), set SYNC_SECRET,
 * and connect from Settings -> Cloud Sync inside the game.
 */

const MANIFEST_KEY = 'imgs/manifest.json';
const SAVES_INDEX_KEY = 'saves/index.json';

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, PUT, PATCH, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Img-Hash',
    'Access-Control-Expose-Headers': 'X-Img-Hash, X-Img-Updated, X-Img-Bytes',
    'Access-Control-Max-Age': '86400',
  };
}

function json(env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

function err(env, message, status = 400) {
  return json(env, { error: message }, status);
}

async function sha256Hex(buf) {
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkAuth(request, env) {
  if (!env.SYNC_SECRET) return false;
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(token)),
    crypto.subtle.digest('SHA-256', enc.encode(env.SYNC_SECRET)),
  ]);
  const ua = new Uint8Array(a);
  const ub = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

async function readJson(bucket, key, fallback) {
  const obj = await bucket.get(key);
  if (!obj) return fallback;
  try {
    return await obj.json();
  } catch {
    return fallback;
  }
}

async function writeJson(bucket, key, data) {
  await bucket.put(key, JSON.stringify(data), {
    httpMetadata: { contentType: 'application/json' },
  });
}

function safeId(id) {
  return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

function imgObjectKey(type, key) {
  const folder = type === 'thumb' ? 'thumbs/data/' : 'imgs/data/';
  return folder + encodeURIComponent(key) + '.jpg';
}

async function handleImgs(request, url, env, path) {
  const bucket = env.BUCKET;

  if (path === '/imgs/manifest' && request.method === 'GET') {
    const manifest = await readJson(bucket, MANIFEST_KEY, { imgs: {}, thumbs: {} });
    return json(env, manifest);
  }

  if (path === '/imgs/rebuild-manifest' && request.method === 'POST') {
    const manifest = { imgs: {}, thumbs: {} };
    for (const [type, prefix, target] of [
      ['img', 'imgs/data/', manifest.imgs],
      ['thumb', 'thumbs/data/', manifest.thumbs],
    ]) {
      let cursor;
      do {
        const page = await bucket.list({ prefix, cursor, include: ['customMetadata'] });
        for (const obj of page.objects) {
          const m = obj.customMetadata || {};
          const rawKey = m.key || decodeURIComponent(obj.key.slice(prefix.length).replace(/\.jpg$/, ''));
          target[rawKey] = {
            hash: m.hash || '',
            bytes: Number(m.bytes || obj.size || 0),
            updatedAt: Number(m.updatedAt || Date.parse(obj.uploaded) || Date.now()),
          };
        }
        cursor = page.truncated ? page.cursor : undefined;
      } while (cursor);
    }
    await writeJson(bucket, MANIFEST_KEY, manifest);
    return json(env, { ok: true, imgs: Object.keys(manifest.imgs).length, thumbs: Object.keys(manifest.thumbs).length });
  }

  const key = url.searchParams.get('k');
  const type = url.searchParams.get('type') === 'thumb' ? 'thumb' : 'img';
  if (!key) return err(env, 'Missing key parameter k');
  const r2Key = imgObjectKey(type, key);

  if (path === '/imgs/meta' && request.method === 'GET') {
    const head = await bucket.head(r2Key);
    if (!head) return json(env, { exists: false }, 404);
    const m = head.customMetadata || {};
    return json(env, {
      exists: true,
      hash: m.hash || '',
      bytes: Number(m.bytes || head.size || 0),
      updatedAt: Number(m.updatedAt || Date.parse(head.uploaded) || 0),
    });
  }

  if (path === '/imgs/item') {
    if (request.method === 'GET') {
      const obj = await bucket.get(r2Key);
      if (!obj) return err(env, 'Not found', 404);
      const m = obj.customMetadata || {};
      return new Response(obj.body, {
        status: 200,
        headers: {
          'Content-Type': (obj.httpMetadata && obj.httpMetadata.contentType) || 'image/jpeg',
          'X-Img-Hash': m.hash || '',
          'X-Img-Updated': String(m.updatedAt || Date.parse(obj.uploaded) || 0),
          'X-Img-Bytes': String(m.bytes || obj.size || 0),
          'Cache-Control': 'no-store',
          ...corsHeaders(env),
        },
      });
    }

    if (request.method === 'PUT') {
      const buf = await request.arrayBuffer();
      if (!buf.byteLength) return err(env, 'Empty image payload');
      if (buf.byteLength > 5 * 1024 * 1024) return err(env, 'Image exceeds 5 MB limit', 413);
      const hash = request.headers.get('X-Img-Hash') || (await sha256Hex(buf));
      const updatedAt = Date.now();
      const bytes = buf.byteLength;
      await bucket.put(r2Key, buf, {
        httpMetadata: { contentType: request.headers.get('Content-Type') || 'image/jpeg' },
        customMetadata: { key, type, hash, updatedAt: String(updatedAt), bytes: String(bytes) },
      });
      const manifest = await readJson(bucket, MANIFEST_KEY, { imgs: {}, thumbs: {} });
      const group = type === 'thumb' ? (manifest.thumbs = manifest.thumbs || {}) : (manifest.imgs = manifest.imgs || {});
      group[key] = { hash, bytes, updatedAt };
      await writeJson(bucket, MANIFEST_KEY, manifest);
      return json(env, { ok: true, hash, bytes, updatedAt });
    }

    if (request.method === 'DELETE') {
      await bucket.delete(r2Key);
      const manifest = await readJson(bucket, MANIFEST_KEY, { imgs: {}, thumbs: {} });
      const group = type === 'thumb' ? manifest.thumbs : manifest.imgs;
      if (group && key in group) {
        delete group[key];
        await writeJson(bucket, MANIFEST_KEY, manifest);
      }
      return json(env, { ok: true });
    }
  }

  return err(env, 'Not found', 404);
}

async function handleSaves(request, url, env, path) {
  const bucket = env.BUCKET;

  if (path === '/saves' && request.method === 'GET') {
    const idx = await readJson(bucket, SAVES_INDEX_KEY, { slots: {}, extras: {} });
    return json(env, idx);
  }

  if (path === '/saves/slot') {
    const id = safeId(url.searchParams.get('id'));
    if (!id) return err(env, 'Missing save slot id');
    const r2Key = `saves/slots/${id}.json`;

    if (request.method === 'GET') {
      const obj = await bucket.get(r2Key);
      if (!obj) return err(env, 'Save slot not found', 404);
      return new Response(obj.body, {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders(env) },
      });
    }

    if (request.method === 'PUT') {
      let body;
      try {
        body = await request.json();
      } catch {
        return err(env, 'Invalid JSON body');
      }
      if (!body || !body.data) return err(env, 'Missing save data');
      const now = Date.now();
      const meta = Object.assign({}, body.meta || {}, { id, updatedAt: now });
      const payload = JSON.stringify({ meta, data: body.data });
      meta.bytes = payload.length;
      await bucket.put(r2Key, payload, { httpMetadata: { contentType: 'application/json' } });
      const idx = await readJson(bucket, SAVES_INDEX_KEY, { slots: {}, extras: {} });
      idx.slots = idx.slots || {};
      idx.slots[id] = meta;
      await writeJson(bucket, SAVES_INDEX_KEY, idx);
      return json(env, { ok: true, meta });
    }

    if (request.method === 'PATCH') {
      let body;
      try {
        body = await request.json();
      } catch {
        return err(env, 'Invalid JSON body');
      }
      const name = String((body && body.name) || '').trim().slice(0, 80);
      if (!name) return err(env, 'Missing name');
      const slot = await readJson(bucket, r2Key, null);
      if (!slot) return err(env, 'Save slot not found', 404);
      slot.meta = Object.assign({}, slot.meta || {}, { id, name });
      if (slot.data && typeof slot.data === 'object') slot.data.cloudName = name;
      await writeJson(bucket, r2Key, slot);
      const idx = await readJson(bucket, SAVES_INDEX_KEY, { slots: {}, extras: {} });
      idx.slots = idx.slots || {};
      if (idx.slots[id]) idx.slots[id].name = name;
      await writeJson(bucket, SAVES_INDEX_KEY, idx);
      return json(env, { ok: true, meta: idx.slots[id] || slot.meta });
    }

    if (request.method === 'DELETE') {
      await bucket.delete(r2Key);
      const idx = await readJson(bucket, SAVES_INDEX_KEY, { slots: {}, extras: {} });
      if (idx.slots && id in idx.slots) {
        delete idx.slots[id];
        await writeJson(bucket, SAVES_INDEX_KEY, idx);
      }
      return json(env, { ok: true });
    }
  }

  if (path === '/saves/extra') {
    const kind = url.searchParams.get('kind');
    if (kind !== 'settings' && kind !== 'library') return err(env, 'Invalid extra kind');
    const r2Key = `saves/${kind}.json`;

    if (request.method === 'GET') {
      const obj = await bucket.get(r2Key);
      if (!obj) return err(env, 'Not found', 404);
      return new Response(obj.body, {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders(env) },
      });
    }

    if (request.method === 'PUT') {
      let body;
      try {
        body = await request.json();
      } catch {
        return err(env, 'Invalid JSON body');
      }
      const updatedAt = Date.now();
      await writeJson(bucket, r2Key, { updatedAt, data: body.data });
      const idx = await readJson(bucket, SAVES_INDEX_KEY, { slots: {}, extras: {} });
      idx.extras = idx.extras || {};
      idx.extras[kind] = updatedAt;
      await writeJson(bucket, SAVES_INDEX_KEY, idx);
      return json(env, { ok: true, updatedAt });
    }
  }

  return err(env, 'Not found', 404);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/health' && request.method === 'GET') {
      return json(env, { ok: true, service: 'hollowmere-sync' });
    }

    if (!(await checkAuth(request, env))) {
      return err(env, 'Unauthorized', 401);
    }

    if (path === '/auth' && request.method === 'GET') {
      return json(env, { ok: true });
    }

    if (path.startsWith('/imgs/')) return handleImgs(request, url, env, path);
    if (path.startsWith('/saves')) return handleSaves(request, url, env, path);

    return err(env, 'Not found', 404);
  },
};
