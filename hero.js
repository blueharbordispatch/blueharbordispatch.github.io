/* ==========================================================
   BLUE HARBOR DISPATCH — HERO GLOBE
   Interactive 3D globe: drag to rotate, scroll/pinch to zoom,
   glowing USA outline with trucks animating between hub cities.
   ========================================================== */

(function () {

  const container = document.getElementById("hero-globe");
  if (!container || typeof THREE === "undefined") return;

  /* ---------------- Basic scene setup ---------------- */

  const RADIUS = 150;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    1,
    2000
  );
  camera.position.set(0, 0, 430);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  /* ---------------- Lat/Lon → 3D helper ---------------- */

  function toVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  /* ---------------- Glow dot sprite texture ---------------- */

  function makeDotTexture(color) {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");

    const grd = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    grd.addColorStop(0, color);
    grd.addColorStop(0.4, color);
    grd.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(c);
  }

  const dotTextureBlue = makeDotTexture("rgba(125,183,255,0.95)");
  const dotTextureAmber = makeDotTexture("rgba(244,163,0,0.95)");

  /* ---------------- Wireframe globe shell ---------------- */

  const shellGeo = new THREE.SphereGeometry(RADIUS, 28, 20);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0x2f6bd6,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  globeGroup.add(shell);

  // Soft inner fill so the globe reads as a solid form, not just wires
  const fillGeo = new THREE.SphereGeometry(RADIUS * 0.985, 32, 32);
  const fillMat = new THREE.MeshBasicMaterial({
    color: 0x0a1a3a,
    transparent: true,
    opacity: 0.55
  });
  globeGroup.add(new THREE.Mesh(fillGeo, fillMat));

  // Outer atmosphere glow
  const glowGeo = new THREE.SphereGeometry(RADIUS * 1.06, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x3f7fe0,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide
  });
  globeGroup.add(new THREE.Mesh(glowGeo, glowMat));

  /* ---------------- Continent outlines (stylized, low-res) ---------------- */

  const continents = {
    northAmericaContext: [
      [60, -150], [70, -140], [68, -100], [60, -80], [50, -60],
      [45, -65], [30, -85], [18, -95], [20, -105], [30, -115],
      [40, -124], [55, -130], [60, -150]
    ],
    southAmerica: [
      [10, -75], [5, -52], [-5, -35], [-20, -40], [-34, -58],
      [-40, -73], [-18, -70], [0, -80], [10, -75]
    ],
    europe: [
      [60, 5], [55, 20], [45, 15], [38, -9], [43, -5], [50, 0], [60, 5]
    ],
    africa: [
      [35, -6], [30, 32], [0, 42], [-25, 32], [-34, 18],
      [-5, 10], [10, -15], [35, -6]
    ],
    asia: [
      [55, 60], [70, 100], [50, 140], [20, 110], [5, 100],
      [25, 70], [40, 50], [55, 60]
    ],
    australia: [
      [-12, 130], [-20, 145], [-35, 150], [-38, 140],
      [-32, 115], [-20, 120], [-12, 130]
    ]
  };

  // Contiguous USA — the highlighted outline
  const usaOutline = [
    [49, -123], [48, -124], [46, -124], [42, -124], [38, -123],
    [34, -120], [32.5, -117], [31, -114], [31.5, -111], [31.8, -106],
    [29.8, -101], [28, -97], [26, -97], [29, -94], [30, -89],
    [30.4, -87], [25, -80.5], [27, -80], [32, -80.9], [36, -76],
    [39, -75], [40.7, -74], [41.5, -71], [43, -70], [45, -67],
    [45, -71], [45, -83], [46.5, -84.5], [48, -89.5], [49, -95],
    [49, -110], [49, -123]
  ];

  function interpolatePoints(coords, segments) {
    const pts = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const [lat1, lon1] = coords[i];
      const [lat2, lon2] = coords[i + 1];
      for (let s = 0; s < segments; s++) {
        const t = s / segments;
        pts.push([lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t]);
      }
    }
    return pts;
  }

  function addDotOutline(coords, segments, size, texture, radiusMult) {
    const pts = interpolatePoints(coords, segments);
    const geo = new THREE.BufferGeometry();
    const positions = [];

    pts.forEach(([lat, lon]) => {
      const v = toVector3(lat, lon, RADIUS * radiusMult);
      positions.push(v.x, v.y, v.z);
    });

    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const mat = new THREE.PointsMaterial({
      size: size,
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    globeGroup.add(new THREE.Points(geo, mat));
  }

  // Faint context dots for the rest of the world
  Object.values(continents).forEach((coords) => {
    addDotOutline(coords, 6, 3.2, dotTextureBlue, 1.01);
  });

  // Bright amber outline for the USA — the star of the globe
  addDotOutline(usaOutline, 4, 5, dotTextureAmber, 1.015);

  /* ---------------- Hub cities + animated truck routes ---------------- */

  const hubs = {
    seattle: [47.61, -122.33],
    la: [34.05, -118.24],
    denver: [39.74, -104.99],
    dallas: [32.78, -96.8],
    chicago: [41.88, -87.63],
    atlanta: [33.75, -84.39],
    nyc: [40.71, -74.0],
    miami: [25.76, -80.19],
    houston: [29.76, -95.37]
  };

  const routes = [
    ["seattle", "la"],
    ["la", "dallas"],
    ["dallas", "chicago"],
    ["chicago", "nyc"],
    ["nyc", "atlanta"],
    ["atlanta", "miami"],
    ["dallas", "houston"],
    ["houston", "atlanta"],
    ["denver", "chicago"],
    ["denver", "la"]
  ];

  const trucks = [];

  function buildArc(latlon1, latlon2) {
    const p1 = toVector3(latlon1[0], latlon1[1], RADIUS * 1.02);
    const p2 = toVector3(latlon2[0], latlon2[1], RADIUS * 1.02);

    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const liftAmount = p1.distanceTo(p2) * 0.35;
    mid.normalize().multiplyScalar(RADIUS * 1.02 + liftAmount);

    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const points = curve.getPoints(48);

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xf4a300,
      transparent: true,
      opacity: 0.35
    });

    globeGroup.add(new THREE.Line(geo, mat));

    return curve;
  }

  routes.forEach(([a, b], i) => {
    const curve = buildArc(hubs[a], hubs[b]);

    const spriteMat = new THREE.SpriteMaterial({
      map: dotTextureAmber,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(9, 9, 1);
    globeGroup.add(sprite);

    trucks.push({
      curve: curve,
      sprite: sprite,
      t: i / routes.length,
      speed: 0.00035 + Math.random() * 0.0002
    });
  });

  /* ---------------- Interaction: drag to rotate, wheel/pinch to zoom ---------------- */

  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  let velocityX = 0.0012;
  let velocityY = 0;
  let idleTimer = null;
  let autoRotate = true;

  const MIN_ZOOM = 260;
  const MAX_ZOOM = 620;

  function setIdleTimer() {
    autoRotate = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      autoRotate = true;
    }, 2200);
  }

  function onPointerDown(x, y) {
    isDragging = true;
    prevX = x;
    prevY = y;
    setIdleTimer();
  }

  function onPointerMove(x, y) {
    if (!isDragging) return;

    const deltaX = x - prevX;
    const deltaY = y - prevY;

    velocityX = deltaX * 0.0006;
    velocityY = deltaY * 0.0006;

    globeGroup.rotation.y += velocityX * 2;
    globeGroup.rotation.x += velocityY * 2;

    globeGroup.rotation.x = Math.max(
      Math.min(globeGroup.rotation.x, 0.9),
      -0.9
    );

    prevX = x;
    prevY = y;
    setIdleTimer();
  }

  function onPointerUp() {
    isDragging = false;
  }

  // Mouse
  renderer.domElement.addEventListener("mousedown", (e) => {
    onPointerDown(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", (e) => {
    onPointerMove(e.clientX, e.clientY);
  });
  window.addEventListener("mouseup", onPointerUp);

  // Touch
  renderer.domElement.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  renderer.domElement.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        // pinch to zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (renderer._lastPinch) {
          const delta = dist - renderer._lastPinch;
          camera.position.z = Math.max(
            MIN_ZOOM,
            Math.min(MAX_ZOOM, camera.position.z - delta * 0.6)
          );
        }
        renderer._lastPinch = dist;
        setIdleTimer();
      }
    },
    { passive: true }
  );

  renderer.domElement.addEventListener("touchend", () => {
    isDragging = false;
    renderer._lastPinch = null;
  });

  // Scroll wheel to zoom (only when hovering the globe)
  container.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      camera.position.z = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, camera.position.z + e.deltaY * 0.5)
      );
      setIdleTimer();
    },
    { passive: false }
  );

  /* ---------------- Resize ---------------- */

  function handleResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener("resize", handleResize);

  /* ---------------- Animate ---------------- */

  function animate() {
    requestAnimationFrame(animate);

    if (autoRotate && !isDragging) {
      globeGroup.rotation.y += 0.0012;
    } else if (!isDragging) {
      globeGroup.rotation.y += velocityX;
      globeGroup.rotation.x += velocityY;
      velocityX *= 0.94;
      velocityY *= 0.94;
    }

    trucks.forEach((truck) => {
      truck.t += truck.speed;
      if (truck.t > 1) truck.t = 0;

      const pos = truck.curve.getPoint(truck.t);
      truck.sprite.position.copy(pos);
    });

    renderer.render(scene, camera);
  }

  animate();
  handleResize();
})();