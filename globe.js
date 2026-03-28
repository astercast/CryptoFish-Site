// ================================================
// CryptoFish — globe.js
// Three.js interactive 3D globe
// ================================================

let globeInitialized = false;
let globeGroup, globeCamera, globeRenderer, globeScene;
let globeAnimFrame;

function latLonToXYZ(lat, lon, r) {
  const phi   = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

function initGlobe() {
  if (globeInitialized) return;
  globeInitialized = true;

  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const W = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || 800;
  const H = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 600;

  globeScene = new THREE.Scene();
  globeCamera = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000);
  globeCamera.position.z = 2.6;

  globeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  globeRenderer.setSize(W, H);
  globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  globeRenderer.setClearColor(0x000000, 0);

  globeGroup = new THREE.Group();
  globeScene.add(globeGroup);

  // Globe sphere
  const sphereGeo = new THREE.SphereGeometry(1, 72, 72);
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0xc8dce8, emissive: 0x0a1a2a, emissiveIntensity: 0.25,
    shininess: 12, transparent: true, opacity: 0.96,
  });
  globeGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

  // Grid lines
  const gridMat = new THREE.LineBasicMaterial({ color: 0x9ab8cc, transparent: true, opacity: 0.18 });
  for (let lat = -75; lat <= 75; lat += 15) {
    const pts = [];
    for (let lon = 0; lon <= 360; lon += 4) pts.push(latLonToXYZ(lat, lon, 1.002));
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }
  for (let lon = 0; lon < 360; lon += 15) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 4) pts.push(latLonToXYZ(lat, lon, 1.002));
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }

  // Atmosphere
  const atmGeo = new THREE.SphereGeometry(1.08, 48, 48);
  const atmMat = new THREE.MeshPhongMaterial({ color: 0xb8d8f0, emissive: 0x6ab0d8, emissiveIntensity: 0.08, transparent: true, opacity: 0.08, side: THREE.BackSide });
  globeScene.add(new THREE.Mesh(atmGeo, atmMat));

  // Lighting
  globeScene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(4, 2, 4);
  globeScene.add(sun);
  const fill = new THREE.DirectionalLight(0x8cc8e8, 0.3);
  fill.position.set(-3, -1, -2);
  globeScene.add(fill);

  // Locality dots + pulse rings
  const dotMeshes = [];
  LOCALITIES.forEach((loc, i) => {
    const radius = 0.022 + Math.sqrt(loc.count / 10000) * 0.06;
    const color  = new THREE.Color(loc.color);
    const dot    = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 10, 10),
      new THREE.MeshBasicMaterial({ color })
    );
    dot.position.copy(latLonToXYZ(loc.lat, loc.lon, 1.03));
    dot.userData.localityIndex = i;
    globeGroup.add(dot);
    dotMeshes.push(dot);

    // Pulse ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 1.5, radius * 2.0, 20),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    ring.position.copy(latLonToXYZ(loc.lat, loc.lon, 1.032));
    ring.lookAt(ring.position.clone().multiplyScalar(2));
    dot.userData.ring = ring;
    globeGroup.add(ring);
  });

  // Interaction state
  let mouseDown = false, isDragging = false;
  let prevX = 0, prevY = 0;
  let autoRotate = true;
  let autoRotateTimer;

  const resumeAuto = () => {
    clearTimeout(autoRotateTimer);
    autoRotateTimer = setTimeout(() => { autoRotate = true; }, 3500);
  };

  canvas.addEventListener('mousedown', e => {
    mouseDown = true; isDragging = false;
    prevX = e.clientX; prevY = e.clientY;
    autoRotate = false;
  });
  window.addEventListener('mousemove', e => {
    if (!mouseDown) return;
    const dx = e.clientX - prevX, dy = e.clientY - prevY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging = true;
    globeGroup.rotation.y += dx * 0.007;
    globeGroup.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeGroup.rotation.x + dy * 0.004));
    prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('mouseup', () => { mouseDown = false; resumeAuto(); });

  // Touch
  let tx = 0, ty = 0;
  canvas.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; autoRotate = false; }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
    globeGroup.rotation.y += dx * 0.007;
    globeGroup.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeGroup.rotation.x + dy * 0.004));
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchend', resumeAuto);

  // Zoom
  canvas.addEventListener('wheel', e => {
    globeCamera.position.z = Math.max(1.6, Math.min(4.5, globeCamera.position.z + e.deltaY * 0.003));
    e.preventDefault();
  }, { passive: false });

  // Click on dot
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  canvas.addEventListener('click', e => {
    if (isDragging) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, globeCamera);
    const hits = raycaster.intersectObjects(dotMeshes);
    if (hits.length) focusLocality(hits[0].object.userData.localityIndex);
    else closePopover();
  });

  // Resize
  window.addEventListener('resize', () => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    if (w && h) { globeCamera.aspect = w/h; globeCamera.updateProjectionMatrix(); globeRenderer.setSize(w, h); }
  });

  // Animate
  let tick = 0;
  function animate() {
    globeAnimFrame = requestAnimationFrame(animate);
    tick += 0.012;
    if (autoRotate) globeGroup.rotation.y += 0.0015;
    dotMeshes.forEach((dot, i) => {
      if (dot.userData.ring) dot.userData.ring.material.opacity = 0.18 + Math.sin(tick + i * 0.9) * 0.14;
    });
    globeRenderer.render(globeScene, globeCamera);
  }
  animate();

  renderLocalityList();
}

function focusLocality(idx) {
  const loc = LOCALITIES[idx];
  document.querySelectorAll('.locality-item').forEach((el, i) => el.classList.toggle('active', i === idx));
  const items = document.querySelectorAll('.locality-item');
  if (items[idx]) items[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showPopover(loc);
}

function showPopover(loc) {
  document.getElementById('pop-title').textContent = loc.name;
  document.getElementById('pop-sub').textContent   = loc.sub + ' · ' + loc.count + ' CryptoFish';
  document.getElementById('pop-fish').innerHTML    = loc.fish.map(f =>
    `<div class="popover-fish">${f}</div>`).join('');
  const exploreBtn = document.getElementById('pop-explore-btn');
  if (exploreBtn) exploreBtn.onclick = () => exploreLocality(loc.name);
  document.getElementById('locality-popover').classList.add('visible');
}

function closePopover() {
  document.getElementById('locality-popover').classList.remove('visible');
  document.querySelectorAll('.locality-item').forEach(el => el.classList.remove('active'));
}

function renderLocalityList() {
  const el = document.getElementById('locality-list');
  if (!el) return;
  el.innerHTML = LOCALITIES.map((l, i) => `
    <div class="locality-item" onclick="focusLocality(${i})">
      <div class="locality-dot" style="background:${l.color}"></div>
      <div class="locality-info">
        <div class="locality-name">${l.name}</div>
        <div class="locality-count">${l.count} fish · ${l.sub.split(',')[0]}</div>
      </div>
      <div class="locality-arrow">›</div>
    </div>`).join('');
}
