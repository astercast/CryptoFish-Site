const { list } = require('@vercel/blob');

// Warm-instance memory cache so consecutive cold-starts don't re-fetch the blob
let _mem = null;
let _memTs = 0;
const MEM_TTL = 3600_000; // 1 hour

module.exports = async function handler(req, res) {
  const now = Date.now();

  if (_mem && (now - _memTs) < MEM_TTL) {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(_mem);
  }

  try {
    const { blobs } = await list({ prefix: 'cryptofish-top-sales' });
    if (blobs.length) {
      const r = await fetch(blobs[0].url);
      if (r.ok) {
        const data = await r.json();
        _mem   = data;
        _memTs = now;
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).json(data);
      }
    }
  } catch (e) {
    console.error('[top-sales read]', e);
  }

  // No blob yet — return empty so client falls back to deep scan
  res.setHeader('Cache-Control', 's-maxage=60');
  res.status(200).json({ sales: [], ts: 0 });
};
