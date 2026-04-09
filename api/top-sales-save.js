const { put, list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const newSales = Array.isArray(req.body?.sales) ? req.body.sales : [];
    if (!newSales.length) return res.status(400).json({ error: 'no sales' });

    // Load existing blob so we can merge (accumulate history, never lose old top sales)
    let existing = [];
    try {
      const { blobs } = await list({ prefix: 'cryptofish-top-sales' });
      if (blobs.length) {
        const r = await fetch(blobs[0].url);
        if (r.ok) {
          const d = await r.json();
          existing = Array.isArray(d.sales) ? d.sales : [];
        }
      }
    } catch {}

    // Merge: deduplicate by tokenId+timestamp
    const seen = new Set(existing.map(s => String(s.tokenId) + '|' + s.ts));
    for (const s of newSales) {
      const key = String(s.tokenId) + '|' + s.ts;
      if (!seen.has(key)) { existing.push(s); seen.add(key); }
    }

    // Keep top 500 by ETH value — more than enough history
    existing.sort((a, b) => parseFloat(b.eth) - parseFloat(a.eth));
    const top = existing.slice(0, 500);

    await put('cryptofish-top-sales.json', JSON.stringify({ sales: top, ts: Date.now() }), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    res.status(200).json({ saved: top.length });
  } catch (e) {
    console.error('[top-sales-save]', e);
    res.status(500).json({ error: e.message });
  }
};
