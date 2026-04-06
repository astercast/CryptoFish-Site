const OS_KEY = process.env.OPENSEA_API_KEY;
const SLUG   = 'cryptofish';
const OS     = 'https://api.opensea.io/api/v2';

// Module-level in-memory cache — shared across warm serverless invocations
let _cache   = null;
let _cacheTs = 0;
const CACHE_TTL = 6 * 3600_000; // 6 hours

module.exports = async function handler(req, res) {
  const now = Date.now();

  // Serve from in-memory cache if still fresh
  if (_cache && (now - _cacheTs) < CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');
    return res.status(200).json(_cache);
  }

  try {
    let cursor = null;
    const allSales = [];
    const MAX_PAGES = 6; // 300 sales — stays well within 10s Vercel hobby timeout

    for (let page = 0; page < MAX_PAGES; page++) {
      const qs = `event_type=sale&limit=50${cursor ? '&next=' + encodeURIComponent(cursor) : ''}`;
      const r = await fetch(`${OS}/events/collection/${SLUG}?${qs}`, {
        headers: { 'x-api-key': OS_KEY, accept: 'application/json' },
      });
      if (!r.ok) break;
      const d = await r.json();
      if (!d.asset_events?.length) break;

      for (const e of d.asset_events) {
        const wei = e.payment?.quantity || '0';
        const eth = parseFloat(wei) / 1e18;
        if (eth > 0) {
          allSales.push({
            tokenId: e.nft?.identifier || '',
            eth:     +eth.toFixed(4),
            ts:      (e.event_timestamp || 0) * 1000,
            image:   e.nft?.image_url || '',
          });
        }
      }

      cursor = d.next;
      if (!cursor) break;
    }

    allSales.sort((a, b) => b.eth - a.eth);
    const top = allSales.slice(0, 20);

    _cache   = { top, scanned: allSales.length, ts: now };
    _cacheTs = now;

    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');
    res.status(200).json(_cache);
  } catch (e) {
    console.error('[api/top-sales]', e);
    // Return stale cache rather than error if we have anything
    if (_cache) {
      res.setHeader('Cache-Control', 's-maxage=300');
      return res.status(200).json({ ..._cache, stale: true });
    }
    res.status(502).json({ error: e.message });
  }
};
