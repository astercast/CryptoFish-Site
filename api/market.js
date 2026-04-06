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

// Paginate sales to build all-time top list
async function fetchAllSales(pages = 4) {
  let all = [];
  let cursor = null;
  for (let i = 0; i < pages; i++) {
    const qs = `event_type=sale&limit=50${cursor ? '&next=' + cursor : ''}`;
    const d = await osFetch(`/events/collection/${SLUG}?${qs}`);
    const events = d.asset_events || [];
    all = all.concat(events);
    cursor = d.next;
    if (!cursor || events.length < 50) break;
  }
  return all;
}

module.exports = async function handler(req, res) {
  try {
    const [statsData, allSaleEvents, listingsData, offersData] = await Promise.all([
      osFetch(`/collections/${SLUG}/stats`),
      fetchAllSales(4),
      osFetch(`/listings/collection/${SLUG}/best?limit=100`),
      osFetch(`/offers/collection/${SLUG}?limit=20`).catch(() => ({ offers: [] })),
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
    const sales = allSaleEvents.map(e => {
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

    // --- Collection offers (WETH bids) ---
    const offers = (offersData.offers || []).map(o => {
      const wei = o.price?.current?.value || '0';
      const dec = o.price?.current?.decimals || 18;
      const eth = parseFloat(wei) / (10 ** dec);
      return { eth: +eth.toFixed(6) };
    }).filter(o => o.eth > 0).sort((a, b) => b.eth - a.eth);

    // --- Holder behavior profiling ---
    // Analyze recent sales to classify addresses
    const now = Date.now();
    const DAY = 86400_000;
    const addrBuys  = {};  // addr -> [timestamps]
    const addrSells = {};  // addr -> [timestamps]
    for (const s of sales) {
      const buyer  = (s.buyer  || '').toLowerCase();
      const seller = (s.seller || '').toLowerCase();
      if (buyer)  { (addrBuys[buyer]   = addrBuys[buyer]   || []).push(s.ts); }
      if (seller) { (addrSells[seller]  = addrSells[seller] || []).push(s.ts); }
    }
    // All unique addresses that participated
    const allAddrs = new Set([...Object.keys(addrBuys), ...Object.keys(addrSells)]);
    let flippers = 0, diamondHands = 0, newBuyers = 0;
    for (const addr of allAddrs) {
      const buys  = addrBuys[addr]  || [];
      const sells = addrSells[addr] || [];
      const hasSold   = sells.length > 0;
      const hasBought = buys.length > 0;
      // Flipper: both bought and sold, or sold 2+
      if (hasBought && hasSold || sells.length >= 2) {
        flippers++;
      }
      // New buyer: bought in last 14 days and never sold
      else if (hasBought && !hasSold && buys.some(t => now - t < 14 * DAY)) {
        newBuyers++;
      }
      // Diamond hand: bought (any time in our window) and never sold
      else if (hasBought && !hasSold) {
        diamondHands++;
      }
      // Pure sellers (only sold, never bought in window) — likely long holders selling
      else if (hasSold && !hasBought) {
        diamondHands++;
      }
    }
    const holderProfile = {
      sample: allAddrs.size,
      flippers,
      diamondHands,
      newBuyers,
    };

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    res.status(200).json({ stats, sales, listings, offers, holderProfile });
  } catch (e) {
    console.error('[api/market]', e);
    res.status(502).json({ error: e.message });
  }
};
