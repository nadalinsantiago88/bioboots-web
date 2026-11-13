// <hero-cinematic> — hero 3D cinemático (three.js r128 + GSAP). Imágenes: img/hero/bmr/bmr-N.png (+ -depth.png / -normal.png opcionales).
(() => {
  const BASE = 'img/hero/bmr/';
  const FALLBACK = { 'bmr-1': 'img/hero/botin-nike.webp', 'bmr-2': 'img/hero/botin-adidas.webp', 'bmr-3': 'img/hero/botin-puma.webp', 'bmr-4': 'img/hero/botin-mizuno.webp', 'bmr-5': 'img/hero/botin-nike.webp', 'bmr-6': 'img/hero/botin-adidas.webp' };
  const loadScript = src => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { const t = setInterval(() => { if ((src.includes('three') && window.THREE) || (src.includes('gsap') && window.gsap)) { clearInterval(t); res(); } }, 30); return; }
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  if (!document.querySelector('link[data-saira]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.saira = '1'; l.href = 'https://fonts.googleapis.com/css2?family=Saira:wght@300;400&display=swap'; document.head.appendChild(l); }

  class HeroCinematic extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.style.cssText = 'position:absolute;inset:0;display:block;overflow:hidden;background:#070708;';
      const brand = this.getAttribute('brand') || 'BioBoots';
      this.innerHTML = `
        <div data-c style="position:absolute;inset:0;"></div>
        <div style="position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 120px rgba(0,0,0,.85);">
          <div style="position:absolute;inset:clamp(16px,3vw,40px);border:1px solid rgba(255,255,255,.08);"></div>
        </div>
        <div data-r style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;pointer-events:none;opacity:0;font-family:'Saira',sans-serif;color:#F2EDE4;text-align:center;padding:0 24px;">
          <svg data-logo viewBox="0 0 100 100" width="96" height="96" fill="none" stroke="#F2EDE4" stroke-width="8" stroke-linecap="round" style="transform:scale(.5) rotate(-90deg);"><path d="M 75,25 A 35,35 0 0,0 75,75"></path></svg>
          <h1 data-t style="margin:0;font-weight:300;font-size:clamp(2.4rem,7vw,4.5rem);letter-spacing:.35em;text-transform:uppercase;opacity:0;transform:translateY(30px);">${brand}</h1>
          <p data-s style="margin:0;font-size:clamp(.75rem,1.4vw,1rem);letter-spacing:.2em;color:rgba(242,237,228,.7);opacity:0;transform:translateY(20px);">TU RENDIMIENTO, NUESTRA RESPONSABILIDAD</p>
        </div>`;
      Promise.all([loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'), loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js')])
        .then(() => this.start()).catch(e => console.warn('hero-cinematic:', e));
    }
    disconnectedCallback() { cancelAnimationFrame(this._raf); this._tl && this._tl.kill(); this._ro && this._ro.disconnect(); this._r && this._r.dispose(); this._init = false; }
    async start() {
      const THREE = window.THREE, gsap = window.gsap, box = this.querySelector('[data-c]');
      const w = () => this.clientWidth || innerWidth, h = () => this.clientHeight || innerHeight;
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070708);
      const cam = new THREE.PerspectiveCamera(45, w() / h(), .1, 100); cam.position.set(0, 0, 4.5);
      const r = this._r = new THREE.WebGLRenderer({ antialias: true });
      r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setSize(w(), h()); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputEncoding = THREE.sRGBEncoding;
      r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; box.appendChild(r.domElement);
      scene.add(new THREE.AmbientLight(0x1c1c1e, .4));
      const dir = new THREE.DirectionalLight(0xffffff, 1.2); dir.position.set(5, 5, 4); scene.add(dir);
      const pt = new THREE.PointLight(0xffffff, 1, 10); pt.position.set(-4, 3, 2); scene.add(pt);
      const rim = new THREE.SpotLight(0xffffff, 3, 15, Math.PI / 4, .5, 1); rim.position.set(0, 4, -6); scene.add(rim);
      const fit = () => { const z = w() / h() < .8 ? 6.2 : 4.5; this._baseZ = z; cam.aspect = w() / h(); cam.updateProjectionMatrix(); r.setSize(w(), h()); };
      this._ro = new ResizeObserver(fit); this._ro.observe(this); fit(); cam.position.z = this._baseZ;

      const L = new THREE.TextureLoader();
      const tex = url => new Promise(res => L.load(url, t => res(t), undefined, () => res(null)));
      const meshes = {};
      await Promise.all([1, 2, 3, 4, 5, 6].map(async i => {
        const k = 'bmr-' + i;
        let map = await tex(BASE + k + '.png'); const real = !!map; if (!map) map = await tex(FALLBACK[k]);
        if (!map) return; map.encoding = THREE.sRGBEncoding;
        const [depth, normal, rough] = real ? await Promise.all([tex(BASE + k + '-depth.png'), tex(BASE + k + '-normal.png'), tex(BASE + k + '-roughness.png')]) : [null, null, null];
        const m = new THREE.MeshPhysicalMaterial({ map, transparent: true, alphaTest: .05, roughness: .65, metalness: .1, clearcoat: .2, clearcoatRoughness: .1, side: THREE.DoubleSide });
        if (depth) { m.displacementMap = depth; m.displacementScale = .22; m.displacementBias = -.01; }
        if (rough) { m.roughnessMap = rough; m.roughness = 1; }
        if (normal) { m.normalMap = normal; m.normalScale = new THREE.Vector2(.8, .8); }
        const seg = depth ? 256 : 1, ar = map.image ? map.image.width / map.image.height : 1;
        const pw = ar >= 1 ? 2.8 : 2.8 * ar, ph = ar >= 1 ? 2.8 / ar : 2.8;
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph, seg, seg), m); mesh.visible = false; mesh.userData.depth = !!depth;
        const back = new THREE.Mesh(new THREE.PlaneGeometry(pw * .99, ph * .99), new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: .5, color: 0x0f0f10, side: THREE.BackSide }));
        back.position.z = -.012; mesh.add(back); scene.add(mesh); meshes[k] = mesh;
      }));

      let active = null;
      const sw = (k, detail) => { if (active) active.visible = false; active = meshes[k] || null; if (!active) return; active.visible = true; active.position.set(0, 0, 0); active.rotation.set(0, 0, 0); if (active.userData.depth) active.material.displacementScale = detail ? .08 : .22; };
      const camAt = (x, y, z, lx, ly) => { cam.position.set(x, y, z); cam.lookAt(lx, ly, 0); };
      const R = this.querySelector('[data-r]'), logo = this.querySelector('[data-logo]'), T = this.querySelector('[data-t]'), S = this.querySelector('[data-s]');
      const z0 = () => this._baseZ;
      const tl = this._tl = gsap.timeline({ repeat: -1 });
      tl.add(() => { sw(null); camAt(0, 0, z0(), 0, 0); gsap.set(R, { opacity: 0 }); gsap.set(logo, { scale: .5, rotate: -90 }); gsap.set(T, { opacity: 0, y: 30, letterSpacing: '.35em' }); gsap.set(S, { opacity: 0, y: 20 }); }).to({}, { duration: .5 });
      tl.add(() => { sw('bmr-6'); if (!active) return; gsap.fromTo(active.position, { y: -4 }, { y: 0, duration: 1.2, ease: 'power2.out' }); gsap.fromTo(active.rotation, { z: -Math.PI * 1.5, y: -.4 }, { z: 0, y: .2, duration: 1.2, ease: 'power2.out' }); }).to({}, { duration: 1.2 });
      tl.add(() => { active && gsap.to(active.rotation, { y: .1, z: 0, duration: .5 }); }).to({}, { duration: .5 });
      tl.add(() => { sw('bmr-3', true); camAt(.6, -.3, 2.5, .8, -.2); gsap.to(cam.position, { z: 2.1, duration: .9, ease: 'sine.out' }); }).to({}, { duration: .9 });
      tl.add(() => { sw('bmr-2', true); camAt(-.5, .4, 2.2, -.2, .2); gsap.to(cam.position, { x: .1, y: .1, duration: 1.9, ease: 'power1.inOut' }); }).to({}, { duration: 1.9 });
      tl.add(() => { sw('bmr-4', true); camAt(0, 0, z0(), 0, 0); active && gsap.fromTo(active.rotation, { x: .5, y: -.4 }, { y: .4, duration: 1, ease: 'power2.out' }); }).to({}, { duration: 1 });
      tl.add(() => { sw('bmr-6'); active && gsap.fromTo(active.rotation, { y: -.15 }, { y: .15, duration: 1.5, ease: 'power1.inOut' }); }).to({}, { duration: 1.5 });
      tl.add(() => { sw('bmr-1'); active && gsap.fromTo(active.rotation, { x: Math.PI / 2.2, z: -.1 }, { z: .1, duration: 1.5, ease: 'power1.inOut' }); }).to({}, { duration: 1.5 });
      tl.add(() => { sw('bmr-5'); active && gsap.fromTo(active.rotation, { x: .1, y: -.2 }, { y: .2, duration: 3, ease: 'sine.inOut' }); }).to({}, { duration: 3 });
      tl.add(() => {
        sw('bmr-6'); if (active) { gsap.to(active.position, { y: 4, duration: .8, ease: 'power2.in' }); gsap.to(active.rotation, { z: Math.PI, duration: .8, ease: 'power2.in' }); }
        gsap.to(R, { opacity: 1, duration: .6, delay: .3 });
        gsap.to(logo, { scale: 1, rotate: 0, duration: 1, delay: .3, ease: 'back.out(1.7)' });
        gsap.to(T, { opacity: 1, y: 0, letterSpacing: '.1em', duration: .8, delay: .6, ease: 'expo.out' });
        gsap.to(S, { opacity: 1, y: 0, duration: .8, delay: .9 });
      }).to({}, { duration: 2.5 });
      tl.add(() => gsap.to(R, { opacity: 0, duration: .5 })).to({}, { duration: .5 });

      const loop = ts => {
        this._raf = requestAnimationFrame(loop); if (document.hidden) return;
        const t = ts * .001;
        if (active && active.visible) { active.position.y += Math.sin(t * 1.5) * .0012; active.rotation.z += Math.cos(t) * .0005; }
        dir.position.x = 5 + Math.sin(t * .8) * 2; pt.position.y = 3 + Math.cos(t * 1.2) * 1.5;
        r.render(scene, cam);
      };
      this._raf = requestAnimationFrame(loop);
    }
  }
  if (!customElements.get('hero-cinematic')) customElements.define('hero-cinematic', HeroCinematic);
})();
