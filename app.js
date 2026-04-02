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
let activeFilters    = { status: [], genera: [], locality: [] };
let currentSearch    = '';
let libraryPage      = 0;
const PAGE_SIZE      = 60;

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
  if (ms > Date.now() * 10) ms = ms / 1000;
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 0) return 'just now';
  if (s < 60)    return s + 's ago';
  if (s < 3600)  return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}
function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
  const navEl = document.getElementById('nav-eth-val');
  if (navEl && liveEthPrice) navEl.textContent = '$' + liveEthPrice.toLocaleString();
}

// ── Live: OpenSea Collection Stats ────────────────
async function fetchCollectionStats() {
  try {
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
      total_supply: parseInt(s.count          ?? 2166),
      listed_count: s.listed_count ? parseInt(s.listed_count) : null,
      avg_price:    parseFloat(s.average_price ?? 0.05),
    };
  } catch (e) {
    console.warn('[OpenSea stats] fallback:', e.message);
    liveCollection = liveCollection || {
      floor_price: 0.064, total_volume: 706.66,
      num_owners: 596, total_supply: 2166,
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
      const sym = (e.payment?.symbol || '').toUpperCase();
      return !sym || sym === 'ETH' || sym === 'WETH';
    }).map(e => {
      const eth   = e.payment ? (parseInt(e.payment.quantity) / 1e18).toFixed(4) : '0.064';
      const rawId = e.nft?.identifier ?? '';
      const token = rawId ? '#' + String(rawId).padStart(4, '0') : '—';
      const ts    = (e.closing_time ?? e.event_timestamp ?? 0) * 1000;
      const idx   = rawId ? parseInt(rawId) - 1 : 0;
      const f     = FISH_DATA[idx];
      return {
        image: f?.image || '',
        name:  f ? escapeHTML(f.name) : ('CryptoFish #' + rawId),
        token,
        eth,
        usd:   fmtUSD(eth),
        time:  timeAgo(ts),
        idx,
      };
    });
    renderSalesFeed(sales);
    renderTopSales(sales);
  } catch (e) {
    console.warn('[OpenSea sales] fallback:', e.message);
    const fallback = RECENT_SALES.map(s => ({
      ...s,
      image: FISH_DATA[s.idx]?.image || '',
      name: FISH_DATA[s.idx] ? escapeHTML(FISH_DATA[s.idx].name) : s.name,
    }));
    renderSalesFeed(fallback);
    renderTopSales(fallback);
  }
}

// ── Render: Stats Bar ─────────────────────────────
function renderStatsBar() {
  const c = liveCollection;
  if (!c) return;

  setEl('stat-floor',  fmt(c.floor_price, 3));
  setEl('stat-volume', c.total_volume.toLocaleString(undefined, { maximumFractionDigits: 1 }));
  setEl('stat-holders',c.num_owners?.toLocaleString() ?? '—');
  setEl('stat-items',  c.total_supply?.toLocaleString() ?? '2,166');
  setEl('stat-offer',  fmt(c.avg_price, 3));

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

  document.querySelectorAll('[data-countup]').forEach(el => {
    const target = parseFloat(el.dataset.countup);
    if (isNaN(target)) return;
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
      <div class="sale-fish-icon">${s.image ? `<img src="${encodeURI(s.image)}" alt="" loading="lazy">` : '🐟'}</div>
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


// ── Render: Fish of the Day ───────────────────────
function renderFOTD() {
  const day  = Math.floor(Date.now() / 86400000);
  const idx  = day % FISH_DATA.length;
  const fish = FISH_DATA[idx];

  const artEl = document.getElementById('fotd-emoji');
  if (artEl) {
    if (fish.image) {
      artEl.innerHTML = `<img src="${encodeURI(fish.image)}" alt="${escapeHTML(fish.name)}" class="fotd-img">`;
    } else {
      artEl.textContent = '🐟';
    }
  }

  setEl('fotd-name',    fish.name);
  setEl('fotd-sci',     fish.sci || '—');
  setEl('fotd-genera',  fish.genus || '—');
  setEl('fotd-locality',fish.locality || '—');
  setEl('fotd-token',   '#' + fish.id);
  setEl('fotd-desc',    fish.sci
    ? `${fish.genus} ${fish.species} from ${fish.locality || 'unknown locality'}. Conservation status: ${STATUS_NAMES[fish.status] || 'Unknown'}.`
    : (fish.honorary ? `Custom honorary token for ${fish.honorary}.` : ''));
  setHTML('fotd-status',`<span class="status-pill status-${fish.status.toLowerCase()}">⬤ ${STATUS_NAMES[fish.status] || 'Unknown'}</span>`);

  const vb = document.getElementById('fotd-view-btn');
  const bb = document.getElementById('fotd-buy-btn');
  const pl = document.getElementById('fotd-profile-link');
  if (vb) vb.onclick = () => showFish(idx);
  if (pl) pl.onclick = () => showFish(idx);
  if (bb) bb.onclick = () => window.open(`https://opensea.io/assets/ethereum/0x9ef31ce8cca614e7aff3c1b883740e8d2728fe91/${fish.tokenId}`, '_blank');
}

// ── Fish Detail ───────────────────────────────────
function showFish(idx) {
  idx = Math.max(0, Math.min(FISH_DATA.length - 1, parseInt(idx) || 0));
  currentFishIndex = idx;
  const f = FISH_DATA[idx];
  if (!f) return;

  const artEl = document.getElementById('detail-art');
  if (artEl) {
    if (f.image) {
      artEl.innerHTML = `<img src="${encodeURI(f.image)}" alt="${escapeHTML(f.name)}" class="detail-img">`;
    } else {
      artEl.innerHTML = '🐟';
    }
  }

  setEl('detail-token',      'Token #' + f.id);
  setEl('detail-common',     f.name);
  setEl('detail-sci',        f.sci || (f.honorary ? 'Custom / Honorary' : ''));
  setEl('detail-genus-bc',   f.genus || '—');
  setEl('detail-species-bc', f.species || '—');
  setEl('sp-common',   f.name);
  setEl('sp-sci',      f.sci || '—');
  setEl('sp-genus',    f.genus || '—');
  setEl('sp-species',  f.species || '—');
  setEl('sp-locality', f.locality || '—');
  setEl('sp-status',   (STATUS_NAMES[f.status] || 'Unknown') + ' (' + f.status + ')');

  setHTML('detail-status-pill',
    `<span class="status-pill status-${f.status.toLowerCase()}">⬤ ${STATUS_NAMES[f.status] || 'Unknown'}</span>`);

  // OpenSea direct link to this specific token
  const buyBtn = document.getElementById('detail-buy-btn');
  if (buyBtn) buyBtn.onclick = () =>
    window.open(`https://opensea.io/assets/ethereum/0x9ef31ce8cca614e7aff3c1b883740e8d2728fe91/${f.tokenId}`, '_blank');

  setEl('detail-price', '—');
  setEl('detail-usd', '');

  // Collection context stats
  const sameGenus    = f.genus ? FISH_DATA.filter(x => x.genus === f.genus).length : 0;
  const sameLocality = f.locality ? FISH_DATA.filter(x => x.locality === f.locality).length : 0;
  const sameStatus   = FISH_DATA.filter(x => x.status === f.status).length;
  const ctx = document.getElementById('detail-context');
  if (ctx) {
    const parts = [];
    if (f.genus)    parts.push(`<strong>${sameGenus}</strong> in genus <em>${escapeHTML(f.genus)}</em>`);
    if (f.locality) parts.push(`<strong>${sameLocality}</strong> from ${escapeHTML(f.locality)}`);
    parts.push(`<strong>${sameStatus}</strong> ${STATUS_NAMES[f.status] || 'Unknown'}`);
    ctx.innerHTML = parts.join(' &nbsp;·&nbsp; ');
  }

  const histEl = document.getElementById('detail-history');
  const consEl = document.getElementById('detail-conservation');
  if (histEl) histEl.textContent = f.honorary
    ? `Custom honorary token created for ${f.honorary}.`
    : (f.sci ? `${f.genus} ${f.species}, found in ${f.locality || 'its native habitat'}.` : '');
  if (consEl) consEl.textContent = f.status && STATUS_NAMES[f.status]
    ? `IUCN Red List status: ${STATUS_NAMES[f.status]} (${f.status}).`
    : '';

  showPage('detail');
}

function navFish(dir) {
  showFish((currentFishIndex + dir + FISH_DATA.length) % FISH_DATA.length);
}

// ── Library ───────────────────────────────────────
function getFilteredFish() {
  let fish = FISH_DATA;
  if (currentSearch) {
    const q = currentSearch;
    fish = fish.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.sci.toLowerCase().includes(q) ||
      f.genus.toLowerCase().includes(q) ||
      f.species.toLowerCase().includes(q) ||
      f.locality.toLowerCase().includes(q) ||
      f.id.includes(q) ||
      String(f.tokenId).includes(q)
    );
  }
  if (activeFilters.status.length)
    fish = fish.filter(f => activeFilters.status.includes(f.status));
  if (activeFilters.genera.length)
    fish = fish.filter(f => activeFilters.genera.includes(f.genus));
  if (activeFilters.locality.length)
    fish = fish.filter(f => activeFilters.locality.some(l => f.locality === l));

  const so = { CR:0, EN:1, VU:2, NT:3, DD:4, LC:5, NE:6, EW:7, EX:8, '?':9 };
  switch (currentSort) {
    case 'alpha':  fish = [...fish].sort((a,b) => a.name.localeCompare(b.name)); break;
    case 'status': fish = [...fish].sort((a,b) => (so[a.status]??9)-(so[b.status]??9)); break;
    default:       fish = [...fish].sort((a,b) => a.tokenId - b.tokenId);
  }
  return fish;
}

function renderLibrary() {
  const grid    = document.getElementById('fish-grid');
  const countEl = document.getElementById('lib-count');
  if (!grid) return;

  const allFish   = getFilteredFish();
  const isList    = currentView === 'list';
  const showCount = (libraryPage + 1) * PAGE_SIZE;
  const fish      = allFish.slice(0, showCount);

  grid.className  = 'fish-grid' + (isList ? ' list-view' : '');

  grid.innerHTML = fish.map((f, i) => {
    const idx = f.tokenId - 1;
    return `
      <div class="fish-card animate-card" style="--card-delay:${(i % 20) * 0.03}s" onclick="showFish(${idx})">
        <div class="fish-card-art">
          <div class="fish-card-token">#${f.id}</div>
          <div class="fish-card-status-dot" style="background:${STATUS_COLORS[f.status]||'#999'}" title="${STATUS_NAMES[f.status]||'Unknown'}"></div>
          ${f.image ? `<img src="${encodeURI(f.image)}" alt="${escapeHTML(f.name)}" class="fish-card-img" loading="lazy">` : '<div class="fish-card-emoji">🐟</div>'}
        </div>
        <div class="fish-card-body">
          <div class="fish-card-common">${escapeHTML(f.name)}</div>
          <div class="fish-card-sci">${f.sci ? escapeHTML(f.sci) : (f.honorary ? 'Custom' : '')}</div>
          <div class="fish-card-footer">
            <div class="fish-card-locality">${escapeHTML(f.locality || '—')}</div>
            <div class="fish-card-status-label">${f.status}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  if (fish.length < allFish.length) {
    grid.innerHTML += `<div class="load-more-wrap"><button class="btn-primary load-more-btn" onclick="loadMoreLibrary()">Load more (${allFish.length - fish.length} remaining)</button></div>`;
  }

  if (countEl) countEl.textContent = `Showing ${fish.length} of ${allFish.length} fish`;
}

function loadMoreLibrary() {
  libraryPage++;
  renderLibrary();
}

function toggleFilter(el, type, val) {
  el.classList.toggle('active');
  const arr = activeFilters[type];
  const i   = arr.indexOf(val);
  if (i > -1) arr.splice(i, 1); else arr.push(val);
  libraryPage = 0;
  renderLibrary();
}

function clearFilters() {
  activeFilters = { status:[], genera:[], locality:[] };
  currentSearch = '';
  libraryPage = 0;
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

function sortLibrary(val) { currentSort = val; libraryPage = 0; renderLibrary(); }

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
  libraryPage = 0;
  renderLibrary();
}

// ── Render: Top Sales ────────────────────────────
function renderTopSales(sales) {
  const el = document.getElementById('top-sales-list');
  if (!el) return;
  const top3 = [...sales]
    .sort((a, b) => parseFloat(b.eth) - parseFloat(a.eth))
    .slice(0, 3);
  if (!top3.length) {
    el.innerHTML = '<div style="grid-column:1/-1;padding:20px;text-align:center;color:var(--text3);font-size:13px">No sale data available.</div>';
    return;
  }
  el.innerHTML = top3.map((s, i) => `
    <div class="top-sale-card animate-card" style="--card-delay:${i * 0.08}s" onclick="showFish(${s.idx ?? 0})">
      <div class="top-sale-rank">#${i + 1}</div>
      <div class="top-sale-art">${s.image ? `<img src="${encodeURI(s.image)}" alt="${s.name}">` : '🐟'}</div>
      <div class="top-sale-info">
        <div class="top-sale-name">${s.name}</div>
        <div class="top-sale-price">${parseFloat(s.eth).toFixed(3)} ETH</div>
        <div class="top-sale-usd">${fmtUSD(s.eth)}</div>
      </div>
    </div>`).join('');
}

// ── Dark Mode ─────────────────────────────────────
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next   = isDark ? '' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('cf-theme', next);
  const btn = document.getElementById('dark-toggle');
  if (btn) btn.textContent = isDark ? '☽' : '☀';
}

// ── Dynamic Filter Pills ──────────────────────────
function buildFilterPills() {
  // Status — built from actual data, conservation-severity order
  const statusOrder = ['CR','EN','VU','NT','LC','DD','NE','EX','EW','?'];
  const statusSet   = new Set(FISH_DATA.map(f => f.status).filter(Boolean));
  const statEl = document.getElementById('status-filters');
  if (statEl) {
    statEl.innerHTML = statusOrder.filter(s => statusSet.has(s)).map(s =>
      `<div class="filter-pill" onclick="toggleFilter(this,'status','${s}')">${s}</div>`
    ).join('');
  }

  // Genera sorted by count
  const genCounts = {};
  FISH_DATA.forEach(f => { if (f.genus) genCounts[f.genus] = (genCounts[f.genus]||0) + 1; });
  const topGenera = Object.entries(genCounts).sort((a,b) => b[1] - a[1]);
  const genEl = document.getElementById('genera-filters');
  if (genEl) {
    genEl.innerHTML = topGenera.map(([g]) =>
      `<div class="filter-pill" onclick="toggleFilter(this,'genera','${escapeHTML(g)}')">${escapeHTML(g)}</div>`
    ).join('');
  }

  // Localities sorted by count
  const locCounts = {};
  FISH_DATA.forEach(f => { if (f.locality) locCounts[f.locality] = (locCounts[f.locality]||0) + 1; });
  const topLocs = Object.entries(locCounts).sort((a,b) => b[1] - a[1]);
  const locEl = document.getElementById('locality-filters');
  if (locEl) {
    locEl.innerHTML = topLocs.map(([l]) =>
      `<div class="filter-pill" onclick="toggleFilter(this,'locality','${l.replace(/'/g,"&#39;")}')">${escapeHTML(l)}</div>`
    ).join('');
  }
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

// ── Lazy image fade-in ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('load', e => {
    if (e.target.tagName === 'IMG') e.target.classList.add('loaded');
  }, true);
});

// ── Hero cards with real NFT art ──────────────────
function renderHeroCards() {
  const heroGrid = document.getElementById('hero-fish-grid');
  if (!heroGrid) return;
  const picks = [199, 499, 799, 1099].map(i => FISH_DATA[i]).filter(Boolean);
  if (picks.length < 4) return;
  heroGrid.innerHTML = `
    <div class="hero-fish-card large" onclick="showFish(${picks[0].tokenId - 1})">
      <div class="fish-img-wrap large-wrap"><img src="${encodeURI(picks[0].image)}" alt="${escapeHTML(picks[0].name)}" loading="lazy"></div>
      <div class="fish-card-info">
        <div class="fish-card-name">${escapeHTML(picks[0].name)}</div>
        <div class="fish-card-sci">${escapeHTML(picks[0].sci)}</div>
      </div>
    </div>
    ${picks.slice(1).map(f => `
    <div class="hero-fish-card" onclick="showFish(${f.tokenId - 1})">
      <div class="fish-img-wrap"><img src="${encodeURI(f.image)}" alt="${escapeHTML(f.name)}" loading="lazy"></div>
      <div class="fish-card-info">
        <div class="fish-card-name">${escapeHTML(f.name)}</div>
        <div class="fish-card-sci">${escapeHTML(f.sci)}</div>
      </div>
    </div>`).join('')}`;
}

// ── DOMContentLoaded ──────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Restore saved theme
  const savedTheme = localStorage.getItem('cf-theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btn = document.getElementById('dark-toggle');
    if (btn) btn.textContent = '☀';
  }

  buildFilterPills();
  renderHeroCards();
  // Show RECENT_SALES as placeholder until live data loads
  renderTopSales(RECENT_SALES.map(s => ({
    ...s,
    image: FISH_DATA[s.idx]?.image || '',
    name: FISH_DATA[s.idx] ? escapeHTML(FISH_DATA[s.idx].name) : s.name,
  })));
  renderLibrary();
  renderFOTD();
  initScrollReveal();

  await Promise.allSettled([fetchEthPrice(), fetchCollectionStats()]);
  renderFOTD();
  fetchRecentSales();

  setInterval(fetchEthPrice,        60_000);
  setInterval(fetchCollectionStats, 300_000);
  setInterval(fetchRecentSales,     120_000);
});
