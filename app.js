// ================================================
// CryptoFish — app.js
// Navigation, library, detail, live data
// ================================================

// ── State ─────────────────────────────────────────
let currentFishIndex = 0;
let currentView      = 'grid';
let currentSort      = 'id';
let mobileNavOpen    = false;
let liveEthPrice     = null;
let liveCollection   = null;
let activeFilters    = { status: [], genera: [], locality: [], listed: [] };
let currentSearch    = '';

// ── Helpers ───────────────────────────────────────
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function fmt(n, dec = 3) { return parseFloat(n).toFixed(dec); }
function fmtUSD(eth) {
  if (!liveEthPrice || !eth) return '—';
  return '$' + Math.round(parseFloat(eth) * liveEthPrice).toLocaleString();
}
function timeAgo(ms) {
  // Guard: if timestamp looks like it was already in ms, don't multiply
  if (ms > Date.now() * 10) ms = ms / 1000;
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 0) return 'just now';
  if (s < 60)    return s + 's ago';
  if (s < 3600)  return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}
function pickEmoji(name) {
  const n = (name || '').toLowerCase();
  const map = [
    ['clown','🐠'],['puffer','🐡'],['shark','🦈'],['whale','🐋'],
    ['dolphin','🐬'],['octopus','🐙'],['lion','🦁'],['seal','🦭'],
    ['coelacanth','🪸'],['nautilus','🐚'],['squid','🦑'],['shrimp','🦐'],
    ['lobster','🦞'],['crab','🦀'],['tuna','🐟'],
  ];
  for (const [k, v] of map) if (n.includes(k)) return v;
  return ['🐟','🐠','🐡','🦈','🦑'][Math.floor(Math.random() * 5)];
}

// ── Navigation ────────────────────────────────────
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const navMap = { home: 0, library: 1, globe: 2, nemo: 3 };
  const links  = document.querySelectorAll('.nav-link');
  if (navMap[page] !== undefined && links[navMap[page]]) {
    links[navMap[page]].classList.add('active');
  }

  if (page === 'globe') setTimeout(initGlobe, 80);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (mobileNavOpen) toggleMobileNav();

  // Re-run scroll reveal for new page
  setTimeout(initScrollReveal, 50);
}

function toggleMobileNav() {
  mobileNavOpen = !mobileNavOpen;
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.toggle('open', mobileNavOpen);
}

// ── Live: ETH Price (CoinGecko) ───────────────────
async function fetchEthPrice() {
  try {
    const r = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { cache: 'no-store' }
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    liveEthPrice = d.ethereum?.usd;
    updatePriceDisplays();
  } catch (e) {
    console.warn('[ETH price] fallback:', e.message);
    liveEthPrice = liveEthPrice || 2065;
    updatePriceDisplays();
  }
}

function updatePriceDisplays() {
  const c = liveCollection;
  setEl('stat-vol-usd',   '≈ ' + fmtUSD(c?.total_volume ?? 706.66));
  setEl('stat-floor-usd', '≈ ' + fmtUSD(c?.floor_price ?? 0.064));
  setEl('stat-offer-usd', '≈ ' + fmtUSD(c?.avg_price ?? 0.05));
  // Nav ETH ticker
  const navEl = document.getElementById('nav-eth-val');
  if (navEl && liveEthPrice) navEl.textContent = '$' + liveEthPrice.toLocaleString();
  // Top sale USD values
  setEl('top-sale-usd-1', '≈ ' + fmtUSD(12.5));
  setEl('top-sale-usd-2', '≈ ' + fmtUSD(8.8));
  setEl('top-sale-usd-3', '≈ ' + fmtUSD(6.2));
  // detail page live price
  const fish = FISH_DATA[currentFishIndex];
  if (fish && document.getElementById('page-detail')?.classList.contains('active')) {
    setEl('detail-usd', '≈ ' + fmtUSD(fish.price) + ' USD');
  }
}

// ── Live: OpenSea Collection Stats ────────────────
async function fetchCollectionStats() {
  try {
    // v2 stats endpoint — no API key needed for public collections
    const r = await fetch(
      'https://api.opensea.io/api/v2/collections/cryptofish/stats',
      { headers: { accept: 'application/json' }, cache: 'no-store' }
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    const s = d.total ?? d;

    liveCollection = {
      floor_price:  parseFloat(s.floor_price  ?? 0.064),
      total_volume: parseFloat(s.volume       ?? 706.66),
      num_owners:   parseInt(s.num_owners     ?? 596),
      total_supply: parseInt(s.count          ?? 2165),
      listed_count: s.listed_count ? parseInt(s.listed_count) : null,
      avg_price:    parseFloat(s.average_price ?? 0.05),
    };
  } catch (e) {
    console.warn('[OpenSea stats] fallback:', e.message);
    liveCollection = liveCollection || {
      floor_price: 0.064, total_volume: 706.66,
      num_owners: 596, total_supply: 2165,
      listed_count: null, avg_price: 0.05,
    };
  }
  renderStatsBar();
}

// ── Live: OpenSea Recent Sales ────────────────────
async function fetchRecentSales() {
  try {
    const r = await fetch(
      'https://api.opensea.io/api/v2/events/collection/cryptofish?event_type=sale&limit=20',
      { headers: { accept: 'application/json' }, cache: 'no-store' }
    );
    if (!r.ok) throw new Error(r.status);
    const d  = await r.json();
    const ev = d.asset_events ?? [];
    if (!ev.length) throw new Error('empty');

    const sales = ev.filter(e => {
      // Only show ETH/WETH sales — skip USDC and other tokens with different decimals
      const sym = (e.payment?.symbol || '').toUpperCase();
      return !sym || sym === 'ETH' || sym === 'WETH';
    }).map(e => {
      const eth   = e.payment ? (parseInt(e.payment.quantity) / 1e18).toFixed(4) : '0.064';
      const rawId = e.nft?.identifier ?? '';
      const name  = e.nft?.name || (rawId ? 'CryptoFish #' + rawId : 'CryptoFish');
      const token = rawId ? '#' + String(rawId).padStart(4, '0') : '—';
      const ts    = (e.closing_time ?? e.event_timestamp ?? 0) * 1000;
      // find in our data if possible
      const localFish = FISH_DATA.find(f => parseInt(f.id) === parseInt(rawId));
      return {
        fish:  localFish?.emoji ?? pickEmoji(name),
        name:  localFish?.common ?? (name.replace('CryptoFish', '').trim() || 'CryptoFish'),
        token,
        eth,
        usd:   fmtUSD(eth),
        time:  timeAgo(ts),
        idx:   localFish ? FISH_DATA.indexOf(localFish) : 0,
      };
    });
    renderSalesFeed(sales);
  } catch (e) {
    console.warn('[OpenSea sales] fallback:', e.message);
    renderSalesFeed(RECENT_SALES);
  }
}

// ── Render: Stats Bar ─────────────────────────────
function renderStatsBar() {
  const c = liveCollection;
  if (!c) return;

  setEl('stat-floor',  fmt(c.floor_price, 3));
  setEl('stat-volume', c.total_volume.toLocaleString(undefined, { maximumFractionDigits: 1 }));
  setEl('stat-holders',c.num_owners?.toLocaleString() ?? '—');
  setEl('stat-items',  c.total_supply?.toLocaleString() ?? '2,165');
  setEl('stat-offer',  fmt(c.avg_price, 3));

  // Re-set countup targets so animation can re-run on each stats refresh
  const floorEl   = document.getElementById('stat-floor');
  const volumeEl  = document.getElementById('stat-volume');
  const holdersEl = document.getElementById('stat-holders');
  const itemsEl   = document.getElementById('stat-items');
  if (floorEl)   floorEl.dataset.countup   = String(c.floor_price);
  if (volumeEl)  volumeEl.dataset.countup  = String(c.total_volume);
  if (holdersEl && c.num_owners)   holdersEl.dataset.countup = String(c.num_owners);
  if (itemsEl   && c.total_supply) itemsEl.dataset.countup   = String(c.total_supply);

  if (c.num_owners && c.total_supply)
    setEl('stat-holders-sub', ((c.num_owners / c.total_supply) * 100).toFixed(1) + '% of supply');
  if (c.listed_count && c.total_supply)
    setEl('stat-listed-sub', ((c.listed_count / c.total_supply) * 100).toFixed(1) + '% listed');

  updatePriceDisplays();

  // Count-up animation on stat values
  document.querySelectorAll('[data-countup]').forEach(el => {
    const target = parseFloat(el.dataset.countup);
    if (isNaN(target)) return;
    // Re-set the attribute so subsequent refreshes can re-animate
    const countupVal = el.dataset.countup;
    el.dataset.countup = '';
    let v = 0; const inc = target / 40;
    const isInt = target >= 10;
    const t = setInterval(() => {
      v = Math.min(v + inc, target);
      el.textContent = isInt ? Math.round(v).toLocaleString() : v.toFixed(3);
      if (v >= target) clearInterval(t);
    }, 16);
  });
}

// ── Render: Sales Feed ────────────────────────────
function renderSalesFeed(sales) {
  const el = document.getElementById('sales-list');
  if (!el) return;
  el.innerHTML = sales.map((s, i) => `
    <div class="sale-item" style="animation-delay:${i * 0.04}s" onclick="showFish(${s.idx ?? 0})">
      <div class="sale-fish-icon">${s.fish}</div>
      <div class="sale-info">
        <div class="sale-name">${s.name}</div>
        <div class="sale-detail">${s.token} · ${s.time}</div>
      </div>
      <div class="sale-price">
        <div class="sale-eth">${s.eth} ETH</div>
        <div class="sale-usd">${s.usd}</div>
      </div>
    </div>`).join('');
}

// Flash a new sale into feed
function simulateLiveSale() {
  const el = document.getElementById('sales-list');
  if (!el) return;
  const s  = RECENT_SALES[Math.floor(Math.random() * RECENT_SALES.length)];
  const div = document.createElement('div');
  div.className = 'sale-item sale-item--new';
  div.onclick   = () => showFish(s.idx ?? 0);
  div.innerHTML = `
    <div class="sale-fish-icon">${s.fish}</div>
    <div class="sale-info">
      <div class="sale-name">${s.name}</div>
      <div class="sale-detail">${s.token} · just now</div>
    </div>
    <div class="sale-price">
      <div class="sale-eth">${s.eth} ETH</div>
      <div class="sale-usd">${fmtUSD(s.eth)}</div>
    </div>`;
  el.insertBefore(div, el.firstChild);
  while (el.children.length > 12) el.removeChild(el.lastChild);
  setTimeout(() => div.classList.remove('sale-item--new'), 1500);
}

// ── Render: Fish of the Day ───────────────────────
function renderFOTD() {
  const day  = Math.floor(Date.now() / 86400000); // changes at UTC midnight
  const fish = FISH_DATA[day % FISH_DATA.length];
  const idx  = FISH_DATA.indexOf(fish);

  setEl('fotd-emoji',   fish.emoji);
  setEl('fotd-name',    fish.common);
  setEl('fotd-sci',     fish.sci);
  setEl('fotd-genera',  fish.genus);
  setEl('fotd-family',  fish.family);
  setEl('fotd-locality',fish.locality);
  setEl('fotd-token',   '#' + fish.id);
  setEl('fotd-desc',    fish.history.slice(0, 290) + '…');
  setHTML('fotd-status',`<span class="status-pill status-${fish.status.toLowerCase()}">⬤ ${STATUS_NAMES[fish.status]}</span>`);

  const vb = document.getElementById('fotd-view-btn');
  const bb = document.getElementById('fotd-buy-btn');
  const pl = document.getElementById('fotd-profile-link');
  if (vb) vb.onclick = () => showFish(idx);
  if (pl) pl.onclick = () => showFish(idx);
  if (bb) bb.onclick = () => window.open('https://opensea.io/collection/cryptofish', '_blank');
}

// ── Fish Detail ───────────────────────────────────
function showFish(idx) {
  idx = Math.max(0, Math.min(FISH_DATA.length - 1, parseInt(idx) || 0));
  currentFishIndex = idx;
  const f = FISH_DATA[idx];
  if (!f) return;

  setEl('detail-art',        f.emoji);
  setEl('detail-token',      'Token #' + f.id);
  setEl('detail-price',      f.price + ' ETH');
  setEl('detail-usd',        '≈ ' + fmtUSD(f.price) + ' USD');
  setEl('detail-common',     f.common);
  setEl('detail-sci',        f.sci);
  setEl('detail-genus-bc',   f.genus);
  setEl('detail-species-bc', f.species);
  setEl('sp-common',   f.common);
  setEl('sp-sci',      f.sci);
  setEl('sp-order',    f.order);
  setEl('sp-family',   f.family);
  setEl('sp-genus',    f.genus);
  setEl('sp-species',  f.species);
  setEl('sp-locality', f.locality);
  setEl('sp-status',   STATUS_NAMES[f.status] + ' (' + f.status + ')');
  setEl('detail-history',      f.history);
  setEl('detail-conservation', f.conservation);

  setHTML('detail-status-pill',
    `<span class="status-pill status-${f.status.toLowerCase()}">⬤ ${STATUS_NAMES[f.status]}</span>`);

  // OpenSea link — search by name since we don't have contract address
  const buyBtn = document.getElementById('detail-buy-btn');
  if (buyBtn) buyBtn.onclick = () =>
    window.open(`https://opensea.io/collection/cryptofish?search[stringTraits][0][name]=Species&search[stringTraits][0][values][0]=${encodeURIComponent(f.species)}`, '_blank');

  // collection context stats
  const sameGenus    = FISH_DATA.filter(x => x.genus    === f.genus).length;
  const sameLocality = FISH_DATA.filter(x => x.locality === f.locality).length;
  const sameStatus   = FISH_DATA.filter(x => x.status   === f.status).length;
  const ctx = document.getElementById('detail-context');
  if (ctx) ctx.innerHTML =
    `<strong>${sameGenus}</strong> in genus <em>${f.genus}</em> &nbsp;·&nbsp; ` +
    `<strong>${sameLocality}</strong> from ${f.locality} &nbsp;·&nbsp; ` +
    `<strong>${sameStatus}</strong> ${STATUS_NAMES[f.status]}`;

  showPage('detail');
}

function navFish(dir) {
  showFish((currentFishIndex + dir + FISH_DATA.length) % FISH_DATA.length);
}

// ── Library ───────────────────────────────────────
function getAllLibraryFish() {
  return [...FISH_DATA, ...generatePlaceholders(80, 0)];
}

function getFilteredFish() {
  let fish = getAllLibraryFish();
  if (currentSearch) {
    fish = fish.filter(f =>
      f.common.toLowerCase().includes(currentSearch) ||
      f.sci.toLowerCase().includes(currentSearch) ||
      f.genus.toLowerCase().includes(currentSearch) ||
      f.id.includes(currentSearch)
    );
  }
  if (activeFilters.status.length)
    fish = fish.filter(f => activeFilters.status.includes(f.status));
  if (activeFilters.genera.length)
    fish = fish.filter(f => activeFilters.genera.includes(f.genus));
  if (activeFilters.locality.length)
    fish = fish.filter(f => activeFilters.locality.some(l => f.locality?.includes(l)));

  const so = { CR:0, EN:1, VU:2, NT:3, DD:4, LC:5 };
  switch (currentSort) {
    case 'price-asc':  fish.sort((a,b) => parseFloat(a.price)-parseFloat(b.price)); break;
    case 'price-desc': fish.sort((a,b) => parseFloat(b.price)-parseFloat(a.price)); break;
    case 'alpha':      fish.sort((a,b) => a.common.localeCompare(b.common));         break;
    case 'status':     fish.sort((a,b) => (so[a.status]??9)-(so[b.status]??9));     break;
    default:           fish.sort((a,b) => parseInt(a.id)-parseInt(b.id));
  }
  return fish;
}

function renderLibrary() {
  const grid    = document.getElementById('fish-grid');
  const countEl = document.getElementById('lib-count');
  if (!grid) return;

  const fish      = getFilteredFish();
  const isList    = currentView === 'list';
  grid.className  = 'fish-grid' + (isList ? ' list-view' : '');

  grid.innerHTML = fish.map((f, i) => {
    const realIdx  = FISH_DATA.findIndex(x => x.id === f.id);
    const clickIdx = realIdx >= 0 ? realIdx : Math.min(i, FISH_DATA.length - 1);
    return `
      <div class="fish-card animate-card" style="--card-delay:${(i % 20) * 0.03}s" onclick="showFish(${clickIdx})">
        <div class="fish-card-art">
          <div class="fish-card-token">#${f.id}</div>
          <div class="fish-card-status-dot" style="background:${STATUS_COLORS[f.status]||'#999'}" title="${STATUS_NAMES[f.status]||''}"></div>
          <div class="fish-card-emoji">${f.emoji}</div>
        </div>
        <div class="fish-card-body">
          <div class="fish-card-common">${f.common}</div>
          <div class="fish-card-sci">${f.sci}</div>
          <div class="fish-card-footer">
            <div class="fish-card-locality">${f.locality?.split(' ')[0]||'—'}</div>
            <div class="fish-card-price">${f.price} ETH</div>
          </div>
        </div>
      </div>`;
  }).join('');

  if (countEl) {
    const total = getAllLibraryFish().length;
    countEl.textContent = `Showing ${fish.length} of 2,165 fish`;
  }
}

function toggleFilter(el, type, val) {
  el.classList.toggle('active');
  const arr = activeFilters[type];
  const i   = arr.indexOf(val);
  if (i > -1) arr.splice(i, 1); else arr.push(val);
  renderLibrary();
}

function clearFilters() {
  activeFilters = { status:[], genera:[], locality:[], listed:[] };
  currentSearch = '';
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  const searchInput = document.getElementById('library-search');
  if (searchInput) searchInput.value = '';
  renderLibrary();
}

function filterPills(containerId, query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll(`#${containerId} .filter-pill`).forEach(p =>
    p.classList.toggle('hidden', !!q && !p.textContent.toLowerCase().includes(q)));
}

function sortLibrary(val) { currentSort = val; renderLibrary(); }

function setView(view) {
  currentView = view;
  document.getElementById('grid-btn')?.classList.toggle('active', view === 'grid');
  document.getElementById('list-btn')?.classList.toggle('active', view === 'list');
  renderLibrary();
}

function toggleFilterSidebar() {
  document.getElementById('filter-sidebar')?.classList.toggle('open');
}

function exploreLocality(name) {
  clearFilters();
  activeFilters.locality.push(name);
  document.querySelectorAll('#locality-filters .filter-pill').forEach(p => {
    if (p.textContent === name) p.classList.add('active');
  });
  showPage('library');
  renderLibrary();
}

function searchLibrary(query) {
  currentSearch = query.toLowerCase().trim();
  renderLibrary();
}

// ── Scroll Reveal ─────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => obs.observe(el));
}

// ── DOMContentLoaded ──────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Render immediately with static data
  renderSalesFeed(RECENT_SALES);
  renderLibrary();
  renderFOTD();
  initScrollReveal();

  // Fetch live data in parallel
  await Promise.allSettled([fetchEthPrice(), fetchCollectionStats()]);
  // Re-render FOTD now that ETH price is available for USD conversion
  renderFOTD();
  fetchRecentSales();

  // Periodic refreshes
  setInterval(fetchEthPrice,        60_000);   // every 60s
  setInterval(fetchCollectionStats, 300_000);  // every 5m
  setInterval(fetchRecentSales,     120_000);  // every 2m

  // Simulated sale flashes (UX liveliness between real fetches)
  const scheduleSale = () => {
    const ms = 20000 + Math.random() * 40000;
    setTimeout(() => { simulateLiveSale(); scheduleSale(); }, ms);
  };
  scheduleSale();
});
