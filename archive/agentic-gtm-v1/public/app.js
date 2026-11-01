(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) document.documentElement.classList.add("reduced");
  const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
  const h = (tag, attrs = {}, html = "") => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (html) e.innerHTML = html;
    return e;
  };
  const SVGNS = "http://www.w3.org/2000/svg";
  const s = (tag, attrs = {}) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  };


  /* ---------------- currency: ₹ (India) or $ (global, scaled) ---------------- */
  const RATE = 95, SCALE = 5, F = SCALE / RATE;            // ₹95 = $1, then 5× to a US-sized business
  let CUR = "INR";
  try {
    const hs = (location.hash || "").toLowerCase();
    let saved = null; try { saved = localStorage.getItem("cur"); } catch (e) {}
    if (hs === "#usd") CUR = "USD"; else if (hs === "#inr") CUR = "INR";
    else if (saved === "USD" || saved === "INR") CUR = saved;
    else { const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || ""); CUR = /Calcutta|Kolkata/.test(tz) ? "INR" : "USD"; }
  } catch (e) {}
  const USD = CUR === "USD";
  const usd = (v) => { const r = v < 100 ? Math.round(v) : v < 10000 ? Math.round(v / 10) * 10 : Math.round(v / 100) * 100; return "$" + r.toLocaleString("en-US"); };
  const k1 = (v) => String(Math.round(v / 100) / 10);
  const money = (n) => (USD ? usd(n * F) : inr(n));
  const MONEY = /₹\s?(\d[\d,]*(?:\.\d+)?)(?:\s?[–-]\s?(\d[\d,]*(?:\.\d+)?))?(\s?(?:k|lakh)\b)?(\+)?/g;
  function conv(str) {
    if (!USD || typeof str !== "string" || !str) return str;
    let out = str.replace(MONEY, (m, a, b, suf, plus) => {
      const num = (x) => parseFloat(x.replace(/,/g, ""));
      const mult = suf ? (suf.trim() === "lakh" ? 1e5 : 1e3) : 1;
      let lo = num(a) * mult, hi = b != null ? num(b) * mult : null;
      plus = plus || "";
      if (!suf && lo < 20 && (hi == null || hi < 20)) return "$" + a + (b != null ? "–" + b : "") + plus;   // ratios like ₹11.90 per ₹1
      lo *= F; if (hi != null) hi *= F;
      if (hi != null) return (suf && lo >= 1000) ? `$${k1(lo)}–${k1(hi)}k${plus}` : `${usd(lo)}–${usd(hi).slice(1)}${plus}`;
      return ((suf && lo >= 1000) ? `$${k1(lo)}k` : usd(lo)) + plus;
    });
    out = out.replace(/(\d+(?:\.\d+)?) lakh/g, (m, x) => Math.round(parseFloat(x) * 1e5).toLocaleString("en-US"));
    return out.replace(/₹/g, "$").replace(/\brupees\b/g, "dollars").replace(/ IST\b/g, "");
  }
  function convData() {
    if (!USD) return;
    FINDINGS.forEach((f) => { f.n = conv(f.n); f.t = conv(f.t); });
    WORKFLOWS.forEach((w) => {
      w.when = conv(w.when);
      w.nodes.forEach((n) => { n[4] = conv(n[4]); n[5] = conv(n[5]); });
      w.run.forEach((r) => { if (r.log) r.log = conv(r.log); if (r.approve) r.approve = conv(r.approve); if (r.find) r.find = [r.find[0], conv(r.find[1])]; });
    });
    (window.LEVELS || []).forEach((L) => { L.money = conv(L.money); L.unit = conv(L.unit); L.finds = L.finds.map(conv); L.fix = conv(L.fix); });
    if (window.FOUNDATION) { FOUNDATION.what = conv(FOUNDATION.what); FOUNDATION.finds = FOUNDATION.finds.map(conv); }
    Object.values(window.AUTOMATIONS || {}).forEach((list) => list.forEach((a) => (a[0] = conv(a[0]))));
    $$("[data-count]").forEach((el) => { if (el.dataset.prefix === "₹") { el.dataset.count = Math.round((+el.dataset.count * F) / 10) * 10; el.dataset.prefix = "$"; } });
  }
  function convDom() {
    if (!USD) return;
    const skip = (n) => n.parentElement && n.parentElement.closest("script,style,[data-noconv]");
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach((n) => { if (!skip(n) && /₹|lakh|rupees| IST/.test(n.nodeValue)) n.nodeValue = conv(n.nodeValue); });
    $$("[aria-label]").forEach((e) => { const v = e.getAttribute("aria-label"); if (/₹|lakh/.test(v)) e.setAttribute("aria-label", conv(v)); });
    $$(".cur-note").forEach((e) => (e.hidden = false));
  }
  $$(".cur button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.cur === CUR));
    b.addEventListener("click", () => {
      if (b.dataset.cur === CUR) return;
      try { localStorage.setItem("cur", b.dataset.cur); } catch (e) {}
      location.hash = b.dataset.cur === "USD" ? "usd" : "inr";
      location.reload();
    });
  });

  /* ---------------- brand + booking ---------------- */
  $$("[data-brand]").forEach((e) => (e.textContent = SITE.brand));
  const bookBtn = $("#bookBtn");
  if (SITE.bookingUrl) {
    bookBtn.href = SITE.bookingUrl;
    bookBtn.target = "_blank";
    bookBtn.rel = "noopener";
    $$("[data-book]").forEach((a) => { a.href = SITE.bookingUrl; a.target = "_blank"; a.rel = "noopener"; });
  } else {
    bookBtn.addEventListener("click", (e) => { e.preventDefault(); $("#replyNote").animate([{ color: "#c6ff4a" }, { color: "" }], { duration: 1400 }); });
  }

  /* ---------------- nav ---------------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- ticker ---------------- */
  const tick = $("#ticker");
  // outcomes, not problems: what the fixes deliver (real results from the audit; projections say so)
  const tickHTML = (window.OUTCOMES || []).map((o) => `<span class="tk"><span class="dot k-opp"></span><b>${o[0]}</b>${o[1]}</span>`).join("");
  tick.innerHTML = tickHTML + tickHTML;
  const pace = () => { const half = tick.scrollWidth / 2; if (half) tick.style.animationDuration = Math.round(half / 28) + "s"; };   // ~28 px a second
  pace();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pace);

  /* =========================================================
     HERO — money flow (three.js)
     Spend streams in from every channel, passes the agent ring,
     waste (48%) drops out in coral, the rest becomes revenue.
     ========================================================= */
  const SOURCES = ["Google Ads", "Meta", "LinkedIn", "YouTube", "Reddit", "Email", "AI calls"];
  function startHero() {
    const canvas = $("#flow");
    const labelsEl = $("#flowLabels");
    if (!window.THREE) return staticHero();
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch (e) { return staticHero(); }
    renderer.setClearColor(0x07080b, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 10);
    const mobile = window.innerWidth < 760;
    const N = mobile ? 4200 : 9000;

    const geo = new THREE.BufferGeometry();
    const seed = new Float32Array(N), src = new Float32Array(N), lane = new Float32Array(N), fate = new Float32Array(N), speed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      seed[i] = Math.random();
      src[i] = Math.floor(Math.random() * SOURCES.length);
      lane[i] = (Math.random() * 2 - 1);
      fate[i] = Math.random() < 0.48 ? 0 : 1;
      speed[i] = 0.055 + Math.random() * 0.05;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aSrc", new THREE.BufferAttribute(src, 1));
    geo.setAttribute("aLane", new THREE.BufferAttribute(lane, 1));
    geo.setAttribute("aFate", new THREE.BufferAttribute(fate, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));

    const uniforms = {
      uTime: { value: 0 }, uW: { value: 10 }, uH: { value: 6 }, uCoreY: { value: -1 }, uBand: { value: 2 },
      uPR: { value: Math.min(window.devicePixelRatio || 1, 2) }, uMobile: { value: mobile ? 1 : 0 }, uSrcX: { value: -4 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSeed; attribute float aSrc; attribute float aLane; attribute float aFate; attribute float aSpeed;
        uniform float uTime, uW, uH, uCoreY, uBand, uPR, uMobile, uSrcX;
        varying vec3 vCol; varying float vA;
        vec3 bez(vec3 a, vec3 b, vec3 c, vec3 d, float t){ float u=1.0-t; return u*u*u*a + 3.0*u*u*t*b + 3.0*u*t*t*c + t*t*t*d; }
        void main(){
          float t = fract(uTime*aSpeed + aSeed);
          float R = uW*0.5 + 0.4;
          float sy = uCoreY + (0.5 - aSrc/6.0) * uBand * 1.3;
          vec3 S = vec3(uSrcX, sy, 0.0);
          vec3 C = vec3(0.0, uCoreY, 0.0);
          float wob = sin(uTime*1.3 + aSeed*40.0)*0.035;
          vec3 p; vec3 col; float a; float size = 1.6;
          if (t < 0.55) {
            float k = t/0.55;
            vec3 b = vec3(mix(uSrcX, 0.0, 0.45), sy + aLane*0.03, aLane*0.2);
            vec3 c = vec3(-uW*0.12, uCoreY + (sy-uCoreY)*0.25 + aLane*0.10, aLane*0.2);
            p = bez(S + vec3(0.0, aLane*0.025, 0.0), b, c, C + vec3(0.0, aLane*0.14, 0.0), k);
            p.y += wob*(1.0-k);
            col = mix(vec3(0.70,0.77,1.0), vec3(0.90,0.93,1.0), k);
            a = 0.42 + 0.48*smoothstep(0.45,1.0,k);
            size = 1.7 + 1.5*smoothstep(0.6,1.0,k);
          } else {
            float k = (t-0.55)/0.45;
            if (aFate > 0.5) {
              // revenue GROWS: the stream bulks out — thicker, brighter and higher the further right it goes
              float grow = 0.9 + 0.1*sin(uTime*0.35);
              float wide = uMobile > 0.5 ? 0.6 : 1.0;
              float x = R * k;
              float cy = uCoreY + aLane*0.14*(1.0 - k) + uBand*0.50*pow(k, 1.6)*grow*wide;
              float spread = (0.06 + uBand*0.80*k*k*grow) * wide;
              p = vec3(x, cy + aLane*spread, aLane*0.5*k);
              col = mix(vec3(0.86,0.95,0.6), vec3(0.80,1.0,0.32), k);
              a = 0.78 + 0.2*k;
              size = 1.8 + 3.4*k*k;
            } else {
              vec3 B = vec3(uW*0.10 + aLane*0.35, uCoreY - uBand*0.62 + aLane*0.06, aLane*0.2);
              vec3 b = vec3(uW*0.03, uCoreY - 0.15, 0.0);
              vec3 c = vec3(B.x - 0.05, B.y + 0.35, 0.0);
              p = bez(C + vec3(0.0, aLane*0.14, 0.0), b, c, B, k);
              col = mix(vec3(1.0,0.55,0.45), vec3(1.0,0.33,0.24), k);
              a = 1.0 - 0.55*smoothstep(0.7, 1.0, k);
              size = 2.2;
            }
          }
          vCol = col; vA = a;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = size * uPR * (uMobile > 0.5 ? 1.15 : 1.0) * (10.0 / -mv.z);
        }`,
      fragmentShader: `
        varying vec3 vCol; varying float vA;
        void main(){
          vec2 d = gl_PointCoord - 0.5; float r = length(d);
          float m = smoothstep(0.5, 0.0, r);
          gl_FragColor = vec4(vCol, vA*m);
        }`,
    });
    const world = new THREE.Group(); scene.add(world);
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    world.add(pts);

    // glow sprites
    const glowTex = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 128;
      const g = c.getContext("2d"); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    const sprite = (color, scale, op) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.scale.set(scale, scale, 1); world.add(sp); return sp;
    };
    const coreGlow = sprite(0x6f8cff, 3.2, 0.55);
    const coreGlow2 = sprite(0xae93ff, 1.4, 0.6);
    const revGlow = sprite(0xc6ff4a, 2.6, 0.45);

    // agent rings
    const ringGroup = new THREE.Group(); world.add(ringGroup);
    const ringMat = (c, o) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending });
    const ring = (r, segs, dashed, c, o) => {
      const g = new THREE.BufferGeometry(); const arr = [];
      for (let i = 0; i < segs; i++) {
        if (dashed && i % 3 === 2) continue;
        const a0 = (i / segs) * Math.PI * 2, a1 = ((i + 1) / segs) * Math.PI * 2;
        arr.push(Math.cos(a0) * r, Math.sin(a0) * r, 0, Math.cos(a1) * r, Math.sin(a1) * r, 0);
      }
      g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
      const l = new THREE.LineSegments(g, ringMat(c, o)); ringGroup.add(l); return l;
    };
    const r1 = ring(0.62, 96, true, 0x9fb2ff, 0.75);
    const r2 = ring(0.82, 140, true, 0xae93ff, 0.45);
    const r3 = ring(0.44, 60, false, 0xffffff, 0.35);
    r2.rotation.x = 1.0; r1.rotation.y = 0.5;

    const labels = SOURCES.map((name) => { const e = h("div", { class: "flab src" }, `<i></i>${name}`); labelsEl.appendChild(e); return e; });
    const coreLab = h("div", { class: "flab core" }, "Agents");
    const revLab = h("div", { class: "flab rev" }, '<span class="spark"><b></b><b></b><b></b><b></b><b></b></span>Revenue ↑<i></i>');
    const binLab = h("div", { class: "flab bin" }, "<i></i>48% waste caught");
    labelsEl.append(coreLab, revLab, binLab);

    let W = 10, H = 6, coreY = -1, band = 2;
    const project = (x, y) => {
      const v = new THREE.Vector3(x, y, 0).project(camera);
      return [(v.x * 0.5 + 0.5) * canvas.clientWidth, (-v.y * 0.5 + 0.5) * canvas.clientHeight];
    };
    function layout() {
      const w = canvas.clientWidth, hgt = canvas.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, hgt, false);
      camera.aspect = w / hgt; camera.updateProjectionMatrix();
      H = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z; W = H * camera.aspect;
      const narrow = w < 760;
      // put the flow in the band reserved under the hero copy
      const zone = $("#flowZone"), cr = canvas.getBoundingClientRect(), zr = zone.getBoundingClientRect();
      const zMid = (zr.top + zr.height / 2 - cr.top) / hgt;           // 0..1 from the top of the canvas
      coreY = (0.5 - zMid) * H;
      band = (zr.height / hgt) * H * (narrow ? 0.6 : 0.62);
      uniforms.uW.value = W; uniforms.uH.value = H; uniforms.uCoreY.value = coreY; uniforms.uBand.value = band;
      ringGroup.position.set(0, coreY, 0);
      const rs = narrow ? 0.7 : 1; ringGroup.scale.set(rs, rs, rs);
      coreGlow.position.set(0, coreY, 0); coreGlow2.position.set(0, coreY, 0.01);

      // labels
      const gutter = narrow ? 10 : Math.max(16, (w - 1240) / 2 + 24);
      const pxToWorldX = (px) => (px / w - 0.5) * W;
      uniforms.uSrcX.value = pxToWorldX(gutter + (narrow ? 74 : 104));
      SOURCES.forEach((_, i) => {
        const sy = coreY + (0.5 - i / 6) * band * 1.3;
        const [, py] = project(0, sy);
        labels[i].style.left = gutter + "px";
        labels[i].style.top = py + "px";
      });
      let [cx, cy] = project(0, coreY - (narrow ? 0.62 : 0.95));
      coreLab.style.left = cx + "px"; coreLab.style.top = cy + "px";
      const wideK = narrow ? 0.6 : 1.0;
      [cx, cy] = project(W * 0.5, narrow ? coreY + band * 0.3 : coreY + band * 1.4 + 0.2);
      revGlow.position.set(W * 0.5, coreY + band * 0.5 * wideK, 0);
      revGlow.scale.set(3.8, 3.8, 1);
      revLab.style.left = (w - (narrow ? 10 : Math.max(16, (w - 1240) / 2 + 24))) + "px"; revLab.style.top = cy + "px";
      [cx, cy] = project(W * 0.10 + 0.55, coreY - band * 0.62);
      binLab.style.left = cx + 70 + "px"; binLab.style.top = cy + "px";
    }
    let mx = 0, my = 0;
    window.addEventListener("pointermove", (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; }, { passive: true });
    window.addEventListener("resize", layout);
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    if (window.ResizeObserver) new ResizeObserver(layout).observe($(".hero"));
    setTimeout(() => $$(".flab", labelsEl).forEach((e, i) => setTimeout(() => e.classList.add("on"), i * 90)), 600);

    let running = true, t0 = performance.now();
    const io = new IntersectionObserver(([en]) => { running = en.isIntersecting; if (running) loop(); }, { threshold: 0 });
    io.observe(canvas);
    function frame(now) {
      const t = (now - t0) / 1000;
      uniforms.uTime.value = t;
      r1.rotation.z = t * 0.5; r2.rotation.z = -t * 0.3; r3.rotation.z = t * 0.15;
      const pulse = 0.5 + 0.08 * Math.sin(t * 2.2);
      coreGlow.material.opacity = pulse;
      world.rotation.y += (mx * 0.10 - world.rotation.y) * 0.05;
      world.rotation.x += (my * 0.05 - world.rotation.x) * 0.05;
      renderer.render(scene, camera);
    }
    function loop() {
      if (!running) return;
      frame(performance.now());
      if (!reduced) requestAnimationFrame(loop);
    }
    if (reduced) { uniforms.uTime.value = 7.3; frame(t0 + 7300); } else loop();
  }
  function staticHero() {
    const c = $("#flow");
    c.style.background = "radial-gradient(600px 300px at 50% 70%, rgba(111,140,255,.18), transparent 70%)";
  }

  /* hero headline */
  function heroIntro() {
    if (!window.gsap || reduced) return;
    gsap.ticker.lagSmoothing(0);
    gsap.from(".hero h1 .line>span", { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.12, delay: 0.15 });
  }

  /* =========================================================
     PILLAR viz (small spark of channels → result)
     ========================================================= */
  function pillarViz() {
    const svg = $("#vizPerf"); if (!svg) return;
    const bars = [38, 52, 30, 64, 44, 72, 58, 80, 66, 90, 74, 96];
    bars.forEach((v, i) => {
      const x = 30 + i * 46, hgt = v * 2.1;
      const waste = i % 3 === 1;
      svg.appendChild(s("rect", { x, y: 300 - hgt, width: 30, height: hgt, rx: 4, fill: waste ? "rgba(255,91,69,.55)" : "rgba(198,255,74,.35)" }));
    });
    const path = s("path", { d: "M10,250 C120,230 160,190 240,170 S420,90 590,40", fill: "none", stroke: "#c6ff4a", "stroke-width": 2.5 });
    svg.appendChild(path);
    $$(".pill[data-goto]").forEach((p) => p.addEventListener("click", () => {
      selectPillar(p.dataset.goto); $("#workflows").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }));
  }

  /* =========================================================
     WORKFLOW PLAYER (n8n-style)
     ========================================================= */
  const NW = 152, NH = 62, COL = 158, ROW = 138, X0 = 20, Y0 = 34, SW = 1150, SH = 410;
  const stage = $("#stage"), edgesSvg = $("#edges"), logBody = $("#logBody"), logState = $("#logState"), runBtn = $("#runBtn");
  let current = null, runToken = 0, autoRan = false;
  const pos = (n) => ({ x: X0 + n[1] * COL, y: Y0 + n[2] * ROW });
  const WFI = '<svg class="wfi" viewBox="0 0 22 14" aria-hidden="true"><circle cx="3" cy="7" r="2.3"/><circle cx="19" cy="3" r="2.3"/><circle cx="19" cy="11" r="2.3"/><path d="M5.3 7 C11 7 11 3 16.7 3 M5.3 7 C11 7 11 11 16.7 11"/></svg>';

  function buildTabs() {
    const tabs = $("#wfTabs");
    PILLARS.forEach((p) => {
      const count = WORKFLOWS.filter((w) => w.pillar === p.id).length;
      const b = h("button", { class: "wf-tab", role: "tab", "aria-selected": "false", "data-p": p.id, type: "button" }, `${p.name} <span class="c">${count} workflows</span>`);
      b.addEventListener("click", () => selectPillar(p.id));
      tabs.appendChild(b);
    });
  }
  function selectPillar(pid) {
    $$(".wf-tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.p === pid)));
    const list = $("#wfList"); list.innerHTML = "";
    WORKFLOWS.filter((w) => w.pillar === pid).forEach((w, i) => {
      const c = h("button", { class: "wf-chip", type: "button", "aria-pressed": "false", "data-w": w.id }, `${WFI}<span class="no">${w.no}</span>${w.name}`);
      c.addEventListener("click", () => loadWorkflow(w.id, true));
      list.appendChild(c);
    });
    loadWorkflow(WORKFLOWS.find((w) => w.pillar === pid).id, false);
  }
  function loadWorkflow(id, autoplay) {
    runToken++;
    const w = WORKFLOWS.find((x) => x.id === id); current = w;
    $$(".wf-chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.w === id)));
    $("#wfTitle").innerHTML = `<span class="wf-no">${WFI}Workflow ${w.no}</span>${w.name}`;
    $("#wfWhen").textContent = w.when;
    $("#wfBadge").innerHTML = w.real ? '<span class="badge real">REAL DATA · from an audit</span>' : '<span class="badge ex">EXAMPLE RUN</span>';
    $$(".node", stage).forEach((n) => n.remove());
    edgesSvg.innerHTML = "";
    const nodeEls = {};
    w.nodes.forEach((n) => {
      const { x, y } = pos(n);
      const el = h("div", { class: `node t-${n[3]}`, style: `left:${x}px;top:${y}px`, "data-id": n[0] },
        `<span class="tile">${n[6]}</span><span class="tx"><div class="tt">${n[4]}</div><div class="ts">${n[5]}</div></span><span class="st"></span>`);
      stage.appendChild(el); nodeEls[n[0]] = el;
    });
    const byId = Object.fromEntries(w.nodes.map((n) => [n[0], n]));
    w._edges = w.edges.map(([a, b]) => {
      const A = pos(byId[a]), B = pos(byId[b]);
      let d;
      if (Math.abs(B.x - A.x) < 60) {
        const x1 = A.x + NW / 2, y1 = B.y > A.y ? A.y + NH : A.y, x2 = B.x + NW / 2, y2 = B.y > A.y ? B.y : B.y + NH;
        d = `M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`;
      } else {
        const x1 = A.x + NW, y1 = A.y + NH / 2, x2 = B.x, y2 = B.y + NH / 2, dx = Math.max(36, (x2 - x1) / 2);
        d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
      }
      const p = s("path", { d, class: "edge" }); edgesSvg.appendChild(p);
      return { a, b, p };
    });
    w._nodes = nodeEls;
    logBody.innerHTML = ""; logState.textContent = "idle";
    appendLog("Ready. Press ▶ Run workflow.", false, "—");
    runBtn.disabled = false; runBtn.textContent = "▶ Run workflow";
    fitStage();
    if (autoplay) runWorkflow();
  }
  function fitStage() {
    const wrap = $("#stageWrap");
    const avail = wrap.clientWidth - 16;
    const sc = Math.max(0.62, Math.min(1.08, avail / SW));
    stage.style.width = SW + "px"; stage.style.height = SH + "px";
    stage.style.zoom = sc;
    wrap.style.overflowX = SW * sc > avail + 4 ? "auto" : "hidden";
    wrap.style.overflowY = "hidden";
  }
  window.addEventListener("resize", fitStage);

  let clock = 7 * 3600;
  const stamp = () => { clock += 1 + Math.floor(Math.random() * 3); const hh = Math.floor(clock / 3600) % 24, mm = Math.floor(clock / 60) % 60, ss = clock % 60; return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; };
  function appendLog(text, ok = true, time) {
    const l = h("div", { class: "ll" + (ok ? " ok" : "") }, `<time>${time || stamp()}</time><span>${text}</span>`);
    logBody.appendChild(l); logBody.scrollTop = logBody.scrollHeight; return l;
  }
  function appendFind([kind, text]) {
    const lab = kind === "waste" ? "Waste found" : kind === "opp" ? "Opportunity" : "Signal";
    const f = h("div", { class: `find ${kind}` }, `<small>${lab}</small>${text}`);
    logBody.appendChild(f); logBody.scrollTop = logBody.scrollHeight;
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 60) : ms));
  function travel(path, token) {
    const dur = 480;
    return new Promise((resolve) => {
      if (reduced) return resolve();
      const len = path.getTotalLength();
      const dot = s("circle", { r: 5, class: "pulse-dot" }); edgesSvg.appendChild(dot);
      const t0 = performance.now();
      let live = true;
      const draw = () => {
        if (!live) return;
        const k = Math.min(1, (performance.now() - t0) / dur);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const pt = path.getPointAtLength(len * e);
        dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
        if (k < 1) requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
      setTimeout(() => { live = false; dot.remove(); resolve(); }, dur);   // time-based: never waits on frames
    });
  }
  function follow(node) {
    const wrap = $("#stageWrap");
    if (wrap.scrollWidth <= wrap.clientWidth + 4) return;
    const z = parseFloat(stage.style.zoom) || 1;
    const x = (parseFloat(node.style.left) + NW / 2) * z - wrap.clientWidth / 2;
    wrap.scrollTo({ left: Math.max(0, x), behavior: reduced ? "auto" : "smooth" });
  }
  async function runWorkflow() {
    const w = current; if (!w) return;
    const token = ++runToken;
    clock = (w.when.match(/(\d\d):(\d\d)/) ? (+RegExp.$1 * 3600 + +RegExp.$2 * 60) : 9 * 3600);
    Object.values(w._nodes).forEach((n) => n.classList.remove("run", "ok", "wait"));
    w._edges.forEach((e) => e.p.classList.remove("hot", "done"));
    logBody.innerHTML = ""; logState.textContent = "running";
    runBtn.disabled = true; runBtn.textContent = "Running…";
    const done = new Set();
    for (const st of w.run) {
      if (token !== runToken) return;
      const node = w._nodes[st.at];
      if (!done.has(st.at)) {
        const incoming = w._edges.filter((e) => e.b === st.at && done.has(e.a));
        incoming.forEach((e) => e.p.classList.add("hot"));
        await Promise.all(incoming.map((e) => travel(e.p, token)));
        incoming.forEach((e) => { e.p.classList.remove("hot"); e.p.classList.add("done"); });
        if (token !== runToken) return;
        node.classList.add("run");
        follow(node);
      }
      if (st.approve) {
        node.classList.remove("run"); node.classList.add("wait");
        logState.textContent = "waiting for you";
        const ok = await askApproval(st.approve, token);
        if (token !== runToken) return;
        node.classList.remove("wait"); node.classList.add("ok"); done.add(st.at);
        logState.textContent = "running";
        if (!ok) { appendLog("Skipped by you · nothing changed", false); break; }
        continue;
      }
      await sleep(380);
      if (token !== runToken) return;
      appendLog(st.log);
      if (st.find) { await sleep(260); appendFind(st.find); }
      await sleep(520);
      node.classList.remove("run"); node.classList.add("ok"); done.add(st.at);
    }
    if (token !== runToken) return;
    logState.textContent = "done";
    runBtn.disabled = false; runBtn.textContent = "↻ Run again";
  }
  function askApproval(text, token) {
    return new Promise((resolve) => {
      const card = h("div", { class: "appr" }, `<small>Your policy · needs your OK</small><p>${text}</p><div class="row"><button class="yes" type="button">Approve</button><button type="button">Skip</button></div><div class="res"></div>`);
      logBody.appendChild(card); logBody.scrollTop = logBody.scrollHeight;
      const [yes, no] = $$("button", card);
      const finish = (v) => { card.classList.add("done"); $(".res", card).textContent = v ? "✓ Approved by you · " + stamp() : "Skipped"; resolve(v); };
      yes.addEventListener("click", () => finish(true), { once: true });
      no.addEventListener("click", () => finish(false), { once: true });
      const watch = setInterval(() => { if (token !== runToken) { clearInterval(watch); resolve(false); } }, 300);
    });
  }
  runBtn.addEventListener("click", runWorkflow);

  /* =========================================================
     PROOF
     ========================================================= */
  const KIND = { waste: "Waste", opp: "Opportunity", signal: "Signal", rule: "Rule now in place" };
  const LVNAME = { all: "Whole account", campaign: "Campaign", asset: "Asset", product: "Product", tracking: "Tracking", store: "Store" };
  let filter = "all", lvl = "any", showAll = false;
  function renderFindings() {
    const grid = $("#fGrid"); grid.innerHTML = "";
    let list = FINDINGS.filter((f) => (filter === "all" || f.k === filter) && (lvl === "any" || f.l === lvl));
    const total = list.length;
    if (!showAll && filter === "all" && lvl === "any") {
      const mix = [];
      ["waste", "opp", "signal", "rule"].forEach((k, ki) => FINDINGS.filter((f) => f.k === k).slice(0, [8, 5, 2, 1][ki]).forEach((f) => mix.push(f)));
      list = mix;
    }
    list.forEach((f) => grid.appendChild(h("div", { class: `fc ${f.k}` }, `<div class="top"><span class="dot k-${f.k}"></span>${KIND[f.k]}<span class="lvtag">${LVNAME[f.l] || ""}</span></div><div class="n tnum">${f.n}</div><p>${f.t}</p>`)));
    $("#moreBtn").style.display = filter === "all" && lvl === "any" && !showAll ? "" : "none";
    $("#moreBtn").textContent = `Show all ${total} findings`;
  }
  function buildFilters() {
    const wrap = $("#fFilters");
    const opts = [["all", "All"], ["waste", "Waste"], ["opp", "Opportunities"], ["signal", "Signals"], ["rule", "Rules"]];
    opts.forEach(([k, label]) => {
      const n = k === "all" ? FINDINGS.length : FINDINGS.filter((f) => f.k === k).length;
      const b = h("button", { type: "button", "aria-pressed": String(k === "all") }, `${k !== "all" ? `<span class="dot k-${k}"></span>` : ""}${label} <span class="cnt">${n}</span>`);
      b.addEventListener("click", () => { filter = k; $$("button", wrap).forEach((x) => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); renderFindings(); });
      wrap.appendChild(b);
    });
    $("#moreBtn").addEventListener("click", () => { showAll = true; renderFindings(); });
    const lw = $("#lFilters");
    LVKEYS.forEach(([k, label]) => {
      const n = k === "any" ? FINDINGS.length : FINDINGS.filter((f) => f.l === k).length;
      const b = h("button", { type: "button", "aria-pressed": String(k === "any") }, `${label} <span class="cnt">${n}</span>`);
      b.addEventListener("click", () => setLevel(k));
      lw.appendChild(b);
    });
  }
  const LVKEYS = [["any", "Every level"], ["campaign", "Campaign"], ["asset", "Asset"], ["product", "Product"], ["tracking", "Tracking"], ["store", "Store"]];
  function setLevel(k) {
    lvl = k;
    $$("#lFilters button").forEach((x, i) => x.setAttribute("aria-pressed", String(LVKEYS[i][0] === k)));
    renderFindings();
  }
  function buildLevels() {
    const fd = $("#found");
    if (fd && window.FOUNDATION) fd.innerHTML = `<div><div class="lt">Level 0 · Foundation</div><h3>${FOUNDATION.title}</h3><p>${FOUNDATION.what}</p></div><ul>${FOUNDATION.finds.map((f) => `<li>${f}</li>`).join("")}</ul>`;
    const wrap = $("#levels"); if (!wrap || !window.LEVELS) return;
    LEVELS.forEach((L) => {
      const card = h("article", { class: "lvl rv", tabindex: "0", role: "button", "aria-label": `Show ${L.name} findings` },
        `<div class="lt">Waste found</div><h3>${L.name}</h3><div class="wh">${L.what}</div>` +
        `<div class="mn"><b class="tnum">${L.money}</b><span>${L.unit}</span></div>` +
        `<ul>${L.finds.map((f) => `<li>${f}</li>`).join("")}</ul>` +
        `<div class="fx"><small>What the agents do</small>${L.fix}</div>`);
      const go = () => {
        filter = "all"; $$("#fFilters button").forEach((x, i) => x.setAttribute("aria-pressed", String(i === 0)));
        setLevel(L.id);
        $("#fFilters").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      };
      card.addEventListener("click", go);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      wrap.appendChild(card);
    });
    wrap.appendChild(h("div", { class: "lvl-total rv" }, "<span>Campaign + product level, every month</span><b class=\"tnum\">₹34,400 · 48% of the budget</b><span>Asset waste sits inside both.</span>"));
  }
  function counters() {
    const els = $$("[data-count]");
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return; io.unobserve(en.target);
      const el = en.target, end = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
      if (reduced) return;
      const t0 = performance.now(), dur = 1400;
      const step = () => { const k = Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + Math.round(end * e).toLocaleString("en-IN") + suf; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      setTimeout(() => { el.textContent = pre + end.toLocaleString("en-IN") + suf; }, dur + 80);
    }), { threshold: 0.4 });
    els.forEach((e) => io.observe(e));
  }

  /* =========================================================
     REPORT CHARTS (paper)
     ========================================================= */
  const C = { red: "#d8432f", orange: "#e8902c", green: "#2c7a3f", ink: "#17191e", ink2: "#5b5f68", line: "#cfc8b8", blue: "#3b5bdb" };
  function svgBox(w, hgt) { return s("svg", { viewBox: `0 0 ${w} ${hgt}`, width: "100%", role: "img", style: "max-width:100%;height:auto;display:block" }); }

  function chartWaste() {
    const W = 620, H = 150, x0 = 4, x1 = W - 4, total = 71800, sc = (x1 - x0) / total;
    const svg = svgBox(W, H);
    svg.setAttribute("aria-label", "Monthly ad budget ₹71,800: ₹16,900 to products that never sell, ₹17,500 to video ads with no product, ₹37,400 to what works");
    const segs = [[16900, C.red, "₹16,900"], [17500, C.orange, "₹17,500"], [37400, C.green, "₹37,400"]];
    let x = x0; const y = 56, bh = 46;
    segs.forEach(([v, col, lab], i) => {
      const w = v * sc - (i < 2 ? 2 : 0);
      const r = s("rect", { x, y, width: 0, height: bh, rx: 4, fill: col }); svg.appendChild(r);
      r.dataset.w = w;
      const t = s("text", { x: x + 10, y: y + bh / 2 + 5, fill: "#fff", style: "font-family:var(--sans);font-size:14px;font-weight:600;fill:#fff" }); t.textContent = lab; svg.appendChild(t);
      x += v * sc;
    });
    const bx = x0, bx2 = x0 + 34400 * sc;
    svg.appendChild(s("path", { d: `M${bx},44 V36 H${bx2} V44`, fill: "none", stroke: C.red, "stroke-width": 1.5 }));
    const tl = s("text", { x: bx, y: 26, class: "lbl-strong", style: `fill:${C.red}` }); tl.textContent = "₹34,400 · 48% sold nothing"; svg.appendChild(tl);
    [0, 20000, 40000, 60000, 71800].forEach((v) => {
      const tx = x0 + v * sc;
      svg.appendChild(s("line", { x1: tx, x2: tx, y1: y + bh + 4, y2: y + bh + 10, stroke: C.line }));
      const t = s("text", { x: Math.min(tx, W - 40), y: y + bh + 26, "text-anchor": v === 0 ? "start" : v === 71800 ? "end" : "middle" }); t.textContent = v === 0 ? "₹0" : v === 71800 ? "₹71.8k" : `₹${v / 1000}k`; svg.appendChild(t);
    });
    $("#vizWaste").appendChild(svg);
    grow(svg);
  }
  function chartGrowth() {
    const rows = [["Ad spend", 96, C.red, "₹37,200 → ₹73,100 a month"], ["Online revenue", 31, C.green, "₹2.47 lakh → ₹3.24 lakh"], ["Platform sales", 21, C.green, "97 → 117 a month"], ["Online orders", 18, C.green, "146 → 172 a month"]];
    const W = 620, H = 210, lx = 132, x1 = W - 70, max = 100, sc = (x1 - lx) / max, rh = 30, gap = 18;
    const svg = svgBox(W, H); svg.setAttribute("aria-label", "Year-on-year change: ad spend +96%, revenue +31%, platform sales +21%, orders +18%");
    rows.forEach(([name, v, col, sub], i) => {
      const y = 14 + i * (rh + gap);
      const t = s("text", { x: 0, y: y + 13, class: "lbl-strong" }); t.textContent = name; svg.appendChild(t);
      const st = s("text", { x: 0, y: y + 28 }); st.textContent = sub; svg.appendChild(st);
      const r = s("rect", { x: lx, y: y + 2, width: 0, height: rh - 6, rx: 4, fill: col }); r.dataset.w = v * sc; svg.appendChild(r);
      const vt = s("text", { x: lx + v * sc + 8, y: y + 19, class: "lbl-strong" }); vt.textContent = `+${v}%`; svg.appendChild(vt);
    });
    svg.appendChild(s("line", { x1: lx, x2: lx, y1: 8, y2: H - 6, stroke: C.line }));
    $("#vizGrowth").appendChild(svg); grow(svg);
  }
  function chartCurve() {
    const W = 620, H = 250, l = 46, r = W - 16, t = 16, b = H - 40;
    const xs = (v) => l + ((v - 3) / 6) * (r - l), ys = (v) => b - (v / 2.6) * (b - t);
    const svg = svgBox(W, H); svg.setAttribute("aria-label", "Extra sales per extra ₹1,000 a week on Search: 2.1 at ₹4,000 a week, 1.4 at ₹6,000, 1.05 at ₹8,000");
    [0, 0.5, 1, 1.5, 2, 2.5].forEach((v) => {
      svg.appendChild(s("line", { x1: l, x2: r, y1: ys(v), y2: ys(v), stroke: C.line, "stroke-dasharray": v ? "2 4" : "" }));
      const tt = s("text", { x: l - 8, y: ys(v) + 4, "text-anchor": "end" }); tt.textContent = v; svg.appendChild(tt);
    });
    [3, 4, 5, 6, 7, 8, 9].forEach((v) => { const tt = s("text", { x: xs(v), y: b + 18, "text-anchor": "middle" }); tt.textContent = `₹${v}k`; svg.appendChild(tt); });
    const xl = s("text", { x: r, y: H - 4, "text-anchor": "end" }); xl.textContent = "Search spend a week →"; svg.appendChild(xl);
    let d = "", area = "";
    for (let v = 3; v <= 9.001; v += 0.1) { const p = `${xs(v).toFixed(1)},${ys(8.4 / v).toFixed(1)}`; d += (d ? " L" : "M") + p; }
    area = d + ` L${xs(9)},${b} L${xs(3)},${b} Z`;
    svg.appendChild(s("path", { d: area, fill: "rgba(59,91,219,.08)" }));
    const line = s("path", { d, fill: "none", stroke: C.blue, "stroke-width": 2.5, "stroke-linecap": "round" }); svg.appendChild(line);
    const len = 2000; line.style.strokeDasharray = len; line.style.strokeDashoffset = len; line.dataset.draw = "1";
    const today = xs(3.8), next = xs(4.95);
    svg.appendChild(s("line", { x1: today, x2: today, y1: t, y2: b, stroke: C.ink2, "stroke-dasharray": "3 3" }));
    const tl = s("text", { x: today + 6, y: t + 12 }); tl.textContent = "today ₹3.8k"; svg.appendChild(tl);
    svg.appendChild(s("line", { x1: next, x2: next, y1: t + 18, y2: b, stroke: C.green, "stroke-dasharray": "3 3" }));
    const nl = s("text", { x: next + 6, y: t + 30, style: `fill:${C.green}` }); nl.textContent = "+₹5,000 a month → ₹4.95k"; svg.appendChild(nl);
    [[4, 2.1], [6, 1.4], [8, 1.05]].forEach(([x, y]) => {
      svg.appendChild(s("circle", { cx: xs(x), cy: ys(y), r: 6, fill: C.blue, stroke: "#f3f0e8", "stroke-width": 2 }));
      const lt = s("text", { x: xs(x) + 10, y: ys(y) - 8, class: "lbl-strong" }); lt.textContent = `${y} sales`; svg.appendChild(lt);
    });
    $("#vizCurve").appendChild(svg); grow(svg);
  }
  function chartLines() {
    const rows = [["Hero line", 11.9], ["Line 2", 10.4], ["Line 3", 6.9], ["Growing media", 4.9], ["Pots", 4.3], ["Non-core lines", 0.58]];
    const W = 620, H = 250, lx = 120, x1 = W - 60, max = 12, sc = (x1 - lx) / max, rh = 26, gap = 12;
    const svg = svgBox(W, H); svg.setAttribute("aria-label", "Rupees back per rupee of ads: hero line 11.9, line 2 10.4, line 3 6.9, growing media 4.9, pots 4.3, non-core lines 0.58");
    rows.forEach(([name, v], i) => {
      const y = 10 + i * (rh + gap);
      const t = s("text", { x: 0, y: y + 17, class: "lbl-strong" }); t.textContent = name; svg.appendChild(t);
      const r = s("rect", { x: lx, y, width: 0, height: rh, rx: 4, fill: v < 1 ? C.red : C.green }); r.dataset.w = v * sc; svg.appendChild(r);
      const vt = s("text", { x: lx + v * sc + 8, y: y + 17, class: "lbl-strong" }); vt.textContent = `₹${v.toFixed(2).replace(/\.?0+$/, "")}`; svg.appendChild(vt);
    });
    const bx = lx + 1 * sc;
    svg.appendChild(s("line", { x1: bx, x2: bx, y1: 0, y2: H - 22, stroke: C.ink, "stroke-dasharray": "3 3" }));
    const bt = s("text", { x: bx + 4, y: H - 6 }); bt.textContent = "₹1 = break-even"; svg.appendChild(bt);
    $("#vizLines").appendChild(svg); grow(svg);
  }
  function grow(svg) {
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return; io.disconnect();
      $$("rect[data-w]", svg).forEach((r, i) => {
        const w = +r.dataset.w;
        if (reduced || !window.gsap) r.setAttribute("width", w);
        else { gsap.to(r, { attr: { width: w }, duration: 1.1, delay: i * 0.08, ease: "power3.out" }); setTimeout(() => r.setAttribute("width", w), 1400 + i * 80); }
      });
      $$("path[data-draw]", svg).forEach((p) => { if (reduced || !window.gsap) p.style.strokeDashoffset = 0; else { gsap.to(p, { strokeDashoffset: 0, duration: 1.6, ease: "power2.out" }); setTimeout(() => (p.style.strokeDashoffset = 0), 1900); } });
    }, { threshold: 0.35 });
    io.observe(svg);
  }

  /* plan (approve toggles) */
  const PLAN = [
    { id: "p1", what: "Stop advertising the 792 products that never sell.", sub: "They took ₹51,100 in 3 months and sold nothing through ads.", save: 16900, budget: -16900, rev: [0, 0] },
    { id: "p2", what: "Bid only for purchases, set targets to 4–5 and move ₹5,000 a month back into Search.", sub: "The returns curve shows that the first ₹5,000 pays back.", save: 0, budget: 5000, rev: [6800, 19200] },
    { id: "p3", what: "Switch off the video ads that show no product for 3 to 4 weeks, as a test.", sub: "They cost ₹34,000 a month and brought ₹400 of traced sales.", save: 17500, budget: -17500, rev: [0, 0] },
    { id: "p4", what: "Run a flash sale for 2 to 3 days every 2 to 3 months, with 15% to 20% off.", sub: "A 2-day sale at 20% off brought 2.6 times the normal daily orders.", save: 0, budget: 0, rev: [10000, 16500] },
    { id: "p5", what: "Bring in a fresh batch of the hero product every 1 to 2 months.", sub: "The hero line sells ₹42–89k in a fresh-batch month.", save: 0, budget: 0, rev: [17000, 34000] },
  ];
  function buildPlan() {
    const ul = $("#planList");
    PLAN.forEach((p) => {
      const k = (v) => (Math.round(v / 100) / 10).toString();
      const amt = conv(p.save ? `saves ${inr(p.save)}` : p.rev[1] ? `+₹${k(p.rev[0])}–${k(p.rev[1])}k a month` : "");
      const li = h("li", { "data-id": p.id, role: "switch", "aria-checked": "false", tabindex: "0" }, `<span class="tg"></span><span class="what">${conv(p.what)}<small>${conv(p.sub)}</small></span><span class="amt">${amt}</span>`);
      const toggle = () => { li.classList.toggle("on"); li.setAttribute("aria-checked", String(li.classList.contains("on"))); updatePlan(); };
      li.addEventListener("click", toggle);
      li.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
      ul.appendChild(li);
    });
    updatePlan();
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return; io.disconnect();
      $$("li", ul).forEach((li, i) => setTimeout(() => { if (!li.classList.contains("on")) { li.classList.add("on"); li.setAttribute("aria-checked", "true"); updatePlan(); } }, reduced ? 0 : 500 + i * 650));
    }, { threshold: 0.5 });
    io.observe(ul);
  }
  let shown = { b: 71800, s: 0, lo: 0, hi: 0 };
  function updatePlan() {
    const on = $$("#planList li.on").map((li) => PLAN.find((p) => p.id === li.dataset.id));
    const tgt = { b: 71800 + on.reduce((a, p) => a + p.budget, 0), s: on.reduce((a, p) => a + p.save, 0), lo: on.reduce((a, p) => a + p.rev[0], 0), hi: on.reduce((a, p) => a + p.rev[1], 0) };
    const r1k = (v) => Math.round(v / 1000) * 1000;
    const paint = (cur, final) => {
      $("#planBudget").textContent = money(cur.b);
      $("#planSave").textContent = money(cur.s);
      const lo = final ? r1k(cur.lo) : cur.lo, hi = final ? r1k(cur.hi) : cur.hi;
      $("#planRev").textContent = cur.hi ? (USD ? `${usd(lo * F)}–${usd(hi * F).slice(1)}` : `${inr(lo)}–${Math.round(hi).toLocaleString("en-IN")}`) : (USD ? "$0" : "₹0");
    };
    const from = { ...shown }; const t0 = performance.now(), dur = reduced ? 0 : 600;
    const id = ++planAnim;
    const step = () => {
      if (id !== planAnim) return;
      const k = dur ? Math.min(1, (performance.now() - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
      paint(Object.fromEntries(Object.keys(tgt).map((key) => [key, from[key] + (tgt[key] - from[key]) * e])), k >= 1);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(() => { if (id === planAnim) paint(tgt, true); }, dur + 50);   // always land on the final numbers
    shown = tgt;
  }
  let planAnim = 0;

  /* =========================================================
     LIBRARY + BENCHMARKS
     ========================================================= */
  function buildLibrary() {
    const wrap = $("#libGrid"); if (!wrap || !window.AUTOMATIONS) return;
    wrap.className = "";
    let n = 0;
    PILLARS.forEach((p) => {
      const list = AUTOMATIONS[p.id];
      const sec = h("div", { class: "auto-pillar rv" }, `<div class="auto-head"><h3>${p.name}</h3><span class="mono">${list.length}+ automations</span></div>`);
      const ul = h("ul", { class: "auto-list" });
      list.forEach(([t, demo]) => {
        n++;
        const w = demo && WORKFLOWS.find((x) => x.id === demo);
        ul.appendChild(h("li", {}, `<span class="n">${String(n).padStart(2, "0")}</span><span class="t">${t}</span>` +
          (w ? `<button class="demo" type="button" data-demo="${w.id}" data-p="${w.pillar}">▶ Workflow ${w.no}</button>` : "<span></span>")));
      });
      sec.appendChild(ul); wrap.appendChild(sec);
    });
    const cnt = $("#autoCount"); if (cnt) cnt.textContent = `${Math.floor(n / 5) * 5}+`;
    wrap.addEventListener("click", (e) => {
      const b = e.target.closest("[data-demo]"); if (!b) return;
      selectPillar(b.dataset.p); loadWorkflow(b.dataset.demo, false);
      $("#workflows").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      setTimeout(runWorkflow, reduced ? 0 : 700);
    });
    const bw = $("#benchGrid"); if (bw && window.BENCH) BENCH.forEach((b) => bw.appendChild(h("a", { class: "bench rv", href: b.url, target: "_blank", rel: "noopener" }, `<div class="bn">${b.n}</div><p>${b.t}</p><span class="src">${b.src} ↗</span>`)));
  }

  /* =========================================================
     REVEALS
     ========================================================= */
  function reveals() {
    const els = $$(".rv");
    if (reduced) { els.forEach((e) => (e.style.opacity = 1)); return; }
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.ticker.lagSmoothing(0);
      els.forEach((el) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });
      ScrollTrigger.create({ trigger: "#workflows", start: "top 55%", once: true, onEnter: () => { if (!autoRan) { autoRan = true; runWorkflow(); } } });
    } else {
      const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.style.transition = "opacity .9s, transform .9s"; en.target.style.opacity = 1; en.target.style.transform = "none"; io.unobserve(en.target); } }), { threshold: 0.12 });
      els.forEach((e) => io.observe(e));
    }
  }

  /* ---------------- boot ---------------- */
  convData();
  buildTabs();
  selectPillar("perf");
  buildLevels(); buildFilters(); renderFindings(); counters();
  chartWaste(); chartGrowth(); chartCurve(); chartLines(); buildPlan();
  buildLibrary();
  pillarViz();
  convDom();
  reveals();
  heroIntro();
  startHero();
})();
