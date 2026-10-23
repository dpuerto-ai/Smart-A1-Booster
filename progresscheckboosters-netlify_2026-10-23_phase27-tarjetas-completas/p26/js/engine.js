/* Progress Check Boosters - shared engine.
 * Loaded before each level script (js/a1.js ... js/c1.js). Each level script defines
 * `const LEVEL = {...}` plus its own data and screens; everything here reads from it at call time. */

const STR = {
    es: {
        all: 'Todas', listen: 'Escuchar', copyTip: 'Clic para copiar', noVoice: 'Voz no disponible en este navegador', speaking: 'Pronunciando frase...',
        turnDone: '¡Tiempo de turno cumplido!', phase: p => `Fase seleccionada: ${p}`,
        copied: 'Frase copiada al portapapeles', roleSel: n => `Rol seleccionado: ${n}`,
        roleClear: 'Roles deseleccionados', confirmClear: '¿Deseas reiniciar los campos de este paso?', words: 'palabras',
        selfTitle: 'Revisa tus temas', selfIntroSel: 'Estos son los temas que elegiste reforzar en el Paso 0. ¿Cómo te fue con cada uno hoy?',
        selfIntroAll: 'No marcaste temas en el Paso 0, así que califica los temas de esta unidad.',
        got: 'Lo domino', almost: 'Casi', needs: 'Necesito practicar',
        reread: 'Relee tu texto del Paso 1 y busca estos temas y los errores frecuentes de abajo.',
        later: 'Para repasar después:', allGood: '¡Buen trabajo! Marcaste todos tus temas como dominados.',
        note: 'Tus respuestas se guardan solo en este navegador; no se envían a ningún sitio.',
        mission: 'Tu misión:',
        exprTitle: 'Expresiones útiles para hablar',
        exprHint: 'Frases listas para usar en tu conversación. Los puntos (...) son espacios para completar con tu propia información.',
        exprOpenBtn: 'Abrir',
        exprDrawerTitle: 'Expresiones útiles',
        exprSearch: 'Buscar expresión...',
        exprClose: 'Cerrar expresiones',
        exprNone: 'No se encontraron expresiones',
        unitsWord: 'Unidades',
        clearBtn: 'Borrar mis respuestas de este dispositivo',
        clearConfirm: '¿Borrar todo lo que escribiste y marcaste en este dispositivo (todas las unidades y niveles)? Esta acción no se puede deshacer.',
        cleared: 'Respuestas borradas'
    },
    en: {
        all: 'All', listen: 'Listen', copyTip: 'Click to copy', noVoice: 'Speech synthesis not supported in this browser', speaking: 'Pronouncing phrase...',
        turnDone: 'Turn time completed!', phase: p => `Jumped to phase: ${p}`,
        copied: 'Copied to clipboard', roleSel: n => `Role selected: ${n}`,
        roleClear: 'Role selection cleared', confirmClear: 'Are you sure you want to clear your answers in this step?', words: 'words',
        selfTitle: 'Review your focus topics', selfIntroSel: 'These are the topics you chose to review in Step 0. How did each one go today?',
        selfIntroAll: 'You did not pick topics in Step 0, so rate the topics of this unit.',
        got: 'Got it', almost: 'Almost', needs: 'Needs practice',
        reread: 'Reread your Step 1 writing and look for these topics and the common traps below.',
        later: 'To review later:', allGood: 'Great work! You marked all your topics as mastered.',
        note: 'Your answers are saved only in this browser; they are not sent anywhere.',
        mission: 'Your mission:',
        exprTitle: 'Useful expressions for speaking',
        exprHint: 'Ready-to-use phrases for your conversation. The dots (...) are blanks to fill in with your own information.',
        exprOpenBtn: 'Open',
        exprDrawerTitle: 'Useful Expressions',
        exprSearch: 'Search expression...',
        exprClose: 'Close expressions',
        exprNone: 'No expressions found',
        unitsWord: 'Units',
        clearBtn: 'Clear my answers on this device',
        clearConfirm: 'Delete everything you wrote and marked on this device (all units and levels)? This cannot be undone.',
        cleared: 'Answers cleared'
    }
};
function S() { return STR[LEVEL.lang] || STR.en; }

// Escapes text so it is safe inside an HTML attribute (quotes, ampersands, angle brackets).
// Used with data-say="..." so phrases containing ' or " no longer break inline handlers.
function escAttr(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// Inline SVG icons (replace emoji so they are consistent across devices and can be hidden from screen readers).
const ICON_SPEAKER = '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const ICON_MUTED = '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>';
// Timers are driven by the clock (end timestamps), so they do not drift when the tab is throttled.
let timerEndsAt = 0, turnEndsAt = 0;

// Local-first image loading: uses images/units/<photo-id>.jpg when present, falls back to the original URL.
function localImg(u) {
    const m = /photo-[\w-]+/.exec(u || '');
    return m ? 'images/units/' + m[0] + '.jpg' : u;
}


// Photo for the unit hero banner (right side, fades into the gradient).
function heroPhoto(b) {
    return `<div class="hidden sm:block absolute inset-y-0 right-0 w-2/5 pointer-events-none" aria-hidden="true"><img src="${localImg(b.imageUrl)}" data-fallback="${escAttr(b.imageUrl)}" alt="" class="w-full h-full object-cover opacity-60" style="-webkit-mask-image:linear-gradient(to right,transparent,#000 70%);mask-image:linear-gradient(to right,transparent,#000 70%)"></div>`;
}
// "Your mission" card shown at the top of Step 1 (round unit photo + task text).
function missionCard(b, ring) {
    return `<div class="flex items-center gap-4 mb-4 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <img src="${localImg(b.imageUrl)}" data-fallback="${escAttr(b.imageUrl)}" alt="" class="w-16 h-16 rounded-full object-cover ring-2 ${ring} ring-offset-2 shrink-0">
        <div class="min-w-0">
            <div class="text-xs font-black uppercase tracking-widest text-gray-900">${S().mission}</div>
            <p class="text-xs md:text-sm text-gray-600 font-medium mt-1"><span class="inline-block text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 rounded px-1.5 mr-1.5 align-middle">EN</span>${b.student.step1Text}</p>
        </div>
    </div>`;
}


// ---- Useful expressions (Step 2: speaking): card + slide-over drawer, same look as the vocabulary drawer ----
const exprState = { filter: 'all', q: '', bid: null };
function exprPhrase(bid, gi, pi) {
    const b = boosters.find(x => x.id === bid);
    return b && b.expressions && b.expressions[gi] ? b.expressions[gi].phrases[pi] : '';
}
function exprSpeak(bid, gi, pi) {
    const t = exprPhrase(bid, gi, pi).replace(/\(\+[^)]*\)/g, '').replace(/\.{3}/g, ' ').replace(/\s+/g, ' ').trim();
    if (t) speakText(t);
}
function exprCopy(bid, gi, pi) { const t = exprPhrase(bid, gi, pi); if (t) copyText(t); }
function renderExpressionsWidget(b) {
    if (!b.expressions || !b.expressions.length) return '';
    const total = b.expressions.reduce((a, g) => a + g.phrases.length, 0);
    return `<div class="bg-white border border-gray-200 rounded-3xl p-4 md:p-5 flex items-center justify-between gap-3">
        <div class="min-w-0">
            <span class="text-xs font-black uppercase tracking-wider text-gray-700 block">💬 ${S().exprTitle} <span class="font-mono text-gray-400 text-[10px]">(${total})</span></span>
            <p class="text-[11px] text-gray-500 mt-1">${S().exprHint}</p>
        </div>
        <button type="button" data-act="openExprDrawer" data-a0="${b.id}" class="${LEVEL.btn} shrink-0">${S().exprOpenBtn}</button>
    </div>`;
}
function ensureExprDrawer() {
    if (document.getElementById('expr-drawer')) return true;
    const v = document.getElementById('vocab-drawer'), vb = document.getElementById('vocab-drawer-backdrop');
    if (!v || !vb) return false;
    const fix = h => h.replace(/vocab-/g, 'expr-').replace(/closeVocabDrawer/g, 'closeExprDrawer').replace(/handleVocabSearch/g, 'handleExprSearch').replace(/clearVocabSearch/g, 'clearExprSearch');
    const tmp = document.createElement('div');
    tmp.innerHTML = fix(vb.outerHTML) + fix(v.outerHTML);
    const drawer = tmp.querySelector('#expr-drawer'), backdrop = tmp.querySelector('#expr-drawer-backdrop');
    drawer.classList.remove('drawer-open'); drawer.classList.add('drawer-closed');
    backdrop.classList.add('hidden', 'opacity-0'); backdrop.classList.remove('opacity-100');
    drawer.setAttribute('aria-label', S().exprDrawerTitle);
    const h3 = drawer.querySelector('h3'); if (h3) h3.textContent = S().exprDrawerTitle;
    const icon = drawer.querySelector('svg.icon-svg'); if (icon) icon.replaceWith(document.createTextNode('💬'));
    const closeBtn = drawer.querySelector('button[data-act="closeExprDrawer"]'); if (closeBtn) closeBtn.setAttribute('aria-label', S().exprClose);
    const inp = drawer.querySelector('#expr-search-input'); if (inp) { inp.setAttribute('placeholder', S().exprSearch); inp.setAttribute('aria-label', S().exprSearch); }
    const content = drawer.querySelector('#expr-drawer-content'); if (content) content.classList.add('hide-scrollbar');
    document.body.appendChild(backdrop); document.body.appendChild(drawer);
    return true;
}
function renderExprCategories(b) {
    const c = document.getElementById('expr-categories-bar'); if (!c) return;
    const total = b.expressions.reduce((a, g) => a + g.phrases.length, 0);
    c.innerHTML = `<button data-act="setExprCategory" data-a0="-1" class="vocab-category-chip ${exprState.filter === -1 ? 'active' : ''}">${S().all} (${total})</button>` +
        b.expressions.map((g, gi) => `<button data-act="setExprCategory" data-a0="${gi}" class="vocab-category-chip ${exprState.filter === gi ? 'active' : ''}">${g.category} (${g.phrases.length})</button>`).join('');
}
function renderExprContent(b) {
    const c = document.getElementById('expr-drawer-content'); if (!c) return;
    const q = exprState.q;
    const groups = b.expressions.map((g, gi) => ({ g, gi })).filter(x => exprState.filter === -1 || x.gi === exprState.filter)
        .map(x => ({ gi: x.gi, category: x.g.category, items: x.g.phrases.map((ph, pi) => ({ ph, pi })).filter(it => !q || it.ph.toLowerCase().includes(q) || x.g.category.toLowerCase().includes(q)) }))
        .filter(x => x.items.length);
    if (!groups.length) {
        c.innerHTML = `<div class="text-center py-12 px-4"><div class="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center text-lg mb-3">🔍</div><p class="text-xs font-bold text-gray-700">${S().exprNone}</p></div>`;
        return;
    }
    c.innerHTML = groups.map(x => `
        <div class="space-y-2">
            <div class="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-1">
                <span>${x.category}</span><span class="text-gray-400 font-mono text-[10px]">${x.items.length}</span>
            </div>
            <div class="grid grid-cols-1 gap-2">
                ${x.items.map(it => `<div class="vocab-word-card group">
                    <button type="button" class="vocab-card-label text-xs font-bold leading-tight" data-act="exprCopy" data-a0="${b.id}" data-a1="${x.gi}" data-a2="${it.pi}" title="${S().copyTip || ''}">${it.ph}</button>
                    <div class="flex items-center gap-1 shrink-0 ml-2"><button type="button" data-act="exprSpeak" data-a0="${b.id}" data-a1="${x.gi}" data-a2="${it.pi}" class="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[11px]" aria-label="${S().listen}: ${escAttr(it.ph)}">${ICON_SPEAKER}</button></div>
                </div>`).join('')}
            </div>
        </div>`).join('');
}
function openExprDrawer(id) {
    const b = boosters.find(x => x.id === (id || selectedBooster));
    if (!b || !b.expressions || !ensureExprDrawer()) return;
    exprState.filter = -1; exprState.q = ''; exprState.bid = b.id;
    const badge = document.getElementById('expr-drawer-unit-badge');
    if (badge) badge.textContent = b.units === 'FINAL' ? 'FINAL' : `${S().unitsWord} ${b.units}: ${b.title}`;
    const inp = document.getElementById('expr-search-input'); if (inp) inp.value = '';
    const clr = document.getElementById('expr-clear-btn'); if (clr) clr.classList.add('hidden');
    renderExprCategories(b); renderExprContent(b);
    const bd = document.getElementById('expr-drawer-backdrop'), dr = document.getElementById('expr-drawer');
    bd.classList.remove('hidden');
    setTimeout(() => { bd.classList.remove('opacity-0'); bd.classList.add('opacity-100'); dr.classList.remove('drawer-closed'); dr.classList.add('drawer-open'); }, 10);
    playChime('success');
}
function closeExprDrawer() {
    const bd = document.getElementById('expr-drawer-backdrop'), dr = document.getElementById('expr-drawer');
    if (!bd || !dr) return;
    bd.classList.remove('opacity-100'); bd.classList.add('opacity-0');
    dr.classList.remove('drawer-open'); dr.classList.add('drawer-closed');
    setTimeout(() => bd.classList.add('hidden'), 300);
}
function setExprCategory(i) {
    exprState.filter = i;
    const b = boosters.find(x => x.id === exprState.bid); if (!b) return;
    renderExprCategories(b); renderExprContent(b);
}
function handleExprSearch(v) {
    exprState.q = (v || '').trim().toLowerCase();
    const clr = document.getElementById('expr-clear-btn'); if (clr) clr.classList.toggle('hidden', !exprState.q);
    const b = boosters.find(x => x.id === exprState.bid); if (b) renderExprContent(b);
}
function clearExprSearch() { const i = document.getElementById('expr-search-input'); if (i) i.value = ''; handleExprSearch(''); }
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeExprDrawer(); });

// Optional: paste the entry IDs from the Form's "Get pre-filled link" (e.g. 'entry.1234567890') to pre-fill level and unit.
const SURVEY_PREFILL = { level: '', unit: '' };
function surveyUrl() {
    try {
        if (!SURVEY_PREFILL.level && !SURVEY_PREFILL.unit) return LEVEL.surveyBase;
        const u = new URL(LEVEL.surveyBase);
        u.searchParams.set('usp', 'pp_url');
        const b = boosters.find(x => x.id === selectedBooster);
        if (SURVEY_PREFILL.level) u.searchParams.set(SURVEY_PREFILL.level, LEVEL.code);
        if (SURVEY_PREFILL.unit && b) u.searchParams.set(SURVEY_PREFILL.unit, String(b.units));
        return u.toString();
    } catch (e) { return LEVEL.surveyBase; }
}

// ---- Step 3 self-check ----
let selfRatings = {};
function selfKey() { return LEVEL.prefix + 'self_'; }
function selfSave() {
    try {
        const b = boosters.find(x => x.id === selectedBooster);
        const diag = [...selectedDiagTopics].map(tp => b.student.diagOptions.indexOf(tp)).filter(i => i >= 0);
        localStorage.setItem(selfKey() + selectedBooster, JSON.stringify({ diag: diag, rate: selfRatings }));
    } catch (e) {}
}
function selfRestore() {
    selfRatings = {};
    try {
        const raw = localStorage.getItem(selfKey() + selectedBooster);
        if (!raw) return;
        const d = JSON.parse(raw);
        const b = boosters.find(x => x.id === selectedBooster);
        selectedDiagTopics = new Set((d.diag || []).map(i => b.student.diagOptions[i]).filter(Boolean));
        selfRatings = d.rate || {};
    } catch (e) {}
}
function setSelfRating(i, val) {
    if (selfRatings[i] === val) delete selfRatings[i]; else selfRatings[i] = val;
    selfSave();
    render();
}
function renderSelfCheck(b) {
    const t = S();
    const opts = b.student.diagOptions;
    const chosen = [...selectedDiagTopics].map(tp => opts.indexOf(tp)).filter(i => i >= 0).sort((x, y) => x - y);
    const idxs = chosen.length ? chosen : opts.map((_, i) => i);
    const choices = [
        ['got', t.got, 'bg-emerald-600 border-emerald-600 text-white'],
        ['almost', t.almost, 'bg-amber-500 border-amber-500 text-white'],
        ['needs', t.needs, 'bg-rose-500 border-rose-500 text-white']
    ];
    const rows = idxs.map(i => {
        const r = selfRatings[i];
        const label = String(opts[i]).replace(/"/g, '&quot;');
        return `<div class="p-3 bg-white border border-gray-200 rounded-xl">
                    <p class="text-xs font-bold text-gray-800 mb-2">${opts[i]}</p>
                    <div role="group" aria-label="${label}" class="flex flex-wrap gap-2">
                        ${choices.map(c => `<button type="button" aria-pressed="${r === c[0]}" data-act="setSelfRating" data-a0="${i}" data-a1="${c[0]}" class="px-3 py-1.5 rounded-full text-xs font-bold border transition active:scale-95 ${r === c[0] ? c[2] : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}">${c[1]}</button>`).join('')}
                    </div></div>`;
    }).join('');
    const rated = idxs.filter(i => selfRatings[i]);
    const pending = idxs.filter(i => selfRatings[i] === 'almost' || selfRatings[i] === 'needs');
    let summary = '';
    if (rated.length && pending.length) summary = t.later + ' ' + pending.map(i => opts[i]).join(' · ');
    else if (rated.length === idxs.length) summary = t.allGood;
    return `<div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 mb-1">${t.selfTitle}</h4>
                <p class="text-xs text-gray-600 mb-3 leading-relaxed">${chosen.length ? t.selfIntroSel : t.selfIntroAll}</p>
                <div class="space-y-2">${rows}</div>
                <p class="text-xs font-semibold text-gray-700 mt-3 min-h-[1rem]" aria-live="polite">${summary}</p>
                <p class="text-xs text-gray-500 mt-2 leading-relaxed">${t.reread}</p>
                <p class="text-[11px] text-gray-400 mt-2">${t.note}</p>
            </div>`;
}
function renderClearDataButton() {
    return `<button type="button" data-act="clearMyData" class="w-full sm:w-auto border border-gray-300 text-gray-600 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 transition active:scale-95">${S().clearBtn}</button>`;
}
function clearMyData() {
    showAppConfirm(S().clearConfirm, () => {
        try {
            Object.keys(localStorage).filter(k => k.indexOf('pcb_') === 0).forEach(k => localStorage.removeItem(k));
        } catch (e) {}
        selectedDiagTopics = new Set();
        selfRatings = {};
        render();
        showToast(S().cleared);
    });
}

// ---- Functions that only differ by language / storage key between levels ----
function renderVocabDrawerCategories(b) {
    const container = document.getElementById('vocab-categories-bar');
    if (!container) return;

    const allBtn = `<button data-act="setVocabDrawerCategory" data-a0="all" class="vocab-category-chip ${vocabDrawerFilterCategory === 'all' ? 'active' : ''}">${S().all} (${b.vocabBank.reduce((acc, cat) => acc + cat.words.length, 0)})</button>`;
    const catBtns = b.vocabBank.map(cat => `
        <button data-act="setVocabDrawerCategory" data-a0="${escAttr(cat.category)}" class="vocab-category-chip ${vocabDrawerFilterCategory === cat.category ? 'active' : ''}">
            ${cat.category} (${cat.words.length})
        </button>
    `).join('');

    container.innerHTML = allBtn + catBtns;
}
function updateWordCount(ta, min, max) {
    const counter = document.getElementById('freewrite-count');
    if (!counter) return;
    const words = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
    counter.textContent = `${words} / ${min}-${max} ${S().words}`;
    counter.className = 'word-count-badge ' + (words < min ? 'word-count-under' : words > max ? 'word-count-over' : 'word-count-ok');
    if (words >= min && words <= max && !ta.dataset.celebrated) {
        ta.dataset.celebrated = 'true';
        playChime('success');
    } else if (words < min || words > max) {
        delete ta.dataset.celebrated;
    }
}
function speakText(text) {
    if (!('speechSynthesis' in window)) {
        showToast(S().noVoice, "ℹ");
        return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[\[.*?\]\]/g, '').replace(/\[.*?\]/g, '').replace(/[*_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    showToast(S().speaking, "🔊");
}
function startTurnTimer(seconds) {
    clearInterval(turnTimerInterval);
    turnTimeLeft = seconds;
    turnEndsAt = Date.now() + seconds * 1000;
    updateTurnTimerUI();
    playChime('success');
    turnTimerInterval = setInterval(() => {
        turnTimeLeft = Math.max(0, Math.ceil((turnEndsAt - Date.now()) / 1000));
        updateTurnTimerUI();
        if (turnTimeLeft <= 0) {
            clearInterval(turnTimerInterval);
            playChime('complete');
            showToast(S().turnDone, "🔔");
        }
    }, 1000);
}
function jumpToPhase(phase) {
    let targetRatio = 1.0;
    if (phase === 'diag') targetRatio = 1.0;
    else if (phase === 'write') targetRatio = 0.90;
    else if (phase === 'speak') targetRatio = 0.55;
    else if (phase === 'feed') targetRatio = 0.15;

    timeLeft = Math.round(totalTime * targetRatio);
    if (isTimerRunning) timerEndsAt = Date.now() + timeLeft * 1000;
    playChime('success');
    showToast(S().phase(phase.toUpperCase()));
    renderTeacherWidget();
}
function copyText(text) {
    const done = () => { showToast(S().copied, "📋"); playChime('success'); };
    const legacy = () => {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.setAttribute('readonly', '');
        temp.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
        document.body.appendChild(temp);
        temp.select();
        try { temp.setSelectionRange(0, text.length); document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(temp);
        done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, legacy);
    } else {
        legacy();
    }
}
function selectRole(i) {
    selectedRoleIndex = i;
    render();
    playChime('success');
    showToast(S().roleSel(boosters.find(x => x.id === selectedBooster).student.roles[i].name));
}
function clearRole() {
    selectedRoleIndex = null;
    render();
    showToast(S().roleClear);
}
function restoreSavedInputs() {
    try {
        const raw = localStorage.getItem(LEVEL.prefix + selectedBooster);
        if (!raw) return;
        const data = JSON.parse(raw);
        document.querySelectorAll('.fill-in-blank').forEach((inp, idx) => {
            if (data['inp_' + idx]) inp.value = data['inp_' + idx];
        });
        const fw = document.getElementById('freewrite-textarea');
        if (fw && data['freewrite']) {
            fw.value = data['freewrite'];
            const b = boosters.find(x => x.id === selectedBooster);
            if (b) updateWordCount(fw, b.student.freeWriteMin, b.student.freeWriteMax);
        }
        updateTemplateProgress();
    } catch(e) {}
}
function saveCurrentInputs() {
    const data = {};
    document.querySelectorAll('.fill-in-blank').forEach((inp, idx) => {
        data['inp_' + idx] = inp.value;
    });
    const fw = document.getElementById('freewrite-textarea');
    if (fw) data['freewrite'] = fw.value;
    try {
        localStorage.setItem(LEVEL.prefix + selectedBooster, JSON.stringify(data));
    } catch(e) {}
}
function clearAllAnswers() {
    showAppConfirm(S().confirmClear, () => {
        document.querySelectorAll('#step1-template-container .fill-in-blank').forEach(inp => {
            inp.value = '';
            inp.className = inp.tagName === 'TEXTAREA' ? 'fill-in-blank sentence-starter-textarea' : 'fill-in-blank';
        });
        const fw = document.getElementById('freewrite-textarea');
        if (fw) {
            fw.value = '';
            const b = boosters.find(x => x.id === selectedBooster);
            if (b) updateWordCount(fw, b.student.freeWriteMin, b.student.freeWriteMax);
        }
        const msg = document.getElementById('validation-msg');
        if (msg) msg.classList.add('hidden');
        localStorage.removeItem(LEVEL.prefix + selectedBooster);
        updateTemplateProgress();
    });
}

// ---- Functions that were identical in all five levels ----

        function setLandingLayoutMode(mode) {
            landingLayoutMode = mode;
            render();
        }

        function navigateCarousel(direction) {
            const total = boosters.length;
            if (direction === 'next') {
                carouselCurrentIndex = (carouselCurrentIndex + 1) % total;
            } else if (direction === 'prev') {
                carouselCurrentIndex = (carouselCurrentIndex - 1 + total) % total;
            } else if (typeof direction === 'number') {
                carouselCurrentIndex = Math.max(0, Math.min(total - 1, direction));
            }
            updateCarouselView();
        }

        function updateTurnTimerUI() {
            const el = document.getElementById('turn-timer-display');
            if (el) {
                const safeLeft = Math.max(turnTimeLeft, 0);
                const m = Math.floor(safeLeft / 60).toString().padStart(2, '0');
                const s = (safeLeft % 60).toString().padStart(2, '0');
                el.textContent = `${m}:${s}`;
            }
        }

        function showToast(msg, icon = '✓') {
            const toast = document.getElementById('quick-toast');
            const msgEl = document.getElementById('quick-toast-msg');
            const iconEl = document.getElementById('quick-toast-icon');
            if (!toast || !msgEl || !iconEl) return;
            msgEl.textContent = msg;
            iconEl.textContent = icon;
            toast.classList.add('show');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 2600);
        }

        function getAudioContext() {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) audioCtx = new AudioContextClass();
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            return audioCtx;
        }

        function setView(v) {
            currentView = v;
            selectedRoleIndex = null;
            activeStudentStep = 0;
            selectedDiagTopics = new Set();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            render();
        }

        function selectBooster(id) {
            selectedBooster = id;
            setView('student');
            selfRestore();
            render();
        }

        function setActiveStep(step) {
            activeStudentStep = (activeStudentStep === step) ? null : step;
            render();
        }

        function setStep1Mode(mode) {
            step1Mode = mode;
            render();
        }

        function toggleDiagTopic(idx) {
            const bb = boosters.find(x => x.id === selectedBooster);
            const t = bb && bb.student.diagOptions[idx];
            if (t === undefined) return;
            if (selectedDiagTopics.has(t)) selectedDiagTopics.delete(t);
            else selectedDiagTopics.add(t);
            selfSave();
            render();
        }

        function togglePresentationMode() {
            presentationMode = !presentationMode;
            if (presentationMode) teacherWidgetMinimized = true;
            document.body.classList.toggle('presentation-mode', presentationMode);
            renderTeacherWidget();
        }

        function activateTeacherMode() {
            isTeacherAuth = true;
            sessionStorage.setItem('isTeacherAuth', 'true');
            teacherWidgetMinimized = false;
            render();
        }

        function logout() {
            isTeacherAuth = false;
            sessionStorage.removeItem('isTeacherAuth');
            clearInterval(timerInterval);
            isTimerRunning = false;
            render();
        }

        function toggleTimer() {
            if (isTimerRunning) {
                clearInterval(timerInterval);
                isTimerRunning = false;
            } else {
                if (timeLeft <= 0) timeLeft = totalTime;
                isTimerRunning = true;
                timerEndsAt = Date.now() + timeLeft * 1000;
                timerInterval = setInterval(() => {
                    timeLeft = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        isTimerRunning = false;
                    }
                    renderTeacherWidget();
                }, 1000);
            }
            renderTeacherWidget();
        }

        function resetTimer() {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timeLeft = totalTime;
            renderTeacherWidget();
        }

        function changeTotalTime(m) {
            if (isTimerRunning) return;
            totalTime = parseInt(m) * 60;
            timeLeft = totalTime;
            renderTeacherWidget();
        }

        function openVocabModal(id) {
            openVocabDrawer(id);
        }

        function closeVocabDrawer() {
            const backdrop = document.getElementById('vocab-drawer-backdrop');
            const drawer = document.getElementById('vocab-drawer');
            if (backdrop && drawer) {
                backdrop.classList.remove('opacity-100');
                backdrop.classList.add('opacity-0');
                drawer.classList.remove('drawer-open');
                drawer.classList.add('drawer-closed');
                setTimeout(() => {
                    backdrop.classList.add('hidden');
                }, 300);
            }
        }

        function setVocabDrawerCategory(cat) {
            vocabDrawerFilterCategory = cat;
            const b = boosters.find(x => x.id === selectedBooster);
            renderVocabDrawerCategories(b);
            renderVocabDrawerWords(b);
        }

        function handleVocabSearch(query) {
            vocabDrawerSearchQuery = query.trim().toLowerCase();
            const clearBtn = document.getElementById('vocab-clear-btn');
            if (clearBtn) clearBtn.classList.toggle('hidden', !vocabDrawerSearchQuery);
            const b = boosters.find(x => x.id === selectedBooster);
            renderVocabDrawerWords(b);
        }

        function clearVocabSearch() {
            const input = document.getElementById('vocab-search-input');
            if (input) input.value = '';
            handleVocabSearch('');
        }

        function showAppAlert(msg) {
            document.getElementById('app-alert-message').textContent = msg;
            document.getElementById('app-alert-modal').classList.remove('hidden');
        }

        function closeAppAlert() {
            document.getElementById('app-alert-modal').classList.add('hidden');
        }

        function showAppConfirm(msg, cb) {
            pendingConfirmCb = cb;
            document.getElementById('app-confirm-message').textContent = msg;
            document.getElementById('app-confirm-modal').classList.remove('hidden');
        }

        function closeAppConfirm(ok) {
            document.getElementById('app-confirm-modal').classList.add('hidden');
            if (ok && typeof pendingConfirmCb === 'function') pendingConfirmCb();
            pendingConfirmCb = null;
        }

        function parseTemplate(t) {
            let htmlText = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            htmlText = htmlText.replace(/\[\[(.*?)\]\]/g, (m, p1) => {
                return `<textarea autocorrect="off" spellcheck="false" placeholder="${p1}" aria-label="${p1}" data-field="${p1}" class="fill-in-blank sentence-starter-textarea" maxlength="400" rows="2" data-in="templateInput"></textarea>`;
            });
            return htmlText.replace(/\[(.*?)\]/g, (m, p1) => {
                return `<input type="text" placeholder="${p1}" data-field="${p1}" class="fill-in-blank" data-in="templateInput">`;
            });
        }

        function render() {
            const app = document.getElementById('app');
            if (currentView === 'landing') {
                app.innerHTML = renderLanding();
                if (landingLayoutMode === 'carousel') {
                    setTimeout(() => {
                        updateCarouselView();
                    }, 40);
                }
            } else {
                app.innerHTML = renderStudentView();
                setTimeout(() => {
                    restoreSavedInputs();
                    updateTemplateProgress();
                }, 60);
            }
            renderTeacherWidget();
        }

// ---- Accessibility helpers ----
let soundMuted = false;
try { soundMuted = localStorage.getItem('pcb_sound') === 'off'; } catch (e) {}

function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function updateSoundToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    const es = LEVEL.lang === 'es';
    btn.innerHTML = soundMuted ? ICON_MUTED : ICON_SPEAKER;
    btn.setAttribute('aria-pressed', soundMuted ? 'true' : 'false');
    btn.setAttribute('aria-label', es ? 'Silenciar sonidos' : 'Mute sounds');
    btn.title = soundMuted ? (es ? 'Sonidos desactivados' : 'Sounds off') : (es ? 'Sonidos activados' : 'Sounds on');
}

function toggleSound() {
    soundMuted = !soundMuted;
    try { localStorage.setItem('pcb_sound', soundMuted ? 'off' : 'on'); } catch (e) {}
    updateSoundToggle();
}

// Makes clickable <div>/<span> elements reachable by keyboard and labels icon-only controls.
function enhanceA11y() {
    const interactive = 'button, a, input, select, textarea, [tabindex]';
    document.querySelectorAll('[data-act]').forEach(el => {
        if (['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY'].includes(el.tagName)) return;
        if (/backdrop/i.test(el.id)) { el.setAttribute('aria-hidden', 'true'); return; }
        if (el.querySelector(interactive)) {
            // A clickable card that already contains buttons (e.g. vocabulary cards): expose its label as the control.
            const label = el.querySelector('span');
            if (el.classList.contains('vocab-word-card') && label && !label.hasAttribute('role')) {
                label.setAttribute('tabindex', '0');
                label.setAttribute('role', 'button');
                label.setAttribute('aria-label', (el.getAttribute('title') || '') + ': ' + label.textContent.trim());
            }
            return;
        }
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    });
    document.querySelectorAll('[data-step]').forEach(st => {
        const b = st.querySelector('button');
        if (b) b.setAttribute('aria-expanded', st.hasAttribute('data-active') ? 'true' : 'false');
    });
    document.querySelectorAll('button, [role="button"]').forEach(b => {
        if (b.hasAttribute('aria-label')) return;
        const visible = b.textContent.replace(/[×✕✖✗↺▲▼◀▶←→‹›↗\s]/g, '');
        if (!visible && b.getAttribute('title')) b.setAttribute('aria-label', b.getAttribute('title'));
    });
}

function initA11y() {
    const btn = document.createElement('button');
    btn.id = 'sound-toggle';
    btn.type = 'button';
    btn.onclick = toggleSound;
    // In the header (not floating over the content, which covered the tabs on phones); falls back to floating.
    const host = document.querySelector('header .max-w-6xl');
    if (host) { btn.classList.add('in-header'); host.appendChild(btn); } else { document.body.appendChild(btn); }
    updateSoundToggle();

    const toast = document.getElementById('quick-toast');
    if (toast) { toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); }
    const ticon = document.getElementById('quick-toast-icon'); if (ticon) ticon.setAttribute('aria-hidden', 'true');
    initDialogs();
    try { document.documentElement.setAttribute('data-level', LEVEL.id); } catch (e) {}

    let queued = false;
    new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; enhanceA11y(); });
    }).observe(document.body, { childList: true, subtree: true });
    enhanceA11y();

    document.addEventListener('keydown', e => {
        const t = e.target;
        if ((e.key === 'Enter' || e.key === ' ') && t && t.matches && t.matches('[role="button"]:not(button):not(a)') && (t.hasAttribute('data-act') || t.closest('[data-act]'))) {
            e.preventDefault();
            t.click();
        } else if (e.key === 'Escape') {
            const modal = document.getElementById('app-confirm-modal');
            const alertM = document.getElementById('app-alert-modal');
            if (modal && !modal.classList.contains('hidden')) closeAppConfirm(false);
            else if (alertM && !alertM.classList.contains('hidden')) closeAppAlert();
        } else if (e.key === 'Tab') {
            trapTab(e);
        }
    });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initA11y);
else initA11y();


// ---- Dialog focus management (drawers and modals) ----
// On open: focus moves inside, the rest of the page becomes inert, Tab stays in the dialog.
// On close: the page is restored and focus returns to the control that opened it.
const dlgStack = [];
function dlgFocusables(root) {
    return [...root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter(el => el.getClientRects().length > 0);
}
function dlgOpen(el, opts) {
    if (!el || dlgStack.some(d => d.el === el)) return;
    const entry = { el: el, opener: document.activeElement, inerted: [] };
    [...document.body.children].forEach(n => {
        if (n === el || n.contains(el) || n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.id === 'quick-toast' || n.id === 'confetti-canvas' || /backdrop/i.test(n.id)) return;
        if (!n.inert) { n.inert = true; entry.inerted.push(n); }
    });
    dlgStack.push(entry);
    // Focus the first control; retry briefly because the drawer is still sliding in (hidden until its class flips).
    let tries = 0;
    const focusFirst = () => {
        const first = (opts && opts.focus && el.querySelector(opts.focus)) || dlgFocusables(el)[0];
        if (first) first.focus({ preventScroll: true });
        if (first && document.activeElement === first) return;
        if (++tries < 8) setTimeout(focusFirst, 50);
    };
    setTimeout(focusFirst, 60);
}
function dlgClose(el) {
    const i = dlgStack.findIndex(d => d.el === el);
    if (i < 0) return;
    const entry = dlgStack.splice(i, 1)[0];
    entry.inerted.forEach(n => { n.inert = false; });
    let target = entry.opener;
    if (!target || !document.contains(target) || target === document.body) {
        target = document.getElementById('app');
        if (target) target.setAttribute('tabindex', '-1');
    }
    if (target && target.focus) { try { target.focus({ preventScroll: true }); } catch (e) {} }
}
function trapTab(e) {
    if (!dlgStack.length) return;
    const el = dlgStack[dlgStack.length - 1].el;
    const f = dlgFocusables(el);
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1], a = document.activeElement;
    if (!el.contains(a)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
}
function initDialogs() {
    const wrap = (openName, closeName, id, focusSel) => {
        const o = window[openName], c = window[closeName];
        const get = () => document.getElementById(id);
        if (typeof o === 'function') window[openName] = function () { const r = o.apply(this, arguments); dlgOpen(get(), { focus: focusSel }); return r; };
        if (typeof c === 'function') window[closeName] = function () { const el = get(); const r = c.apply(this, arguments); dlgClose(el); return r; };
    };
    wrap('openVocabDrawer', 'closeVocabDrawer', 'vocab-drawer', '#vocab-search-input');
    wrap('openExprDrawer', 'closeExprDrawer', 'expr-drawer', '#expr-search-input');
    wrap('showAppAlert', 'closeAppAlert', 'app-alert-modal', 'button');
    wrap('showAppConfirm', 'closeAppConfirm', 'app-confirm-modal', 'button');
}


// ---- Level content loader (data/<level>.json) ----
// The level script declares `let boosters` and `let speakingCards`; this fills them before the first render.
function loadLevelData() {
    const app = document.getElementById('app');
    const es = typeof LEVEL !== 'undefined' && LEVEL.lang === 'es';
    if (app) app.innerHTML = '<p role="status" style="margin:48px auto;text-align:center;font:600 14px system-ui,sans-serif;color:#475569">' + (es ? 'Cargando contenido…' : 'Loading content…') + '</p>';
    return fetch('data/' + LEVEL.id + '.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(d => {
            if (!d || !Array.isArray(d.boosters) || !d.boosters.length) throw new Error('empty content');
            boosters = cleanContent(d.boosters);
            speakingCards = cleanContent(d.speakingCards || {});
        });
}
function showLoadError(err) {
    try { console.error('Content load failed:', err); } catch (e) {}
    const app = document.getElementById('app'); if (!app) return;
    const es = typeof LEVEL !== 'undefined' && LEVEL.lang === 'es';
    const local = location.protocol === 'file:';
    const msg = local
        ? (es ? 'Abre la página desde el sitio publicado o desde un servidor local; no funciona al abrir el archivo directamente.' : 'Open the page from the published site or a local server; it does not work when opened as a plain file.')
        : (es ? 'Revisa tu conexión y vuelve a intentarlo.' : 'Check your connection and try again.');
    app.innerHTML = '<div role="alert" style="margin:48px auto;max-width:420px;text-align:center;padding:28px;background:#fff;border:1px solid #e2e8f0;border-radius:24px;font-family:system-ui,sans-serif">' +
        '<h1 style="font-size:18px;font-weight:800;margin:0 0 8px;color:#0f172a">' + (es ? 'No se pudo cargar el contenido' : 'The content could not be loaded') + '</h1>' +
        '<p style="font-size:14px;line-height:1.5;color:#475569;margin:0 0 16px">' + msg + '</p>' +
        '<button type="button" data-act="reload" style="padding:10px 20px;border-radius:12px;border:0;background:#0f172a;color:#fff;font-weight:700;font-size:13px;cursor:pointer">' + (es ? 'Reintentar' : 'Retry') + '</button></div>';
}

/* ===== Pantallas compartidas por todos los niveles (4b) =====
   Colores, textos y sonidos propios de cada nivel viven en LEVEL.theme y LEVEL.ui (js/<nivel>.js). ===== */

        let boosters = [];
        let speakingCards = {};

        let landingLayoutMode = 'carousel';
        let carouselCurrentIndex = 0;
        let carouselTouchStartX = 0;

        function updateCarouselView() {
            const T = LEVEL.theme, U = LEVEL.ui;
            const track = document.getElementById('carousel-track');
            if (!track) return;
            const cards = track.children;
            const total = cards.length;
            if (total === 0) return;

            carouselCurrentIndex = Math.max(0, Math.min(total - 1, carouselCurrentIndex));

            const firstCard = cards[0];
            const cardWidth = firstCard.offsetWidth;
            const cardGap = 16;
            const containerWidth = track.parentElement.offsetWidth;
            const centerOffset = (containerWidth / 2) - (cardWidth / 2);
            const translateX = -(carouselCurrentIndex * (cardWidth + cardGap)) + centerOffset;

            track.style.transform = `translateX(${translateX}px)`;

            Array.from(cards).forEach((card, idx) => {
                const isActive = idx === carouselCurrentIndex;
                card.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                if (isActive) {
                    card.style.opacity = '1'; card.style.filter = 'none';
                    card.style.transform = 'scale(1.03)';
                    card.style.borderColor = '' + T.cardBorder + '';
                    card.style.boxShadow = '' + T.cardShadow + '';
                } else {
                    card.style.opacity = '1'; card.style.filter = 'saturate(0.55)';
                    card.style.transform = 'scale(0.95)';
                    card.style.borderColor = '' + T.cardIdleBorder + '';
                    card.style.boxShadow = 'none';
                }
            });

            const dots = document.querySelectorAll('.carousel-dot');
            dots.forEach((dot, idx) => {
                if (idx === carouselCurrentIndex) {
                    dot.className = 'carousel-dot w-6 h-2 rounded-full ' + T.dotActive + ' transition-all duration-300';
                } else {
                    dot.className = 'carousel-dot w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-300 cursor-pointer';
                }
            });

            const ctr = document.querySelector('.carousel-counter');
            if (ctr) ctr.textContent = (carouselCurrentIndex + 1) + ' / ' + total;

            const activeBooster = boosters[carouselCurrentIndex];
            const previewTitle = document.getElementById('carousel-preview-title');
            const previewUnits = document.getElementById('carousel-preview-units');
            const previewFocus = document.getElementById('carousel-preview-focus');
            const previewVocabCount = document.getElementById('carousel-preview-vocab-count');
            const previewStartBtn = document.getElementById('carousel-preview-start-btn');
            const previewVocabBtn = document.getElementById('carousel-preview-vocab-btn');

            if (previewTitle && activeBooster) {
                previewTitle.textContent = activeBooster.title;
                if (previewUnits) previewUnits.textContent = activeBooster.units === 'FINAL' ? '' + U.finalExam + '' : `${U.unitWord} ${activeBooster.units}`;
                if (previewFocus) previewFocus.textContent = activeBooster.teacher.focus;
                if (previewVocabCount) {
                    const totalWords = activeBooster.vocabBank.reduce((acc, cat) => acc + cat.words.length, 0);
                    previewVocabCount.textContent = `${totalWords} ${U.keyWords}`;
                }
                if (previewStartBtn) previewStartBtn.onclick = () => selectBooster(activeBooster.id);
                if (previewVocabBtn) previewVocabBtn.onclick = () => openVocabDrawer(activeBooster.id);
            }
        }

        window.addEventListener('keydown', (e) => {
            if (currentView === 'landing' && landingLayoutMode === 'carousel') {
                if (e.key === 'ArrowLeft') navigateCarousel('prev');
                if (e.key === 'ArrowRight') navigateCarousel('next');
            }
        });

        let currentView = 'landing';
        let selectedBooster = 1;
        let selectedRoleIndex = null;
        let activeStudentStep = 0;
        let step1Mode = 'template';
        let isTeacherAuth = sessionStorage.getItem('isTeacherAuth') === 'true';
        let totalTime = 1200;
        let timeLeft = 1200;
        let isTimerRunning = false;
        let timerInterval = null;
        let teacherWidgetMinimized = false;
        let teacherWidgetShowInfo = false;
        let selectedDiagTopics = new Set();
        let presentationMode = false;

        let vocabDrawerFilterCategory = 'all';
        let vocabDrawerSearchQuery = '';

        /* Turn-taking timer */
        let turnTimerInterval = null;
        let turnTimeLeft = 0;

        let toastTimeout = null;

        let audioCtx = null;

        function playChime(type = 'success') {
            const T = LEVEL.theme, U = LEVEL.ui;
            if (soundMuted) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const now = ctx.currentTime;
                
                if (type === 'success') {
                    const osc1 = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc1.type = 'sine';
                    osc2.type = 'triangle';

                    osc1.frequency.setValueAtTime(T.chime[0], now);
                    osc1.frequency.setValueAtTime(T.chime[1], now + T.chime[2]);

                    osc2.frequency.setValueAtTime(T.chime[0], now);
                    osc2.frequency.setValueAtTime(T.chime[1], now + T.chime[2]);

                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

                    osc1.connect(gain);
                    osc2.connect(gain);
                    gain.connect(ctx.destination);

                    osc1.start(now);
                    osc2.start(now);
                    osc1.stop(now + 0.45);
                    osc2.stop(now + 0.45);
                } else if (type === 'complete') {
                    const notes = T.notes;
                    notes.forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const startTime = now + (idx * 0.08);

                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, startTime);

                        gain.gain.setValueAtTime(0.12, startTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

                        osc.connect(gain);
                        gain.connect(ctx.destination);

                        osc.start(startTime);
                        osc.stop(startTime + 0.5);
                    });
                }
            } catch (e) {}
        }

        let confettiAnimationId = null;
        function triggerConfetti() {
            const T = LEVEL.theme, U = LEVEL.ui;
            if (prefersReducedMotion()) return;
            const canvas = document.getElementById('confetti-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const particles = [];
            const colors = T.confetti;

            for (let i = 0; i < 90; i++) {
                particles.push({
                    x: canvas.width * (0.3 + Math.random() * 0.4),
                    y: canvas.height * 0.45,
                    vx: (Math.random() - 0.5) * 14,
                    vy: (Math.random() - 0.9) * 16,
                    size: Math.random() * 7 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 12,
                    opacity: 1
                });
            }

            if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

            function update() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                let alive = false;

                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.42;
                    p.vx *= 0.98;
                    p.rotation += p.rotationSpeed;
                    p.opacity -= 0.012;

                    if (p.opacity > 0) {
                        alive = true;
                        ctx.save();
                        ctx.globalAlpha = Math.max(0, p.opacity);
                        ctx.translate(p.x, p.y);
                        ctx.rotate((p.rotation * Math.PI) / 180);
                        ctx.fillStyle = p.color;
                        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                        ctx.restore();
                    }
                });

                if (alive) {
                    confettiAnimationId = requestAnimationFrame(update);
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }

            confettiAnimationId = requestAnimationFrame(update);
        }

        /* Vocabulary drawer */

        function openVocabDrawer(id) {
            const T = LEVEL.theme, U = LEVEL.ui;
            const b = boosters.find(x => x.id === (id || selectedBooster));
            if (!b) return;
            selectedBooster = b.id;
            vocabDrawerFilterCategory = 'all';
            vocabDrawerSearchQuery = '';

            const badge = document.getElementById('vocab-drawer-unit-badge');
            if (badge) badge.textContent = b.units === 'FINAL' ? '' + U.finalExam + '' : `${U.unitWord} ${b.units}: ${b.title}`;

            const searchInput = document.getElementById('vocab-search-input');
            if (searchInput) searchInput.value = '';

            renderVocabDrawerCategories(b);
            renderVocabDrawerWords(b);

            const backdrop = document.getElementById('vocab-drawer-backdrop');
            const drawer = document.getElementById('vocab-drawer');
            if (backdrop && drawer) {
                backdrop.classList.remove('hidden');
                setTimeout(() => {
                    backdrop.classList.remove('opacity-0');
                    backdrop.classList.add('opacity-100');
                    drawer.classList.remove('drawer-closed');
                    drawer.classList.add('drawer-open');
                }, 10);
            }
            playChime('success');
        }

        function renderVocabDrawerWords(b) {
            const T = LEVEL.theme, U = LEVEL.ui;
            const container = document.getElementById('vocab-drawer-content');
            if (!container || !b) return;

            const q = vocabDrawerSearchQuery;
            let filteredCategories = b.vocabBank;

            if (vocabDrawerFilterCategory !== 'all') {
                filteredCategories = filteredCategories.filter(c => c.category === vocabDrawerFilterCategory);
            }

            if (q) {
                filteredCategories = filteredCategories.map(cat => ({
                    category: cat.category,
                    words: cat.words.filter(w => w.toLowerCase().includes(q))
                })).filter(cat => cat.words.length > 0);
            }

            if (!filteredCategories.length) {
                container.innerHTML = `
                    <div class="text-center py-12 px-4">
                        <div class="w-12 h-12 rounded-full ${T.emptyIcon} mx-auto flex items-center justify-center text-lg mb-3">🔍</div>
                        <p class="text-xs font-bold text-gray-700">${U.emptyTitle}</p>
                        <p class="text-[11px] text-gray-400 mt-1">${U.emptyHint}</p>
                        <button data-act="clearVocabSearch" class="mt-4 text-xs font-black ${T.emptyLink} hover:underline">${U.emptyReset}</button>
                    </div>
                `;
                return;
            }

            container.innerHTML = filteredCategories.map(cat => `
                <div class="space-y-2">
                    <div class="flex items-center justify-between text-[11px] font-black uppercase tracking-wider ${T.catHead} border-b border-gray-100 pb-1">
                        <span>${cat.category}</span>
                        <span class="text-gray-400 font-mono text-[10px]">${cat.words.length} items</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${cat.words.map(w => {
                            const highlighted = q ? w.replace(new RegExp(`(${q})`, 'gi'), '<mark class="' + T.mark + '">$1</mark>') : w;
                            const safeWord = w.replace(/'/g, "\\'");
                            return `
                                <div class="vocab-word-card group">
                                    <button type="button" class="vocab-card-label text-xs font-bold ${T.wordColor} leading-tight" data-say="${escAttr(w)}" data-act="copyText" title="${U.copyTitle}">${highlighted}</button>
                                    <div class="flex items-center gap-1 shrink-0 ml-2">
                                        <button type="button" data-say="${escAttr(w)}" data-act="speakText" aria-label="${S().listen}: ${escAttr(w)}" class="w-6 h-6 rounded-lg bg-white border border-gray-200 hover:border-${T.vocabAccent} flex items-center justify-center text-[10px] text-gray-500 hover:text-${T.vocabAccent} transition-all active:scale-90" title="${U.speakLabel}">${ICON_SPEAKER}</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('');
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeVocabDrawer();
        });

        let pendingConfirmCb = null;

        function updateTemplateProgress() {
            const T = LEVEL.theme, U = LEVEL.ui;
            const container = document.getElementById('step1-template-container');
            const progressFill = document.getElementById('template-progress-fill');
            const progressLabel = document.getElementById('template-progress-label');
            const progressBadge = document.getElementById('template-progress-badge');
            if (!container || !progressFill || !progressLabel) return;

            const inputs = container.querySelectorAll('.fill-in-blank');
            const total = inputs.length;
            if (total === 0) return;

            let filled = 0;
            inputs.forEach(inp => {
                if (inp.value.trim().length >= T.minFill) filled++;
            });

            const percent = Math.round((filled / total) * 100);
            progressFill.style.width = `${percent}%`;
            progressLabel.textContent = U.progress(filled, total, percent);

            if (percent === 100) {
                progressFill.className = T.fillDone;
                if (progressBadge) {
                    progressBadge.classList.remove('hidden');
                    progressBadge.classList.add('inline-flex');
                }
            } else {
                progressFill.className = T.fillActive;
                if (progressBadge) {
                    progressBadge.classList.add('hidden');
                    progressBadge.classList.remove('inline-flex');
                }
            }
        }

        function verifyAnswers() {
            const T = LEVEL.theme, U = LEVEL.ui;
            const b = boosters.find(x => x.id === selectedBooster);
            let missing = 0;
            let correctCount = 0;
            const inputs = document.querySelectorAll('#step1-template-container .fill-in-blank');
            const total = inputs.length;

            inputs.forEach(inp => {
                const val = inp.value.trim().toLowerCase();
                const field = inp.dataset.field;
                if (!val) {
                    inp.className = inp.tagName === 'TEXTAREA' ? 'fill-in-blank sentence-starter-textarea empty-input' : 'fill-in-blank empty-input';
                    missing++;
                } else if (b.student.correctAnswers && b.student.correctAnswers[field]) {
                    const ok = b.student.correctAnswers[field].some(k => {
                        if (LEVEL.regexAnswers) { try { return new RegExp(k, 'i').test(val); } catch (e) {  } }
                        return val.includes(k.toLowerCase());
                    });
                    const cls = ok ? 'filled-input' : 'empty-input';
                    inp.className = inp.tagName === 'TEXTAREA' ? `fill-in-blank sentence-starter-textarea ${cls}` : `fill-in-blank ${cls}`;
                    if (ok) correctCount++;
                    else missing++;
                } else {
                    inp.className = inp.tagName === 'TEXTAREA' ? 'fill-in-blank sentence-starter-textarea filled-input' : 'fill-in-blank filled-input';
                    correctCount++;
                }
            });

            const msg = document.getElementById('validation-msg');
            if (msg) {
                msg.classList.remove('hidden');
                if (missing === 0 && total > 0) {
                    msg.innerHTML = '<span class="' + T.okSpan + ' font-extrabold flex items-center gap-1.5"><svg viewBox="0 0 512 512" class="w-4 h-4 ' + T.okIcon + ' inline"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg> ' + U.okMsg + '</span>';
                    playChime('complete');
                    triggerConfetti();
                } else {
                    msg.innerHTML = `<span class="text-amber-800 font-bold flex items-center gap-1.5"><svg viewBox="0 0 512 512" class="w-4 h-4 fill-amber-600 inline"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg> ${U.missingMsg(missing)}</span>`;
                    playChime('success');
                }
            }
            updateTemplateProgress();
        }

        function formatDialogueBubbles(rawText, roles, activeRoleIdx) {
            const T = LEVEL.theme, U = LEVEL.ui;
            if (!rawText) return '';
            const lines = rawText.split(/<br\s*\/?>/i).map(l => l.trim()).filter(Boolean);
            
            return `
                <div class="space-y-3 py-1">
                    ${lines.map(line => {
                        const isA = line.startsWith('A:');
                        const isB = line.startsWith('B:');
                        const speakerRole = isA ? roles[0] : (isB ? roles[1] : null);
                        const cleanLine = line.replace(/^[AB]:\s*"?/, '').replace(/"?$/, '');
                        const isMyTurn = (isA && activeRoleIdx === 0) || (isB && activeRoleIdx === 1);
                        const isPartnerTurn = activeRoleIdx !== null && !isMyTurn;
                        const roleAvatar = speakerRole?.avatar || (isA ? '' + T.avatarA + '' : '' + T.avatarB + '');

                        return `
                            <div class="flex items-start gap-2.5 ${isB ? 'flex-row-reverse' : 'flex-row'} transition-all ${isPartnerTurn ? 'opacity-55' : 'opacity-100'}">
                                <div class="w-9 h-9 rounded-2xl ${isA ? '' + T.avA + '' : '' + T.avB + ''} flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-white/40">
                                    ${roleAvatar}
                                </div>
                                <div class="max-w-[85%] ${isA ? 'bubble-a' : 'bubble-b'} p-3.5 rounded-2xl shadow-xs text-xs md:text-sm font-medium ${T.bubbleText} relative group ${isMyTurn ? 'ring-2 ' + T.ring + '' : ''}">
                                    <div class="flex items-center justify-between gap-2 mb-1">
                                        <span class="text-[10px] font-black uppercase tracking-wider ${isA ? '' + T.nameA + '' : '' + T.nameB + ''} flex items-center gap-1">
                                            <span>${speakerRole ? speakerRole.name : (isA ? '' + U.roleA + '' : '' + U.roleB + '')}</span>
                                            ${isMyTurn ? '<span class="ml-1 ' + T.youBg + ' text-white text-[8px] px-1.5 py-0.2 rounded-full font-black">' + U.youText + '</span>' : ''}
                                        </span>
                                        <button data-say="${escAttr(cleanLine)}" data-act="speakText" class="text-gray-400 ${T.speakHover} transition" aria-label="${U.speakLabel}" title="${U.speakLabel}">${ICON_SPEAKER}</button>
                                    </div>
                                    <p class="leading-relaxed font-semibold">"${cleanLine}"</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        window.addEventListener('resize', () => {
            if (currentView === 'landing' && landingLayoutMode === 'carousel') {
                updateCarouselView();
            }
        });


/* ===== Seguridad de contenido y eventos (4c) ===== */

// El contenido de data/*.json es texto con, como máximo, <br>, <em> y <strong>. Cualquier otra etiqueta
// (por error o intento de inyección) se muestra como texto en vez de ejecutarse.
const ALLOWED_TAG = /^<\/?(br|em|strong)\s*\/?>$/i;
function cleanText(s) {
    return s.replace(/<[^<>]*>/g, tag => ALLOWED_TAG.test(tag) ? tag : tag.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
}
function cleanContent(v) {
    if (typeof v === 'string') return cleanText(v);
    if (Array.isArray(v)) return v.map(cleanContent);
    if (v && typeof v === 'object') { const o = {}; Object.keys(v).forEach(k => { o[k] = cleanContent(v[k]); }); return o; }
    return v;
}

// Acciones de los botones y campos. Las páginas ya no usan onclick="..." escrito en el HTML:
// cada elemento declara data-act="nombre" (y data-a0, data-a1... como argumentos) y este despachador lo ejecuta.
// Para agregar un botón nuevo: añade su acción aquí y usa data-act="miAccion" en el HTML.
const argN = (el, k) => Number(el.dataset['a' + k]);
const argS = (el, k) => el.dataset['a' + k];
const ACTIONS = {
    activateTeacherMode, clearAllAnswers, clearMyData, clearRole, clearVocabSearch, closeAppAlert, closeExprDrawer,
    closeVocabDrawer, logout, resetTimer, toggleTimer, togglePresentationMode, verifyAnswers,
    changeTotalTime: el => changeTotalTime(argN(el, 0)),
    startTurnTimer: el => startTurnTimer(argN(el, 0)),
    closeAppConfirm: el => closeAppConfirm(argS(el, 0) === 'true'),
    jumpToPhase: el => jumpToPhase(argS(el, 0)),
    navigateCarousel: el => navigateCarousel(isNaN(argN(el, 0)) ? argS(el, 0) : argN(el, 0)),
    carouselCard: el => { if (argN(el, 0) === carouselCurrentIndex) selectBooster(argN(el, 1)); else navigateCarousel(argN(el, 0)); },
    selectBooster: el => selectBooster(argN(el, 0)),
    selectRole: el => selectRole(argN(el, 0)),
    setActiveStep: el => setActiveStep(argN(el, 0)),
    setStep1Mode: el => setStep1Mode(argS(el, 0)),
    setView: el => setView(argS(el, 0)),
    setLandingLayoutMode: el => setLandingLayoutMode(argS(el, 0)),
    toggleDiagTopic: el => toggleDiagTopic(argN(el, 0)),
    openVocabDrawer: el => openVocabDrawer(argN(el, 0)),
    openVocabModal: el => openVocabModal(argN(el, 0)),
    setVocabDrawerCategory: el => setVocabDrawerCategory(argS(el, 0)),
    openExprDrawer: el => openExprDrawer(argN(el, 0)),
    setExprCategory: el => setExprCategory(argN(el, 0)),
    exprCopy: el => exprCopy(argN(el, 0), argN(el, 1), argN(el, 2)),
    exprSpeak: el => exprSpeak(argN(el, 0), argN(el, 1), argN(el, 2)),
    setSelfRating: el => setSelfRating(argN(el, 0), argS(el, 1)),
    speakText: el => speakText(el.dataset.say),
    copyText: el => copyText(el.dataset.say),
    teacherWidgetMin: el => { teacherWidgetMinimized = argS(el, 0) === 'true'; renderTeacherWidget(); },
    toggleTeacherInfo: () => { teacherWidgetShowInfo = !teacherWidgetShowInfo; renderTeacherWidget(); },
    reload: () => location.reload()
};
const INPUT_ACTIONS = {
    handleVocabSearch: el => handleVocabSearch(el.value),
    templateInput: () => { updateTemplateProgress(); saveCurrentInputs(); },
    wordCount: el => { updateWordCount(el, argN(el, 0), argN(el, 1)); saveCurrentInputs(); }
};
document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act]');
    const fn = el && ACTIONS[el.dataset.act];
    if (fn) fn(el, e);
});
document.addEventListener('input', e => {
    const el = e.target.closest && e.target.closest('[data-in]');
    const fn = el && INPUT_ACTIONS[el.dataset.in];
    if (fn) fn(el, e);
});
