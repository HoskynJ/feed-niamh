/* Feed Niamh random recommendation update */
(function () {
  function shuffle(items) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const randomState = { pool: [], seen: new Set() };

  function matchesPreferences(recipe) {
    const selected = [...state.prefs].filter(p => p !== 'none');
    return !selected.length || selected.every(p =>
      recipe.preferences.includes(p) ||
      (p === 'under_500' && recipe.calories_estimate < 500) ||
      (p === 'super_fast' && recipe.time_minutes <= 15)
    );
  }

  function createPool() {
    let pool = recipes.filter(r =>
      r.energy.includes(state.energy) &&
      r.needs.includes(state.need) &&
      matchesPreferences(r)
    );

    if (pool.length < 5) {
      pool = recipes.filter(r =>
        r.energy.includes(state.energy) && r.needs.includes(state.need)
      );
    }
    if (pool.length < 5) {
      pool = recipes.filter(r =>
        (r.energy.includes(state.energy) || r.needs.includes(state.need)) &&
        matchesPreferences(r)
      );
    }
    if (pool.length < 5) {
      pool = recipes.filter(r =>
        r.energy.includes(state.energy) || r.needs.includes(state.need)
      );
    }
    if (state.need === 'surprise') {
      pool = recipes.filter(matchesPreferences);
    }
    return shuffle(pool.length ? pool : recipes);
  }

  function renderRandomBatch() {
    let available = randomState.pool.filter(r => !randomState.seen.has(r.id));
    if (available.length < 5) {
      randomState.seen.clear();
      available = shuffle(randomState.pool);
    }

    state.matches = shuffle(available).slice(0, 5);
    state.matches.forEach(r => randomState.seen.add(r.id));
    state.index = 0;

    document.getElementById('carousel').innerHTML = state.matches.map(r => `
      <article class="recipe-card">
        <div class="recipe-card-inner">
          <div class="recipe-hero"><span class="emoji">${r.emoji}</span></div>
          <div class="card-body">
            <div class="meta">
              <span class="pill">⏱ ${r.time_minutes} mins</span>
              <span class="pill">✦ ${r.difficulty}</span>
            </div>
            <h3>${r.name}</h3>
            <p class="why"><strong>Why this?</strong><br>${r.why}</p>
            <button class="secondary" data-view="${r.id}">View recipe&nbsp; →</button>
          </div>
        </div>
      </article>`).join('');

    document.getElementById('dots').innerHTML = state.matches
      .map((_, i) => `<span class="dot ${i === 0 ? 'on' : ''}"></span>`)
      .join('');
    updateCarousel();
  }

  buildResults = function () {
    randomState.seen.clear();
    randomState.pool = createPool();
    renderRandomBatch();
    show('results');
  };

  document.getElementById('show-ideas').onclick = buildResults;
  document.getElementById('another').onclick = function () {
    renderRandomBatch();
    window.scrollTo(0, 0);
  };
})();
