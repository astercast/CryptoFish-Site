const OS_KEY   = process.env.OPENSEA_API_KEY;
const CONTRACT = '0x9ef31ce8cca614e7aff3c1b883740e8d2728fe91';
const OS       = 'https://api.opensea.io/api/v2';

module.exports = async function handler(req, res) {
  const { id } = req.query;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Missing ?id=tokenId' });
  }

  try {
    // Best listing for this specific token
    const r = await fetch(
      `${OS}/orders/ethereum/seaport/listings?asset_contract_address=${CONTRACT}&token_ids=${id}&limit=1&order_by=eth_price&order_direction=asc`,
      { headers: { 'x-api-key': OS_KEY, accept: 'application/json' } }
    );
    if (!r.ok) throw new Error(`OpenSea ${r.status}`);
    const d = await r.json();
    const order = d.orders?.[0];

    if (!order) {
      return res.status(200).json({ listed: false, tokenId: id });
    }

    const wei = order.price?.current?.value || '0';
    const eth = (parseFloat(wei) / 1e18).toFixed(6);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json({ listed: true, tokenId: id, eth: +eth });
  } catch (e) {
    console.error('[api/listing]', e);
    res.status(502).json({ error: e.message });
  }
};
