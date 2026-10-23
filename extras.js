(() => {
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  /* ---------- CELEBRATION FX ---------- */
  const layer = document.createElement('div');
  layer.className = 'sq-fx-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  const confettiColors = ['#d5ff5e', '#85efd4', '#ff947b', '#a8d9ed', '#ffffff'];

  function confetti(x, y, count = 36) {
    if (reduceMotion.matches) return;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('i');
      piece.className = 'sq-confetti';
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.background = pick(confettiColors);
      if (Math.random() > 0.6) piece.style.borderRadius = '50%';
      layer.appendChild(piece);
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 260;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 160;
      piece.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 420}px) rotate(${Math.random() * 900 - 450}deg)`, opacity: 0 }
      ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.15,.7,.4,1)' }).onfinish = () => piece.remove();
    }
  }

  function xpPop(x, y, amount) {
    const pop = document.createElement('span');
    pop.className = 'sq-xp-pop';
    pop.textContent = `+${amount} XP`;
    pop.style.left = `${x}px`;
    pop.style.top = `${y}px`;
    layer.appendChild(pop);
    setTimeout(() => pop.remove(), 1300);
  }

  const toast = document.createElement('div');
  toast.className = 'sq-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  let toastTimer = null;
  function showToast(icon, label, text) {
    toast.innerHTML = `<b>${icon}</b><span><small>${label}</small><strong>${text}</strong></span>`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function centerOf(el) {
    if (!el) return { x: innerWidth / 2, y: innerHeight / 2 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  window.addEventListener('sq:xp', (event) => {
    const { amount, el } = event.detail;
    const { x, y } = centerOf(el);
    xpPop(x, y - 10, amount);
    confetti(x, y, 18);
  });
  window.addEventListener('sq:complete', (event) => {
    const { x, y } = centerOf(document.querySelector('.result-medal'));
    confetti(x, y, event.detail.perfect ? 90 : 50);
    if (event.detail.perfect) showToast('★', 'PERFECT ROUND', '3 for 3. Founder instincts confirmed.');
  });
  window.addEventListener('sq:levelup', (event) => {
    confetti(innerWidth / 2, innerHeight * 0.35, 110);
    showToast('↑', 'LEVEL UP', `You’re now a ${event.detail.name}.`);
  });

  // Secret: the Konami code flips on Turbo Founder mode.
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let codeIndex = 0;
  document.addEventListener('keydown', (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    codeIndex = key === code[codeIndex] ? codeIndex + 1 : (key === code[0] ? 1 : 0);
    if (codeIndex < code.length) return;
    codeIndex = 0;
    const on = document.body.classList.toggle('sq-turbo');
    confetti(innerWidth / 2, innerHeight / 2, 140);
    showToast('✳', 'SECRET UNLOCKED', on ? 'Turbo Founder mode: ON' : 'Turbo Founder mode: OFF');
  });

  /* ---------- IDEA REACTOR ---------- */
  const reelData = {
    product: [['🍪', 'Cookie subscription'], ['🎒', 'Upcycled backpacks'], ['🌱', 'Desk plant kits'], ['🎧', 'Study playlists'], ['🧦', 'Mismatched sock club'], ['📸', 'Mini photo booth'], ['🧩', 'Custom puzzles'], ['🎨', 'Sticker packs'], ['🚲', 'Bike tune-ups'], ['🕯️', 'Scented candles'], ['🤖', 'Robot workshops'], ['📚', 'Book swap app']],
    audience: [['🧑‍🎓', 'exam-week students'], ['👵', 'tech-curious grandparents'], ['🐶', 'busy dog owners'], ['⚽', 'local sports teams'], ['🎮', 'gamers who need a break'], ['🧑‍🍳', 'first-time home cooks'], ['🎤', 'school band members'], ['🌍', 'eco-minded neighbors'], ['👶', 'tired new parents'], ['🏫', 'teachers on a budget']],
    twist: [['♻️', 'made from waste'], ['⚡', 'delivered in 30 min'], ['🌙', 'only sold at night'], ['🎁', 'with a mystery bonus'], ['🗳️', 'customers vote the design'], ['🧪', 'a new flavor every week'], ['🤝', 'buy one, gift one'], ['📍', 'pop-up at random spots'], ['🎲', 'gamified with points'], ['🔊', 'with a theme song']]
  };
  const reels = [...document.querySelectorAll('.reel')];
  const result = { product: null, audience: null, twist: null };
  const spinButton = $('reactor-spin');

  function itemHTML([emoji, label]) {
    return `<div class="reel-item"><b>${emoji}</b><span>${label}</span></div>`;
  }
  function setReel(reel, item) {
    const strip = reel.querySelector('.reel-strip');
    strip.style.transition = 'none';
    strip.style.transform = 'translateY(0)';
    strip.innerHTML = itemHTML(item);
    result[reel.dataset.reel] = item;
  }
  function spinReel(reel, delay) {
    return new Promise((resolve) => {
      const list = reelData[reel.dataset.reel];
      const final = pick(list);
      result[reel.dataset.reel] = final;
      const strip = reel.querySelector('.reel-strip');
      if (reduceMotion.matches) { setReel(reel, final); resolve(); return; }
      const count = 14 + Math.floor(delay / 90);
      const items = Array.from({ length: count }, () => pick(list));
      items.push(final);
      strip.style.transition = 'none';
      strip.style.transform = 'translateY(0)';
      // Keep the currently visible item on top so the spin starts seamlessly.
      strip.innerHTML += items.map(itemHTML).join('');
      const height = strip.firstElementChild.offsetHeight;
      void strip.offsetHeight;
      strip.style.transition = `transform ${1.1 + delay / 1000}s cubic-bezier(.12,.75,.2,1.04)`;
      strip.style.transform = `translateY(-${items.length * height}px)`;
      strip.addEventListener('transitionend', () => { setReel(reel, final); resolve(); }, { once: true });
    });
  }
  function renderIdea() {
    const { product, audience, twist } = result;
    if (!product) return;
    $('reactor-idea').innerHTML = `<mark>${product[1]}</mark> for ${audience[1]}, <mark>${twist[1]}</mark>.`;
    const score = 62 + Math.floor(Math.random() * 37);
    $('reactor-score').textContent = `${score}%`;
    $('reactor-bar').style.width = `${score}%`;
    $('reactor-verdict').textContent = score > 90 ? 'Wildly launchable. Go talk to 5 real people today.' : score > 78 ? 'Strong spark. Test it with a tiny pop-up first.' : 'Interesting chaos. Try locking one reel and spinning again.';
  }
  if (spinButton && reels.length) {
    reels.forEach((reel) => setReel(reel, pick(reelData[reel.dataset.reel])));
    renderIdea();
    reels.forEach((reel) => reel.querySelector('.reel-lock').addEventListener('click', (event) => {
      const locked = reel.classList.toggle('locked');
      event.currentTarget.textContent = locked ? 'LOCKED' : 'LOCK';
      event.currentTarget.setAttribute('aria-pressed', String(locked));
    }));
    spinButton.addEventListener('click', async () => {
      const toSpin = reels.filter((reel) => !reel.classList.contains('locked'));
      if (!toSpin.length) { showToast('🔒', 'ALL REELS LOCKED', 'Unlock a reel to remix your idea.'); return; }
      spinButton.classList.add('spinning');
      $('reactor-idea').textContent = 'Reactor warming up…';
      await Promise.all(toSpin.map((reel, i) => spinReel(reel, i * 380)));
      spinButton.classList.remove('spinning');
      renderIdea();
      const { x, y } = centerOf($('reactor-idea'));
      confetti(x, y, 24);
    });
    $('reactor-save').addEventListener('click', () => {
      const text = $('reactor-idea').textContent;
      const list = $('reactor-saved');
      if ([...list.children].some((li) => li.textContent === text)) return;
      const li = document.createElement('li');
      li.textContent = text;
      list.prepend(li);
      showToast('✦', 'IDEA VAULT', 'Saved to this page’s idea vault.');
    });
  }

  /* ---------- FOUNDER ID CARD ---------- */
  const card = $('idcard');
  if (card) {
    const nameInput = $('idcard-name-input');
    const superInput = $('idcard-super');
    let accent = '#d5ff5e';
    const serial = `SQ-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
    $('idcard-serial').textContent = serial;

    function readProgress() {
      return {
        xp: $('xp-count')?.textContent || '0',
        level: $('level-name')?.textContent || 'Curious',
        missions: $('mission-count')?.textContent || '0',
        badges: [...document.querySelectorAll('.badge-chip')].map((b) => ({ label: b.textContent.trim(), on: b.classList.contains('unlocked') }))
      };
    }
    function renderCard() {
      const p = readProgress();
      $('idcard-name').textContent = nameInput.value.trim() || 'Future Founder';
      $('idcard-title').textContent = `${p.level.toUpperCase()} · ${superInput.value.toUpperCase()}`;
      $('idcard-xp').textContent = p.xp;
      $('idcard-missions').textContent = p.missions;
      $('idcard-level').textContent = p.level;
      $('idcard-badges').innerHTML = p.badges.map((b) => `<span class="${b.on ? 'on' : ''}">${b.label}</span>`).join('');
      card.style.setProperty('--accent', accent);
    }
    [nameInput, superInput].forEach((el) => el.addEventListener('input', renderCard));
    document.querySelectorAll('.idcard-swatches button').forEach((button) => button.addEventListener('click', () => {
      accent = button.dataset.color;
      document.querySelectorAll('.idcard-swatches button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      renderCard();
    }));
    // Keep the card in sync with game progress.
    const stats = $('xp-count');
    if (stats) new MutationObserver(renderCard).observe(stats, { childList: true, characterData: true, subtree: true });
    const shelf = $('badge-shelf');
    if (shelf) new MutationObserver(renderCard).observe(shelf, { attributes: true, subtree: true, attributeFilter: ['class'] });

    // Holographic tilt.
    card.addEventListener('pointermove', (event) => {
      if (reduceMotion.matches) return;
      const r = card.getBoundingClientRect();
      const px = (event.clientX - r.left) / r.width;
      const py = (event.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(px - 0.5) * 18}deg) rotateX(${(0.5 - py) * 14}deg)`;
      card.style.setProperty('--gx', `${px * 100}%`);
      card.style.setProperty('--gy', `${py * 100}%`);
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });

    $('idcard-download').addEventListener('click', () => {
      const p = readProgress();
      const w = 1200, h = 756;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#17232c'); bg.addColorStop(0.6, '#0a0f14');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(0, 0, w, h, 54); ctx.fill();
      ctx.strokeStyle = accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 3;
      [230, 320, 410].forEach((r) => { ctx.beginPath(); ctx.arc(w - 120, h - 60, r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha *= 0.5; });
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#a9b6ba'; ctx.font = '26px monospace';
      ctx.fillText('◉ SIDEQUEST / FOUNDER ID', 64, 90);
      ctx.textAlign = 'right'; ctx.fillStyle = accent; ctx.fillText(serial, w - 64, 90); ctx.textAlign = 'left';
      ctx.fillStyle = accent; ctx.beginPath(); ctx.roundRect(w - 180, 140, 116, 86, 14); ctx.fill();
      ctx.fillStyle = '#f4f7f1'; ctx.font = '600 92px Arial, sans-serif';
      ctx.fillText((nameInput.value.trim() || 'Future Founder').slice(0, 22), 64, 330);
      ctx.fillStyle = accent; ctx.font = '30px monospace';
      ctx.fillText(`${p.level.toUpperCase()} · ${superInput.value.toUpperCase()}`, 64, 386);
      [['XP', p.xp], ['MISSIONS', p.missions], ['LEVEL', p.level]].forEach(([label, value], i) => {
        const x = 64 + i * 250;
        ctx.fillStyle = '#a9b6ba'; ctx.font = '24px monospace'; ctx.fillText(label, x, 490);
        ctx.fillStyle = '#f4f7f1'; ctx.font = '600 54px Arial, sans-serif'; ctx.fillText(String(value), x, 550);
      });
      let bx = 64;
      ctx.font = '24px monospace';
      p.badges.forEach((b) => {
        const bw = ctx.measureText(b.label).width + 30;
        ctx.strokeStyle = b.on ? accent : '#ffffff33'; ctx.lineWidth = 2;
        ctx.strokeRect(bx, 630, bw, 48);
        ctx.fillStyle = b.on ? accent : '#7b878b'; ctx.fillText(b.label, bx + 15, 663);
        bx += bw + 12;
      });
      const link = document.createElement('a');
      link.download = 'sidequest-founder-id.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      const { x, y } = centerOf(card);
      confetti(x, y, 60);
    });
    renderCard();
  }
})();
