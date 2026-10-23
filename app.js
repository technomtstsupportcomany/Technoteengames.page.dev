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
    },
    online: {
      name: 'Sell online, stay safe', skill: 'DIGITAL SMARTS', teenOnly: true,
      questions: [
        { prompt: 'You want to sell your stickers online. What is the safest first step?', options: ['Post your home address so buyers can pick up.', 'Set up a shop with a parent or guardian, using their approved account.', 'Message strangers directly from your personal account.'], answer: 1, good: 'Selling with a trusted adult keeps payments and personal details protected while you learn.', learn: 'Under-18 sellers should use accounts and payment tools set up with a parent or guardian.' },
        { prompt: 'A buyer asks for your phone number and school. What do you do?', options: ['Share it—they seem nice.', 'Keep it private and chat only through the shop’s messaging.', 'Send a selfie so they trust you.'], answer: 1, good: 'Real customers do not need your personal details. Shop messaging keeps a record and keeps you safe.', learn: 'Never share personal info like your number, school, or address with buyers.' },
        { prompt: 'You get a 2-star review: “Arrived bent.” What is the best move?', options: ['Reply kindly, fix the problem, and improve your packaging.', 'Argue in the comments.', 'Delete your shop and start over.'], answer: 0, good: 'A calm, helpful reply builds trust with everyone reading—and better packaging prevents it next time.', learn: 'Treat reviews as free feedback and respond politely.' }
      ]
    },
    profit: {
      name: 'Sales aren’t profit', skill: 'PROFIT CHECK', teenOnly: true,
      questions: [
        { prompt: 'You sold 20 bracelets at $5 each. What is your revenue?', options: ['$25', '$100', '$5'], answer: 1, good: 'Right: 20 × $5 = $100. Revenue is all the money that came in.', learn: 'Revenue = number sold × price: 20 × $5 = $100.' },
        { prompt: 'Your beads, string, and table fee cost $60 in total. What is your profit?', options: ['$100', '$160', '$40'], answer: 2, good: 'Exactly: $100 revenue − $60 costs = $40 profit. That is what you actually keep.', learn: 'Profit = revenue − costs: $100 − $60 = $40.' },
        { prompt: 'How could you raise profit next time without upsetting customers?', options: ['Buy beads in bulk to lower the cost per bracelet.', 'Triple the price overnight.', 'Skip the clasp so they fall apart.'], answer: 0, good: 'Lowering your costs while keeping quality means more profit and happy customers.', learn: 'Profit grows when you cut costs smartly or add real value.' }
      ]
    }
  };
  // Junior edition (ages 9–13): simpler wording and smaller numbers for the core missions.
  const juniorQuestions = {
    pricing: [
      { prompt: 'You made cookies to sell. How do you pick a price?', options: ['Give them away for free.', 'Think about what the cookies cost to make, then pick a fair price.', 'Pick $100 because it sounds cool.'], answer: 1, good: 'Yes! A fair price pays you back for what you spent—and people are happy to pay it.', learn: 'First think about what it cost you, then pick a fair price.' },
      { prompt: 'Your cookie supplies cost $6 and you made 6 cookies. How much did each cookie cost?', options: ['$1 each', '$6 each', '$3 each'], answer: 0, good: 'Great maths! $6 shared across 6 cookies is $1 each.', learn: 'Share the total cost across all the cookies: $6 ÷ 6 = $1.' },
      { prompt: 'Each cookie cost $1 to make. Which price lets you earn a little?', options: ['50¢', '$1', '$2'], answer: 2, good: 'Nice! At $2 you get your $1 back and earn $1 extra for your hard work.', learn: 'Your price should be more than what it cost to make.' }
    ],
    audience: [
      { prompt: 'You made cool bookmarks. Who might like them most?', options: ['Kids who love reading.', 'People who never read books.', 'Nobody—just guess.'], answer: 0, good: 'Yes! Bookmarks are perfect for people who love to read.', learn: 'Think about who would use your product the most.' },
      { prompt: 'How can you find out what designs readers like?', options: ['Ask a few friends who read.', 'Make 100 bookmarks first, then ask.', 'Never ask anyone.'], answer: 0, good: 'Asking first is super smart—now you can make designs people really want.', learn: 'Ask people before making lots of something.' },
      { prompt: 'Most friends pick the space design. What should you make more of?', options: ['The design nobody picked.', 'The space design.', 'Only plain white ones.'], answer: 1, good: 'Spot on! Listening to what people pick helps you make what they love.', learn: 'Make more of what your customers choose.' }
    ],
    teamwork: [
      { prompt: 'You and two friends want to run a lemonade stand. What do you do first?', options: ['Agree on a plan together.', 'Everyone does their own thing.', 'Argue about who is the boss.'], answer: 0, good: 'Teams work best when everyone knows the plan.', learn: 'Start by agreeing on a plan as a team.' },
      { prompt: 'Maya loves art, Leo loves maths. Who should make the sign?', options: ['Leo', 'Maya', 'Nobody'], answer: 1, good: 'Yes! Give jobs to people based on what they are good at. Leo can count the money.', learn: 'Give each person a job that fits their strengths.' },
      { prompt: 'Your first day was slow. What now?', options: ['Give up forever.', 'Talk as a team about what to try next time.', 'Blame your friends.'], answer: 1, good: 'Great teammates learn together and try again.', learn: 'Talk about what happened and make a new plan together.' }
    ],
    budget: [
      { prompt: 'You have $10 to start a bracelet business. What do you buy first?', options: ['Beads and string to make bracelets.', 'A giant trophy.', 'Lots of candy.'], answer: 0, good: 'Yes! Spend money on things you need to make your product first.', learn: 'Buy what you need to make your product before anything else.' },
      { prompt: 'Beads cost $6. How much of your $10 is left?', options: ['$16', '$4', '$6'], answer: 1, good: 'Correct! $10 − $6 = $4 left.', learn: 'Subtract what you spent: $10 − $6 = $4.' },
      { prompt: 'You have $4 left. What is a smart choice?', options: ['Save some in case you need more string.', 'Spend it all right away on anything.', 'Lose it.'], answer: 0, good: 'Smart saver! Keeping a little extra helps if something goes wrong.', learn: 'Saving a little helps when surprises happen.' }
    ],
    branding: [
      { prompt: 'You sell dog treats. Which name is easy to remember?', options: ['Happy Paws Treats', 'Product Number 47392', 'The Very Long Name For Small Snacks Company'], answer: 0, good: 'Yes! Short, fun names that say what you sell are easy to remember.', learn: 'A good name is short, fun, and tells people what you sell.' },
      { prompt: 'Which sign tells people the most?', options: ['“Stuff.”', '“Yummy treats that make dogs wag!”', '“Buy.”'], answer: 1, good: 'That sign shows who it is for and why it is great.', learn: 'Tell people what it is and why they will love it.' },
      { prompt: 'Should your sign, bags, and stickers match?', options: ['Yes, same colours and logo.', 'No, change them every day.', 'Hide your logo.'], answer: 0, good: 'Matching colours and logos help people recognise you.', learn: 'Using the same look everywhere helps people remember you.' }
    ],
    pitch: [
      { prompt: 'What should you say first when you tell someone about your idea?', options: ['What it is and who it helps.', 'Your whole life story.', 'Nothing—just stare.'], answer: 0, good: 'Yes! Start with what it is and who it is for.', learn: 'Say what it is and who it helps.' },
      { prompt: 'Your friend looks confused. What do you do?', options: ['Show them an example.', 'Talk super fast.', 'Walk away.'], answer: 0, good: 'Examples make ideas easy to understand.', learn: 'Use an example to explain your idea.' },
      { prompt: 'What is a great way to finish?', options: ['“Would you like to try one?”', '“You HAVE to buy it.”', '“Bye.”'], answer: 0, good: 'A friendly question invites people in.', learn: 'End with a friendly question.' }
    ]
  };
  const BIRTHDAY_KEY = 'sidequest-birthday-v1';
  const MIN_AGE = 9;
  const TEEN_AGE = 13;
  const FOUNDER_VAULT_MISSIONS = 3;
  // Junior missions that unlock as you earn XP.
  const juniorXpLocks = { budget: 50, branding: 90, pitch: 120 };
  let profile = null; // { birthday: 'YYYY-MM-DD', edition: 'junior' | 'teen' }
  const defaultState = { xp: 0, completed: 0, completedMissions: [], correctAnswers: 0 };
  let state = { ...defaultState, completedMissions: [] };
  if (saveConsent) {
    try { state = { ...state, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
    catch { state = { ...defaultState, completedMissions: [] }; }
  }
  if (saveConsent) {
    try { profile = JSON.parse(localStorage.getItem(BIRTHDAY_KEY) || 'null'); } catch { profile = null; }
  } else {
    try { profile = JSON.parse(sessionStorage.getItem(BIRTHDAY_KEY) || 'null'); } catch { profile = null; }
  }
  let current = null;
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
    // Keep the birthday wherever the player said their data may live.
    try {
      if (accept) {
        if (profile) localStorage.setItem(BIRTHDAY_KEY, JSON.stringify(profile));
        else profile = JSON.parse(localStorage.getItem(BIRTHDAY_KEY) || 'null');
      } else localStorage.removeItem(BIRTHDAY_KEY);
    } catch { /* The birthday stays in memory for this page view. */ }
    saveProfile();
    choiceOverlay.hidden = true;
    document.body.classList.remove('privacy-locked');
    updateStats();
    if (profile) applyEdition(); else openBirthdayGate();
  }
  $('accept-progress').addEventListener('click', () => chooseProgressStorage(true));
  $('decline-progress').addEventListener('click', () => chooseProgressStorage(false));
  $('privacy-settings').addEventListener('click', () => { choiceOverlay.hidden = false; document.body.classList.add('privacy-locked'); $('accept-progress').focus(); });
  function today() { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()); }
  function parseBirthday(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!match) return null;
    const [y, m, d] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
    const date = new Date(y, m, d);
    return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d ? date : null;
  }
  function birthdayInYear(birth, year) {
    const date = new Date(year, birth.getMonth(), birth.getDate());
    // Leap-day birthdays are celebrated on 28 February in other years.
    return date.getMonth() === birth.getMonth() ? date : new Date(year, 1, 28);
  }
  function daysBetween(from, to) { return Math.round((to - from) / 86400000); }
  function ageOn(birth, on) {
    return on.getFullYear() - birth.getFullYear() - (on < birthdayInYear(birth, on.getFullYear()) ? 1 : 0);
  }
  function daysUntilBirthday(birth) {
    const now = today();
    let next = birthdayInYear(birth, now.getFullYear());
    if (next < now) next = birthdayInYear(birth, now.getFullYear() + 1);
    return daysBetween(now, next);
  }
  function daysUntilAge(birth, age) { return daysBetween(today(), birthdayInYear(birth, birth.getFullYear() + age)); }
  function ordinal(n) { const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'TH' : ['TH', 'ST', 'ND', 'RD'][n % 10] || 'TH'; return `${n}${suffix}`; }
  function plural(n, word) { return `${n} ${word}${n === 1 ? '' : 's'}`; }
  function playerAge() { return profile ? ageOn(parseBirthday(profile.birthday), today()) : null; }
  function saveProfile() {
    if (!profile) return;
    try { (saveConsent ? localStorage : sessionStorage).setItem(BIRTHDAY_KEY, JSON.stringify(profile)); } catch { /* Keep the birthday in memory only. */ }
  }
  const birthdayGate = $('birthday-gate');
  function openBirthdayGate() {
    $('birthday-input').max = `${today().getFullYear()}-${String(today().getMonth() + 1).padStart(2, '0')}-${String(today().getDate()).padStart(2, '0')}`;
    $('birthday-input').value = profile ? profile.birthday : '';
    $('birthday-error').hidden = true;
    birthdayGate.hidden = false;
    document.body.classList.add('privacy-locked');
    $('birthday-input').focus();
  }
  function birthdayError(message) { $('birthday-error').textContent = message; $('birthday-error').hidden = false; }
  $('birthday-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const value = $('birthday-input').value;
    const birth = parseBirthday(value);
    if (!birth) return birthdayError('Please pick your birthday from the calendar.');
    if (birth > today()) return birthdayError('That date is in the future! Please check your birthday.');
    const age = ageOn(birth, today());
    if (age > 110) return birthdayError('Please check the year of your birthday.');
    if (age < MIN_AGE) return birthdayError(`Sidequest is made for ages 9–16. Your adventure unlocks on your 9th birthday—only ${plural(daysUntilAge(birth, MIN_AGE), 'day')} to go!`);
    const edition = age < TEEN_AGE ? 'junior' : (profile && profile.birthday === value ? profile.edition : 'teen');
    profile = { birthday: value, edition };
    saveProfile();
    birthdayGate.hidden = true;
    document.body.classList.remove('privacy-locked');
    applyEdition();
  });
  $('change-birthday').addEventListener('click', openBirthdayGate);
  $('edition-switch').addEventListener('click', () => {
    if (!profile || playerAge() < TEEN_AGE) return;
    profile.edition = profile.edition === 'teen' ? 'junior' : 'teen';
    saveProfile();
    applyEdition();
  });
  function edition() {
    if (!profile) return 'teen';
    // A saved Teen choice never outlives the age check.
    return playerAge() < TEEN_AGE ? 'junior' : profile.edition;
  }
  function getMission(key) {
    const mission = missions[key];
    return edition() === 'junior' && juniorQuestions[key] ? { ...mission, questions: juniorQuestions[key] } : mission;
  }
  function lockReason(key) {
    const mission = missions[key];
    if (!mission) return 'Mission not found';
    if (edition() === 'junior') {
      if (mission.teenOnly) {
        const age = playerAge();
        if (age !== null && age >= TEEN_AGE) return 'TEEN EDITION ONLY · switch editions above to unlock';
        const days = profile ? daysUntilAge(parseBirthday(profile.birthday), TEEN_AGE) : null;
        return days === null ? 'TEEN EDITION ONLY · ages 13–16' : `TEEN EDITION · unlocks on your 13th birthday, in ${plural(days, 'day')}`;
      }
      const needed = juniorXpLocks[key];
      if (needed && state.xp < needed) return `LOCKED · earn ${needed - state.xp} more XP to unlock`;
      return null;
    }
    if (mission.teenOnly) {
      const done = state.completedMissions.filter((item) => !missions[item] || !missions[item].teenOnly).length;
      if (done < FOUNDER_VAULT_MISSIONS) return `FOUNDER VAULT · finish ${plural(FOUNDER_VAULT_MISSIONS - done, 'more mission')} to unlock`;
    }
    return null;
  }
  function applyLocks() {
    document.querySelectorAll('.mission-card').forEach((card) => {
      const button = card.querySelector('.start-mission');
      if (!button) return;
      const reason = lockReason(button.dataset.mission);
      card.classList.toggle('is-locked', Boolean(reason));
      let note = card.querySelector('.lock-note');
      let badge = card.querySelector('.mission-lock-badge');
      if (reason) {
        if (!note) { note = document.createElement('div'); note.className = 'lock-note'; card.querySelector('.card-content').appendChild(note); }
        note.innerHTML = `<b>🔒</b><span>${reason}</span>`;
        if (!badge) { badge = document.createElement('span'); badge.className = 'mission-lock-badge'; badge.textContent = '🔒'; badge.setAttribute('aria-hidden', 'true'); card.querySelector('.mission-illustration').appendChild(badge); }
      } else {
        if (note) note.remove();
        if (badge) badge.remove();
      }
    });
  }
  function updateBirthdayBar() {
    if (!profile) return;
    const birth = parseBirthday(profile.birthday);
    const days = daysUntilBirthday(birth);
    const bar = $('edition-bar');
    bar.classList.toggle('is-birthday', days === 0);
    $('edition-bday').textContent = days === 0 ? `🎉 HAPPY ${ordinal(ageOn(birth, today()))} BIRTHDAY! +25 BONUS XP` : `🎂 ${plural(days, 'DAY').toUpperCase()} UNTIL YOUR BIRTHDAY`;
    if (days === 0 && state.birthdayBonusYear !== today().getFullYear()) {
      state.birthdayBonusYear = today().getFullYear(); state.xp += 25; save();
    }
  }
  function applyEdition() {
    const junior = edition() === 'junior';
    document.body.classList.toggle('edition-junior', junior);
    document.body.classList.toggle('edition-teen', !junior);
    $('edition-bar').hidden = !profile;
    $('edition-name').textContent = junior ? 'JUNIOR EDITION · AGES 9–13' : 'TEEN EDITION · AGES 13–16';
    $('edition-eyebrow').textContent = junior ? 'A REAL-WORLD BUSINESS GAME FOR CURIOUS KIDS · AGES 9–13' : 'A REAL-WORLD BUSINESS GAME FOR BIG-THINKING TEENS · AGES 13–16';
    const canSwitch = Boolean(profile) && playerAge() >= TEEN_AGE;
    $('edition-switch').hidden = !canSwitch;
    $('edition-switch').textContent = junior ? 'Switch to Teen edition' : 'Switch to Junior edition';
    updateBirthdayBar();
    current = null; questionIndex = 0; roundCorrect = 0;
    updateStats();
    showHome();
  }
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
    $('level-name').textContent = level.name;
    $('journey-level').textContent = String(levels.indexOf(level) + 1).padStart(2, '0');
    $('journey-rank').textContent = level.short;
    $('journey-xp').textContent = state.xp;
    const next = levels[levels.indexOf(level) + 1];
    $('journey-next-label').textContent = next ? `Next: ${next.name}` : 'Top level reached · keep exploring';
    $('journey-needed').textContent = next ? `${Math.max(0, next.min - state.xp)} XP to go` : 'All 4 levels unlocked';
    const pct = next ? Math.min(100, ((state.xp - level.min) / (next.min - level.min)) * 100) : 100;
    $('journey-progress').style.width = `${pct}%`;
    $('badge-count').textContent = `${state.completedMissions.length} / ${Object.keys(missions).length}`;
    document.querySelectorAll('.badge-chip').forEach((badge) => badge.classList.toggle('unlocked', state.completedMissions.includes(badge.dataset.badge)));
    applyLocks();
  }
  function updateRound() {
    $('round-number').textContent = String(Math.min(questionIndex + 1, 3)).padStart(2, '0');
    document.querySelectorAll('.round-bars i').forEach((bar, i) => bar.classList.toggle('active', i <= questionIndex && questionIndex < 3));
  }
  function startMission(key) {
    if (!missions[key] || lockReason(key)) return;
    current = key; questionIndex = 0; roundCorrect = 0;
    showQuestion();
    $('play').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function showQuestion(feedback) {
    const mission = getMission(current);
    const q = mission.questions[questionIndex];
    updateRound();
    content.innerHTML = `<span class="game-step">${mission.skill} <span>↘</span></span><h3>${q.prompt}</h3><p>Choose your move. You can always try again.</p><div class="option-list">${q.options.map((option, i) => `<button class="answer-option" data-answer="${i}"><span class="option-key">${String.fromCharCode(65 + i)}</span><span>${option}</span><span class="option-arrow">↗</span></button>`).join('')}</div>${feedback ? `<div class="feedback ${feedback.correct ? '' : 'is-miss'}" role="status"><strong>${feedback.correct ? 'Nice call!' : 'Good try—here’s the takeaway.'}</strong> ${feedback.text}</div><button class="button button-dark game-next" id="game-next">${questionIndex === 2 ? 'See your results' : 'Next decision'} <span>↗</span></button>` : ''}<div class="game-bottom"><span><span class="game-heart">♥</span> EVERY ANSWER IS A CHANCE TO LEARN</span><button class="quiet-button" id="reset-progress" type="button">Reset progress</button></div>`;
    content.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => chooseAnswer(Number(button.dataset.answer))));
    const next = $('game-next'); if (next) next.addEventListener('click', nextStep);
    $('reset-progress').addEventListener('click', resetProgress);
  }
  function chooseAnswer(choice) {
    const q = getMission(current).questions[questionIndex];
    const correct = choice === q.answer;
    if (correct) { roundCorrect++; state.xp += 10; state.correctAnswers++; save(); }
    showQuestion({ correct, text: correct ? q.good : q.learn });
    content.querySelectorAll('[data-answer]').forEach((button) => { button.disabled = true; button.classList.toggle('is-selected', Number(button.dataset.answer) === choice); });
  }
  function nextStep() {
    if (questionIndex < 2) { questionIndex++; showQuestion(); return; }
    if (!state.completedMissions.includes(current)) {
      state.completedMissions.push(current); state.completed++;
    }
    state.xp += 15; save();
    const mission = getMission(current);
    updateRound();
    content.innerHTML = `<span class="game-step">MISSION COMPLETE <span>✳</span></span><div class="result-medal">${roundCorrect === 3 ? '★' : '✳'}</div><div class="game-result-line">${mission.skill} · +15 COMPLETION XP</div><h3>You made moves.<br>That’s how it starts.</h3><p>You got ${roundCorrect} of 3 decisions right. ${roundCorrect < 3 ? 'You still picked up the key idea—every try counts.' : 'Great instincts. Keep building on them.'}</p><div class="feedback"><strong>Takeaway:</strong> ${mission.questions[2].learn}</div><button class="button button-dark game-next" id="play-again">Try another mission <span>↗</span></button><div class="game-bottom"><span><span class="game-heart">♥</span> ${saveConsent ? 'PROGRESS SAVED ON THIS DEVICE' : 'PROGRESS ENDS WITH THIS SESSION'}</span><button class="quiet-button" id="reset-progress" type="button">Reset progress</button></div>`;
    $('play-again').addEventListener('click', () => { current = null; questionIndex = 0; showHome(); });
    $('reset-progress').addEventListener('click', resetProgress);
  }
  function showHome() {
    updateRound();
    const quickStarts = [['pricing', 'Set a fair price'], ['audience', 'Find your first customers'], ['teamwork', 'Get a team moving'], ['budget', 'Plan a tiny budget'], ['branding', 'Create a memorable brand'], ['pitch', 'Pitch the big idea'], ['online', 'Sell online, stay safe'], ['profit', 'Work out your real profit']];
    content.innerHTML = `<span class="game-step">MISSION SELECT <span>↘</span></span><h3>Pick your next move.</h3><p>Choose a quick business challenge and learn as you go.</p><div class="option-list preview-options">${quickStarts.map(([key, label], i) => { const locked = lockReason(key); return `<button class="answer-option${locked ? ' is-locked' : ''}" data-start="${key}"${locked ? ` disabled title="${locked}"` : ''}><span class="option-key">${String.fromCharCode(65 + i)}</span><span>${label}</span><span class="option-arrow">${locked ? '🔒' : '↗'}</span></button>`; }).join('')}</div><div class="game-bottom"><span><span class="game-heart">♥</span> EVERY ANSWER IS A CHANCE TO LEARN</span><button class="quiet-button" id="reset-progress" type="button">Reset progress</button></div>`;
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
  if (profile && !parseBirthday(profile.birthday)) profile = null;
  if (profile) applyEdition();
  else if (consentChoice !== 'ask') openBirthdayGate();
})();
