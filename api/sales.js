const OS_KEY = process.env.OPENSEA_API_KEY;
const SLUG   = 'cryptofish';
const OS     = 'https://api.opensea.io/api/v2';

module.exports = async function handler(req, res) {
  try {
    const cursor = req.query.cursor || '';
    const qs = `event_type=sale&limit=50${cursor ? '&next=' + encodeURIComponent(cursor) : ''}`;
    const r = await fetch(`${OS}/events/collection/${SLUG}?${qs}`, {
      headers: { 'x-api-key': OS_KEY, accept: 'application/json' },
    });
    if (!r.ok) throw new Error(`OpenSea ${r.status}`);
    const d = await r.json();

    const sales = (d.asset_events || []).map(e => {
      const wei = e.payment?.quantity || '0';
      const eth = (parseFloat(wei) / 1e18).toFixed(4);
      return {
        tokenId: e.nft?.identifier || '',
        eth,
        seller: e.seller || '',
        buyer:  e.buyer || '',
        ts:     (e.event_timestamp || 0) * 1000,
        image:  e.nft?.image_url || '',
      };
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ sales, next: d.next || null });
  } catch (e) {
    console.error('[api/sales]', e);
    res.status(502).json({ error: e.message });
  }
};
