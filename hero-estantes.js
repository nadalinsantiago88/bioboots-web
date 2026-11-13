// <hero-estantes brand="Bio Boots"> · Hero "estantes por marca" (three.js)
(function () {
  if (customElements.get('hero-estantes')) return;
  const V = '0.186.1', CDN = (p) => `https://cdn.jsdelivr.net/npm/three@${V}/${p}/+esm`;

  const CSS = `
  :host { display: block; }
  .he { --he-bg:#050506; --he-cream:#efe6d3; --he-white:#fbf8f1; --he-glow:#ffd9a8;
    position:relative; height:100svh; min-height:620px; overflow:hidden; background:var(--he-bg);
    color:var(--he-cream); font-family:'Saira',system-ui,sans-serif; isolation:isolate; -webkit-tap-highlight-color:transparent; }
  .he-canvas { position:absolute; inset:0; width:100%; height:100%; display:block; touch-action:pan-y; }
  .he-vignette { position:absolute; inset:0; pointer-events:none; z-index:1;
    background: radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%),
      linear-gradient(to bottom, rgba(5,5,6,.35), transparent 22%, transparent 78%, rgba(5,5,6,.6)); }
  .he-title { position:absolute; left:0; right:0; top:clamp(96px,12vh,140px); margin:0; z-index:2; text-align:center;
    font-weight:200; font-size:clamp(3.1rem,10.2vw,8.8rem); line-height:.9; letter-spacing:.07em; text-transform:uppercase;
    color:var(--he-cream); pointer-events:none; user-select:none; white-space:nowrap; }
  .he-title .he-ch { display:inline-block; opacity:0; transform:translateY(.25em);
    animation:he-in 1.1s cubic-bezier(.2,.7,.1,1) forwards; animation-delay:calc(var(--i) * 70ms + 150ms); }
  .he-title .he-sp { display:inline-block; width:.32em; }
  @keyframes he-in { to { opacity:1; transform:none; } }
  .he-tagline { position:absolute; left:16px; right:16px; bottom:clamp(26px,6.5vh,70px); margin:0; z-index:2;
    display:flex; align-items:center; justify-content:center; gap:1.1em; text-align:center; font-weight:300;
    font-size:clamp(.74rem,1.25vw,1rem); letter-spacing:.38em; text-transform:uppercase; color:var(--he-cream);
    opacity:0; animation:he-fade 1.4s ease 1.5s forwards; }
  .he-tagline::before, .he-tagline::after { content:""; height:1px; width:clamp(24px,6vw,72px);
    background:linear-gradient(90deg, transparent, rgba(239,230,211,.55)); }
  .he-tagline::after { transform:scaleX(-1); }
  @keyframes he-fade { to { opacity:.88; } }
  .he-labels { position:absolute; inset:0; z-index:3; pointer-events:none; }
  .he-label { position:absolute; left:0; top:0; display:flex; flex-direction:column; align-items:center; gap:.35em;
    padding:.5em .9em; transform:translate(-50%,0); color:var(--he-cream); text-decoration:none; pointer-events:auto;
    outline:none; opacity:0; transition:opacity .6s ease; }
  .he.is-ready .he-label { opacity:1; }
  .he-label-marca { font-weight:400; font-size:clamp(.72rem,.95vw,.9rem); letter-spacing:.34em; text-transform:uppercase;
    opacity:.55; transition:opacity .35s ease, letter-spacing .5s ease, color .35s ease; }
  .he-label-cta { font-weight:300; font-size:.72rem; letter-spacing:.18em; text-transform:uppercase; color:var(--he-glow);
    opacity:0; transform:translateY(-4px); transition:opacity .35s ease, transform .35s ease; }
  .he-label.is-active .he-label-marca { opacity:1; color:var(--he-white); letter-spacing:.42em; }
  .he-label.is-active .he-label-cta { opacity:.95; transform:none; }
  .he-label:focus-visible .he-label-marca { text-decoration:underline; text-underline-offset:.5em; }
  .he.is-hovering .he-canvas { cursor:pointer; }
  @media (hover: none) { .he-label-marca { opacity:.9; } .he-label-cta { opacity:.75; transform:none; } }
  .he.no-webgl .he-labels { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:12px; padding:0 16px; }
  .he.no-webgl .he-label { position:static; transform:none; opacity:1; border:1px solid rgba(239,230,211,.25); border-radius:999px; }
  @media (prefers-reduced-motion: reduce) { .he-title .he-ch, .he-tagline { animation-duration:.01s; animation-delay:0s; } }`;

  class HeroEstantes extends HTMLElement {
    static get observedAttributes() { return ['brand']; }
    set brand(v) { this._brand = v; this._setTitle && this._setTitle(v); }
    get brand() { return this._brand || this.getAttribute('brand') || 'Bio Boots'; }
    attributeChangedCallback() { this._setTitle && this._setTitle(this.getAttribute('brand')); }
    connectedCallback() {
      if (this._started) return; this._started = true;
      const sh = this.attachShadow({ mode: 'open' });
      sh.innerHTML = `<style>${CSS}</style>
        <section class="he" aria-labelledby="he-title">
          <canvas class="he-canvas" aria-hidden="true"></canvas>
          <div class="he-vignette" aria-hidden="true"></div>
          <h1 class="he-title" id="he-title"></h1>
          <nav class="he-labels" aria-label="Elegí tu marca"></nav>
          <p class="he-tagline">Tu rendimiento, nuestra responsabilidad</p>
        </section>`;
      start(this, sh.querySelector('.he')).catch((e) => { console.warn('[hero] 3D no disponible', e); sh.querySelector('.he').classList.add('no-webgl', 'is-ready'); });
    }
  }
  customElements.define('hero-estantes', HeroEstantes);

  async function start(host, root) {
    const CONFIG = {
      catalogo: '#catalogo',
      puntaHacia: 'izquierda',
      marcas: [
        { id: 'nike',   nombre: 'Nike',   modelo: '', imagen: 'img/hero/botin-nike.webp', rotY: 0, color: '#e2466e', suela: '#f4efe6', tapones: '#f4efe6' },
        { id: 'adidas', nombre: 'Adidas', modelo: '', imagen: 'img/hero/botin-adidas.webp', rotY: 0, color: '#eeebe4', suela: '#141414', tapones: '#141414' },
        { id: 'puma',   nombre: 'Puma',   modelo: '', imagen: 'img/hero/botin-puma.webp', rotY: 0, color: '#f0a23a', suela: '#1b1b1b', tapones: '#e9e4da' },
        { id: 'mizuno', nombre: 'Mizuno', modelo: '', imagen: 'img/hero/botin-mizuno.webp', rotY: 0, color: '#2a55c9', suela: '#f1ede4', tapones: '#f1ede4' },
      ],
    };
    const canvas = root.querySelector('.he-canvas');
    const labelsEl = root.querySelector('.he-labels');
    const titleEl = root.querySelector('.he-title');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(hover: none)').matches;

    // Título (se arma antes de cargar three para que aparezca enseguida)
    const chars = [];
    host._setTitle = (txt) => {
      txt = String(txt || 'Bio Boots').trim();
      titleEl.textContent = ''; titleEl.setAttribute('aria-label', txt); chars.length = 0;
      [...txt].forEach((c, i) => {
        const s = document.createElement('span');
        if (c === ' ') { s.className = 'he-sp'; titleEl.appendChild(s); return; }
        s.className = 'he-ch'; s.style.setProperty('--i', i); s.textContent = c; s.setAttribute('aria-hidden', 'true');
        titleEl.appendChild(s); chars.push({ el: s, p: 0 });
      });
    };
    host._setTitle(host.brand);

    // Links de marca
    let labelHover = -1;
    function irAMarca(m, ev) {
      const evento = new CustomEvent('bioboots:marca', { detail: { id: m.id, nombre: m.nombre }, bubbles: true, composed: true, cancelable: true });
      if (!host.dispatchEvent(evento)) { ev && ev.preventDefault(); return; }
      const destino = document.querySelector(`${CONFIG.catalogo}-${m.id}`) || document.querySelector(CONFIG.catalogo);
      if (destino) { ev && ev.preventDefault(); window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY - 80, behavior: reduceMotion ? 'auto' : 'smooth' }); }
    }
    const labels = CONFIG.marcas.map((m, i) => {
      const a = document.createElement('a');
      a.className = 'he-label'; a.href = `${CONFIG.catalogo}`;
      a.innerHTML = `<span class="he-label-marca">${m.nombre}</span><span class="he-label-cta">Ver botines</span>`;
      a.setAttribute('aria-label', `Ver botines ${m.nombre} en el catálogo`);
      a.addEventListener('click', (e) => irAMarca(m, e));
      a.addEventListener('pointerenter', () => { labelHover = i; });
      a.addEventListener('pointerleave', () => { if (labelHover === i) labelHover = -1; });
      a.addEventListener('focus', () => { labelHover = i; });
      a.addEventListener('blur', () => { if (labelHover === i) labelHover = -1; });
      labelsEl.appendChild(a);
      return a;
    });

    const [THREE, { GLTFLoader }, { DRACOLoader }, { RoomEnvironment }, { EffectComposer }, { RenderPass }, { OutputPass }, { mergeVertices }] = await Promise.all([
      import(`https://cdn.jsdelivr.net/npm/three@${V}/+esm`),
      import(CDN('examples/jsm/loaders/GLTFLoader.js')),
      import(CDN('examples/jsm/loaders/DRACOLoader.js')),
      import(CDN('examples/jsm/environments/RoomEnvironment.js')),
      import(CDN('examples/jsm/postprocessing/EffectComposer.js')),
      import(CDN('examples/jsm/postprocessing/RenderPass.js')),
      import(CDN('examples/jsm/postprocessing/OutputPass.js')),
      import(CDN('examples/jsm/utils/BufferGeometryUtils.js')),
    ]);

    // Título: letras que reaccionan a la luz del cursor
    const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, activo: false, ultimo: -1e9 };
    root.addEventListener('pointermove', (e) => {
      const r = root.getBoundingClientRect();
      pointer.x = e.clientX; pointer.y = e.clientY;
      pointer.nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      pointer.activo = e.pointerType === 'mouse';
      pointer.ultimo = performance.now();
    });
    root.addEventListener('pointerleave', () => { pointer.activo = false; pointer.x = pointer.y = -9999; });
    const cream = [239, 230, 211], white = [255, 250, 240];
    function actualizarTitulo(t, dt) {
      const tr = titleEl.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(titleEl).fontSize);
      const R = fs * 1.5;
      let px = pointer.x, py = pointer.y;
      const quieto = !pointer.activo || performance.now() - pointer.ultimo > 3500;
      if (quieto) {
        const ciclo = (t % 7) / 3.2;
        px = ciclo <= 1 ? tr.left - R + (tr.width + 2 * R) * ciclo : -9999;
        py = tr.top + tr.height / 2;
      }
      for (const c of chars) {
        const r = c.el.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), (py - (r.top + r.height / 2)) * 1.4);
        const target = 1 - THREE.MathUtils.smoothstep(d, 0, R);
        c.p = THREE.MathUtils.damp(c.p, target, 9, dt);
        const p = c.p;
        const col = cream.map((v, k) => Math.round(v + (white[k] - v) * p));
        c.el.style.fontWeight = Math.round(200 + 520 * p);
        c.el.style.color = `rgb(${col})`;
        c.el.style.textShadow = p > 0.01 ? `0 0 ${(0.35 * p).toFixed(3)}em rgba(255,226,186,${(0.55 * p).toFixed(3)})` : 'none';
        if (c.el.getAnimations().length === 0) c.el.style.transform = `translateY(${(-0.05 * p).toFixed(4)}em)`;
      }
    }

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); }
    catch (err) { root.classList.add('no-webgl', 'is-ready'); }

    if (renderer) iniciar3D();
    else {
      const timer = new THREE.Timer(); timer.connect(document);
      (function loop() { timer.update(); actualizarTitulo(timer.getElapsed(), timer.getDelta()); requestAnimationFrame(loop); })();
    }

    function iniciar3D() {
      const DPR = Math.min(window.devicePixelRatio, coarse ? 1.5 : 1.75);
      renderer.setPixelRatio(DPR);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050506);
      const bgTex = new THREE.TextureLoader().load(new URL('img/hero/fondo-satin.webp', document.baseURI).href, () => layout());
      bgTex.colorSpace = THREE.SRGBColorSpace;
      scene.background = bgTex;
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      scene.environment = pmrem.fromScene(room, 0.04).texture;
      scene.environmentIntensity = 0.14;
      room.dispose(); pmrem.dispose();

      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);

      const WALL_Z = -0.62, SHELF_D = 0.46, BOOT_Z = WALL_Z + SHELF_D / 2;
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 24),
        new THREE.ShadowMaterial({ opacity: 0.55 }));
      wall.position.z = WALL_Z; wall.receiveShadow = true; scene.add(wall);



      scene.add(new THREE.HemisphereLight(0xffd2a0, 0x050505, 0.06));
      const rim = new THREE.DirectionalLight(0xffcf9a, 0.8);
      rim.position.set(-2.5, 2.2, -3.5); scene.add(rim);
      const cursorLight = new THREE.PointLight(0xffbe7a, 0, 3.2, 2);
      cursorLight.position.set(0, 0, 0.25); scene.add(cursorLight);

      const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xcfd8d8, roughness: 0.06, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.3, depthWrite: false });
      const edgeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xd9e6e2).multiplyScalar(0.55) });
      const shelfGeo = new THREE.BoxGeometry(1.34, 0.028, SHELF_D);
      const edgeGeo = new THREE.BoxGeometry(1.34, 0.028, 0.004);
      const barGeo = new THREE.BoxGeometry(1.2, 0.01, 0.018);
      const hitGeo = new THREE.BoxGeometry(1.34, 0.95, SHELF_D + 0.1);
      const stripGeo = new THREE.BoxGeometry(0.82, 0.006, 0.006);

      const haloMat = (intensity) => new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0xffc98a) }, uI: { value: intensity } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
          uniform vec3 uColor; uniform float uI; varying vec2 vUv;
          void main(){
            vec2 p = (vUv - 0.5) * 2.0;
            float d = length(p * vec2(1.0, 1.9));
            float a = exp(-d * d * 4.0) * smoothstep(1.0, 0.0, d);
            gl_FragColor = vec4(uColor * a * uI, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });

      const LAMP_Y = 0.78, CONE_H = 0.86, SPOT_ANGLE = 0.62;
      const coneGeo = new THREE.ConeGeometry(Math.tan(SPOT_ANGLE) * CONE_H, CONE_H, 48, 1, true);
      const coneMat = () => new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0xffb866) }, uI: { value: 0 }, uH: { value: CONE_H } },
        vertexShader: `
          uniform float uH; varying vec3 vN; varying vec3 vV; varying float vH;
          void main(){
            vH = position.y / uH + 0.5;
            vec4 mv = modelViewMatrix * vec4(position,1.0);
            vN = normalize(normalMatrix * normal); vV = -mv.xyz;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform vec3 uColor; uniform float uI; varying vec3 vN; varying vec3 vV; varying float vH;
          void main(){
            float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.5);
            float a = f * pow(vH, 1.6) * smoothstep(1.0, 0.93, vH);
            gl_FragColor = vec4(uColor * a * uI, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      });

      const items = CONFIG.marcas.map((m, i) => {
        const g = new THREE.Group(); scene.add(g);
        const shelf = new THREE.Mesh(shelfGeo, glassMat);
        shelf.position.set(0, -0.014, BOOT_Z); shelf.receiveShadow = true; g.add(shelf);
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.position.set(0, -0.014, WALL_Z + SHELF_D + 0.002); g.add(edge);
        const barMat = new THREE.MeshBasicMaterial({ color: 0xffc98a });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(0, -0.05, WALL_Z + SHELF_D - 0.05); g.add(bar);
        const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), haloMat(0));
        halo.position.set(0, -0.18, WALL_Z + 0.002); g.add(halo);
        const spot = new THREE.SpotLight(0xffaa5c, 0, 3, SPOT_ANGLE, 0.75, 2);
        spot.position.set(0, LAMP_Y - 0.01, BOOT_Z + 0.06);
        spot.target.position.set(0, 0.12, BOOT_Z);
        spot.castShadow = true;
        spot.shadow.mapSize.set(coarse ? 512 : 1024, coarse ? 512 : 1024);
        spot.shadow.bias = -0.0004; spot.shadow.normalBias = 0.02;
        g.add(spot, spot.target);
        const cone = new THREE.Mesh(coneGeo, coneMat());
        cone.visible = false; g.add(cone);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffb060 });
        const bulb = new THREE.Mesh(stripGeo, bulbMat); bulb.position.set(0, LAMP_Y, BOOT_Z - 0.04); g.add(bulb);
        const stripGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.26), haloMat(0));
        stripGlow.position.set(0, LAMP_Y, WALL_Z + 0.003); g.add(stripGlow);
        const hit = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial());
        hit.visible = false; hit.position.set(0, 0.42, BOOT_Z); hit.userData.index = i; g.add(hit);
        const holder = new THREE.Group(); holder.position.set(0, 0, BOOT_Z); g.add(holder);
        const pose = new THREE.Group(); holder.add(pose);
        const placeholder = crearBotinProvisorio(m);
        pose.add(placeholder);
        cargarProducto(m, pose, placeholder);
        return { m, g, holder, pose, bar, barMat, halo, spot, cone, hit, bulbMat, stripGlow, h: 0, on: reduceMotion ? 1 : 0 };
      });
      const hits = items.map((it) => it.hit);

      const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
      const composer = new EffectComposer(renderer, rt);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new OutputPass());


      const view = { center: new THREE.Vector3(), dist: 8, mobile: false };
      function layout() {
        const w = root.clientWidth, h = root.clientHeight; if (!w || !h) return;
        renderer.setSize(w, h, false); composer.setSize(w, h);
        camera.aspect = w / h; camera.updateProjectionMatrix();
        if (bgTex.image) { const ia = bgTex.image.width / bgTex.image.height, a = w / h;
          if (a > ia) { bgTex.repeat.set(1, ia / a); bgTex.offset.set(0, (1 - ia / a) / 2); } else { bgTex.repeat.set(a / ia, 1); bgTex.offset.set((1 - a / ia) / 2, 0); } }
        const mobile = camera.aspect < 0.9; view.mobile = mobile;
        const cols = mobile ? 2 : 4, rows = mobile ? 2 : 1;
        const sx = mobile ? 1.5 : 1.62, sy = 1.5;
        items.forEach((it, i) => { const c = i % cols, r = Math.floor(i / cols); it.g.position.set((c - (cols - 1) / 2) * sx, ((rows - 1) / 2 - r) * sy, 0); });
        const contentW = cols * sx - 0.12, contentH = (rows - 1) * sy + 1.0;
        const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const fitH = (contentH / 2) / (tanH * (mobile ? 0.6 : 0.5));
        const fitW = (contentW / 2) / (tanH * camera.aspect * (mobile ? 0.94 : 0.9));
        view.dist = Math.max(fitH, fitW);
        const viewH = 2 * view.dist * tanH;
        view.center.set(0, 0.2 + viewH * (mobile ? 0.015 : 0.035), BOOT_Z);
      }
      new ResizeObserver(layout).observe(root);
      layout();

      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let hoverIdx = -1;
      function pick(e) {
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(hits, false)[0];
        return hit ? hit.object.userData.index : -1;
      }
      canvas.addEventListener('pointermove', (e) => { hoverIdx = pick(e); root.classList.toggle('is-hovering', hoverIdx >= 0); });
      canvas.addEventListener('pointerleave', () => { hoverIdx = -1; root.classList.remove('is-hovering'); });
      let downAt = null;
      canvas.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; });
      canvas.addEventListener('pointerup', (e) => {
        if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
        const i = pick(e);
        if (i >= 0) irAMarca(CONFIG.marcas[i]);
      });

      const timer = new THREE.Timer(); timer.connect(document);
      const camTarget = new THREE.Vector3(), camPos = new THREE.Vector3(), lookAt = new THREE.Vector3();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.25);
      const cursorPos = new THREE.Vector3(), tmp = new THREE.Vector3();
      const barBase = new THREE.Color(0xffc98a);
      let first = true;

      function animate() {
        timer.update();
        const dt = Math.min(timer.getDelta(), 0.05);
        const t = timer.getElapsed();
        const activo = hoverIdx >= 0 ? hoverIdx : labelHover;
        const px = pointer.activo ? pointer.nx : 0, py = pointer.activo ? pointer.ny : 0;
        camTarget.set(view.center.x + px * 0.22, view.center.y + py * 0.1, view.center.z + view.dist);
        if (first) camPos.copy(camTarget); else camPos.lerp(camTarget, 1 - Math.exp(-3 * dt));
        camera.position.copy(camPos);
        lookAt.set(view.center.x + px * 0.06, view.center.y, view.center.z);
        camera.lookAt(lookAt);

        raycaster.setFromCamera(ndc.set(px, py), camera);
        if (pointer.activo && raycaster.ray.intersectPlane(plane, cursorPos)) {
          cursorLight.position.lerp(cursorPos, 1 - Math.exp(-10 * dt));
          cursorLight.intensity = THREE.MathUtils.damp(cursorLight.intensity, 1.6, 6, dt);
        } else cursorLight.intensity = THREE.MathUtils.damp(cursorLight.intensity, 0, 4, dt);

        items.forEach((it, i) => {
          if (!reduceMotion && it.on < 1) {
            const k = THREE.MathUtils.clamp((t - 0.35 - i * 0.28) / 0.9, 0, 1);
            const flicker = k > 0 && k < 0.45 ? (Math.sin(t * 90 + i * 7) > 0.2 ? 1 : 0.25) : 1;
            it.on = k * flicker; if (k >= 1) it.on = 1;
          }
          const on = it.on;
          it.h = THREE.MathUtils.damp(it.h, activo === i ? 1 : 0, 7, dt);
          it.dim = THREE.MathUtils.damp(it.dim ?? 1, activo >= 0 && activo !== i ? 0.62 : 1, 5, dt);
          const h = it.h;
          it.spot.intensity = 2.6 * on * it.dim * (1 + 0.5 * h);
          it.cone.material.uniforms.uI.value = 0.11 * on * it.dim * (1 + 0.8 * h);
          it.bulbMat.color.set(0xffc27a).multiplyScalar((0.1 + 1.4 * on) * (0.75 + 0.25 * it.dim) * (1 + 0.35 * h));
          it.stripGlow.material.uniforms.uI.value = (0.35 + 0.4 * h) * on * it.dim;
          it.barMat.color.copy(barBase).multiplyScalar((0.55 + 4.2 * h) * on * (0.6 + 0.4 * it.dim));
          it.halo.material.uniforms.uI.value = (0.04 + 0.55 * h) * on;
          const flo = reduceMotion ? 0 : Math.sin(t * 1.1 + i * 1.7) * 0.006;
          it.pose.position.y = flo + 0.045 * h;
          it.pose.rotation.y = ((reduceMotion ? 0 : Math.sin(t * 0.5 + i) * 0.03) + 0.5 * h) * (it.m.imagen ? 0.3 : 1);
          it.pose.scale.setScalar(1 + 0.035 * h);
          tmp.set(0, -0.12, WALL_Z + SHELF_D).applyMatrix4(it.g.matrixWorld).project(camera);
          const lx = (tmp.x * 0.5 + 0.5) * root.clientWidth;
          const ly = (-tmp.y * 0.5 + 0.5) * root.clientHeight;
          labels[i].style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) translate(-50%, 0)`;
          labels[i].classList.toggle('is-active', activo === i);
        });

        actualizarTitulo(t, dt);
        composer.render(dt);
        if (first) { first = false; root.classList.add('is-ready'); }
      }
      new IntersectionObserver(([e]) => renderer.setAnimationLoop(e.isIntersecting ? animate : null), { threshold: 0 }).observe(root);
      renderer.compileAsync(scene, camera).catch(() => {});
    }

    function crearBotinProvisorio(m) {
      const g = new THREE.Group();
      const ancho = (x, y, alto) => {
        const t = THREE.MathUtils.clamp(x, 0, 1);
        let w = 0.62 + 0.38 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.07));
        if (t > 0.82) w *= 1 - (t - 0.82) * 1.7;
        if (alto) { const k = THREE.MathUtils.clamp((y - 0.07) / 0.33, 0, 1); w *= 1 - 0.6 * k * k; }
        return w;
      };
      const deformar = (geo, alto) => {
        geo.deleteAttribute('normal'); geo.deleteAttribute('uv');
        geo = mergeVertices(geo, 1e-4);
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) * ancho(p.getX(i), p.getY(i), alto));
        geo.computeVertexNormals();
        return geo;
      };
      const s = new THREE.Shape();
      s.moveTo(0.03, 0.07);
      s.bezierCurveTo(-0.025, 0.13, -0.03, 0.27, 0.02, 0.355);
      s.bezierCurveTo(0.05, 0.405, 0.13, 0.415, 0.2, 0.37);
      s.bezierCurveTo(0.26, 0.335, 0.33, 0.315, 0.42, 0.29);
      s.bezierCurveTo(0.6, 0.235, 0.8, 0.19, 0.93, 0.135);
      s.bezierCurveTo(1.01, 0.105, 1.02, 0.075, 0.97, 0.068);
      s.lineTo(0.03, 0.07);
      let upper = new THREE.ExtrudeGeometry(s, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 8, curveSegments: 40, steps: 3 });
      upper.translate(0, 0, -0.12);
      upper = deformar(upper, true);
      g.add(new THREE.Mesh(upper, new THREE.MeshPhysicalMaterial({ color: m.color, roughness: 0.42, metalness: 0.02, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.5, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff) })));
      const so = new THREE.Shape();
      so.moveTo(0.05, 0); so.lineTo(0.93, 0);
      so.quadraticCurveTo(1.03, 0.004, 1.0, 0.055);
      so.lineTo(0.975, 0.082); so.lineTo(0.02, 0.085);
      so.quadraticCurveTo(-0.035, 0.04, 0.05, 0);
      let sole = new THREE.ExtrudeGeometry(so, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.012, bevelSegments: 4, curveSegments: 16 });
      sole.translate(0, 0, -0.125);
      sole = deformar(sole, false);
      const soleMesh = new THREE.Mesh(sole, new THREE.MeshStandardMaterial({ color: m.suela, roughness: 0.32 }));
      soleMesh.scale.z = 1.04; g.add(soleMesh);
      const studGeo = new THREE.CylinderGeometry(0.015, 0.024, 0.05, 14);
      const studMat = new THREE.MeshStandardMaterial({ color: m.tapones, roughness: 0.3 });
      [[0.09, 1], [0.2, 1], [0.52, 1], [0.66, 1], [0.79, 1], [0.9, 0.7]].forEach(([x, k]) => {
        for (const side of [-1, 1]) {
          const st = new THREE.Mesh(studGeo, studMat);
          st.position.set(x, -0.022, side * 0.085 * ancho(x, 0, false) * k);
          g.add(st);
        }
      });
      g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      g.position.y = 0.047; g.position.x = -0.5;
      const wrap = new THREE.Group(); wrap.add(g);
      wrap.rotation.y = CONFIG.puntaHacia === 'izquierda' ? Math.PI : 0;
      wrap.scale.setScalar(1.02);
      return wrap;
    }

    let gltfLoader;
    function cargarProducto(m, pose, placeholder) {
      if (m.modelo) {
        gltfLoader = gltfLoader || new GLTFLoader().setDRACOLoader(new DRACOLoader());
        gltfLoader.loadAsync(m.modelo).then((gltf) => {
          const obj = gltf.scene;
          obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          let box = new THREE.Box3().setFromObject(obj);
          const size = box.getSize(new THREE.Vector3());
          const wrap = new THREE.Group();
          if (size.z > size.x) obj.rotation.y = Math.PI / 2;
          wrap.add(obj);
          box = new THREE.Box3().setFromObject(wrap);
          const sz = box.getSize(new THREE.Vector3());
          wrap.scale.setScalar(1.02 / Math.max(sz.x, sz.z));
          box = new THREE.Box3().setFromObject(wrap);
          const c = box.getCenter(new THREE.Vector3());
          wrap.position.set(-c.x, -box.min.y, -c.z);
          const outer = new THREE.Group(); outer.add(wrap);
          outer.rotation.y = (m.rotY || 0) + (CONFIG.puntaHacia === 'izquierda' ? Math.PI : 0);
          pose.remove(placeholder); pose.add(outer);
        }).catch((e) => console.warn(`[hero] no se pudo cargar ${m.modelo}, queda el provisorio`, e));
      } else if (m.imagen) {
        new THREE.TextureLoader().loadAsync(new URL(m.imagen, document.baseURI).href).then((tex) => {
          tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
          const w = 1.05, h = w * tex.image.height / tex.image.width;
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.4, roughness: 0.6, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.32 }));
          mesh.position.y = h / 2 - 0.004; mesh.castShadow = true;
          if (m.espejar) mesh.scale.x = -1;
          pose.remove(placeholder); pose.add(mesh);
        }).catch((e) => console.warn(`[hero] no se pudo cargar ${m.imagen}, queda el provisorio`, e));
      }
    }
  }
})();
