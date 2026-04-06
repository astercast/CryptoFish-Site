const OS_KEY  = process.env.OPENSEA_API_KEY;
const SLUG    = 'cryptofish';
const CONTRACT = '0x9ef31ce8cca614e7aff3c1b883740e8d2728fe91';
const OS       = 'https://api.opensea.io/api/v2';

async function osFetch(path) {
  const r = await fetch(`${OS}${path}`, {
    headers: { 'x-api-key': OS_KEY, accept: 'application/json' },
  });
  if (!r.ok) throw new Error(`OpenSea ${r.status}`);
  return r.json();
}

module.exports = async function handler(req, res) {
  try {
    const [statsData, salesData, listingsData] = await Promise.all([
      osFetch(`/collections/${SLUG}/stats`),
      osFetch(`/events/collection/${SLUG}?event_type=sale&limit=20`),
      osFetch(`/listings/collection/${SLUG}/best?limit=50`),
    ]);

    // --- Stats ---
    const t = statsData.total || {};
    const stats = {
      floor_price:  t.floor_price ?? null,
      total_volume: t.volume ?? null,
      num_owners:   t.num_owners ?? null,
      total_supply: 2166,
      market_cap:   t.market_cap ?? null,
      avg_price:    t.average_price ?? null,
      day_volume:   statsData.intervals?.[0]?.volume ?? null,
      week_volume:  statsData.intervals?.[1]?.volume ?? null,
    };

    // --- Sales ---
    const sales = (salesData.asset_events || []).map(e => {
      const wei = e.payment?.quantity || '0';
      const eth = (parseFloat(wei) / 1e18).toFixed(4);
      const tokenId = e.nft?.identifier || '';
      return {
        tokenId,
        eth,
        seller: e.seller || '',
        buyer:  e.buyer || '',
        ts:     (e.event_timestamp || 0) * 1000,
        tx:     e.transaction || '',
        image:  e.nft?.original_image_url || e.nft?.image_url || '',
      };
    });

    // --- Listings (floor-sorted) ---
    const listings = {};
    for (const l of (listingsData.listings || [])) {
      const tokenId = l.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria;
      if (!tokenId) continue;
      const wei = l.price?.current?.value || '0';
      const eth = parseFloat(wei) / 1e18;
      // Keep only cheapest listing per token
      if (!listings[tokenId] || eth < listings[tokenId].eth) {
        listings[tokenId] = { tokenId, eth: +eth.toFixed(6) };
      }
    }

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    res.status(200).json({ stats, sales, listings });
  } catch (e) {
    console.error('[api/market]', e);
    res.status(502).json({ error: e.message });
  }
};
