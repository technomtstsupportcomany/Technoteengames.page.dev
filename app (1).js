(() => {
  const STORAGE_KEY = 'sidequest-progress-v1';
  const CONSENT_KEY = 'sidequest-progress-choice-v1';
  let consentChoice = 'ask';
  try { consentChoice = sessionStorage.getItem(CONSENT_KEY) || 'ask'; } catch { /* Ask again if session storage is unavailable. */ }
  let saveConsent = consentChoice === 'accept';
  const missions = {
    pricing: {
      name: 'The first price', skill: 'MONEY SMARTS',
      questions: [
        { prompt: 'Your cookie pop-up is ready. What should one box cost?', options: ['Pick the lowest price so everyone buys one.', 'Add up your costs, then choose a fair price people will pay.', 'Copy the fanciest bakery in town.'], answer: 1, good: 'A good price covers what you spend and feels fair to your customer. Start with your costs, then check what people think.', learn: 'Start with your costs, then add a fair amount for your work.' },
        { prompt: 'You spent $12 on ingredients for 6 boxes. What is the ingredient cost per box?', options: ['$2 per box', '$6 per box', '$12 per box'], answer: 0, good: 'Exactly. $12 divided across 6 boxes is $2 per box. That gives you a useful starting point for pricing.', learn: 'Divide the total cost by the number of boxes: $12 ÷ 6 = $2.' },
        { prompt: 'Friends say they would pay $5 a box. What should you check next?', options: ['If $5 covers your costs and leaves something for your effort.', 'Raise it to $20 because higher prices look premium.', 'Ignore them and guess.'], answer: 0, good: 'Smart move. A price should make sense for your customer and for the work you put in.', learn: 'A price should make sense for both your customer and your business.' }
      ]
    },
    audience: {
      name: 'Who is it for?', skill: 'KNOW YOUR PEOPLE',
      questions: [
        { prompt: 'You make custom tote bags. Who should you learn about first?', options: ['Absolutely everyone.', 'One group who might want your design, like students looking for a fun gift.', 'Only people who already own a tote.'], answer: 1, good: 'Starting with a specific group helps you make something they actually want. You can grow from there.', learn: 'A clear first audience makes it easier to design and talk about your product.' },
        { prompt: 'How can you find out what that group likes?', options: ['Ask a few people and listen to what they say.', 'Assume your taste is the same as everyone’s.', 'Make 500 bags before asking anyone.'], answer: 0, good: 'A few thoughtful questions can help you shape a better idea before you spend time or money.', learn: 'Ask people in your audience before you build a lot of inventory.' },
        { prompt: 'Two people like your tote, but want different colors. What is useful to learn?', options: ['Which color more people in your audience prefer.', 'Which color is hardest to find.', 'Nothing—color never matters.'], answer: 0, good: 'You are learning from your future customers. Their feedback helps you make a more confident next move.', learn: 'Look for patterns in feedback from the people you hope to serve.' }
      ]
    },
    teamwork: {
      name: 'The best next step', skill: 'TEAMWORK',
      questions: [
        { prompt: 'Your crew has a big idea and a tiny budget. What do you do first?', options: ['Spend everything on the biggest launch possible.', 'Agree on one small thing to test together.', 'Wait until you have a perfect plan.'], answer: 1, good: 'A small test helps the team learn what works before committing the whole budget.', learn: 'Small experiments can teach your team a lot with less risk.' },
        { prompt: 'Everyone wants to lead. What is a useful first move?', options: ['Give each person a clear job that plays to their strengths.', 'Let the loudest person decide everything.', 'Do every task yourself.'], answer: 0, good: 'Clear roles help the whole team contribute and make progress together.', learn: 'Good teams share clear roles and give people room to contribute.' },
        { prompt: 'Your first test gets mixed feedback. What now?', options: ['Ask what people liked and what could be better.', 'Quit; the first try should be perfect.', 'Ignore everyone and spend more.'], answer: 0, good: 'Mixed feedback is useful information. Talk it through with your team and decide what to try next.', learn: 'Treat feedback as information for your next experiment.' }
      ]
    },
    budget: {
      name: 'Make $40 go further', skill: 'BUDGET BASICS',
      questions: [
        { prompt: 'You have $40 to test a handmade keychain idea. What comes first?', options: ['Spend it all on a fancy logo.', 'List the costs you need to test the idea safely.', 'Borrow more before you know what people want.'], answer: 1, good: 'A short list keeps a small test focused. Spend on what helps you learn, not just what looks impressive.', learn: 'Start with the costs needed to test the idea and learn from it.' },
        { prompt: 'Your table fee is $10 and each keychain costs $2 to make. Which cost changes per item?', options: ['The $10 table fee.', 'The $2 material cost.', 'Both costs stay the same.'], answer: 1, good: 'Materials rise as you make more items; the table fee stays the same for that event.', learn: 'Separate fixed costs from costs that increase with each item.' },
        { prompt: 'You still have $8 after buying supplies. What is a smart plan?', options: ['Keep some aside for a surprise cost.', 'Spend it because unused money is wasted.', 'Buy extra stock before your first test.'], answer: 0, good: 'A small buffer helps you handle the unexpected without derailing your plan.', learn: 'A buffer gives you room when a real-world cost changes.' }
      ]
    },
    branding: {
      name: 'Give it a little spark', skill: 'BRAND & STORY',
      questions: [
        { prompt: 'You sell custom notebooks. What makes a brand name useful?', options: ['It helps the right people remember what you offer.', 'It is as long and complicated as possible.', 'It sounds like a much bigger company.'], answer: 0, good: 'A clear, memorable name helps people connect your product with the idea behind it.', learn: 'A strong brand helps the right people remember what you make and why.' },
        { prompt: 'Which post tells a clearer product story?', options: ['“Buy this.”', '“A pocket notebook for ideas you want to keep close.”', '“We sell many amazing things.”'], answer: 1, good: 'It paints a quick picture of who it helps and what makes it useful.', learn: 'Show the person, need, and benefit in everyday words.' },
        { prompt: 'Your friends remember the design but not the product. What could help?', options: ['Repeat a simple message about what the notebook is for.', 'Change the brand every day.', 'Add more words to every post.'], answer: 0, good: 'A consistent message makes the product easier to understand and remember.', learn: 'Consistency helps turn a first impression into a recognizable brand.' }
      ]
    },
    pitch: {
      name: 'Say it in 20 seconds', skill: 'PITCH WITH PURPOSE',
      questions: [
        { prompt: 'What belongs in a helpful first pitch?', options: ['Who it helps, what it does, and why it matters.', 'Every detail you have ever planned.', 'A promise that it will be the next big thing.'], answer: 0, good: 'A short pitch makes the idea easy to picture without overpromising.', learn: 'Keep it simple: who it helps, what you offer, and why it is useful.' },
        { prompt: 'A listener looks confused. What is a smart next move?', options: ['Use a clear example and ask what they want to know.', 'Talk faster and add more jargon.', 'Assume they are not interested.'], answer: 0, good: 'A clear example invites a real conversation and helps you learn what landed.', learn: 'A pitch starts a conversation; it is not a speech to memorize.' },
        { prompt: 'Which ending invites useful feedback?', options: ['“Would this solve a problem for you?”', '“You should buy it right now.”', '“That is all there is to say.”'], answer: 0, good: 'A real question gives the other person room to respond and gives you a chance to improve.', learn: 'End by inviting an honest response, not by forcing a yes.' }
      ]
    }
  };
  const defaultState = { xp: 0, completed: 0, completedMissions: [], correctAnswers: 0 };
  let state = { ...defaultState, completedMissions: [] };
  if (saveConsent) {
    try { state = { ...state, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
    catch { state = { ...defaultState, completedMissions: [] }; }
  }
  let current = null;
  let shownLevel = null;
  const celebrate = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
  let questionIndex = 0;
  let roundCorrect = 0;

  const content = document.getElementById('game-content');
  const $ = (id) => document.getElementById(id);
  const choiceOverlay = $('privacy-choice');
  if (consentChoice !== 'ask') choiceOverlay.hidden = true;
  else { document.body.classList.add('privacy-locked'); $('accept-progress').focus(); }
  function chooseProgressStorage(accept) {
    consentChoice = accept ? 'accept' : 'decline';
    try { sessionStorage.setItem(CONSENT_KEY, consentChoice); } catch { /* The choice applies for this page view. */ }
    saveConsent = accept;
    if (accept) {
      try { state = { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
      catch { state = { ...defaultState, completedMissions: [] }; }
    } else if (!saveConsent) {
      state = { ...defaultState, completedMissions: [] };
    }
    choiceOverlay.hidden = true;
    document.body.classList.remove('privacy-locked');
    updateStats();
  }
  $('accept-progress').addEventListener('click', () => chooseProgressStorage(true));
  $('decline-progress').addEventListener('click', () => chooseProgressStorage(false));
  $('privacy-settings').addEventListener('click', () => { choiceOverlay.hidden = false; document.body.classList.add('privacy-locked'); $('accept-progress').focus(); });
  function save() {
    if (saveConsent) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Continue the game when storage is unavailable. */ }
    }
    updateStats();
  }
  function updateStats() {
    $('xp-count').textContent = state.xp;
    $('mission-count').textContent = state.completed;
    $('save-status').textContent = saveConsent ? 'PROGRESS SAVES ON THIS DEVICE' : 'PROGRESS IS TEMPORARY THIS SESSION';
    const levels = [
      { name: 'Curious', short: 'CURIOUS', min: 0, next: 50 },
      { name: 'Spark Starter', short: 'SPARK STARTER', min: 50, next: 120 },
      { name: 'Builder', short: 'BUILDER', min: 120, next: 240 },
      { name: 'Venture Lead', short: 'VENTURE LEAD', min: 240, next: 240 }
    ];
    const level = [...levels].reverse().find((item) => state.xp >= item.min) || levels[0];
    const levelIndex = levels.indexOf(level);
    if (current && shownLevel !== null && levelIndex > shownLevel) celebrate('sq:levelup', { name: level.name });
    shownLevel = levelIndex;
    $('level-name').textContent = level.name;
    $('journey-level').textContent = String(levels.indexOf(level) + 1).padStart(2, '0');
    $('journey-rank').textContent = level.short;
    $('journey-xp').textContent = state.xp;
    const next = levels[levels.indexOf(level) + 1];
    $('journey-next-label').textContent = next ? `Next: ${next.name}` : 'Top level reached · keep exploring';
    $('journey-needed').textContent = next ? `${Math.max(0, next.min - state.xp)} XP to go` : 'All 4 levels unlocked';
    const pct = next ? Math.min(100, ((state.xp - level.min) / (next.min - level.min)) * 100) : 100;
    $('journey-progress').style.width = `${pct}%`;
    $('badge-count').textContent = `${state.completedMissions.length} / 6`;
    document.querySelectorAll('.badge-chip').forEach((badge) => badge.classList.toggle('unlocked', state.completedMissions.includes(badge.dataset.badge)));
  }
  function updateRound() {
    $('round-number').textContent = String(Math.min(questionIndex + 1, 3)).padStart(2, '0');
    document.querySelectorAll('.round-bars i').forEach((bar, i) => bar.classList.toggle('active', i <= questionIndex && questionIndex < 3));
  }
  function startMission(key) {
    if (!missions[key]) return;
    current = key; questionIndex = 0; roundCorrect = 0;
    showQuestion();
    $('play').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function showQuestion(feedback) {
    const mission = missions[current];
    const q = mission.questions[questionIndex];
    updateRound();
    content.innerHTML = `<span class="game-step">${mission.skill} <span>↘</span></span><h3>${q.prompt}</h3><p>Choose your move. You can always try again.</p><div class="option-list">${q.options.map((option, i) => `<button class="answer-option" data-answer="${i}"><span class="option-key">${String.fromCharCode(65 + i)}</span><span>${option}</span><span class="option-arrow">↗</span></button>`).join('')}</div>${feedback ? `<div class="feedback ${feedback.correct ? '' : 'is-miss'}" role="status"><strong>${feedback.correct ? 'Nice call!' : 'Good try—here’s the takeaway.'}</strong> ${feedback.text}</div><button class="button button-dark game-next" id="game-next">${questionIndex === 2 ? 'See your results' : 'Next decision'} <span>↗</span></button>` : ''}<div class="game-bottom"><span><span class="game-heart">♥</span> EVERY ANSWER IS A CHANCE TO LEARN</span><button class="quiet-button" id="reset-progress" type="button">Reset progress</button></div>`;
    content.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => chooseAnswer(Number(button.dataset.answer))));
    const next = $('game-next'); if (next) next.addEventListener('click', nextStep);
    $('reset-progress').addEventListener('click', resetProgress);
  }
  function chooseAnswer(choice) {
    const q = missions[current].questions[questionIndex];
    const correct = choice === q.answer;
    if (correct) { roundCorrect++; state.xp += 10; state.correctAnswers++; save(); }
    showQuestion({ correct, text: correct ? q.good : q.learn });
    if (correct) celebrate('sq:xp', { amount: 10, el: content.querySelector(`[data-answer="${choice}"]`) });
    content.querySelectorAll('[data-answer]').forEach((button) => { button.disabled = true; button.classList.toggle('is-selected', Number(button.dataset.answer) === choice); });
  }
  function nextStep() {
    if (questionIndex < 2) { questionIndex++; showQuestion(); return; }
    if (!state.completedMissions.includes(current)) {
      state.completedMissions.push(current); state.completed++;
    }
    state.xp += 15; save();
    const mission = missions[current];
    updateRound();
    content.innerHTML = `<span class="game-step">MISSION COMPLETE <span>✳</span></span><div class="result-medal">${roundCorrect === 3 ? '★' : '✳'}</div><div class="game-result-line">${mission.skill} · +15 COMPLETION XP</div><h3>You made moves.<br>That’s how it starts.</h3><p>You got ${roundCorrect} of 3 decisions right. ${roundCorrect < 3 ? 'You still picked up the key idea—every try counts.' : 'Great instincts. Keep building on them.'}</p><div class="feedback"><strong>Takeaway:</strong> ${mission.questions[2].learn}</div><button class="button button-dark game-next" id="play-again">Try another mission <span>↗</span></button><div class="game-bottom"><span><span class="game-heart">♥</span> ${saveConsent ? 'PROGRESS SAVED ON THIS DEVICE' : 'PROGRESS ENDS WITH THIS SESSION'}</span><button class="quiet-button" id="reset-progress" type="button">Reset progress</button></div>`;
    celebrate('sq:complete', { perfect: roundCorrect === 3 });
    $('play-again').addEventListener('click', () => { current = null; questionIndex = 0; showHome(); });
    $('reset-progress').addEventListener('click', resetProgress);
  }
  function showHome() {
    updateRound();
    const quickStarts = [['pricing', 'Set a fair price'], ['audience', 'Find your first customers'], ['teamwork', 'Get a team moving'], ['budget', 'Plan a tiny budget'], ['branding', 'Create a memorable brand'], ['pitch', 'Pitch the big idea']];
    content.innerHTML = `<span class="game-step">MISSION SELECT <span>↘</span></span><h3>Pick your next move.</h3><p>Choose a quick business challenge and learn as you go.</p><div class="option-list preview-options">${quickStarts.map(([key, label], i) => `<button class="answer-option" data-start="${key}"><span class="option-key">${String.fromCharCode(65 + i)}</span><span>${label}</span><span class="option-arrow">↗</span></button>`).join('')}</div><div class="game-bottom"><span><span class="game-heart">♥</span> EVERY ANSWER IS A CHANCE TO LEARN</span><button class="quiet-button" id="reset-progress" type="button">Reset progress</button></div>`;
    content.querySelectorAll('[data-start]').forEach((button) => button.addEventListener('click', () => startMission(button.dataset.start)));
    $('reset-progress').addEventListener('click', resetProgress);
  }
  function resetProgress() {
    state = { ...defaultState, completedMissions: [] }; current = null; questionIndex = 0; roundCorrect = 0; save(); showHome();
  }
  document.querySelectorAll('.start-mission').forEach((button) => button.addEventListener('click', () => startMission(button.dataset.mission)));
  document.querySelectorAll('[data-action="start"]').forEach((button) => button.addEventListener('click', () => startMission(button.dataset.mission)));
  function updateCalculator() {
    const cost = Math.max(0, Number($('cost-input').value) || 0);
    const units = Math.max(1, Math.floor(Number($('units-input').value) || 1));
    const margin = Math.min(0.9, Math.max(0.05, Number($('margin-input').value) / 100));
    const price = Math.round((cost / units / (1 - margin)) * 100) / 100;
    $('margin-value').textContent = `${Math.round(margin * 100)}%`;
    $('price-result').textContent = `$${price.toFixed(2)}`;
    $('revenue-result').textContent = `About $${(price * units).toFixed(2)} if all ${units} sell · estimate, not a promise`;
  }
  ['cost-input', 'units-input', 'margin-input'].forEach((id) => $(id).addEventListener('input', updateCalculator));
  $('build-pitch').addEventListener('click', () => {
    const audience = $('pitch-audience').value;
    const offer = $('pitch-offer').value;
    const benefit = $('pitch-benefit').value;
    $('pitch-result').textContent = `We help ${audience} with ${offer}, so they can ${benefit}.`;
    $('pitch-result').classList.add('pitch-generated');
  });
  updateCalculator();
  updateStats();
  $('reset-progress').addEventListener('click', resetProgress);
})();
