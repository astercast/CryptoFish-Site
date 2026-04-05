// ================================================
// CryptoFish  -  globe.js  v3  (globe.gl)
// ================================================

let globeInitialized = false;
let globeInstance    = null;
let locDataArr       = [];
// ── Locality → [lat, lon] ─────────────────────────
const LOC_COORDS = {
  // Lake Malawi
  'Nkhata Bay':[-11.6,34.3],'Likoma Island':[-12.1,34.7],'Chizumulu Island':[-11.8,34.5],
  'Mbenji Island':[-13.6,34.7],'Namalenje Island':[-13.4,34.7],'Thumbi West Island':[-14.1,34.8],
  'Thumbi East Island':[-14.1,34.9],'Boadzulu Island':[-14.2,35.0],'Otter Point':[-14.0,34.9],
  'Cobwe':[-12.3,34.4],'Ndumbi Rocks':[-12.0,34.4],'Makanjila Point':[-14.4,35.2],
  'Mara Rocks':[-12.5,34.5],'Hai Reef':[-13.9,34.8],'Taiwanee Reef':[-14.2,34.9],
  'Maingano Island':[-12.2,34.3],'Chembe Beach':[-14.0,34.8],'Gome Rock':[-11.5,34.3],
  'Gome':[-11.5,34.3],'Manda':[-10.7,34.2],'Masinje':[-14.3,35.0],'Senga Point':[-13.8,34.8],
  'Ngwasi':[-13.0,34.6],'Chinyankwazi Island':[-13.7,34.7],'Liwani':[-14.5,35.3],
  'Gallireya Reef':[-12.8,34.6],'Higga Reef':[-11.5,34.3],'Undu Reef':[-11.8,34.4],
  'Nakantenga Island':[-13.3,34.6],'Mphanga Rocks':[-11.4,34.2],'Chidunga Rocks':[-13.7,34.8],
  'Metangula':[-12.3,34.8],'Ntekete':[-14.3,35.1],'Mdowa':[-11.2,34.2],'Itungi':[-9.4,34.0],
  'Ruarwe':[-11.0,34.2],'Londo':[-10.4,34.2],'Londo Bay':[-10.4,34.2],'Cape Kaiser':[-11.2,34.1],
  'Mbweca Rocks':[-11.4,34.2],'Chiofu':[-11.5,34.3],'Maleri Island':[-13.8,34.8],
  'Mbamba Bay':[-11.4,34.5],'Dwanga':[-13.2,34.5],'Meponda':[-13.8,35.4],
  // Lake Tanganyika
  'Kigoma':[-4.9,29.6],'Kipili':[-7.4,30.6],'Kekese':[-6.2,30.2],'Isanga':[-8.6,31.0],
  'Cape Kabogo':[-5.9,29.8],'Kantalamba':[-8.5,31.1],'Mabilibili':[-6.8,30.4],'Halembe':[-4.6,29.6],
  'Mvuna Island':[-7.3,30.6],'Kalala Island':[-7.2,30.5],'Ubwari':[-4.3,29.3],
  'Ulwile Island':[-7.0,30.5],'Fulwe Rocks':[-6.5,30.3],'Kalambo Lodge':[-8.6,31.2],
  'Mboko Island':[-4.8,29.5],'Msalaba':[-5.2,29.7],'Cape Mpimbwe':[-7.4,30.5],
  'Udachi':[-4.4,29.5],'Wimbi':[-4.3,29.4],'Mtoto':[-6.9,30.4],'Bemba':[-4.7,29.5],
  'Ikola':[-6.8,30.4],'Luagala Point':[-5.8,29.8],'Katumbi Point':[-5.5,29.8],
  'Pasagulu Point':[-8.8,31.3],'Katonga':[-4.5,29.5],'Kizike':[-4.8,29.5],
  'Chituta Bay':[-8.6,31.1],'Chimba':[-5.4,29.7],'Lumbye Bay':[-8.4,31.0],
  'Cape Nambeyeye':[-8.0,30.8],'Isonga':[-4.6,29.5],'Mahale National Park':[-6.1,29.9],
  'Kaswente Bay':[-8.7,31.2],'Mwaka':[-7.1,30.5],'Shanshete':[-7.2,30.5],
  'Kansombo':[-7.3,30.6],'Kabwe':[-7.2,30.6],'Kasongola':[-4.8,29.6],'Kalugunga':[-5.0,29.7],
  'Kushangaza':[-5.9,29.9],'Cape Caramba':[-5.6,29.8],'Cape Nundo':[-5.7,29.8],
  'Chibwensolo':[-8.5,31.0],'Kifumbwe':[-6.5,30.3],'Minago':[-5.0,29.6],'Mucansi':[-5.2,29.7],
  'Gitaza':[-3.5,29.4],'Nyanza-Lac':[-4.3,29.4],'Uvira':[-3.4,29.1],'Tembwe Deux':[-4.2,29.3],
  'Bulu Point':[-5.1,29.7],'Kyeso':[-5.8,29.8],'Katenga':[-5.4,29.7],'Mawimbi':[-4.8,29.5],
  'Nkwasi Point':[-5.2,29.7],'Moliro':[-8.9,31.4],'Livua':[-8.0,30.8],'Kiku':[-8.3,31.0],
  'Kapampa':[-8.6,31.1],'Mkuyu':[-5.6,29.8],'Kilima':[-5.3,29.7],'Segunga (North)':[-5.2,29.7],
  'Kungwe Point':[-6.0,29.9],'Ifala':[-8.1,30.9],'Ndole Bay':[-8.4,31.0],'Lupota':[-8.5,31.1],
  'Kashekzi':[-5.6,29.8],'Kasalamnjaga':[-4.7,29.6],
  // Lake Victoria
  'Makobe Island':[-1.1,33.6],'Kisumu':[-0.1,34.8],'Napoleon Gulf':[0.4,33.2],
  'Mwanza Gulf':[-2.5,32.9],'Rusinga Island':[-0.4,34.2],'Lake Ukerewe':[-2.0,33.1],
  'Napoleon Gulf':[0.4,33.2],'Lake George':[-0.1,30.2],
  // Other African lakes
  'Lake Barombi Mbo':[4.7,9.3],'Lake Ejagham':[5.5,8.9],'Lake Bosumtwi':[-6.5,-1.4],
  'Mangarahara River':[-18.8,46.8],'Andapa':[-14.7,49.6],
  // Red Sea / Indian Ocean
  'Hurghada':[27.2,33.8],'Jeddah':[21.5,39.2],'Gulf of Aqaba':[28.5,34.9],
  'Siyul El Gelwa':[27.5,33.9],'Fury Shoals':[24.5,35.2],'Massawa':[15.6,39.5],
  'Fahl Island':[23.6,58.5],'Persian Gulf':[26.0,52.0],'Gulf of Oman':[22.0,57.0],
  'Mirbat':[16.9,54.7],'Unawatuna':[6.0,80.2],'Maldives':[4.2,73.5],'Ellaidhoo':[4.1,73.2],
  'Vilamendhoo':[3.6,72.9],'Baa Atoll':[5.0,72.8],'Ras Nasrani':[28.0,34.4],
  // Southeast Asia / Coral Triangle
  'Raja Ampat':[-0.5,130.7],'Komodo':[-8.5,119.5],'Lembeh Strait':[1.4,125.2],
  'Cebu':[10.3,123.9],'Anilao':[13.7,120.9],'El Nido':[11.2,119.4],'Bintan':[1.1,104.5],
  'Sulawesi':[-1.5,120.5],'Phuket':[8.0,98.3],'Coron':[11.9,120.2],'Bali':[-8.3,115.2],
  'Flores':[-8.7,121.5],'Panabo':[7.3,125.7],'North Sulawesi':[1.5,125.0],
  'Okinawa':[26.5,128.0],'Sesoko Island':[26.6,127.9],'Tulumben':[-8.3,115.6],
  'Mergui Island':[12.0,98.0],'Ambon Bay':[-3.7,128.2],'Palau':[7.5,134.5],
  // Pacific
  'Moorea':[-17.5,-149.8],'Tahiti':[-17.7,-149.5],'Nacula Island':[-16.9,177.4],
  'Wakaya':[-17.6,179.0],'Enewetak':[11.5,162.3],'Kwajalein':[8.7,167.7],
  'Dumaguete':[9.3,123.3],'Mabini':[13.7,121.1],'Minabe':[33.8,135.4],'Kasumi':[35.6,134.6],
  'Busan':[35.1,129.0],'Wongat Island':[-5.5,145.8],'Lord Howe Island':[-31.5,159.1],
  'Mooloolaba':[-26.7,153.1],'Middleton Reef':[-29.5,159.1],'Ribbon Reefs':[-15.0,145.0],
  'Raine Island':[-11.6,144.0],'Christmas Island':[-10.5,105.7],'Cook Islands':[-21.2,-159.8],
  'Big Island':[19.6,-155.5],'Kona':[19.6,-156.0],'Rabbit Island':[21.4,-157.7],
  'Jade Shoals':[21.0,-157.5],'Polo Beach':[20.7,-156.4],'North Bali':[-8.1,115.1],
  'Mihiri':[5.1,73.0],'Helengeli':[4.5,73.6],'Nusa Dua':[-8.8,115.2],
  // Caribbean / Atlantic
  'Bonaire':[12.2,-68.3],'Curacao':[12.3,-69.0],'La Romana':[18.4,-69.0],
  'Navassa Island':[18.4,-75.0],'Lighthouse Reef Atoll':[17.3,-87.5],'Guarapari':[-20.7,-40.5],
  'Ascension Island':[-7.9,-14.3],'Cape Verde':[16.0,-24.0],'Gulf of California':[26.0,-110.0],
  'Gulf Of Mexico':[25.0,-90.0],'Baffin Bay':[73.0,-68.0],
  // Africa continued
  'Watamu':[-3.4,40.0],'Aliwal Shoal':[-30.3,30.9],'Sodwana Bay':[-27.5,32.7],
  'Mafia Island':[-7.9,39.7],'Chumbe Island':[-6.3,39.2],'Zanzibar':[-6.2,39.2],
  // East Africa / rivers
  'Meme River':[5.0,9.5],'Aguaytia River':[-9.2,-75.5],'Rio Tapajos':[-5.0,-57.0],
  'Rio Xingu':[-3.5,-52.0],'Rio Xingu Basin':[-3.5,-52.0],'Rio Araguaia':[-13.0,-50.0],
  'Rio Negro':[-3.0,-61.0],'Orinoco River':[7.0,-65.0],'Upper Orinoco River':[4.0,-67.0],
  'Ventuari River':[4.0,-65.5],'Parana River':[-25.0,-57.0],'Suriname':[4.0,-56.0],
  'Essequibo River':[5.0,-59.0],'Atins':[-2.5,-43.0],'Ubatuba':[-23.4,-45.1],
  'Meta':[4.0,-73.0],'Atabapo River':[4.0,-67.2],'Xingu River basin':[-3.5,-52.0],
  // SE Asia rivers
  'Irrawaddy':[17.0,96.0],'Myanmar':[19.0,96.5],'Mekong River':[12.0,105.0],
  'Salween River':[17.0,97.5],'Muang Khong':[14.0,105.8],'Malay Peninsula':[4.5,103.0],
  'Kalimantan Barat':[0.0,111.0],'Kalimantan Timur':[0.5,117.0],'Java':[-7.5,110.5],
  'Sumatra':[-0.5,101.5],'Sarawak':[3.0,113.0],'Mahakam Basin':[0.0,116.5],
  'Mempawah':[-0.5,109.0],'Riau Islands':[1.0,104.0],'Selangor':[3.4,101.4],
  // South Asia
  'Kerala':[10.0,76.5],'Kumaradhara River':[12.7,75.2],'Madhya Pradesh':[23.5,78.0],
  'Sri Lanka':[7.5,80.7],'Bihn Duong':[10.9,106.8],
  // Australia / NZ
  'Monterey Bay':[36.8,-121.9],'Des Moines':[41.6,-93.6],'Virginia':[37.4,-79.0],
  'Arkansas River Drainage':[36.0,-95.0],'Ogeechee River':[33.0,-81.9],
  'English River':[50.0,-93.7],'St. Lawrence River':[46.0,-74.0],'Great Lakes':[44.0,-78.0],
  // Special / worldwide
  'Worldwide':[20.0,0.0],'Atlantic Ocean':[0.0,-30.0],'North Atlantic Ocean':[45.0,-30.0],
  'North Pacific Ocean':[40.0,-160.0],'Pacific Ocean':[0.0,-140.0],
  'Godthaab':[64.2,-51.7],'Galician continental shelf':[43.0,-10.0],
  'Yangtze River':[30.0,110.0],'Tisza River':[48.0,20.0],'Krka':[43.9,16.1],
  'Hormuzgan':[27.0,56.5],'Isla de la Juventud':[21.6,-82.8],'Lake Xochimilco':[19.3,-99.1],
  'Lake Apoyo':[11.9,-86.0],'Lake Amatitlan':[14.5,-90.5],'Catemaco Lake':[18.4,-95.1],
  'Media Luna':[21.9,-99.2],'Rio Chalchijapan':[17.8,-92.9],'Rio Salado':[17.5,-92.5],
  'Rio Canaveral':[10.9,-75.0],'Rio Meta':[4.5,-72.3],'Andes River':[-8.0,-78.0],
  'Altamira':[-3.2,-52.2],'Tapajos Basin':[-4.0,-55.0],'Tocantins':[-10.0,-48.5],
  'Rio Pindar':[-5.0,-45.0],'Bahia River Basin':[-12.5,-41.5],
  'Cuduyari':[1.0,-69.0],'Pamoni River':[5.5,-61.0],'Maroni River Basin':[4.5,-54.0],
  'Andes River':[-8.0,-78.0],'Suksamrarn':[16.4,103.0],'Florida Island':[-9.1,160.2],
  'Pavuvu Island':[-9.0,159.1],'Solomon Islands':[-9.0,160.0],
  'Napo River Drainage':[-1.5,-77.5],'Salween River':[17.0,97.5],
  'Hormuzgan':[27.0,56.5],'Malagarasi River':[-5.5,30.5],'Lake Peten-Itza':[16.9,-89.9],
  'Lago Peten':[16.9,-89.9],'Chacamax River':[17.5,-92.0],'San Juan River Basin':[10.8,-84.0],
  'San Jose River':[10.0,-84.5],'Olla 5 River':[9.3,-83.5],'Rio Tefe':[-3.4,-64.7],
  'Rio Ucayali':[-8.0,-74.0],'Rio Babahoyo':[-1.8,-79.5],'Cumar':[2.5,-66.5],
  'Arara cachoeiras':[-6.0,-53.0],'Rio Pindare':[-5.0,-45.0],'Vitoria do Xingu':[-3.2,-52.0],
  'Guaviare':[2.5,-72.5],'Suriname':[4.0,-56.0],'Essequibo River':[5.0,-59.0],
  'Parana River':[-25.0,-57.0],'Guanabara Bay Basin':[-22.9,-43.2],
  'Lower Tocantins River Basin':[-5.5,-49.0],'Sao Simao':[-18.9,-50.5],
  'Puente El Chilte':[23.6,-105.4],'Santo Domingo River':[15.5,-92.0],
  'Olla 5 River':[9.3,-83.5],'Kumradhara River':[12.7,75.2],
  // Misc
  'Chesterfield Islands':[-19.9,158.3],'Middleton Reef':[-29.5,159.1],
  'Rottnest Island':[-32.0,115.5],'Exmouth':[-21.9,114.1],'North Island':[-38.0,175.5],
  'Monkey Mia':[-25.8,113.7],'Moka Manu':[-17.5,-149.8],'Maitre Island':[-22.3,166.5],
  'Sodwana Bay':[-27.5,32.7],'Raine Island':[-11.6,144.0],'Cocos Islands':[-12.1,96.9],
  'Poivre Atoll':[-5.8,53.3],'Hikkaduwa':[6.1,80.1],'Watamu':[-3.4,40.0],
  'Umm Gamaar':[27.2,33.9],'Guitars Island':[12.0,-69.5],'Pulau Putri':[-5.7,106.5],
  'Siyul El Gelwa':[27.5,33.9],'Milne Bay':[-10.3,150.5],'Dampier':[-20.6,116.7],
  'Punta Carrion':[-0.4,-90.4],'Ascension Island':[-7.9,-14.3],
  'Saint Helena Island':[-15.9,-5.7],'Mwangaden River':[4.2,38.5],
  'Mudflats':[-35.0,138.0],'Mauritius':[-20.2,57.5],'Mauritania':[20.0,-12.0],
  'Burdwood Bank':[-54.5,-60.0],'Maale':[3.5,73.5],'Massawa':[15.6,39.5],
  'Selagor':[3.4,101.4],'Pangandaran':[-7.7,108.6],'Bunaken':[1.6,124.8],
  'Loang Spit':[1.6,124.9],'Maumere':[-8.6,122.2],'Apo Island':[9.1,123.4],
  'Davao':[7.0,125.6],'Hon Mun Island':[12.2,109.3],'Verde Island Passage':[13.5,121.0],
  'Boracay':[11.9,121.9],'Puerto Galera':[13.5,121.0],'Subic Bay':[14.8,120.2],
  'Balamban':[10.5,123.7],'Puerto Princesa':[9.8,118.7],'Bohol':[9.8,124.2],
  'Leyte Gulf':[11.0,125.5],'Camiguin Island':[9.2,124.7],'Surigao Strait':[10.2,125.4],
};

// ── Equirectangular helpers ───────────────────────
function lonLatToCanvas(lon, lat, W, H) {
  return [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
}
function latLonToXYZ(lat, lon, r) {
  const phi   = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// ── Canvas earth texture ──────────────────────────
function createEarthTexture() {
  const W = 2048, H = 1024;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Ocean gradient
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0,   '#0d4f7a');
  grd.addColorStop(0.3, '#1976a0');
  grd.addColorStop(0.7, '#1976a0');
  grd.addColorStop(1,   '#0d4f7a');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Ocean wave shimmer lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let y = 20; y < H; y += 24) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const wy = y + Math.sin(x * 0.025) * 3;
      x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }

  // Draw landmasses
  LANDMASSES.forEach(lm => {
    ctx.beginPath();
    lm.pts.forEach(([lon, lat], i) => {
      const [x, y] = lonLatToCanvas(lon, lat, W, H);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = lm.col;
    ctx.fill();
    // Outline
    const darker = lm.col.replace(/^#/, '');
    const r = parseInt(darker.slice(0,2),16), g = parseInt(darker.slice(2,4),16), b = parseInt(darker.slice(4,6),16);
    ctx.strokeStyle = `rgba(${Math.max(0,r-30)},${Math.max(0,g-30)},${Math.max(0,b-30)},0.6)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Polar glow overlays
  const northGrd = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, H*0.2);
  northGrd.addColorStop(0,   'rgba(220,240,255,0.55)');
  northGrd.addColorStop(1,   'rgba(220,240,255,0)');
  ctx.fillStyle = northGrd;
  ctx.fillRect(0, 0, W, H*0.2);

  const southGrd = ctx.createRadialGradient(W/2, H, 0, W/2, H, H*0.2);
  southGrd.addColorStop(0,   'rgba(220,240,255,0.55)');
  southGrd.addColorStop(1,   'rgba(220,240,255,0)');
  ctx.fillStyle = southGrd;
  ctx.fillRect(0, H*0.8, W, H*0.2);

  return new THREE.CanvasTexture(c);
}

// ── Cloud texture ─────────────────────────────────
function createCloudTexture() {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const CLOUDS = [
    [0.08,0.25,90,28],[0.15,0.18,70,22],[0.22,0.30,110,30],[0.30,0.22,80,20],
    [0.38,0.28,95,25],[0.45,0.20,75,18],[0.52,0.32,100,28],[0.60,0.24,85,22],
    [0.68,0.19,70,20],[0.75,0.28,90,24],[0.82,0.22,80,18],[0.90,0.30,100,26],
    [0.05,0.68,80,22],[0.18,0.72,95,26],[0.30,0.65,70,20],[0.42,0.70,85,24],
    [0.55,0.67,90,22],[0.65,0.73,75,20],[0.78,0.68,95,26],[0.88,0.72,80,22],
    [0.12,0.45,100,20],[0.28,0.50,80,18],[0.50,0.42,90,22],[0.70,0.48,85,20],
    [0.92,0.44,75,18],[0.35,0.55,110,24],[0.60,0.52,90,20],[0.80,0.55,95,22],
  ];
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  CLOUDS.forEach(([cx, cy, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(cx * W, cy * H, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  return new THREE.CanvasTexture(c);
}

// ── Build locality data from FISH_DATA + LOC_COORDS ──
function buildLocData() {
  const map = {};
  FISH_DATA.forEach(f => {
    if (!f.locality || !LOC_COORDS[f.locality]) return;
    if (!map[f.locality]) {
      const [lat, lon] = Array.isArray(LOC_COORDS[f.locality][0])
        ? LOC_COORDS[f.locality][0]
        : LOC_COORDS[f.locality];
      map[f.locality] = { name: f.locality, lat, lon, count: 0, fish: [] };
    }
    map[f.locality].count++;
    if (map[f.locality].fish.length < 8 && f.image)
      map[f.locality].fish.push(f);
  });
  const locs = Object.values(map).sort((a, b) => b.count - a.count);

  // Pre-compute nearby localities (within ~0.7° ≈ 78 km)
  const THRESH = 0.7;
  locs.forEach(loc => {
    loc.nearby = locs.filter(other =>
      other !== loc &&
      Math.abs(other.lat - loc.lat) < THRESH &&
      Math.abs(other.lon - loc.lon) < THRESH
    ).sort((a, b) => b.count - a.count);
  });

  return locs;
}

// ── Zoom-adaptive clustering ──────────────────────
let currentClusters = [];
let lastAlt         = -1;
let clusterRafId    = null;

function clusterLocs(locs, threshDeg) {
  const used     = new Array(locs.length).fill(false);
  const clusters = [];
  for (let i = 0; i < locs.length; i++) {
    if (used[i]) continue;
    const base    = locs[i];
    const members = [base];
    used[i] = true;
    for (let j = i + 1; j < locs.length; j++) {
      if (used[j]) continue;
      if (Math.abs(locs[j].lat - base.lat) < threshDeg &&
          Math.abs(locs[j].lon - base.lon) < threshDeg) {
        members.push(locs[j]);
        used[j] = true;
      }
    }
    const total = members.reduce((s, m) => s + m.count, 0);
    const lat   = members.reduce((s, m) => s + m.lat * m.count, 0) / total;
    const lon   = members.reduce((s, m) => s + m.lon * m.count, 0) / total;
    const fish  = [];
    const seen  = new Set();
    for (const m of members)
      for (const f of m.fish)
        if (!seen.has(f.tokenId) && fish.length < 8) { fish.push(f); seen.add(f.tokenId); }
    clusters.push({
      lat, lon, count: total, fish,
      hue:       members[0].hue,
      isCluster: members.length > 1,
      size:      members.length,
      name:      members.length === 1
        ? members[0].name
        : members[0].name + (members.length > 1 ? ` +${members.length - 1}` : ''),
      locs:   members,
      nearby: members.length === 1 ? (members[0].nearby || []) : [],
    });
  }
  return clusters;
}

function updateGlobeClusters() {
  if (!globeInstance) return;
  const alt = globeInstance.pointOfView().altitude ?? 2.5;
  if (Math.abs(alt - lastAlt) < 0.04) return;
  lastAlt = alt;
  const thresh = Math.max(0.04, alt * 0.55);
  currentClusters = clusterLocs(locDataArr, thresh);
  globeInstance.pointsData(currentClusters);
}

function scheduleClusterUpdate() {
  if (clusterRafId) return;
  clusterRafId = requestAnimationFrame(() => {
    clusterRafId = null;
    updateGlobeClusters();
  });
}

// ── Main init ─────────────────────────────────────

// ── Init Globe (globe.gl) ─────────────────────────
function initGlobe() {
  if (globeInitialized) return;
  globeInitialized = true;

  const el = document.getElementById('globe-canvas');
  if (!el) { globeInitialized = false; return; }

  locDataArr = buildLocData();
  locDataArr.forEach((loc, i) => { loc.hue = (i * 47) % 360; });

  if (!window.Globe) {
    console.error('[CryptoFish] Globe library not loaded');
    globeInitialized = false;
    return;
  }

  const W = el.offsetWidth  || el.parentElement?.offsetWidth  || 600;
  const H = el.offsetHeight || el.parentElement?.offsetHeight || 500;

  globeInstance = Globe()
    .width(W).height(H)
    .backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .atmosphereColor('#aad4f5')
    .atmosphereAltitude(0.18)
    .pointsData([])
    .pointLat(d => d.lat)
    .pointLng(d => d.lon)
    .pointAltitude(d => d.isCluster ? 0.025 : 0.012)
    .pointRadius(d => {
      const base = Math.log(Math.min(d.count, 80) + 1) / Math.log(81);
      return d.isCluster ? 0.42 + base * 0.85 : 0.22 + base * 0.6;
    })
    .pointColor(d => d.isCluster ? `hsl(${d.hue},58%,72%)` : `hsl(${d.hue},88%,62%)`)
    .pointResolution(12)
    .onPointClick(d => { _focusByData(d); showPopover(d); })
    .onGlobeClick(() => closePopover())
    .pointLabel(d => {
      const sub = d.isCluster
        ? `${d.size} localities · ${d.count} fish`
        : `${d.count} CryptoFish`;
      return `<div style="background:rgba(15,15,30,.88);color:#fff;padding:8px 12px;border-radius:10px;font-family:Inter,sans-serif;font-size:12px;max-width:220px"><b>${d.name}</b><br><span style="opacity:.75">${sub}</span></div>`;
    });

  globeInstance(el);

  // Auto-rotate
  globeInstance.controls().autoRotate      = true;
  globeInstance.controls().autoRotateSpeed = 0.38;
  globeInstance.controls().enableDamping   = true;

  let autoTimer;
  const stopAuto   = () => { globeInstance.controls().autoRotate = false; clearTimeout(autoTimer); };
  const resumeAuto = () => { clearTimeout(autoTimer); autoTimer = setTimeout(() => { if (globeInstance) globeInstance.controls().autoRotate = true; }, 3600); };

  el.addEventListener('mousedown',  stopAuto);
  el.addEventListener('touchstart', stopAuto, { passive: true });
  window.addEventListener('mouseup',    resumeAuto);
  window.addEventListener('touchend',   resumeAuto);

  window.addEventListener('resize', () => {
    if (!globeInstance) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    if (w && h) globeInstance.width(w).height(h);
  });

  // Zoom-adaptive clustering
  globeInstance.controls().addEventListener('change', scheduleClusterUpdate);
  updateGlobeClusters();

  renderLocalityList();
}

function _focusByData(d) {
  // Works for both clusters and single raw locs
  const primaryLoc = d.locs ? d.locs[0] : d;
  const idx = locDataArr.indexOf(primaryLoc);
  document.querySelectorAll('.locality-item').forEach((el, i) => el.classList.toggle('active', i === idx));
  const items = document.querySelectorAll('.locality-item');
  if (items[idx]) items[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  // Clusters zoom in deep enough to start splitting them
  const curAlt = globeInstance?.pointOfView().altitude ?? 2.5;
  const targetAlt = d.isCluster ? Math.max(0.35, curAlt * 0.42) : 1.4;
  if (globeInstance) globeInstance.pointOfView({ lat: d.lat, lng: d.lon, altitude: targetAlt }, 900);
}

// ── Public: focus by sidebar index ────────────────
function focusLocality(idx) {
  const loc = locDataArr[idx];
  if (!loc) return;
  // Wrap raw loc so showPopover can treat it uniformly
  const item = { ...loc, isCluster: false, size: 1, locs: [loc], nearby: loc.nearby || [] };
  _focusByData(item);
  showPopover(item);
}

// ── Popover ───────────────────────────────────────
function showPopover(item) {
  const isCluster = item.isCluster && item.locs.length > 1;

  document.getElementById('pop-title').textContent = isCluster
    ? item.locs[0].name + ' area'
    : item.locs[0].name;
  document.getElementById('pop-sub').textContent = isCluster
    ? `${item.size} localities · ${item.count} CryptoFish total`
    : `${item.count} CryptoFish · ${item.locs[0].lat.toFixed(1)}°, ${item.locs[0].lon.toFixed(1)}°`;

  const fishArr = item.fish || [];
  document.getElementById('pop-fish').innerHTML = fishArr.length
    ? fishArr.map(f => `<div class="popover-fish"><img src="${f.image}" alt="${f.name}" title="${f.name}" onclick="event.stopPropagation();showFish(${f.tokenId - 1})" loading="lazy"></div>`).join('')
    : '<div class="popover-fish-empty">No images available</div>';

  const nearbyEl = document.getElementById('pop-nearby');
  if (nearbyEl) {
    if (isCluster) {
      nearbyEl.innerHTML =
        `<div class="pop-nearby-label">Localities in this area — zoom in to separate</div>` +
        `<div class="pop-nearby-list">` +
        item.locs.map(loc => {
          const locIdx = locDataArr.indexOf(loc);
          return `<button class="pop-nearby-btn" onclick="focusLocality(${locIdx})">${loc.name} <span class="pop-nearby-count">${loc.count}</span></button>`;
        }).join('') +
        `</div>`;
      nearbyEl.style.display = '';
    } else if (item.nearby && item.nearby.length) {
      nearbyEl.innerHTML =
        `<div class="pop-nearby-label">Nearby localities</div>` +
        `<div class="pop-nearby-list">` +
        item.nearby.slice(0, 8).map(n => {
          const nIdx = locDataArr.indexOf(n);
          return `<button class="pop-nearby-btn" onclick="focusLocality(${nIdx})">${n.name} <span class="pop-nearby-count">${n.count}</span></button>`;
        }).join('') +
        `</div>`;
      nearbyEl.style.display = '';
    } else {
      nearbyEl.style.display = 'none';
    }
  }

  const btn = document.getElementById('pop-explore-btn');
  if (btn) {
    btn.textContent = isCluster ? 'Explore all fish from this area →' : 'Explore all fish from here →';
    btn.onclick = isCluster
      ? () => exploreLocalities(item.locs.map(l => l.name))
      : () => exploreLocality(item.locs[0].name);
  }

  document.getElementById('locality-popover').classList.add('visible');
}

function closePopover() {
  document.getElementById('locality-popover').classList.remove('visible');
  document.querySelectorAll('.locality-item').forEach(el => el.classList.remove('active'));
}

// ── Sidebar list ──────────────────────────────────
function renderLocalityList() {
  const el = document.getElementById('locality-list');
  if (!el || !locDataArr.length) return;
  el.innerHTML = locDataArr.slice(0, 60).map((l, i) => `
    <div class="locality-item" onclick="focusLocality(${i})">
      <div class="locality-dot" style="background:hsl(${l.hue},70%,55%)"></div>
      <div class="locality-info">
        <div class="locality-name">${l.name}</div>
        <div class="locality-count">${l.count} fish</div>
      </div>
      <div class="locality-arrow">›</div>
    </div>`).join('');
}

function buildLocalityFish() {} // no-op
