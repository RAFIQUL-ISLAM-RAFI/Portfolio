/* ============================================================
   Hero 3D Scene — Three.js
   Wireframe icosahedron core + drifting particle field.
   Reacts subtly to mouse movement. Respects reduced-motion
   and scales down on small / low-power screens.
============================================================ */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 720;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight || 1,
    0.1,
    100
  );
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  /* ---------- Lighting ---------- */
  const ambient = new THREE.AmbientLight(0x8899ff, 0.6);
  scene.add(ambient);

  const key = new THREE.PointLight(0x3ee8ff, 2.2, 30);
  key.position.set(4, 3, 6);
  scene.add(key);

  const rim = new THREE.PointLight(0xa35bff, 1.8, 30);
  rim.position.set(-5, -2, -4);
  scene.add(rim);

  /* ---------- Core: layered icosahedron ---------- */
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  const outerGeo = new THREE.IcosahedronGeometry(2.1, 1);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x0d1120,
    wireframe: true,
    emissive: 0x3ee8ff,
    emissiveIntensity: 0.35,
    metalness: 0.4,
    roughness: 0.3,
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  coreGroup.add(outerMesh);

  const innerGeo = new THREE.IcosahedronGeometry(1.35, 0);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d18,
    wireframe: true,
    emissive: 0xa35bff,
    emissiveIntensity: 0.5,
    metalness: 0.3,
    roughness: 0.4,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  coreGroup.add(innerMesh);

  // subtle solid glass core
  const glassGeo = new THREE.IcosahedronGeometry(0.85, 2);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x101425,
    transparent: true,
    opacity: 0.35,
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.4,
    emissive: 0x5b7fff,
    emissiveIntensity: 0.25,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  coreGroup.add(glassMesh);

  coreGroup.position.set(2.2, 0, 0);

  /* ---------- Orbiting nodes (developer symbols as small octa) ---------- */
  const nodeGroup = new THREE.Group();
  coreGroup.add(nodeGroup);
  const nodeCount = isMobile ? 3 : 5;
  const nodeColors = [0x3ee8ff, 0x5b7fff, 0xa35bff, 0x3ee8ff, 0x5b7fff];
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    const geo = new THREE.OctahedronGeometry(0.14, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: nodeColors[i % nodeColors.length],
      emissive: nodeColors[i % nodeColors.length],
      emissiveIntensity: 0.9,
      roughness: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const angle = (i / nodeCount) * Math.PI * 2;
    const radius = 2.9;
    mesh.userData = { angle, radius, speed: 0.15 + i * 0.02, tiltSpeed: 0.6 + i * 0.1 };
    nodeGroup.add(mesh);
    nodes.push(mesh);
  }

  /* ---------- Particle field ---------- */
  const particleCount = isMobile ? 140 : 380;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x8fd8ff,
    size: 0.03,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ---------- Mouse parallax ---------- */
  let targetX = 0, targetY = 0;
  let mouseX = 0, mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', resize);

  /* ---------- Animation loop ---------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      coreGroup.rotation.y = t * 0.15 + mouseX * 0.3;
      coreGroup.rotation.x = t * 0.08 + mouseY * 0.2;
      innerMesh.rotation.y = -t * 0.25;
      innerMesh.rotation.x = t * 0.12;
      glassMesh.rotation.y = t * 0.35;

      nodes.forEach((n) => {
        const { angle, radius, speed, tiltSpeed } = n.userData;
        const a = angle + t * speed;
        n.position.set(Math.cos(a) * radius, Math.sin(a * 0.6) * 0.8, Math.sin(a) * radius);
        n.rotation.x = t * tiltSpeed;
        n.rotation.y = t * tiltSpeed;
      });

      particles.rotation.y = t * 0.015;
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.02;
      camera.lookAt(coreGroup.position);
    } else {
      coreGroup.rotation.y = 0.4;
      coreGroup.rotation.x = 0.15;
    }

    renderer.render(scene, camera);
  }
  animate();
})();
