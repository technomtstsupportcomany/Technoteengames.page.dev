(() => {
  const UNWRAP_KEY = 'sidequest-xmas-unwrapped';
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = id => document.getElementById(id);
  // The Holiday Edition stays wrapped until midnight on 1 December in the visitor's own time zone.
  // Adding ?preview-xmas to the URL skips the lock so the team can check it early.
  const UNLOCK_AT = new Date(2026, 11, 1);
  const previewEarly = new URLSearchParams(location.search).has('preview-xmas');
  const isLocked = () => !previewEarly && Date.now() < UNLOCK_AT.getTime();

  /* ---------- Peel-off reveal ---------- */
  let corner = null;
  let hint = null;
  let peel = null;
  let countdownTimer = null;

  function countdownText() {
    const left = Math.max(0, UNLOCK_AT.getTime() - Date.now());
    const days = Math.floor(left / 864e5);
    const hours = Math.floor(left / 36e5) % 24;
    const minutes = Math.floor(left / 6e4) % 60;
    return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
  }

  function renderHint(nudged = false) {
    if (!hint || !corner) return;
    const locked = isLocked();
    corner.classList.toggle('is-locked', locked);
    if (locked) {
      corner.setAttribute('aria-label', `The Sidequest Christmas update is wrapped until December 1. Unwraps in ${countdownText()}.`);
      hint.innerHTML = nudged
        ? `<small>NO PEEKING 🎅</small>Still wrapped! Come back on December 1 · <b>${countdownText()}</b>`
        : `<small>🔒 HOLIDAY EDITION · DEC 1</small>Something's wrapped under here. Unwraps in <b>${countdownText()}</b>`;
    } else {
      corner.setAttribute('aria-label', 'Peel off the page to reveal the Sidequest Christmas update');
      hint.innerHTML = '<small>NEW · HOLIDAY EDITION</small>Grab the corner to peel back the page 🎁';
    }
  }

  function nudgeLocked() {
    renderHint(true);
    corner.classList.remove('is-tugged');
    void corner.offsetWidth;
    corner.classList.add('is-tugged');
  }

  function showCorner() {
    if (corner) return;
    corner = document.createElement('button');
    corner.type = 'button';
    corner.className = 'peel-corner';
    corner.setAttribute('aria-label', 'Peel off the page to reveal the Sidequest Christmas update');
    corner.innerHTML = '<span class="peel-under"></span><span class="peel-flap"></span>';
    hint = document.createElement('div');
    hint.className = 'peel-hint';
    hint.setAttribute('aria-hidden', 'true');
    document.body.append(hint, corner);
    renderHint();
    // Refresh the countdown, and switch the corner over to peelable the moment December arrives.
    countdownTimer = setInterval(() => renderHint(), 30000);

    corner.addEventListener('pointerdown', event => {
      if (isLocked()) { event.preventDefault(); nudgeLocked(); return; }
      startDrag(event);
    });
    // Keyboard activation (Enter/Space) fires click with no pointer details.
    corner.addEventListener('click', event => {
      if (event.detail !== 0) return;
      if (isLocked()) nudgeLocked();
      else beginPeel().then(() => finishPeel());
    });
  }

  function hideCorner() {
    corner?.remove();
    hint?.remove();
    corner = hint = null;
    clearInterval(countdownTimer);
  }

  // Serialise the page as it looks right now so it can be peeled away in an isolated frame.
  function snapshotHtml() {
    const clone = root.cloneNode(true);
    const liveFields = root.querySelectorAll('input, textarea, select');
    clone.querySelectorAll('input, textarea, select').forEach((field, i) => {
      const live = liveFields[i];
      if (!live) return;
      if (field.tagName === 'TEXTAREA') field.textContent = live.value;
      else if (field.tagName === 'SELECT') [...field.options].forEach((option, j) => option.toggleAttribute('selected', live.options[j]?.selected));
      else if (live.type === 'checkbox' || live.type === 'radio') field.toggleAttribute('checked', live.checked);
      else field.setAttribute('value', live.value);
    });
    clone.querySelectorAll('script, iframe, .peel-corner, .peel-hint, .xmas-snow, [id*="kofi" i], [class*="kofi" i], [class*="floatingchat" i]').forEach(node => node.remove());
    clone.classList.remove('xmas');
    const freeze = document.createElement('style');
    freeze.textContent = 'html{scroll-behavior:auto!important;overflow:hidden!important}*,*::before,*::after{animation:none!important;transition:none!important}';
    clone.querySelector('head').append(freeze);
    return '<!doctype html>' + clone.outerHTML;
  }

  function beginPeel() {
    if (peel) return peel.ready;
    const width = root.clientWidth;
    const height = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const sheet = document.createElement('iframe');
    sheet.className = 'peel-sheet';
    sheet.setAttribute('aria-hidden', 'true');
    sheet.tabIndex = -1;
    sheet.style.width = width + 'px';
    sheet.style.height = height + 'px';
    sheet.srcdoc = snapshotHtml();

    const shadow = document.createElement('div');
    shadow.className = 'peel-shadow';
    const back = document.createElement('div');
    back.className = 'peel-back';
    const backFace = document.createElement('div');
    back.append(backFace);

    peel = { sheet, shadow, back, backFace, width, height, t: 0, loaded: false };
    peel.ready = new Promise(resolve => {
      sheet.addEventListener('load', () => {
        sheet.contentWindow.scrollTo(scrollX, scrollY);
        // Moving the iframe would reload it, so the layers are placed around it instead.
        sheet.before(shadow);
        sheet.after(back);
        peel.loaded = true;
        renderPeel(Math.max(peel.t, 40));
        hideCorner();
        unwrap();
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        resolve();
      }, { once: true });
    });
    // The frame only loads once it is in the document; keep it invisible until then.
    sheet.style.visibility = 'hidden';
    document.body.append(sheet);
    peel.ready.then(() => { sheet.style.visibility = ''; });
    return peel.ready;
  }

  // Clip the rectangle to the half-plane x + y <= k (keepBelow) or x + y >= k.
  function clipRect(w, h, k, keepBelow) {
    const pts = [[0, 0], [w, 0], [w, h], [0, h]];
    const inside = ([x, y]) => keepBelow ? x + y <= k : x + y >= k;
    const out = [];
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      if (inside(p)) out.push(p);
      if (inside(p) !== inside(q)) {
        const s = (k - p[0] - p[1]) / ((q[0] - p[0]) + (q[1] - p[1]));
        out.push([p[0] + s * (q[0] - p[0]), p[1] + s * (q[1] - p[1])]);
      }
    });
    return out;
  }

  const toPolygon = pts => pts.length ? `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})` : 'polygon(0 0,0 0,0 0)';

  // t = how far the fold line has travelled from the bottom-right corner (along x + y).
  function renderPeel(t) {
    if (!peel?.loaded) return;
    const { width: w, height: h } = peel;
    const total = w + h;
    t = Math.min(Math.max(t, 0), total);
    peel.t = t;
    const k = total - t;
    const fold = k / total * 100;
    const depth = t / total * 100;

    peel.sheet.style.clipPath = toPolygon(clipRect(w, h, k, true));
    // The lifted part of the page, mirrored across the fold line.
    const flap = clipRect(w, h, k, false).map(([x, y]) => [k - y, k - x]);
    peel.backFace.style.clipPath = toPolygon(flap);
    peel.backFace.style.background = `linear-gradient(135deg, #bdb7a5 ${fold - depth}%, #ece7d8 ${fold - depth * .55}%, #fffef7 ${fold - depth * .12}%, #d6cfbb ${fold}%)`;
    peel.shadow.style.background = `linear-gradient(135deg, transparent ${fold}%, #0000008c ${fold}%, transparent ${fold + Math.min(depth * .5, 7)}%)`;
  }

  function animatePeel(to, duration) {
    return new Promise(resolve => {
      const from = peel.t;
      const start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        renderPeel(from + (to - from) * eased);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  function endPeel() {
    if (!peel) return;
    peel.sheet.remove();
    peel.shadow.remove();
    peel.back.remove();
    peel = null;
  }

  async function finishPeel() {
    if (!peel) return;
    await peel.ready;
    if (reduceMotion.matches) {
      endPeel();
      return;
    }
    const remaining = (peel.width + peel.height) - peel.t;
    await animatePeel(peel.width + peel.height, Math.max(500, Math.min(1400, remaining * .9)));
    endPeel();
  }

  function startDrag(event) {
    event.preventDefault();
    beginPeel();
    const pull = ({ clientX, clientY }) => ((peel?.width ?? innerWidth) - clientX + (peel?.height ?? innerHeight) - clientY) / 2;

    const onMove = e => {
      if (peel) peel.t = Math.max(40, pull(e));
      renderPeel(peel?.t ?? 0);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      finishPeel();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  /* ---------- Festive extras ---------- */
  let snowStop = null;
  let festiveReady = false;

  function startSnow() {
    if (snowStop || reduceMotion.matches) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'xmas-snow';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    let flakes = [];
    let frame = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * ratio;
      canvas.height = innerHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.round(Math.min(140, innerWidth / 10));
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 2.2 + .6,
        speed: Math.random() * .6 + .3,
        drift: Math.random() * Math.PI * 2
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.fillStyle = '#ffffffcc';
      ctx.beginPath();
      flakes.forEach(f => {
        f.y += f.speed;
        f.drift += .01;
        f.x += Math.sin(f.drift) * .35;
        if (f.y > innerHeight + 4) { f.y = -4; f.x = Math.random() * innerWidth; }
        ctx.moveTo(f.x + f.r, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      });
      ctx.fill();
      frame = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    snowStop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.remove();
      snowStop = null;
    };
  }

  function addLights() {
    const header = document.querySelector('.site-header');
    if (!header || header.querySelector('.xmas-lights')) return;
    const lights = document.createElement('div');
    lights.className = 'xmas-lights';
    lights.setAttribute('aria-hidden', 'true');
    const count = Math.max(10, Math.round(header.clientWidth / 60));
    for (let i = 0; i < count; i++) {
      const bulb = document.createElement('i');
      bulb.style.setProperty('--d', `${(i % 5) * .3}s`);
      lights.append(bulb);
    }
    header.append(lights);
  }

  const adventQuests = [
    ['Name it', 'Write three names for a holiday business idea. Keep the one that is easiest to say out loud.'],
    ['Gift gap', 'Ask two people about a gift they wish existed. What problem sits behind that wish?'],
    ['Price tag', 'Pick a gift you could make. Add up the materials, then choose a fair price.'],
    ['Wrap & brand', 'Sketch a gift tag or sticker that would make your product easy to recognise.'],
    ['Jingle pitch', 'Pitch your idea in ten seconds, like a holiday ad. Say it out loud twice.'],
    ['Budget elf', 'Plan a $20 budget for a mini holiday stall. Keep $3 aside as a buffer.'],
    ['Kind startup', 'Dream up a service that helps a neighbour this season. Who benefits most?'],
    ['Team sleigh', 'Split a holiday project into three clear roles. Who is great at each one?'],
    ['Feedback cocoa', 'Share your idea with a friend and ask, “What would make this better?”'],
    ['Leftover math', 'You made 30 cards and sold 22. Write one thing you would change next time.'],
    ['Thank-you note', 'Write a thank-you to someone who helped your idea. Good founders say thanks.'],
    ['New-year map', 'Write one small business goal for January—and the very first step.']
  ];

  function buildAdvent() {
    const grid = $('advent-grid');
    if (!grid) return;
    const update = () => {
      const opened = grid.querySelectorAll('.is-open').length;
      $('advent-count').textContent = opened;
      $('advent-progress').style.width = `${opened / adventQuests.length * 100}%`;
    };
    adventQuests.forEach(([title, task], i) => {
      const door = document.createElement('button');
      door.type = 'button';
      door.className = 'advent-door';
      door.setAttribute('aria-expanded', 'false');
      door.setAttribute('aria-label', `Day ${i + 1}: open door`);
      door.innerHTML = `<span class="door-back"><small>DAY ${String(i + 1).padStart(2, '0')} · ${title.toUpperCase()}</small>${task}</span><span class="door-front" aria-hidden="true">${i + 1}</span>`;
      door.addEventListener('click', () => {
        const open = door.classList.toggle('is-open');
        door.setAttribute('aria-expanded', String(open));
        door.setAttribute('aria-label', open ? `Day ${i + 1}: ${title}. ${task}` : `Day ${i + 1}: open door`);
        update();
      });
      grid.append(door);
    });
    update();
  }

  function buildCocoa() {
    const form = $('cocoa-form');
    if (!form) return;
    const price = $('cocoa-price');
    const batch = $('cocoa-batch');
    const extra = $('cocoa-extra');
    const result = $('cocoa-result');
    const money = n => `${n < 0 ? '−' : ''}$${Math.abs(n).toFixed(2)}`;

    const syncLabels = () => {
      $('cocoa-price-out').textContent = money(+price.value);
      $('cocoa-batch-out').textContent = batch.value;
    };
    price.addEventListener('input', syncLabels);
    batch.addEventListener('input', syncLabels);
    syncLabels();

    form.addEventListener('submit', event => {
      event.preventDefault();
      const cupPrice = +price.value;
      const cups = +batch.value;
      const cupCost = .8 + (extra.checked ? .4 : 0);
      const demand = Math.round(130 * Math.exp(-.42 * (cupPrice - 1)) * (extra.checked ? 1.3 : 1));
      const sold = Math.min(demand, cups);
      const revenue = sold * cupPrice;
      const costs = cups * cupCost + 15;
      const profit = revenue - costs;
      const leftover = cups - sold;
      const missed = demand - sold;

      let tip;
      if (profit < 0) tip = 'The stall fee and ingredients cost more than the day brought in. Try a price that still covers each cup, and prep closer to what you think will sell.';
      else if (missed > 8) tip = `Sold out with about ${missed} people still in line! Next time, prep more cups—or nudge the price up a little.`;
      else if (leftover > 10) tip = `${leftover} cups went cold. Prepping fewer, or a friendlier price, would turn that waste into profit.`;
      else tip = 'Nicely balanced: you covered every cost, wasted very little, and kept the line happy. That is founder thinking.';

      result.innerHTML = `<div class="cocoa-stats">
        <span>CUPS SOLD<b>${sold}</b></span>
        <span>REVENUE<b>${money(revenue)}</b></span>
        <span>COSTS<b>${money(costs)}</b></span>
        <span>PROFIT<b class="${profit >= 0 ? 'is-profit' : 'is-loss'}">${money(profit)}</b></span>
      </div>${tip}`;
    });
  }

  function startFestive() {
    addLights();
    startSnow();
    if (!festiveReady) {
      festiveReady = true;
      buildAdvent();
      buildCocoa();
      $('xmas-rewrap')?.addEventListener('click', rewrap);
    }
  }

  function unwrap() {
    root.classList.add('xmas');
    try { sessionStorage.setItem(UNWRAP_KEY, '1'); } catch { /* The reveal applies for this page view. */ }
    startFestive();
  }

  function rewrap() {
    root.classList.remove('xmas');
    try { sessionStorage.removeItem(UNWRAP_KEY); } catch { /* Nothing stored to clear. */ }
    snowStop?.();
    document.querySelector('.xmas-lights')?.remove();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    showCorner();
  }

  if (root.classList.contains('xmas') && isLocked()) root.classList.remove('xmas');
  if (root.classList.contains('xmas')) startFestive();
  else showCorner();
})();
