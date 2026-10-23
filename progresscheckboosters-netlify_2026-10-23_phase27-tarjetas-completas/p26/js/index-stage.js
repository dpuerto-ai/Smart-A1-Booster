(function () {
    var stage = document.getElementById('lvStage');
    var track = document.getElementById('lvTrack');
    if (!stage || !track) return;
    var items = Array.prototype.slice.call(track.querySelectorAll('.lv-item'));
    var DATA = [
      { desc: 'Practica tus primeras conversaciones y textos en inglés: hablar de ti, de tu día a día y de tus planes. Cada booster te prepara con escritura guiada, speaking en parejas y una revisión final.', code: 'A1', name: 'Basic', meta: 'Interchange 1 · 9 boosters', color: '#ef4444', href: 'a1.html' },
      { desc: 'Gana soltura para contar experiencias, comparar, hacer planes y resolver situaciones cotidianas. Cada booster te prepara con escritura guiada, speaking en parejas y una revisión final.', code: 'A2', name: 'Low Intermediate', meta: 'Interchange 2 · 9 boosters', color: '#22d3ee', href: 'a2.html' },
      { desc: 'Expresa opiniones, cuenta lo que has vivido y conversa sobre temas actuales con más seguridad. Cada booster te prepara con escritura guiada, speaking en parejas y una revisión final.', code: 'B1', name: 'Intermediate', meta: 'Interchange 3 · 9 boosters', color: '#34d399', href: 'b1.html' },
      { desc: 'Desarrolla tus ideas con más detalle y precisión sobre temas de actualidad, trabajo y sociedad. Cada booster te prepara con escritura, speaking en parejas y una revisión final.', code: 'B2', name: 'Upper Intermediate', meta: 'Passages 1 · 13 boosters', color: '#fbbf24', href: 'b2.html' },
      { desc: 'Argumenta, matiza y sostén conversaciones complejas con naturalidad y precisión. Cada booster te prepara con escritura, speaking en parejas y una revisión final.', code: 'C1', name: 'Advanced', meta: 'Passages 2 · 13 boosters', color: '#60a5fa', href: 'c1.html' }
    ];
    var n = items.length, active = 0, launching = false;
    var info = document.getElementById('lvInfo'), codeEl = document.getElementById('lvCode'),
        nameEl = document.getElementById('lvName'), metaEl = document.getElementById('lvMeta'),
        goEl = document.getElementById('lvGo'), dotsEl = document.getElementById('lvDots');
    var prevD = items.map(function () { return 0; });

    var dots = DATA.map(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'lv-dot'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Nivel ' + d.code);
      b.addEventListener('click', function () { setActive(i); });
      dotsEl.appendChild(b); return b;
    });

    function wrap(i) { return ((i % n) + n) % n; }
    function offset(i) { var d = wrap(i - active); if (d > n / 2) d -= n; return d; }

    function render(animateInfo) {
      items.forEach(function (el, i) {
        var d = offset(i);
        var jump = Math.abs(d - prevD[i]) > 2;
        if (jump) { el.style.transition = 'none'; }
        el.style.setProperty('--d', d);
        el.style.setProperty('--abs', Math.abs(d));
        el.style.zIndex = 10 - Math.abs(d);
        el.classList.toggle('is-active', d === 0);
        el.querySelector('a').tabIndex = d === 0 ? 0 : -1;
        if (jump) { void el.offsetWidth; el.style.transition = ''; }
        prevD[i] = d;
      });
      var d = DATA[active];
      stage.style.setProperty('--accent', d.color);
      document.getElementById('lvDesc').textContent = d.desc; 
      codeEl.textContent = d.code; 
      nameEl.textContent = d.name; 
      metaEl.textContent = d.meta;
      goEl.href = d.href; 
      goEl.setAttribute('aria-label', 'Entrar al nivel ' + d.code);
      dots.forEach(function (b, i) { 
        b.classList.toggle('is-active', i === active); 
        b.setAttribute('aria-selected', i === active); 
      });
      if (animateInfo) { 
        info.classList.remove('lv-swap'); 
        void info.offsetWidth; 
        info.classList.add('lv-swap'); 
      }
    }

    function setActive(i) { if (launching) return; active = wrap(i); render(true); }
    function go(href) {
      if (launching) return; launching = true;
      stage.classList.add('lv-launching');
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(function () { window.location.href = href; }, reduce ? 0 : 320);
    }
    window.addEventListener('pageshow', function () { launching = false; stage.classList.remove('lv-launching'); });

    items.forEach(function (el, i) {
      el.querySelector('a').addEventListener('click', function (e) {
        e.preventDefault();
        if (i === active) go(DATA[i].href); else setActive(i);
      });
    });
    goEl.addEventListener('click', function (e) { e.preventDefault(); go(DATA[active].href); });
    document.getElementById('lvPrev').addEventListener('click', function () { setActive(active - 1); });
    document.getElementById('lvNext').addEventListener('click', function () { setActive(active + 1); });

    // Keyboard controls
    document.addEventListener('keydown', function (e) {
      var t = e.target, tag = t && t.tagName;
      var modal = document.getElementById('searchModal');
      if (modal && !modal.classList.contains('hidden')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
      else if (e.key === 'End') { e.preventDefault(); setActive(n - 1); }
      else if (e.key === 'Enter' && (tag === 'BODY' || t === stage)) { e.preventDefault(); go(DATA[active].href); }
    });

    // Touch & mouse drag support
    var sx = null, moved = false;
    track.addEventListener('pointerdown', function (e) { sx = e.clientX; moved = false; });
    track.addEventListener('pointermove', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 12) moved = true; });
    function endDrag(e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { 
        setActive(active + (dx < 0 ? 1 : -1)); 
        track.dataset.swiped = '1'; 
        setTimeout(function () { delete track.dataset.swiped; }, 50); 
      }
    }
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', function () { sx = null; });
    track.addEventListener('click', function (e) { 
      if (track.dataset.swiped) { e.stopPropagation(); e.preventDefault(); } 
    }, true);

    // Initial entrance setup
    var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    stage.classList.add('carousel-ready');
    if (!reduceMotion) stage.classList.add('lv-intro');
    render(false);
    if (!reduceMotion) {
      items.forEach(function (el, i) { el.style.transitionDelay = (Math.abs(offset(i)) * 0.08) + 's'; });
      requestAnimationFrame(function () { 
        requestAnimationFrame(function () {
          stage.classList.remove('lv-intro');
          info.classList.add('lv-swap');
          setTimeout(function () { 
            items.forEach(function (el) { el.style.transitionDelay = ''; }); 
          }, 1000);
        }); 
      });
    }
    try { stage.focus({ preventScroll: true }); } catch (e) {}
  })();
