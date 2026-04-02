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
let _suppressPush = false;

function showPage(page, { pushState = true, fishIdx = null } = {}) {
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

  // History API
  if (pushState && !_suppressPush) {
    const state = { page };
    if (fishIdx !== null) state.fishIdx = fishIdx;
    const url = page === 'home' ? '/' : (page === 'detail' && fishIdx !== null)
      ? `/?fish=${fishIdx + 1}`
      : `/?page=${page}`;
    history.pushState(state, '', url);
  }
}

function toggleMobileNav() {
  mobileNavOpen = !mobileNavOpen;
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.toggle('open', mobileNavOpen);
}

// ── Live: ETH Price (CoinGecko → CryptoCompare) ─────────────────
async function fetchEthPrice() {
  try {
    const r = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { cache: 'no-store' }
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    if (!d.ethereum?.usd) throw new Error('no price');
    liveEthPrice = d.ethereum.usd;
  } catch {
    try {
      const r2 = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD', { cache: 'no-store' });
      if (!r2.ok) throw new Error(r2.status);
      const d2 = await r2.json();
      if (!d2.USD) throw new Error('no price');
      liveEthPrice = d2.USD;
    } catch (e2) {
      console.warn('[ETH price] both APIs failed:', e2.message);
      // Keep previous value if available, otherwise stays null
    }
  }
  updatePriceDisplays();
}

function updatePriceDisplays() {
  const c = liveCollection;
  setEl('stat-vol-usd',   c?.total_volume != null && liveEthPrice ? '≈ ' + fmtUSD(c.total_volume) : '—');
  setEl('stat-floor-usd', c?.floor_price  != null && liveEthPrice ? '≈ ' + fmtUSD(c.floor_price)  : '—');
  setEl('stat-offer-usd', c?.avg_price    != null && liveEthPrice ? '≈ ' + fmtUSD(c.avg_price)    : '—');
  const navEl = document.getElementById('nav-eth-val');
  if (navEl) navEl.textContent = liveEthPrice ? '$' + liveEthPrice.toLocaleString() : '—';
}

// ── Live: Collection Stats (Reservoir) ──────────────
const RESERVOIR_HEADERS = { 'x-api-key': 'demo-api-key', accept: 'application/json' };
const CF_CONTRACT = '0x9ef31ce8cca614e7aff3c1b883740e8d2728fe91';

async function fetchCollectionStats() {
  try {
    const r = await fetch(
      `https://api.reservoir.tools/collections/v7?id=${CF_CONTRACT}`,
      { headers: RESERVOIR_HEADERS, cache: 'no-store' }
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    const c = d.collections?.[0];
    if (!c) throw new Error('no collection');
    liveCollection = {
      floor_price:  c.floorAsk?.price?.amount?.decimal ?? null,
      total_volume: c.volume?.allTime ?? null,
      num_owners:   c.ownerCount     ?? null,
      total_supply: c.tokenCount     ?? 2166,
      listed_count: c.onSaleCount    ?? null,
      avg_price:    c.volume?.['7day'] && c.tokenCount
                      ? parseFloat((c.volume['7day'] / Math.max(c.tokenCount * 0.01, 1)).toFixed(4))
                      : null,
    };
  } catch (e) {
    console.warn('[Reservoir stats] failed:', e.message);
  }
  renderStatsBar();
}

// ── Live: Recent Sales (Reservoir) ─────────────────
async function fetchRecentSales() {
  try {
    const r = await fetch(
      `https://api.reservoir.tools/sales/v6?collection=${CF_CONTRACT}&limit=50&sortBy=time`,
      { headers: RESERVOIR_HEADERS, cache: 'no-store' }
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    const ev = d.sales ?? [];
    if (!ev.length) throw new Error('empty');

    const sales = ev.map(e => {
      const rawEth = e.price?.amount?.decimal;
      if (!rawEth) return null;
      const eth   = parseFloat(rawEth).toFixed(4);
      const rawId = e.token?.tokenId ?? '';
      const token = rawId ? '#' + String(rawId).padStart(4, '0') : '—';
      const ts    = (e.timestamp ?? 0) * 1000;
      const idx   = rawId ? parseInt(rawId) - 1 : -1;
      const f     = idx >= 0 ? FISH_DATA[idx] : null;
      return {
        image: f?.image || '',
        name:  f ? escapeHTML(f.name) : ('CryptoFish ' + (rawId ? token : '—')),
        token,
        eth,
        usd:   fmtUSD(eth),
        time:  timeAgo(ts),
        ts,
        idx:   idx >= 0 ? idx : 0,
      };
    }).filter(Boolean);

    // Most recent first for activity feed
    const byTime  = [...sales].sort((a, b) => b.ts - a.ts);
    renderSalesFeed(byTime);
    // Highest price for top-sales section (up to 9)
    const byPrice = [...sales].sort((a, b) => parseFloat(b.eth) - parseFloat(a.eth));
    renderTopSales(byPrice);
  } catch (e) {
    console.warn('[Reservoir sales] failed:', e.message);
    renderSalesFeed([]);
  }
}

// ── Render: Stats Bar ─────────────────────────────
function renderStatsBar() {
  const c = liveCollection;
  if (!c) return;

  setEl('stat-floor',  c.floor_price  != null ? fmt(c.floor_price, 3) : '—');
  setEl('stat-volume', c.total_volume != null ? c.total_volume.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—');
  setEl('stat-holders',c.num_owners   != null ? c.num_owners.toLocaleString() : '—');
  setEl('stat-items',  c.total_supply != null ? c.total_supply.toLocaleString() : '2,166');
  setEl('stat-offer',  c.avg_price    != null ? fmt(c.avg_price, 3) : '—');

  const floorEl   = document.getElementById('stat-floor');
  const volumeEl  = document.getElementById('stat-volume');
  const holdersEl = document.getElementById('stat-holders');
  const itemsEl   = document.getElementById('stat-items');
  if (floorEl   && c.floor_price  != null) floorEl.dataset.countup   = String(c.floor_price);
  if (volumeEl  && c.total_volume != null) volumeEl.dataset.countup  = String(c.total_volume);
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
  if (!el) return;  if (!sales.length) {
    el.innerHTML = '<div class="sales-loading">Loading recent activity…</div>';
    return;
  }  el.innerHTML = sales.map((s, i) => `
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
function showFish(idx, { pushState = true } = {}) {
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
  setEl('detail-genus-bc',   f.genus || (f.honorary ? 'Honorary' : '—'));
  setEl('detail-species-bc', f.species || (f.honorary ? f.honorary : '—'));
  setEl('sp-common',   f.name);
  setEl('sp-sci',      f.sci || (f.honorary ? 'Custom / Honorary' : '—'));
  setEl('sp-genus',    f.genus || '—');
  setEl('sp-species',  f.species || '—');
  setEl('sp-locality', f.locality || '—');
  setEl('sp-status',   (STATUS_NAMES[f.status] || 'Unknown') + ' (' + f.status + ')');

  setHTML('detail-status-pill',
    `<span class="status-pill status-${f.status.toLowerCase()}">⬤ ${STATUS_NAMES[f.status] || 'Unknown'}</span>`);

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

  // Bio section heading
  const bioHeading = document.getElementById('detail-bio-heading');
  if (bioHeading) bioHeading.textContent = f.honorary && !f.genus ? 'About this Token' : 'About this Species';

  // Show loading state immediately, then populate async
  const bioEl = document.getElementById('detail-bio');
  if (bioEl) bioEl.innerHTML = '<p class="detail-prose bio-loading">Loading species information…</p>';

  // Conservation block
  const consEl = document.getElementById('detail-conservation');
  if (consEl) {
    if (f.status && STATUS_NAMES[f.status] && f.status !== '?') {
      const statusName = STATUS_NAMES[f.status];
      const statusDesc = {
        'CR': 'Critically Endangered species face an extremely high risk of extinction in the wild. This IUCN category requires evidence of a population decline of 80%+ over three generations, or a population estimated at under 250 mature individuals. Without intervention, extinction is a likely outcome for this species.',
        'EN': 'Endangered species face a very high risk of extinction in the wild. The IUCN Endangered category indicates a severe population decline and restricted range. Active conservation programs and habitat protection are critical to preventing extinction.',
        'VU': 'Vulnerable species face a high risk of extinction in the wild under current conditions. They have experienced significant population declines or are restricted to vulnerable habitat, and require monitoring and protection to prevent further decline.',
        'NT': 'Near Threatened species are not currently threatened but are close to qualifying for a threatened category, or may do so without continued conservation measures. They are monitored closely for any signs of decline.',
        'LC': 'Least Concern species have been evaluated and do not meet the criteria for more threatened categories. However, this designation does not mean the species faces no pressure — many LC species face habitat loss, collection pressure, or pollution that has not yet triggered a status change.',
        'DD': 'Data Deficient means insufficient information exists to make a direct or indirect assessment of the species\' extinction risk. This is not a positive status — it means the species has not been studied enough to know if it is threatened.',
        'NE': 'Not Evaluated — this species has not yet been assessed against IUCN criteria. Many freshwater and marine species fall into this category due to limited scientific survey coverage.',
        'EW': 'Extinct in the Wild — this species survives only in captivity or as a naturalized population outside its historic range. Its natural ecosystem no longer supports a wild population.',
        'EX': 'Extinct — this species is no longer known to exist anywhere on Earth. This is the final designation on the IUCN Red List, assigned only when exhaustive surveys confirm no surviving individuals.',
      }[f.status] || '';
      consEl.innerHTML = `<strong>IUCN Red List status: ${escapeHTML(statusName)} (${escapeHTML(f.status)})</strong>${statusDesc ? '<br><br>' + escapeHTML(statusDesc) : ''}`;
    } else {
      consEl.innerHTML = f.honorary ? 'Honorary tokens are not assessed for conservation status as they represent community members rather than species.' : 'Conservation status has not been formally evaluated for this species.';
    }
  }

  // Async bio fetch (Wikipedia → rich fallback)
  if (typeof fetchFishBio === 'function') {
    fetchFishBio(f).then(result => {
      const el = document.getElementById('detail-bio');
      if (el && currentFishIndex === idx) el.innerHTML = result.html;
    }).catch(() => {
      const el = document.getElementById('detail-bio');
      if (el && currentFishIndex === idx)
        el.innerHTML = '<p class="detail-prose">Species information could not be loaded.</p>';
    });
  }

  // Push browser history
  if (pushState) {
    history.pushState({ page: 'detail', fishIdx: idx }, '', `/?fish=${f.tokenId}`);
  }

  showPage('detail', { pushState: false });
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
function showMorePills(containerId, btnId) {
  const container = document.getElementById(containerId);
  const btn       = document.getElementById(btnId);
  if (!container || !btn) return;
  const hidden = container.querySelector('.filter-pills-hidden');
  if (hidden) {
    hidden.querySelectorAll('.filter-pill').forEach(p => container.insertBefore(p, btn));
    hidden.remove();
  }
  btn.remove();
}

function buildFilterPills() {
  // Status — full names, conservation-severity order
  const statusOrder  = ['CR','EN','VU','NT','LC','DD','NE','EX','EW','?'];
  const statusCounts = {};
  FISH_DATA.forEach(f => { if (f.status) statusCounts[f.status] = (statusCounts[f.status]||0)+1; });
  const statEl = document.getElementById('status-filters');
  if (statEl) {
    statEl.innerHTML = statusOrder.filter(s => statusCounts[s]).map(s =>
      `<div class="filter-pill" onclick="toggleFilter(this,'status','${s}')">${STATUS_NAMES[s]||s}<span class="pill-count">${statusCounts[s]}</span></div>`
    ).join('');
  }

  // Genera sorted by count, top 20 + show-more
  const genCounts = {};
  FISH_DATA.forEach(f => { if (f.genus) genCounts[f.genus] = (genCounts[f.genus]||0)+1; });
  const topGenera = Object.entries(genCounts).sort((a,b) => b[1]-a[1]);
  const genEl = document.getElementById('genera-filters');
  if (genEl) {
    const vis  = topGenera.slice(0, 20);
    const rest = topGenera.slice(20);
    genEl.innerHTML =
      vis.map(([g,c]) => `<div class="filter-pill" onclick="toggleFilter(this,'genera','${escapeHTML(g)}')">${escapeHTML(g)}<span class="pill-count">${c}</span></div>`).join('') +
      (rest.length ? `<div class="filter-pill pill-show-more" id="genera-more-btn" onclick="showMorePills('genera-filters','genera-more-btn')">+${rest.length} more</div><div class="filter-pills-hidden">${rest.map(([g,c])=>`<div class="filter-pill" onclick="toggleFilter(this,'genera','${escapeHTML(g)}')">${escapeHTML(g)}<span class="pill-count">${c}</span></div>`).join('')}</div>` : '');
  }

  // Localities sorted by count, top 20 + show-more
  const locCounts = {};
  FISH_DATA.forEach(f => { if (f.locality) locCounts[f.locality] = (locCounts[f.locality]||0)+1; });
  const topLocs = Object.entries(locCounts).sort((a,b) => b[1]-a[1]);
  const locEl = document.getElementById('locality-filters');
  if (locEl) {
    const vis  = topLocs.slice(0, 20);
    const rest = topLocs.slice(20);
    locEl.innerHTML =
      vis.map(([l,c]) => `<div class="filter-pill" onclick="toggleFilter(this,'locality','${l.replace(/'/g,"&#39;")}')">${escapeHTML(l)}<span class="pill-count">${c}</span></div>`).join('') +
      (rest.length ? `<div class="filter-pill pill-show-more" id="locality-more-btn" onclick="showMorePills('locality-filters','locality-more-btn')">+${rest.length} more</div><div class="filter-pills-hidden">${rest.map(([l,c])=>`<div class="filter-pill" onclick="toggleFilter(this,'locality','${l.replace(/'/g,"&#39;")}')">${escapeHTML(l)}<span class="pill-count">${c}</span></div>`).join('')}</div>` : '');
  }
}

// ── Scroll Reveal ─────────────────────────────────
function initScrollReveal() {
  // Immediately reveal anything already in the viewport
  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) el.classList.add('revealed');
  });
  // Use IntersectionObserver for the rest (below the fold)
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => obs.observe(el));
}


// ── Hero cards: random picks, rotate every 8s ────────────────
let heroRotateInterval = null;

function renderHeroCards() {
  const heroGrid = document.getElementById('hero-fish-grid');
  if (!heroGrid) return;
  const withImg = FISH_DATA.filter(f => f.image);
  if (withImg.length < 3) return;

  function pickRandom3() {
    const pool = [...withImg];
    const picks = [];
    while (picks.length < 3) {
      picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return picks;
  }

  function renderPicks(picks) {
    heroGrid.innerHTML = `
      <div class="hero-fish-card large animate-card" style="--card-delay:.05s" onclick="showFish(${picks[0].tokenId - 1})">
        <div class="fish-img-wrap large-wrap"><img src="${encodeURI(picks[0].image)}" alt="${escapeHTML(picks[0].name)}"></div>
        <div class="fish-card-info">
          <div class="fish-card-name">${escapeHTML(picks[0].name)}</div>
          <div class="fish-card-sci">${escapeHTML(picks[0].sci)}</div>
        </div>
      </div>
      ${picks.slice(1).map((f, i) => `
      <div class="hero-fish-card animate-card" style="--card-delay:${(i + 2) * 0.08}s" onclick="showFish(${f.tokenId - 1})">
        <div class="fish-img-wrap"><img src="${encodeURI(f.image)}" alt="${escapeHTML(f.name)}"></div>
        <div class="fish-card-info">
          <div class="fish-card-name">${escapeHTML(f.name)}</div>
          <div class="fish-card-sci">${escapeHTML(f.sci)}</div>
        </div>
      </div>`).join('')}`;
  }

  renderPicks(pickRandom3());

  if (heroRotateInterval) clearInterval(heroRotateInterval);
  heroRotateInterval = setInterval(() => {
    heroGrid.style.transition = 'opacity .35s';
    heroGrid.style.opacity    = '0';
    setTimeout(() => {
      renderPicks(pickRandom3());
      heroGrid.style.opacity = '1';
    }, 360);
  }, 8000);
}

// ── popstate: back/forward button routing ─────────
window.addEventListener('popstate', e => {
  const state = e.state;
  if (!state) { showPage('home', { pushState: false }); return; }
  if (state.page === 'detail' && state.fishIdx != null) {
    showFish(state.fishIdx, { pushState: false });
  } else if (state.page) {
    showPage(state.page, { pushState: false });
  } else {
    showPage('home', { pushState: false });
  }
});

// ── DOMContentLoaded ──────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Handle deep-link URLs: /?fish=42 or /?page=globe etc.
  const urlParams = new URLSearchParams(window.location.search);
  const deepFish  = urlParams.get('fish');
  const deepPage  = urlParams.get('page');

  // Set initial history state so popstate works on first back press
  const initState = deepFish ? { page: 'detail', fishIdx: parseInt(deepFish) - 1 }
                  : deepPage ? { page: deepPage }
                  : { page: 'home' };
  history.replaceState(initState, '', window.location.href);

  // Restore saved theme
  const savedTheme = localStorage.getItem('cf-theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btn = document.getElementById('dark-toggle');
    if (btn) btn.textContent = '☀';
  }

  // Nav scroll shadow
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Lazy-image progressive fade
  document.addEventListener('load', e => {
    if (e.target.tagName === 'IMG') {
      e.target.classList.remove('loading');
      e.target.classList.add('loaded');
    }
  }, true);

  try { buildFilterPills(); }   catch(e) { console.error('[buildFilterPills]', e); }
  try { renderHeroCards(); }    catch(e) { console.error('[renderHeroCards]', e); }
  try { renderTopSales([]); }   catch(e) { console.error('[renderTopSales]', e); }
  try { renderSalesFeed([]); }  catch(e) { console.error('[renderSalesFeed]', e); }
  try { renderLibrary(); }      catch(e) { console.error('[renderLibrary]', e); }
  try { renderFOTD(); }         catch(e) { console.error('[renderFOTD]', e); }
  initScrollReveal();

  // Deep-link routing: open the correct page based on URL params
  if (deepFish) {
    const idx = parseInt(deepFish) - 1;
    if (!isNaN(idx) && idx >= 0) showFish(idx, { pushState: false });
  } else if (deepPage && ['library','globe','nemo'].includes(deepPage)) {
    showPage(deepPage, { pushState: false });
  }

  await Promise.allSettled([fetchEthPrice(), fetchCollectionStats()]);
  try { renderFOTD(); } catch(e) { console.error('[renderFOTD2]', e); }
  fetchRecentSales();

  setInterval(fetchEthPrice,        60_000);
  setInterval(fetchCollectionStats, 300_000);
  setInterval(fetchRecentSales,     120_000);

  // Ripple effect on .btn-primary clicks
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-primary');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;border-radius:50%;transform:scale(0);animation:ripple .5s linear;
      background:rgba(255,255,255,.28);pointer-events:none;
      width:${Math.max(r.width,r.height) * 2}px;height:${Math.max(r.width,r.height) * 2}px;
      left:${e.clientX - r.left - Math.max(r.width,r.height)}px;
      top:${e.clientY - r.top  - Math.max(r.width,r.height)}px;
    `;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});
